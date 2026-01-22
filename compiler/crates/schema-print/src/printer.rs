/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;
use std::fmt::Result as FmtResult;
use std::fmt::Write;

use fnv::FnvHashMap;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use itertools::Itertools;
use schema::*;

use crate::calculate_hash;

pub const DEAULT_SHARD_COUNT: usize = 1;

pub struct Printer<'schema, 'writer> {
    schema: &'schema SDLSchema,
    // Each writer here represents a shard
    writers: &'writer mut Vec<String>,
    // Index to specify which shard to write for a given type
    writers_index: usize,
    shard_count: usize,
    // Each writer here represents shards for individual types.
    // For e.g you may want to shard huge types like Query.
    type_writers: Option<&'writer mut FnvHashMap<StringKey, Vec<String>>>,
    // When sharding individual types, this represents index to
    // specify which shard to wite for a given type and field
    type_writers_index: Option<(StringKey, usize)>,
}

impl<'schema, 'writer> Printer<'schema, 'writer> {
    pub fn new(schema: &'schema SDLSchema, writers: &'writer mut Vec<String>) -> Self {
        Self {
            schema,
            writers_index: 0,
            writers,
            shard_count: DEAULT_SHARD_COUNT,
            type_writers: None,
            type_writers_index: None,
        }
    }

    pub fn new_with_shards(
        schema: &'schema SDLSchema,
        writers: &'writer mut Vec<String>,
        shard_count: usize,
        type_writers: Option<&'writer mut FnvHashMap<StringKey, Vec<String>>>,
    ) -> Self {
        Self {
            schema,
            writers_index: 0,
            writers,
            shard_count,
            type_writers,
            type_writers_index: None,
        }
    }

    pub fn print_schema_definition(&mut self) -> FmtResult {
        let query_type_name = self
            .schema
            .query_type()
            .map(|type_| self.schema.get_type_name(type_));

        let mutation_type_name = self
            .schema
            .mutation_type()
            .map(|type_| self.schema.get_type_name(type_));

        let subscription_type_name = self
            .schema
            .subscription_type()
            .map(|type_| self.schema.get_type_name(type_));

        write!(self.writer(), "schema {{")?;
        self.print_new_line()?;
        if let Some(type_name) = query_type_name {
            writeln!(self.writer(), "  query: {type_name}")?;
        }
        if let Some(type_name) = mutation_type_name {
            writeln!(self.writer(), "  mutation: {type_name}")?;
        }
        if let Some(type_name) = subscription_type_name {
            writeln!(self.writer(), "  subscription: {type_name}")?;
        }
        write!(self.writer(), "}}")?;
        self.print_definition_end()
    }

    pub fn print_directives(&mut self) -> FmtResult {
        if self.schema.get_directives().count() == 0 {
            return Ok(());
        }
        let mut ordered_directives = self.schema.get_directives().collect::<Vec<_>>();
        ordered_directives.sort_by_key(|dir| dir.name);
        for directive in ordered_directives {
            self.print_directive(directive)?;
        }
        Ok(())
    }

    pub fn print_directive(&mut self, directive: &Directive) -> FmtResult {
        write!(self.writer(), "directive @{}", directive.name.item)?;
        self.print_args(&directive.arguments)?;
        if directive.repeatable {
            write!(self.writer(), " repeatable")?;
        }
        write!(
            self.writer(),
            " on {}",
            directive.locations.iter().join(" | ")
        )?;
        self.print_definition_end()
    }

    pub fn print_all_types(&mut self) -> FmtResult {
        let ordered_type_map = self.schema.get_type_map().collect::<BTreeMap<_, _>>();
        for (_key, value) in ordered_type_map.iter() {
            self.print_type(**value)?;
        }
        Ok(())
    }

    pub fn print_types(&mut self, types_to_print: &[(StringKey, Type)]) -> FmtResult {
        for (_key, value) in types_to_print.iter() {
            self.print_type(*value)?;
        }
        Ok(())
    }

    pub fn print_type(&mut self, type_: Type) -> FmtResult {
        self.update_writer_index_for_type_start(&type_);
        match type_ {
            Type::Enum(id) => self.print_enum(id)?,
            Type::InputObject(id) => self.print_input_object(id)?,
            Type::Interface(id) => self.print_interface(id)?,
            Type::Object(id) => self.print_object(id)?,
            Type::Scalar(id) => self.print_scalar(id)?,
            Type::Union(id) => self.print_union(id)?,
        }
        self.update_writer_index_for_type_end();
        Ok(())
    }

    fn print_scalar(&mut self, id: ScalarID) -> FmtResult {
        let scalar = self.schema.scalar(id);
        write!(self.writer(), "scalar {}", scalar.name.item)?;
        self.print_directive_values(&scalar.directives)?;
        self.print_definition_end()
    }

