/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::hash::Hash;

use common::ArgumentName;
use common::DirectiveName;
use common::WithLocation;
use dashmap::DashMap;
use fnv::FnvBuildHasher;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use ouroboros::self_referencing;

use super::FlatBufferSchema;
use crate::Argument;
use crate::ArgumentDefinitions;
use crate::Directive;
use crate::Enum;
use crate::EnumID;
use crate::Field;
use crate::FieldID;
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
use crate::field_descriptions::CLIENT_ID_DESCRIPTION;
use crate::field_descriptions::TYPENAME_DESCRIPTION;

#[self_referencing]
struct OwnedFlatBufferSchema {
    #[allow(dead_code)]
    data: Vec<u8>,

    #[borrows(data)]
    #[covariant]
    pub schema: FlatBufferSchema<'this>,
}

const CLIENTID_FIELD_ID: FieldID = FieldID(10_000_000);
const TYPENAME_FIELD_ID: FieldID = FieldID(10_000_001);
const FETCH_TOKEN_FIELD_ID: FieldID = FieldID(10_000_002);
const STRONGID_FIELD_ID: FieldID = FieldID(10_000_003);
const IS_FULFILLED_FIELD_ID: FieldID = FieldID(10_000_004);

pub struct SchemaWrapper {
    clientid_field_name: StringKey,
    strongid_field_name: StringKey,
    typename_field_name: StringKey,
    fetch_token_field_name: StringKey,
    is_fulfilled_field_name: StringKey,
    unchecked_argument_type_sentinel: Option<TypeReference<Type>>,

    directives: Cache<DirectiveName, Option<Directive>>,
    interfaces: Cache<InterfaceID, Interface>,
    unions: Cache<UnionID, Union>,
    input_objects: Cache<InputObjectID, InputObject>,
    enums: Cache<EnumID, Enum>,
    scalars: Cache<ScalarID, Scalar>,
    fields: Cache<FieldID, Field>,
    objects: Cache<ObjectID, Object>,
    fb: OwnedFlatBufferSchema,
}
impl fmt::Debug for SchemaWrapper {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Schema").finish()
    }
}

fn _assert_send_sync(_: impl Send + Sync) {}
fn _assert_send_sync2(s: &SchemaWrapper) {
    _assert_send_sync(s)
}

impl SchemaWrapper {
    pub fn from_vec(data: Vec<u8>) -> Self {
        let fb = OwnedFlatBufferSchemaBuilder {
            data,
            schema_builder: |data| FlatBufferSchema::build(data),
        }
        .build();

        let mut result = Self {
            clientid_field_name: "__id".intern(),
            strongid_field_name: "strong_id__".intern(),
            typename_field_name: "__typename".intern(),
            fetch_token_field_name: "__token".intern(),
            is_fulfilled_field_name: "is_fulfilled__".intern(),
            unchecked_argument_type_sentinel: None,
            directives: Cache::new(),
            unions: Cache::new(),
            interfaces: Cache::new(),
            input_objects: Cache::new(),
            enums: Cache::new(),
            scalars: Cache::new(),
            fields: Cache::new(),
            objects: Cache::new(),
            fb,
        };

        // prepopulate special fields
        result.fields.get(TYPENAME_FIELD_ID, || Field {
            name: WithLocation::generated(result.typename_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("String".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });
        result.fields.get(CLIENTID_FIELD_ID, || -> Field {
            Field {
                name: WithLocation::generated(result.clientid_field_name),
                is_extension: true,
                arguments: ArgumentDefinitions::new(Default::default()),
                type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                    result.get_type("ID".intern()).unwrap(),
                ))),
                directives: Vec::new(),
                parent_type: None,
                description: Some(*CLIENT_ID_DESCRIPTION),
                hack_source: None,
            }
        });
        result.fields.get(STRONGID_FIELD_ID, || Field {
            name: WithLocation::generated(result.strongid_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::Named(result.get_type("ID".intern()).unwrap()),
            directives: Vec::new(),
            parent_type: None,
            description: Some(*TYPENAME_DESCRIPTION),
            hack_source: None,
        });
        result.fields.get(FETCH_TOKEN_FIELD_ID, || Field {
            name: WithLocation::generated(result.fetch_token_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("ID".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });
        result.fields.get(IS_FULFILLED_FIELD_ID, || Field {
            name: WithLocation::generated(result.is_fulfilled_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(vec![Argument {
                name: WithLocation::generated(ArgumentName("name".intern())),
                type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                    result.get_type("String".intern()).unwrap(),
                ))),
                default_value: None,
                description: None,
                directives: Default::default(),
            }]),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(
                result.get_type("Boolean".intern()).unwrap(),
            ))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
            hack_source: None,
        });

