/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Compact binary serialization format for InMemorySchema with a string table.
//!
//! The key optimization: StringKey values (the dominant deserialization cost due
//! to intern() hash map lookups) are stored as u32 indices into a string table.
//! On deserialization, each unique string is interned exactly once, and subsequent
//! references use a cheap Vec index lookup instead of re-interning.
//!
//! Two variants:
//!   - Sequential: `serialize` / `deserialize` — simple sequential format
//!   - Parallel: `serialize_parallel` / `deserialize_parallel` — includes per-entity
//!     offset tables enabling rayon-based parallel decoding + parallel string interning

use std::collections::HashMap;
use std::collections::hash_map::Entry;

use common::ArgumentName;
use common::DirectiveName;
use common::EnumName;
use common::InputObjectName;
use common::InterfaceName;
use common::ObjectName;
use common::ScalarName;
use common::UnionName;
use common::WithLocation;
use graphql_syntax::ConstantValue;
use graphql_syntax::DirectiveLocation;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use rayon::iter::IntoParallelIterator;
use rayon::iter::IntoParallelRefIterator;
use rayon::iter::ParallelIterator;

use crate::Argument;
use crate::ArgumentDefinitions;
use crate::ArgumentValue;
use crate::Directive;
use crate::DirectiveValue;
use crate::Enum;
use crate::EnumID;
use crate::EnumValue;
use crate::Field;
use crate::FieldID;
use crate::InMemorySchema;
use crate::InputObject;
use crate::InputObjectID;
use crate::Interface;
use crate::InterfaceID;
use crate::Object;
use crate::ObjectID;
use crate::Scalar;
use crate::ScalarID;
use crate::Schema;
use crate::Type;
use crate::TypeReference;
use crate::Union;
use crate::UnionID;

const MAGIC_PAR: u32 = 0x434F4D51; // "COMQ" — parallel format

// ============================================================
// String Collection
// ============================================================

struct StringCollector {
    table: Vec<String>,
    index: HashMap<StringKey, u32>,
}

impl StringCollector {
    fn new() -> Self {
        Self {
            table: Vec::new(),
            index: HashMap::new(),
        }
    }

    fn add(&mut self, key: StringKey) {
        if let Entry::Vacant(e) = self.index.entry(key) {
            let idx = self.table.len() as u32;
            self.table.push(key.lookup().to_owned());
            e.insert(idx);
        }
    }

    fn add_opt(&mut self, opt: Option<StringKey>) {
        if let Some(key) = opt {
            self.add(key);
        }
    }

    fn add_directive_values(&mut self, dvs: &[DirectiveValue]) {
        for dv in dvs {
            self.add(dv.name.0);
            for av in &dv.arguments {
                self.add(av.name.0);
            }
        }
    }

    fn add_arguments(&mut self, args: &ArgumentDefinitions) {
        for arg in args.iter() {
            self.add(arg.name.item.0);
            self.add_opt(arg.description);
            self.add_directive_values(&arg.directives);
        }
    }
}

fn collect_strings(schema: &InMemorySchema) -> StringCollector {
    let mut c = StringCollector::new();

    for (key, _) in schema.get_type_map() {
        c.add(*key);
    }

    for d in schema.get_directives() {
        c.add(d.name.item.0);
        c.add_arguments(&d.arguments);
        c.add_opt(d.description);
        c.add_opt(d.hack_source);
    }

    let fields: Vec<&Field> = schema.get_fields().collect();
    let regular_field_count = fields.len().saturating_sub(5);
    for field in &fields[..regular_field_count] {
        c.add(field.name.item);
        c.add_opt(field.description);
        c.add_opt(field.hack_source);
        c.add_directive_values(&field.directives);
        c.add_arguments(&field.arguments);
    }

    for obj in schema.get_objects() {
        c.add(obj.name.item.0);
        c.add_opt(obj.description);
        c.add_opt(obj.hack_source);
        c.add_directive_values(&obj.directives);
    }

    for iface in schema.get_interfaces() {
        c.add(iface.name.item.0);
        c.add_opt(iface.description);
        c.add_opt(iface.hack_source);
        c.add_directive_values(&iface.directives);
    }

    for e in schema.get_enums() {
        c.add(e.name.item.0);
        c.add_opt(e.description);
        c.add_opt(e.hack_source);
        c.add_directive_values(&e.directives);
        for ev in &e.values {
            c.add(ev.value);
            c.add_opt(ev.description);
            c.add_directive_values(&ev.directives);
        }
    }

    for u in schema.get_unions() {
        c.add(u.name.item.0);
        c.add_opt(u.description);
        c.add_opt(u.hack_source);
        c.add_directive_values(&u.directives);
    }

    for s in schema.scalars() {
        c.add(s.name.item.0);
        c.add_opt(s.description);
        c.add_opt(s.hack_source);
        c.add_directive_values(&s.directives);
    }

    for io in schema.input_objects() {
        c.add(io.name.item.0);
        c.add_opt(io.description);
        c.add_opt(io.hack_source);
        c.add_directive_values(&io.directives);
        c.add_arguments(&io.fields);
    }

    c
}