    fn print_object(&mut self, id: ObjectID) -> FmtResult {
        let object = self.schema.object(id);
        write!(self.writer(), "type {}", object.name.item)?;
        self.print_implementing_interfaces(&object.interfaces)?;
        self.print_directive_values(&object.directives)?;
        self.print_space()?;
        self.print_fields(&object.fields, object.name.item)?;
        self.print_definition_end()
    }

    fn print_interface(&mut self, id: InterfaceID) -> FmtResult {
        let interface = self.schema.interface(id);
        write!(self.writer(), "interface {}", interface.name.item)?;
        self.print_implementing_interfaces(&interface.interfaces)?;
        self.print_directive_values(&interface.directives)?;
        self.print_space()?;
        self.print_fields(&interface.fields, interface.name.item)?;
        self.print_definition_end()
    }

    fn print_union(&mut self, id: UnionID) -> FmtResult {
        let union_ = self.schema.union(id);
        write!(self.writer(), "union {}", union_.name.item.0)?;
        self.print_directive_values(&union_.directives)?;
        if !union_.members.is_empty() {
            let union_members = union_
                .members
                .iter()
                .map(|id| self.schema.object(*id).name.item)
                .collect::<Vec<_>>()
                .iter()
                .join(" | ");
            write!(self.writer(), " = {union_members}")?;
        }
        self.print_definition_end()
    }

    fn print_enum(&mut self, id: EnumID) -> FmtResult {
        let enum_ = self.schema.enum_(id);
        write!(self.writer(), "enum {}", enum_.name.item)?;
        self.print_directive_values(&enum_.directives)?;
        self.print_space()?;
        self.print_enum_values(&enum_.values)?;
        self.print_definition_end()
    }

    fn print_input_object(&mut self, id: InputObjectID) -> FmtResult {
        let input_object = self.schema.input_object(id);
        write!(self.writer(), "input {}", input_object.name.item)?;
        self.print_directive_values(&input_object.directives)?;
        self.print_space()?;
        self.print_input_object_fields(&input_object.fields)?;
        self.print_definition_end()
    }

    pub fn print_fields(&mut self, fields: &[FieldID], type_name: impl Lookup) -> FmtResult {
        if fields.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        let typename = type_name.lookup().intern();
        for field_id in fields {
            let field = &self.schema.field(*field_id);
            self.update_writer_index_for_field_start(field.name.item, typename);
            self.print_space()?;
            self.print_space()?;
            write!(self.writer(), "{}", field.name.item)?;
            self.print_args(&field.arguments)?;
            let type_string = self.schema.get_type_string(&field.type_);
            write!(self.writer(), ": {type_string}")?;
            self.print_directive_values(&field.directives)?;
            self.print_new_line()?;
        }
        self.update_writer_index_for_all_field_end(typename);
        write!(self.writer(), "}}")
    }

    // Prints a set of fields indented by 2 spaces
    // Does not handle writing the type definition and open/closing brackets
    pub fn print_fields_without_brackets(&mut self, fields: &[FieldID]) -> FmtResult {
        if fields.is_empty() {
            return Ok(());
        }
        for field_id in fields {
            let field = &self.schema.field(*field_id);
            self.print_space()?;
            self.print_space()?;
            write!(self.writer(), "{}", field.name.item)?;
            self.print_args(&field.arguments)?;
            let type_string = self.schema.get_type_string(&field.type_);
            write!(self.writer(), ": {type_string}")?;
            self.print_directive_values(&field.directives)?;
            self.print_new_line()?;
        }
        Ok(())
    }