        result.unchecked_argument_type_sentinel = Some(TypeReference::Named(
            result.get_type("Boolean".intern()).unwrap(),
        ));

        result
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        self.flatbuffer_schema().has_type(type_name)
    }

    pub fn has_directive(&self, name: DirectiveName) -> bool {
        self.get_directive(name).is_some()
    }

    pub fn get_directives(&self) -> Vec<&Directive> {
        todo!()
    }

    pub fn get_type_map(&self) -> impl Iterator<Item = (&StringKey, &Type)> {
        if true {
            todo!();
        }
        (vec![]).into_iter()
    }

    fn flatbuffer_schema(&self) -> &FlatBufferSchema<'_> {
        self.fb.borrow_schema()
    }
}

impl Schema for SchemaWrapper {
    fn query_type(&self) -> Option<Type> {
        Some(self.flatbuffer_schema().query_type())
    }

    fn mutation_type(&self) -> Option<Type> {
        self.flatbuffer_schema().mutation_type()
    }

    fn subscription_type(&self) -> Option<Type> {
        self.flatbuffer_schema().subscription_type()
    }

    fn clientid_field(&self) -> FieldID {
        CLIENTID_FIELD_ID
    }

    fn strongid_field(&self) -> FieldID {
        STRONGID_FIELD_ID
    }

    fn typename_field(&self) -> FieldID {
        TYPENAME_FIELD_ID
    }

    fn fetch_token_field(&self) -> FieldID {
        FETCH_TOKEN_FIELD_ID
    }

    fn is_fulfilled_field(&self) -> FieldID {
        IS_FULFILLED_FIELD_ID
    }

    fn get_type(&self, type_name: StringKey) -> Option<Type> {
        self.flatbuffer_schema().get_type(type_name)
    }

    fn get_directive(&self, name: DirectiveName) -> Option<&Directive> {
        self.directives
            .get(name, || self.flatbuffer_schema().get_directive(name))
            .as_ref()
    }

    fn input_object(&self, id: InputObjectID) -> &InputObject {
        self.input_objects
            .get(id, || self.flatbuffer_schema().input_object(id))
    }

    fn enum_(&self, id: EnumID) -> &Enum {
        self.enums.get(id, || self.flatbuffer_schema().enum_(id))
    }

    fn scalar(&self, id: ScalarID) -> &Scalar {
        self.scalars.get(id, || self.flatbuffer_schema().scalar(id))
    }

    fn field(&self, id: FieldID) -> &Field {
        self.fields.get(id, || self.flatbuffer_schema().field(id))
    }

    fn object(&self, id: ObjectID) -> &Object {
        self.objects.get(id, || self.flatbuffer_schema().object(id))
    }

    fn union(&self, id: UnionID) -> &Union {
        self.unions.get(id, || self.flatbuffer_schema().union(id))
    }

    fn interface(&self, id: InterfaceID) -> &Interface {
        self.interfaces
            .get(id, || self.flatbuffer_schema().interface(id))
    }

    fn get_type_name(&self, type_: Type) -> StringKey {
        match type_ {
            Type::Enum(id) => self.enum_(id).name.item.0,
            Type::InputObject(id) => self.input_object(id).name.item.0,
            Type::Interface(id) => self.interface(id).name.item.0,
            Type::Object(id) => self.object(id).name.item.0,
            Type::Scalar(id) => self.scalar(id).name.item.0,
            Type::Union(id) => self.union(id).name.item.0,
        }
    }