// ============================================================
// Writer
// ============================================================

struct Writer<'a> {
    buf: Vec<u8>,
    index: &'a HashMap<StringKey, u32>,
}

impl<'a> Writer<'a> {
    fn new(index: &'a HashMap<StringKey, u32>) -> Self {
        Self {
            buf: Vec::new(),
            index,
        }
    }

    fn w_u8(&mut self, v: u8) {
        self.buf.push(v);
    }

    fn w_u32(&mut self, v: u32) {
        self.buf.extend_from_slice(&v.to_le_bytes());
    }

    fn w_bool(&mut self, v: bool) {
        self.w_u8(v as u8);
    }

    fn w_sk(&mut self, key: StringKey) {
        self.w_u32(self.index[&key]);
    }

    fn w_opt_sk(&mut self, opt: Option<StringKey>) {
        match opt {
            Some(key) => {
                self.w_u8(1);
                self.w_sk(key);
            }
            None => self.w_u8(0),
        }
    }

    fn w_opt_u32(&mut self, opt: Option<u32>) {
        match opt {
            Some(v) => {
                self.w_u8(1);
                self.w_u32(v);
            }
            None => self.w_u8(0),
        }
    }

    fn w_type(&mut self, t: &Type) {
        match t {
            Type::Enum(id) => {
                self.w_u8(0);
                self.w_u32(id.0);
            }
            Type::InputObject(id) => {
                self.w_u8(1);
                self.w_u32(id.0);
            }
            Type::Interface(id) => {
                self.w_u8(2);
                self.w_u32(id.0);
            }
            Type::Object(id) => {
                self.w_u8(3);
                self.w_u32(id.0);
            }
            Type::Scalar(id) => {
                self.w_u8(4);
                self.w_u32(id.0);
            }
            Type::Union(id) => {
                self.w_u8(5);
                self.w_u32(id.0);
            }
        }
    }

    fn w_opt_type(&mut self, opt: &Option<Type>) {
        match opt {
            Some(t) => {
                self.w_u8(1);
                self.w_type(t);
            }
            None => self.w_u8(0),
        }
    }

    fn w_type_ref(&mut self, tr: &TypeReference<Type>) {
        match tr {
            TypeReference::Named(t) => {
                self.w_u8(0);
                self.w_type(t);
            }
            TypeReference::NonNull(inner) => {
                self.w_u8(1);
                self.w_type_ref(inner);
            }
            TypeReference::List(inner) => {
                self.w_u8(2);
                self.w_type_ref(inner);
            }
        }
    }

    fn w_const_val(&mut self, cv: &ConstantValue) {
        let blob = rmp_serde::to_vec(cv).expect("msgpack ConstantValue failed");
        self.w_u32(blob.len() as u32);
        self.buf.extend_from_slice(&blob);
    }

    fn w_dir_loc(&mut self, loc: &DirectiveLocation) {
        self.w_u8(match loc {
            DirectiveLocation::Query => 0,
            DirectiveLocation::Mutation => 1,
            DirectiveLocation::Subscription => 2,
            DirectiveLocation::Field => 3,
            DirectiveLocation::FragmentDefinition => 4,
            DirectiveLocation::FragmentSpread => 5,
            DirectiveLocation::InlineFragment => 6,
            DirectiveLocation::Schema => 7,
            DirectiveLocation::Scalar => 8,
            DirectiveLocation::Object => 9,
            DirectiveLocation::FieldDefinition => 10,
            DirectiveLocation::ArgumentDefinition => 11,
            DirectiveLocation::Interface => 12,
            DirectiveLocation::Union => 13,
            DirectiveLocation::Enum => 14,
            DirectiveLocation::EnumValue => 15,
            DirectiveLocation::InputObject => 16,
            DirectiveLocation::InputFieldDefinition => 17,
            DirectiveLocation::VariableDefinition => 18,
        });
    }

    fn w_arg_val(&mut self, av: &ArgumentValue) {
        self.w_sk(av.name.0);
        self.w_const_val(&av.value);
    }

    fn w_dir_val(&mut self, dv: &DirectiveValue) {
        self.w_sk(dv.name.0);
        self.w_u32(dv.arguments.len() as u32);
        for av in &dv.arguments {
            self.w_arg_val(av);
        }
    }

    fn w_dir_vals(&mut self, dvs: &[DirectiveValue]) {
        self.w_u32(dvs.len() as u32);
        for dv in dvs {
            self.w_dir_val(dv);
        }
    }

    fn w_enum_val(&mut self, ev: &EnumValue) {
        self.w_sk(ev.value);
        self.w_dir_vals(&ev.directives);
        self.w_opt_sk(ev.description);
    }