    /// Follow the mobile schema generation sorting strategy: sort argument definitions by name
    fn print_args(&mut self, args: &ArgumentDefinitions) -> FmtResult {
        if args.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer(), "(")?;
        let mut sorted_args: Vec<_> = args.iter().collect();
        sorted_args.sort_by(|a, b| a.name.item.cmp(&b.name.item));
        for arg in sorted_args {
            if first {
                first = false;
            } else {
                write!(self.writer(), ", ")?;
            }
            let type_string = self.schema.get_type_string(&arg.type_);
            write!(self.writer(), "{}: {}", arg.name.item, type_string,)?;
            if let Some(default) = &arg.default_value {
                write!(self.writer(), " = {default}")?;
            }
            self.print_directive_values(&arg.directives)?;
        }
        write!(self.writer(), ")")
    }

    fn print_enum_values(&mut self, values: &[EnumValue]) -> FmtResult {
        if values.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        for value in values {
            write!(self.writer(), "  {}", value.value,)?;
            self.print_directive_values(&value.directives)?;
            self.print_new_line()?;
        }
        write!(self.writer(), "}}")
    }

    fn print_input_object_fields(&mut self, args: &ArgumentDefinitions) -> FmtResult {
        if args.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        for arg in args.iter() {
            let type_string = self.schema.get_type_string(&arg.type_);
            write!(self.writer(), "  {}: {}", arg.name.item, type_string,)?;
            if let Some(default) = &arg.default_value {
                write!(self.writer(), " = {default}")?;
            }
            self.print_directive_values(&arg.directives)?;
            self.print_new_line()?;
        }
        write!(self.writer(), "}}")
    }

    /// Follow the mobile schema generation sorting strategy: sort directives by name
    fn print_directive_values(&mut self, directives: &[DirectiveValue]) -> FmtResult {
        if directives.is_empty() {
            return Ok(());
        }
        let mut sorted_directives: Vec<_> = directives.iter().collect();
        sorted_directives.sort_by(|a, b| a.name.cmp(&b.name));
        for directive in sorted_directives {
            write!(self.writer(), " @{}", directive.name)?;
            self.print_directive_argument_values(&directive.arguments)?;
        }
        Ok(())
    }

    /// Follow the mobile schema generation sorting strategy: sort arguments by name
    fn print_directive_argument_values(&mut self, values: &[ArgumentValue]) -> FmtResult {
        if values.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer(), "(")?;
        let mut sorted_values: Vec<_> = values.iter().collect();
        sorted_values.sort_by(|a, b| a.name.cmp(&b.name));
        for value in sorted_values {
            if first {
                first = false;
            } else {
                write!(self.writer(), ", ")?;
            }
            write!(self.writer(), "{}: {}", value.name, value.value)?;
        }
        write!(self.writer(), ")")
    }

    fn print_implementing_interfaces(&mut self, interfaces: &[InterfaceID]) -> FmtResult {
        if !interfaces.is_empty() {
            let interface_names = interfaces
                .iter()
                .map(|id| self.schema.interface(*id).name.item)
                .join(" & ");
            write!(self.writer(), " implements {interface_names}")?;
        }
        Ok(())
    }

    pub fn print_type_declaration(&mut self, type_name: StringKey) -> FmtResult {
        writeln!(self.writer(), "type {type_name} {{")
    }

    pub fn print_definition_closure(&mut self) -> FmtResult {
        write!(self.writer(), "}}")
    }

    pub fn print_definition_end(&mut self) -> FmtResult {
        self.print_new_line()?;
        self.print_new_line()
    }

    fn print_new_line(&mut self) -> FmtResult {
        writeln!(self.writer())
    }

    fn print_space(&mut self) -> FmtResult {
        write!(self.writer(), " ")
    }

    fn writer(&mut self) -> &mut String {
        if let Some(type_writers) = &mut self.type_writers
            && let Some((type_name, index)) = self.type_writers_index
            && let Some(writers) = type_writers.get_mut(&type_name)
        {
            return writers.get_mut(index).unwrap();
        }
        self.writers.get_mut(self.writers_index).unwrap()
    }

    fn update_writer_index_for_type_start(&mut self, type_: &Type) {
        if self.shard_count > 1 {
            let type_name = self.schema.get_type_name(*type_);
            let type_hash = calculate_hash(&type_name.lookup()) as usize;
            self.writers_index = type_hash % self.shard_count;
            if let Some(type_writers) = &self.type_writers
                && type_writers.contains_key(&type_name)
            {
                self.type_writers_index = Some((type_name, 0));
            }
        }
    }

    fn update_writer_index_for_type_end(&mut self) {
        self.type_writers_index = None;
    }

    fn update_writer_index_for_field_start(&mut self, field_name: StringKey, type_name: StringKey) {
        if let Some(type_writers) = &mut self.type_writers
            && let Some(writers) = type_writers.get_mut(&type_name)
        {
            let index = (calculate_hash(&field_name.lookup()) as usize) % writers.len();
            self.type_writers_index = Some((type_name, index));
        }
    }

    fn update_writer_index_for_all_field_end(&mut self, type_name: StringKey) {
        if let Some(type_writers) = &self.type_writers
            && let Some(writers) = type_writers.get(&type_name)
        {
            self.type_writers_index = Some((type_name, writers.len() - 1));
        }
    }
}

pub fn is_schema_of_common_name(schema: &SDLSchema) -> bool {
    schema.query_type().is_some()
        && schema.mutation_type().is_some()
        && schema.subscription_type().is_some()
}

pub fn has_schema_definition_types(schema: &SDLSchema) -> bool {
    schema.query_type().is_some()
        || schema.mutation_type().is_some()
        || schema.subscription_type().is_some()
}