    fn is_extension_type(&self, type_: Type) -> bool {
        match type_ {
            Type::Enum(id) => self.enum_(id).is_extension,
            Type::Interface(id) => self.interface(id).is_extension,
            Type::Object(id) => self.object(id).is_extension,
            Type::Scalar(id) => self.scalar(id).is_extension,
            Type::Union(id) => self.union(id).is_extension,
            Type::InputObject(_) => false,
        }
    }

    fn is_string(&self, type_: Type) -> bool {
        match type_ {
            Type::Scalar(id) => self.scalar(id).name.item.lookup() == "String",
            _ => false,
        }
    }

    fn is_id(&self, type_: Type) -> bool {
        match type_ {
            Type::Scalar(id) => self.scalar(id).name.item.lookup() == "ID",
            _ => false,
        }
    }

    fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID> {
        // Special case for __typename and __id fields, which should not be in the list of type fields
        // but should be fine to select.
        let can_have_typename = matches!(
            parent_type,
            Type::Object(_) | Type::Interface(_) | Type::Union(_)
        );
        if can_have_typename {
            if name == self.typename_field_name {
                return Some(TYPENAME_FIELD_ID);
            }
            // TODO(inanc): Also check if the parent type is fetchable?
            if name == self.fetch_token_field_name {
                return Some(FETCH_TOKEN_FIELD_ID);
            }
            if name == self.clientid_field_name {
                return Some(CLIENTID_FIELD_ID);
            }
            if name == self.strongid_field_name {
                return Some(STRONGID_FIELD_ID);
            }
            if name == self.is_fulfilled_field_name {
                return Some(IS_FULFILLED_FIELD_ID);
            }
        }

        let fields = match parent_type {
            Type::Object(id) => {
                let object = self.object(id);
                &object.fields
            }
            Type::Interface(id) => {
                let interface = self.interface(id);
                &interface.fields
            }
            // Unions don't have any fields, but can have selections like __typename
            // or a field with @fixme_fat_interface
            Type::Union(_) => return None,
            _ => panic!(
                "Cannot get field {} on type '{:?}', this type does not have fields",
                name,
                self.get_type_name(parent_type)
            ),
        };
        fields
            .iter()
            .find(|field_id| {
                let field = self.field(**field_id);
                field.name.item == name
            })
            .cloned()
    }

    fn unchecked_argument_type_sentinel(&self) -> &TypeReference<Type> {
        self.unchecked_argument_type_sentinel.as_ref().unwrap()
    }

    fn snapshot_print(&self) -> String {
        todo!()
    }

    fn input_objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a InputObject> + 'a> {
        if self.input_objects.map.len() < self.flatbuffer_schema().input_objects.len() {
            for i in 0..self.flatbuffer_schema().input_objects.len() {
                let id = InputObjectID(i.try_into().unwrap());
                self.input_object(id);
            }
        }

        Box::new(self.input_objects.map.iter().map(|ref_| *ref_.value()))
    }

    fn enums<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Enum> + 'a> {
        if self.enums.map.len() < self.flatbuffer_schema().enums.len() {
            for i in 0..self.flatbuffer_schema().enums.len() {
                let id = EnumID(i.try_into().unwrap());
                self.enum_(id);
            }
        }

        Box::new(self.enums.map.iter().map(|ref_| *ref_.value()))
    }

    fn scalars<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Scalar> + 'a> {
        if self.scalars.map.len() < self.flatbuffer_schema().scalars.len() {
            for i in 0..self.flatbuffer_schema().scalars.len() {
                let id = ScalarID(i.try_into().unwrap());
                self.scalar(id);
            }
        }

        Box::new(self.scalars.map.iter().map(|ref_| *ref_.value()))
    }

    fn fields<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Field> + 'a> {
        if self.fields.map.len() < self.flatbuffer_schema().fields.len() {
            for i in 0..self.flatbuffer_schema().fields.len() {
                let id = FieldID(i.try_into().unwrap());
                self.field(id);
            }
        }

        Box::new(self.fields.map.iter().map(|ref_| *ref_.value()))
    }

    fn objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Object> + 'a> {
        if self.objects.map.len() < self.flatbuffer_schema().objects.len() {
            for i in 0..self.flatbuffer_schema().objects.len() {
                let id = ObjectID(i.try_into().unwrap());
                self.object(id);
            }
        }

        Box::new(self.objects.map.iter().map(|ref_| *ref_.value()))
    }

    fn unions<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Union> + 'a> {
        if self.unions.map.len() < self.flatbuffer_schema().unions.len() {
            for i in 0..self.flatbuffer_schema().unions.len() {
                let id = UnionID(i.try_into().unwrap());
                self.union(id);
            }
        }

        Box::new(self.unions.map.iter().map(|ref_| *ref_.value()))
    }

    fn interfaces<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Interface> + 'a> {
        if self.interfaces.map.len() < self.flatbuffer_schema().interfaces.len() {
            for i in 0..self.flatbuffer_schema().interfaces.len() {
                let id = InterfaceID(i.try_into().unwrap());
                self.interface(id);
            }
        }

        Box::new(self.interfaces.map.iter().map(|ref_| *ref_.value()))
    }
}