    fn w_argument(&mut self, arg: &Argument) {
        self.w_sk(arg.name.item.0);
        self.w_type_ref(&arg.type_);
        match &arg.default_value {
            Some(cv) => {
                self.w_u8(1);
                self.w_const_val(cv);
            }
            None => self.w_u8(0),
        }
        self.w_opt_sk(arg.description);
        self.w_dir_vals(&arg.directives);
    }

    fn w_arg_defs(&mut self, ad: &ArgumentDefinitions) {
        let args: Vec<&Argument> = ad.iter().collect();
        self.w_u32(args.len() as u32);
        for arg in args {
            self.w_argument(arg);
        }
    }

    fn w_field(&mut self, field: &Field) {
        self.w_sk(field.name.item);
        self.w_bool(field.is_extension);
        self.w_arg_defs(&field.arguments);
        self.w_type_ref(&field.type_);
        self.w_dir_vals(&field.directives);
        self.w_opt_type(&field.parent_type);
        self.w_opt_sk(field.description);
        self.w_opt_sk(field.hack_source);
    }

    fn w_object(&mut self, obj: &Object) {
        self.w_sk(obj.name.item.0);
        self.w_bool(obj.is_extension);
        self.w_u32(obj.fields.len() as u32);
        for fid in &obj.fields {
            self.w_u32(fid.0);
        }
        self.w_u32(obj.interfaces.len() as u32);
        for iid in &obj.interfaces {
            self.w_u32(iid.0);
        }
        self.w_dir_vals(&obj.directives);
        self.w_opt_sk(obj.description);
        self.w_opt_sk(obj.hack_source);
    }

    fn w_interface(&mut self, iface: &Interface) {
        self.w_sk(iface.name.item.0);
        self.w_bool(iface.is_extension);
        self.w_u32(iface.implementing_interfaces.len() as u32);
        for id in &iface.implementing_interfaces {
            self.w_u32(id.0);
        }
        self.w_u32(iface.implementing_objects.len() as u32);
        for id in &iface.implementing_objects {
            self.w_u32(id.0);
        }
        self.w_u32(iface.fields.len() as u32);
        for fid in &iface.fields {
            self.w_u32(fid.0);
        }
        self.w_dir_vals(&iface.directives);
        self.w_u32(iface.interfaces.len() as u32);
        for id in &iface.interfaces {
            self.w_u32(id.0);
        }
        self.w_opt_sk(iface.description);
        self.w_opt_sk(iface.hack_source);
    }

    fn w_enum(&mut self, e: &Enum) {
        self.w_sk(e.name.item.0);
        self.w_bool(e.is_extension);
        self.w_u32(e.values.len() as u32);
        for ev in &e.values {
            self.w_enum_val(ev);
        }
        self.w_dir_vals(&e.directives);
        self.w_opt_sk(e.description);
        self.w_opt_sk(e.hack_source);
    }

    fn w_union(&mut self, u: &Union) {
        self.w_sk(u.name.item.0);
        self.w_bool(u.is_extension);
        self.w_u32(u.members.len() as u32);
        for id in &u.members {
            self.w_u32(id.0);
        }
        self.w_dir_vals(&u.directives);
        self.w_opt_sk(u.description);
        self.w_opt_sk(u.hack_source);
    }

    fn w_scalar(&mut self, s: &Scalar) {
        self.w_sk(s.name.item.0);
        self.w_bool(s.is_extension);
        self.w_dir_vals(&s.directives);
        self.w_opt_sk(s.description);
        self.w_opt_sk(s.hack_source);
    }

    fn w_input_object(&mut self, io: &InputObject) {
        self.w_sk(io.name.item.0);
        self.w_arg_defs(&io.fields);
        self.w_dir_vals(&io.directives);
        self.w_opt_sk(io.description);
        self.w_opt_sk(io.hack_source);
    }

    fn w_directive(&mut self, d: &Directive) {
        self.w_sk(d.name.item.0);
        self.w_arg_defs(&d.arguments);
        self.w_u32(d.locations.len() as u32);
        for loc in &d.locations {
            self.w_dir_loc(loc);
        }
        self.w_bool(d.repeatable);
        self.w_bool(d.is_extension);
        self.w_opt_sk(d.description);
        self.w_opt_sk(d.hack_source);
    }
}

// ============================================================
// Reader
// ============================================================

struct Reader<'a> {
    data: &'a [u8],
    pos: usize,
    strings: &'a [StringKey],
}

impl<'a> Reader<'a> {
    fn new(data: &'a [u8], strings: &'a [StringKey]) -> Self {
        Self {
            data,
            pos: 0,
            strings,
        }
    }

    fn r_u8(&mut self) -> u8 {
        let v = self.data[self.pos];
        self.pos += 1;
        v
    }

    fn r_u32(&mut self) -> u32 {
        let v = u32::from_le_bytes(self.data[self.pos..self.pos + 4].try_into().unwrap());
        self.pos += 4;
        v
    }

    fn r_bool(&mut self) -> bool {
        self.r_u8() != 0
    }

    fn r_sk(&mut self) -> StringKey {
        let idx = self.r_u32();
        self.strings[idx as usize]
    }

    fn r_opt_sk(&mut self) -> Option<StringKey> {
        if self.r_u8() == 1 {
            Some(self.r_sk())
        } else {
            None
        }
    }

    fn r_opt_u32(&mut self) -> Option<u32> {
        if self.r_u8() == 1 {
            Some(self.r_u32())
        } else {
            None
        }
    }

    fn r_type(&mut self) -> Type {
        match self.r_u8() {
            0 => Type::Enum(EnumID(self.r_u32())),
            1 => Type::InputObject(InputObjectID(self.r_u32())),
            2 => Type::Interface(InterfaceID(self.r_u32())),
            3 => Type::Object(ObjectID(self.r_u32())),
            4 => Type::Scalar(ScalarID(self.r_u32())),
            5 => Type::Union(UnionID(self.r_u32())),
            v => panic!("invalid Type variant: {v}"),
        }
    }

    fn r_opt_type(&mut self) -> Option<Type> {
        if self.r_u8() == 1 {
            Some(self.r_type())
        } else {
            None
        }
    }

    fn r_type_ref(&mut self) -> TypeReference<Type> {
        match self.r_u8() {
            0 => TypeReference::Named(self.r_type()),
            1 => TypeReference::NonNull(Box::new(self.r_type_ref())),
            2 => TypeReference::List(Box::new(self.r_type_ref())),
            v => panic!("invalid TypeReference variant: {v}"),
        }
    }

    fn r_const_val(&mut self) -> ConstantValue {
        let len = self.r_u32() as usize;
        let blob = &self.data[self.pos..self.pos + len];
        self.pos += len;
        rmp_serde::from_slice(blob).expect("msgpack ConstantValue deser failed")
    }

    fn r_dir_loc(&mut self) -> DirectiveLocation {
        match self.r_u8() {
            0 => DirectiveLocation::Query,
            1 => DirectiveLocation::Mutation,
            2 => DirectiveLocation::Subscription,
            3 => DirectiveLocation::Field,
            4 => DirectiveLocation::FragmentDefinition,
            5 => DirectiveLocation::FragmentSpread,
            6 => DirectiveLocation::InlineFragment,
            7 => DirectiveLocation::Schema,
            8 => DirectiveLocation::Scalar,
            9 => DirectiveLocation::Object,
            10 => DirectiveLocation::FieldDefinition,
            11 => DirectiveLocation::ArgumentDefinition,
            12 => DirectiveLocation::Interface,
            13 => DirectiveLocation::Union,
            14 => DirectiveLocation::Enum,
            15 => DirectiveLocation::EnumValue,
            16 => DirectiveLocation::InputObject,
            17 => DirectiveLocation::InputFieldDefinition,
            18 => DirectiveLocation::VariableDefinition,
            v => panic!("invalid DirectiveLocation variant: {v}"),
        }
    }

    fn r_arg_val(&mut self) -> ArgumentValue {
        let name = ArgumentName(self.r_sk());
        let value = self.r_const_val();
        ArgumentValue { name, value }
    }

    fn r_dir_val(&mut self) -> DirectiveValue {
        let name = DirectiveName(self.r_sk());
        let count = self.r_u32() as usize;
        let arguments = (0..count).map(|_| self.r_arg_val()).collect();
        DirectiveValue { name, arguments }
    }

    fn r_dir_vals(&mut self) -> Vec<DirectiveValue> {
        let count = self.r_u32() as usize;
        (0..count).map(|_| self.r_dir_val()).collect()
    }

    fn r_enum_val(&mut self) -> EnumValue {
        let value = self.r_sk();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        EnumValue {
            value,
            directives,
            description,
        }
    }

    fn r_argument(&mut self) -> Argument {
        let name = WithLocation::generated(ArgumentName(self.r_sk()));
        let type_ = self.r_type_ref();
        let default_value = if self.r_u8() == 1 {
            Some(self.r_const_val())
        } else {
            None
        };
        let description = self.r_opt_sk();
        let directives = self.r_dir_vals();
        Argument {
            name,
            type_,
            default_value,
            description,
            directives,
        }
    }

    fn r_arg_defs(&mut self) -> ArgumentDefinitions {
        let count = self.r_u32() as usize;
        let args = (0..count).map(|_| self.r_argument()).collect();
        ArgumentDefinitions::new(args)
    }

    fn r_field(&mut self) -> Field {
        let name = WithLocation::generated(self.r_sk());
        let is_extension = self.r_bool();
        let arguments = self.r_arg_defs();
        let type_ = self.r_type_ref();
        let directives = self.r_dir_vals();
        let parent_type = self.r_opt_type();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Field {
            name,
            is_extension,
            arguments,
            type_,
            directives,
            parent_type,
            description,
            hack_source,
        }
    }