struct Cache<K: Hash + Eq, V: 'static> {
    map: DashMap<K, &'static V, FnvBuildHasher>,
}
impl<K: Hash + Eq, V> Cache<K, V> {
    fn new() -> Self {
        Self {
            map: DashMap::with_hasher(FnvBuildHasher::default()),
        }
    }

    fn get(&self, key: K, f: impl FnOnce() -> V) -> &V {
        *self
            .map
            .entry(key)
            .or_insert_with(|| Box::leak(Box::new(f())))
    }
}

#[cfg(test)]
mod tests {
    use common::DiagnosticsResult;

    use super::*;
    use crate::build_schema;
    use crate::flatbuffer::serialize::serialize_as_flatbuffer;

    #[test]
    fn all_scalars() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?.unwrap_in_memory_impl();
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        let mut scalar_names = fb_schema
            .scalars()
            .map(|scalar| scalar.name.item.0.lookup())
            .collect::<Vec<&str>>();
        scalar_names.sort();
        assert_eq!(
            scalar_names,
            vec!["Boolean", "Float", "ID", "Int", "String"]
        );

        Ok(())
    }

    #[test]
    fn all_scalars_with_lookup() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?.unwrap_in_memory_impl();
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        // Look up a scalar type to populate cache
        let user_type = fb_schema.get_type("String".intern()).unwrap();
        fb_schema.scalar(user_type.get_scalar_id().unwrap());

        let mut scalar_names = fb_schema
            .scalars()
            .map(|scalar| scalar.name.item.0.lookup())
            .collect::<Vec<&str>>();
        scalar_names.sort();
        assert_eq!(
            scalar_names,
            vec!["Boolean", "Float", "ID", "Int", "String"]
        );

        Ok(())
    }

    #[test]
    fn all_types() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        type User { id: ID }
        type MailingAddress { id: ID }
        type Country { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?.unwrap_in_memory_impl();
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        let mut object_names = fb_schema
            .objects()
            .map(|object| object.name.item.0.lookup())
            .collect::<Vec<&str>>();
        object_names.sort();
        assert_eq!(
            object_names,
            vec!["Country", "MailingAddress", "Query", "User"]
        );

        Ok(())
    }

    #[test]
    fn all_types_with_lookup() -> DiagnosticsResult<()> {
        let sdl = "
        type Query { id: ID }
        type User { id: ID }
        type MailingAddress { id: ID }
        type Country { id: ID }
        ";
        let sdl_schema = build_schema(sdl)?.unwrap_in_memory_impl();
        let bytes = serialize_as_flatbuffer(&sdl_schema);
        let fb_schema = SchemaWrapper::from_vec(bytes);

        // Look up User type to populate cache
        let user_type = fb_schema.get_type("User".intern()).unwrap();
        fb_schema.object(user_type.get_object_id().unwrap());

        let mut object_names = fb_schema
            .objects()
            .map(|object| object.name.item.0.lookup())
            .collect::<Vec<&str>>();
        object_names.sort();
        assert_eq!(
            object_names,
            vec!["Country", "MailingAddress", "Query", "User"]
        );

        Ok(())
    }
}