    fn r_object(&mut self) -> Object {
        let name = WithLocation::generated(ObjectName(self.r_sk()));
        let is_extension = self.r_bool();
        let f_count = self.r_u32() as usize;
        let fields = (0..f_count).map(|_| FieldID(self.r_u32())).collect();
        let i_count = self.r_u32() as usize;
        let interfaces = (0..i_count).map(|_| InterfaceID(self.r_u32())).collect();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Object {
            name,
            is_extension,
            fields,
            interfaces,
            directives,
            description,
            hack_source,
        }
    }

    fn r_interface(&mut self) -> Interface {
        let name = WithLocation::generated(InterfaceName(self.r_sk()));
        let is_extension = self.r_bool();
        let ii_count = self.r_u32() as usize;
        let implementing_interfaces = (0..ii_count).map(|_| InterfaceID(self.r_u32())).collect();
        let io_count = self.r_u32() as usize;
        let implementing_objects = (0..io_count).map(|_| ObjectID(self.r_u32())).collect();
        let f_count = self.r_u32() as usize;
        let fields = (0..f_count).map(|_| FieldID(self.r_u32())).collect();
        let directives = self.r_dir_vals();
        let i_count = self.r_u32() as usize;
        let interfaces = (0..i_count).map(|_| InterfaceID(self.r_u32())).collect();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Interface {
            name,
            is_extension,
            implementing_interfaces,
            implementing_objects,
            fields,
            directives,
            interfaces,
            description,
            hack_source,
        }
    }

    fn r_enum(&mut self) -> Enum {
        let name = WithLocation::generated(EnumName(self.r_sk()));
        let is_extension = self.r_bool();
        let v_count = self.r_u32() as usize;
        let values = (0..v_count).map(|_| self.r_enum_val()).collect();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Enum {
            name,
            is_extension,
            values,
            directives,
            description,
            hack_source,
        }
    }

    fn r_union(&mut self) -> Union {
        let name = WithLocation::generated(UnionName(self.r_sk()));
        let is_extension = self.r_bool();
        let m_count = self.r_u32() as usize;
        let members = (0..m_count).map(|_| ObjectID(self.r_u32())).collect();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Union {
            name,
            is_extension,
            members,
            directives,
            description,
            hack_source,
        }
    }

    fn r_scalar(&mut self) -> Scalar {
        let name = WithLocation::generated(ScalarName(self.r_sk()));
        let is_extension = self.r_bool();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Scalar {
            name,
            is_extension,
            directives,
            description,
            hack_source,
        }
    }

    fn r_input_object(&mut self) -> InputObject {
        let name = WithLocation::generated(InputObjectName(self.r_sk()));
        let fields = self.r_arg_defs();
        let directives = self.r_dir_vals();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        InputObject {
            name,
            fields,
            directives,
            description,
            hack_source,
        }
    }

    fn r_directive(&mut self) -> Directive {
        let name = WithLocation::generated(DirectiveName(self.r_sk()));
        let arguments = self.r_arg_defs();
        let loc_count = self.r_u32() as usize;
        let locations = (0..loc_count).map(|_| self.r_dir_loc()).collect();
        let repeatable = self.r_bool();
        let is_extension = self.r_bool();
        let description = self.r_opt_sk();
        let hack_source = self.r_opt_sk();
        Directive {
            name,
            arguments,
            locations,
            repeatable,
            is_extension,
            description,
            hack_source,
        }
    }
}

// ============================================================
// Helpers: write / read string table header
// ============================================================

fn write_string_table(out: &mut Vec<u8>, table: &[String]) {
    out.extend_from_slice(&(table.len() as u32).to_le_bytes());
    for s in table {
        let bytes = s.as_bytes();
        out.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
        out.extend_from_slice(bytes);
    }
}

/// Read raw string byte slices from the table (no interning yet).
fn read_string_table_raw<'b>(data: &'b [u8], pos: &mut usize) -> Vec<&'b str> {
    let count = u32::from_le_bytes(data[*pos..*pos + 4].try_into().unwrap()) as usize;
    *pos += 4;
    let mut strs = Vec::with_capacity(count);
    for _ in 0..count {
        let len = u32::from_le_bytes(data[*pos..*pos + 4].try_into().unwrap()) as usize;
        *pos += 4;
        let s = std::str::from_utf8(&data[*pos..*pos + len]).unwrap();
        *pos += len;
        strs.push(s);
    }
    strs
}

fn write_root_types(w: &mut Writer<'_>, schema: &InMemorySchema) {
    let q = schema.query_type().and_then(|t| match t {
        Type::Object(id) => Some(id),
        _ => None,
    });
    let m = schema.mutation_type().and_then(|t| match t {
        Type::Object(id) => Some(id),
        _ => None,
    });
    let s = schema.subscription_type().and_then(|t| match t {
        Type::Object(id) => Some(id),
        _ => None,
    });
    w.w_opt_u32(q.map(|id| id.0));
    w.w_opt_u32(m.map(|id| id.0));
    w.w_opt_u32(s.map(|id| id.0));
}

#[allow(clippy::too_many_arguments)]
fn build_type_map_and_schema(
    query_type: Option<ObjectID>,
    mutation_type: Option<ObjectID>,
    subscription_type: Option<ObjectID>,
    directives: HashMap<DirectiveName, Directive>,
    enums: Vec<Enum>,
    fields: Vec<Field>,
    input_objects: Vec<InputObject>,
    interfaces: Vec<Interface>,
    objects: Vec<Object>,
    scalars: Vec<Scalar>,
    unions: Vec<Union>,
) -> InMemorySchema {
    let mut type_map = HashMap::with_capacity(
        objects.len()
            + interfaces.len()
            + enums.len()
            + unions.len()
            + scalars.len()
            + input_objects.len(),
    );
    for (i, obj) in objects.iter().enumerate() {
        type_map.insert(obj.name.item.0, Type::Object(ObjectID(i as u32)));
    }
    for (i, iface) in interfaces.iter().enumerate() {
        type_map.insert(iface.name.item.0, Type::Interface(InterfaceID(i as u32)));
    }
    for (i, e) in enums.iter().enumerate() {
        type_map.insert(e.name.item.0, Type::Enum(EnumID(i as u32)));
    }
    for (i, u) in unions.iter().enumerate() {
        type_map.insert(u.name.item.0, Type::Union(UnionID(i as u32)));
    }
    for (i, s) in scalars.iter().enumerate() {
        type_map.insert(s.name.item.0, Type::Scalar(ScalarID(i as u32)));
    }
    for (i, io) in input_objects.iter().enumerate() {
        type_map.insert(io.name.item.0, Type::InputObject(InputObjectID(i as u32)));
    }

    InMemorySchema::from_raw_parts(
        query_type,
        mutation_type,
        subscription_type,
        type_map,
        directives,
        enums,
        fields,
        input_objects,
        interfaces,
        objects,
        scalars,
        unions,
    )
}

// ============================================================
// Parallel format: serialize
// ============================================================

/// Write entities with a per-entity byte-offset table so they can be decoded
/// in parallel.  Layout:
///   [u32 count]
///   [u32 offset_0] ... [u32 offset_{count}]   (count+1 entries; last = total_bytes)
///   [entity bytes ...]
fn write_indexed_section<T>(
    out: &mut Vec<u8>,
    entities: &[&T],
    index: &HashMap<StringKey, u32>,
    write_fn: fn(&mut Writer<'_>, &T),
) {
    let count = entities.len();
    out.extend_from_slice(&(count as u32).to_le_bytes());

    // Reserve space for the offset table (count+1 entries)
    let offset_table_pos = out.len();
    out.resize(offset_table_pos + (count + 1) * 4, 0);

    // Write each entity, recording its offset
    let mut offsets = Vec::with_capacity(count + 1);
    let mut w = Writer::new(index);
    for entity in entities {
        offsets.push(w.buf.len() as u32);
        write_fn(&mut w, entity);
    }
    offsets.push(w.buf.len() as u32); // sentinel = total bytes

    // Fill in offset table
    for (i, offset) in offsets.iter().enumerate() {
        let pos = offset_table_pos + i * 4;
        out[pos..pos + 4].copy_from_slice(&offset.to_le_bytes());
    }

    out.extend_from_slice(&w.buf);
}

pub fn serialize_parallel(schema: &InMemorySchema) -> Vec<u8> {
    let collector = collect_strings(schema);

    let mut out = Vec::new();
    out.extend_from_slice(&MAGIC_PAR.to_le_bytes());
    write_string_table(&mut out, &collector.table);

    // Root types — written directly (tiny)
    let mut w = Writer::new(&collector.index);
    write_root_types(&mut w, schema);
    out.extend_from_slice(&w.buf);

    // Directives — small, sequential (no index needed)
    let directives: Vec<&Directive> = schema.get_directives().collect();
    let mut w = Writer::new(&collector.index);
    w.w_u32(directives.len() as u32);
    for d in &directives {
        w.w_directive(d);
    }
    out.extend_from_slice(&w.buf);

    // Fields — large, indexed for parallel decoding
    let fields: Vec<&Field> = schema.get_fields().collect();
    let regular_field_count = fields.len().saturating_sub(5);
    write_indexed_section(
        &mut out,
        &fields[..regular_field_count],
        &collector.index,
        |w, f| w.w_field(f),
    );

    // Enums — indexed
    let enums: Vec<&Enum> = schema.get_enums().collect();
    write_indexed_section(&mut out, &enums, &collector.index, |w, e| w.w_enum(e));

    // Input objects — indexed
    let input_objects: Vec<&InputObject> = schema.input_objects().collect();
    write_indexed_section(&mut out, &input_objects, &collector.index, |w, io| {
        w.w_input_object(io)
    });

    // Interfaces — indexed
    let interfaces: Vec<&Interface> = schema.get_interfaces().collect();
    write_indexed_section(&mut out, &interfaces, &collector.index, |w, iface| {
        w.w_interface(iface)
    });

    // Objects — indexed
    let objects: Vec<&Object> = schema.get_objects().collect();
    write_indexed_section(&mut out, &objects, &collector.index, |w, obj| {
        w.w_object(obj)
    });

    // Scalars — tiny, sequential
    let scalars: Vec<&Scalar> = schema.scalars().collect();
    let mut w = Writer::new(&collector.index);
    w.w_u32(scalars.len() as u32);
    for s in &scalars {
        w.w_scalar(s);
    }
    out.extend_from_slice(&w.buf);

    // Unions — small, sequential
    let unions: Vec<&Union> = schema.get_unions().collect();
    let mut w = Writer::new(&collector.index);
    w.w_u32(unions.len() as u32);
    for u in &unions {
        w.w_union(u);
    }
    out.extend_from_slice(&w.buf);

    out
}

// ============================================================
// Parallel format: deserialize
// ============================================================

/// Read an indexed section's offset table and entity data slice, advancing pos.
/// Returns (offsets, entity_data_slice).
fn read_indexed_header<'b>(data: &'b [u8], pos: &mut usize) -> (Vec<u32>, &'b [u8]) {
    let count = u32::from_le_bytes(data[*pos..*pos + 4].try_into().unwrap()) as usize;
    *pos += 4;

    // Read count+1 offsets
    let offsets: Vec<u32> = (0..=count)
        .map(|i| u32::from_le_bytes(data[*pos + i * 4..*pos + i * 4 + 4].try_into().unwrap()))
        .collect();
    *pos += (count + 1) * 4;

    let total_bytes = *offsets.last().unwrap() as usize;
    let entity_data = &data[*pos..*pos + total_bytes];
    *pos += total_bytes;
    (offsets, entity_data)
}

pub fn deserialize_parallel(data: &[u8]) -> InMemorySchema {
    let mut pos = 0;

    let magic = u32::from_le_bytes(data[pos..pos + 4].try_into().unwrap());
    assert_eq!(magic, MAGIC_PAR, "invalid parallel compact format magic");
    pos += 4;

    // 1. Read string table raw, then intern in parallel
    let raw_strings = read_string_table_raw(data, &mut pos);
    let strings: Vec<StringKey> = raw_strings.par_iter().map(|s: &&str| s.intern()).collect();

    // 2. Root types (tiny, sequential)
    let mut r = Reader::new(&data[pos..], &strings);
    let query_type = r.r_opt_u32().map(ObjectID);
    let mutation_type = r.r_opt_u32().map(ObjectID);
    let subscription_type = r.r_opt_u32().map(ObjectID);
    pos += r.pos;

    // 3. Directives (small, sequential)
    let mut r = Reader::new(&data[pos..], &strings);
    let dir_count = r.r_u32() as usize;
    let mut directives = HashMap::with_capacity(dir_count);
    for _ in 0..dir_count {
        let d = r.r_directive();
        directives.insert(d.name.item, d);
    }
    pos += r.pos;

    // 4. Fields — parallel
    let (field_offsets, field_data) = read_indexed_header(data, &mut pos);
    let field_count = field_offsets.len() - 1;
    let fields: Vec<Field> = (0..field_count)
        .into_par_iter()
        .map(|i| {
            let start = field_offsets[i] as usize;
            let end = field_offsets[i + 1] as usize;
            let mut er = Reader::new(&field_data[start..end], &strings);
            er.r_field()
        })
        .collect();

    // 5. Enums — parallel
    let (enum_offsets, enum_data) = read_indexed_header(data, &mut pos);
    let enum_count = enum_offsets.len() - 1;
    let enums: Vec<Enum> = (0..enum_count)
        .into_par_iter()
        .map(|i| {
            let start = enum_offsets[i] as usize;
            let end = enum_offsets[i + 1] as usize;
            let mut er = Reader::new(&enum_data[start..end], &strings);
            er.r_enum()
        })
        .collect();

    // 6. Input objects — parallel
    let (io_offsets, io_data) = read_indexed_header(data, &mut pos);
    let io_count = io_offsets.len() - 1;
    let input_objects: Vec<InputObject> = (0..io_count)
        .into_par_iter()
        .map(|i| {
            let start = io_offsets[i] as usize;
            let end = io_offsets[i + 1] as usize;
            let mut er = Reader::new(&io_data[start..end], &strings);
            er.r_input_object()
        })
        .collect();

    // 7. Interfaces — parallel
    let (iface_offsets, iface_data) = read_indexed_header(data, &mut pos);
    let iface_count = iface_offsets.len() - 1;
    let interfaces: Vec<Interface> = (0..iface_count)
        .into_par_iter()
        .map(|i| {
            let start = iface_offsets[i] as usize;
            let end = iface_offsets[i + 1] as usize;
            let mut er = Reader::new(&iface_data[start..end], &strings);
            er.r_interface()
        })
        .collect();

    // 8. Objects — parallel
    let (obj_offsets, obj_data) = read_indexed_header(data, &mut pos);
    let obj_count = obj_offsets.len() - 1;
    let objects: Vec<Object> = (0..obj_count)
        .into_par_iter()
        .map(|i| {
            let start = obj_offsets[i] as usize;
            let end = obj_offsets[i + 1] as usize;
            let mut er = Reader::new(&obj_data[start..end], &strings);
            er.r_object()
        })
        .collect();

    // 9. Scalars (tiny, sequential)
    let mut r = Reader::new(&data[pos..], &strings);
    let scalar_count = r.r_u32() as usize;
    let scalars: Vec<Scalar> = (0..scalar_count).map(|_| r.r_scalar()).collect();
    pos += r.pos;

    // 10. Unions (small, sequential)
    let mut r = Reader::new(&data[pos..], &strings);
    let union_count = r.r_u32() as usize;
    let unions: Vec<Union> = (0..union_count).map(|_| r.r_union()).collect();

    // 11. Build type_map and assemble schema
    build_type_map_and_schema(
        query_type,
        mutation_type,
        subscription_type,
        directives,
        enums,
        fields,
        input_objects,
        interfaces,
        objects,
        scalars,
        unions,
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Schema;
    use crate::build_schema;
    use crate::schema::SDLSchema;

    const TEST_SDL: &str = "
        type Query {
            greeting: String
            node(id: ID!): Node
        }
        interface Node {
            id: ID!
        }
        type User implements Node {
            id: ID!
            name: String
            friends: [User]
        }
        enum Role { ADMIN USER }
        input CreateUserInput {
            name: String!
            role: Role
        }
        union SearchResult = User
        scalar DateTime
    ";

    fn get_in_memory_schema(sdl: &str) -> InMemorySchema {
        match build_schema(sdl).unwrap() {
            SDLSchema::InMemory(schema) => schema,
            _ => panic!("Expected InMemory schema"),
        }
    }

    /// Verify that the deserialized schema has the same types, fields, and
    /// structure as the original.
    fn assert_schemas_equivalent(original: &InMemorySchema, deserialized: &InMemorySchema) {
        // Root types
        assert_eq!(original.query_type(), deserialized.query_type());
        assert_eq!(original.mutation_type(), deserialized.mutation_type());
        assert_eq!(
            original.subscription_type(),
            deserialized.subscription_type()
        );

        // Type map entries
        let mut orig_types: Vec<_> = original.get_type_map().map(|(k, v)| (*k, *v)).collect();
        let mut deser_types: Vec<_> = deserialized.get_type_map().map(|(k, v)| (*k, *v)).collect();
        orig_types.sort_by_key(|(k, _)| k.lookup().to_owned());
        deser_types.sort_by_key(|(k, _)| k.lookup().to_owned());
        assert_eq!(
            orig_types.len(),
            deser_types.len(),
            "Type map size mismatch"
        );
        for ((ok, _), (dk, _)) in orig_types.iter().zip(deser_types.iter()) {
            assert_eq!(ok.lookup(), dk.lookup(), "Type name mismatch");
        }

        // Entity counts
        assert_eq!(
            original.get_fields().count(),
            deserialized.get_fields().count(),
            "Field count mismatch"
        );
        assert_eq!(
            original.get_enums().count(),
            deserialized.get_enums().count(),
            "Enum count mismatch"
        );
        assert_eq!(
            original.get_objects().count(),
            deserialized.get_objects().count(),
            "Object count mismatch"
        );
        assert_eq!(
            original.get_interfaces().count(),
            deserialized.get_interfaces().count(),
            "Interface count mismatch"
        );
        assert_eq!(
            original.get_unions().count(),
            deserialized.get_unions().count(),
            "Union count mismatch"
        );

        // Directive names
        let mut orig_dirs: Vec<_> = original
            .get_directives()
            .map(|d| d.name.item.0.lookup().to_owned())
            .collect();
        let mut deser_dirs: Vec<_> = deserialized
            .get_directives()
            .map(|d| d.name.item.0.lookup().to_owned())
            .collect();
        orig_dirs.sort();
        deser_dirs.sort();
        assert_eq!(orig_dirs, deser_dirs, "Directive names mismatch");
    }

    /// Round-trip through parallel serialize/deserialize.
    #[test]
    fn round_trip_parallel() {
        let schema = get_in_memory_schema(TEST_SDL);
        let bytes = serialize_parallel(&schema);
        let deserialized = deserialize_parallel(&bytes);
        assert_schemas_equivalent(&schema, &deserialized);
    }
}
