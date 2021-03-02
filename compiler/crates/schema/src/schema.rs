/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::definitions::{Directive, *};
use crate::sdl::SDLSchemaImpl;
use crate::{flatbuffer::SchemaWrapper, graphql_schema::Schema};
use common::DiagnosticsResult;
use graphql_syntax::*;
use interner::StringKey;

#[derive(Debug)]
pub enum SDLSchema {
    SDL(SDLSchemaImpl),
    FlatBuffer(SchemaWrapper),
}

impl Schema for SDLSchema {
    fn query_type(&self) -> Option<Type> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.query_type(),
            SDLSchema::SDL(schema) => schema.query_type(),
        }
    }

    fn mutation_type(&self) -> Option<Type> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.mutation_type(),
            SDLSchema::SDL(schema) => schema.mutation_type(),
        }
    }

    fn subscription_type(&self) -> Option<Type> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.subscription_type(),
            SDLSchema::SDL(schema) => schema.subscription_type(),
        }
    }

    fn clientid_field(&self) -> FieldID {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.clientid_field(),
            SDLSchema::SDL(schema) => schema.clientid_field(),
        }
    }

    fn typename_field(&self) -> FieldID {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.typename_field(),
            SDLSchema::SDL(schema) => schema.typename_field(),
        }
    }

    fn fetch_token_field(&self) -> FieldID {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.fetch_token_field(),
            SDLSchema::SDL(schema) => schema.fetch_token_field(),
        }
    }

    fn get_type(&self, type_name: StringKey) -> Option<Type> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.get_type(type_name),
            SDLSchema::SDL(schema) => schema.get_type(type_name),
        }
    }

    fn get_directive(&self, name: StringKey) -> Option<&Directive> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.get_directive(name),
            SDLSchema::SDL(schema) => schema.get_directive(name),
        }
    }

    fn input_object(&self, id: InputObjectID) -> &InputObject {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.input_object(id),
            SDLSchema::SDL(schema) => schema.input_object(id),
        }
    }

    fn enum_(&self, id: EnumID) -> &Enum {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.enum_(id),
            SDLSchema::SDL(schema) => schema.enum_(id),
        }
    }

    fn scalar(&self, id: ScalarID) -> &Scalar {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.scalar(id),
            SDLSchema::SDL(schema) => schema.scalar(id),
        }
    }

    fn field(&self, id: FieldID) -> &Field {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.field(id),
            SDLSchema::SDL(schema) => schema.field(id),
        }
    }

    fn object(&self, id: ObjectID) -> &Object {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.object(id),
            SDLSchema::SDL(schema) => schema.object(id),
        }
    }

    fn union(&self, id: UnionID) -> &Union {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.union(id),
            SDLSchema::SDL(schema) => schema.union(id),
        }
    }

    fn interface(&self, id: InterfaceID) -> &Interface {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.interface(id),
            SDLSchema::SDL(schema) => schema.interface(id),
        }
    }

    fn get_type_name(&self, type_: Type) -> StringKey {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.get_type_name(type_),
            SDLSchema::SDL(schema) => schema.get_type_name(type_),
        }
    }

    fn is_extension_type(&self, type_: Type) -> bool {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.is_extension_type(type_),
            SDLSchema::SDL(schema) => schema.is_extension_type(type_),
        }
    }

    fn is_string(&self, type_: Type) -> bool {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.is_string(type_),
            SDLSchema::SDL(schema) => schema.is_string(type_),
        }
    }

    fn is_id(&self, type_: Type) -> bool {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.is_id(type_),
            SDLSchema::SDL(schema) => schema.is_id(type_),
        }
    }

    fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID> {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.named_field(parent_type, name),
            SDLSchema::SDL(schema) => schema.named_field(parent_type, name),
        }
    }

    /// A value that represents a type of unchecked arguments where we don't
    /// have a type to instantiate the argument.
    ///
    /// TODO: we probably want to replace this with a proper `Unknown` type.
    fn unchecked_argument_type_sentinel(&self) -> &TypeReference {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.unchecked_argument_type_sentinel(),
            SDLSchema::SDL(schema) => schema.unchecked_argument_type_sentinel(),
        }
    }

    fn snapshot_print(&self) -> String {
        match self {
            SDLSchema::FlatBuffer(schema) => schema.snapshot_print(),
            SDLSchema::SDL(schema) => schema.snapshot_print(),
        }
    }
}

impl SDLSchema {
    /// Creates an uninitialized, invalid schema which can then be added to using the add_*
    /// methods. Note that we still bake in some assumptions about the clientid and typename
    /// fields, but in practice this is not an issue.
    pub fn create_uninitialized() -> Self {
        SDLSchema::SDL(SDLSchemaImpl::create_uninitialized())
    }

    pub fn build(
        schema_definitions: &[graphql_syntax::TypeSystemDefinition],
        client_definitions: &[graphql_syntax::TypeSystemDefinition],
    ) -> DiagnosticsResult<Self> {
        Ok(SDLSchema::SDL(SDLSchemaImpl::build(
            schema_definitions,
            client_definitions,
        )?))
    }

    pub fn build_flatbuffer(
        schema_definitions: &[graphql_syntax::TypeSystemDefinition],
        client_definitions: &[graphql_syntax::TypeSystemDefinition],
    ) -> DiagnosticsResult<Self> {
        let sdl_schema = crate::sdl::SDLSchemaImpl::build(schema_definitions, client_definitions)?;
        let flatbuffer_bytes = crate::flatbuffer::serialize_as_flatbuffer(&sdl_schema);
        Ok(SDLSchema::FlatBuffer(SchemaWrapper::from_vec(
            flatbuffer_bytes,
        )))
    }

    pub fn unwrap_sdl_impl(self) -> SDLSchemaImpl {
        match self {
            SDLSchema::FlatBuffer(_schema) => panic!("expected an underlying SDL schema"),
            SDLSchema::SDL(schema) => schema,
        }
    }

    pub fn get_directive_mut(&mut self, name: StringKey) -> Option<&mut Directive> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_directive_mut(name),
        }
    }

    pub fn get_type_map(&self) -> impl Iterator<Item = (&StringKey, &Type)> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_type_map(),
        }
    }

    pub fn get_directives(&self) -> impl Iterator<Item = &Directive> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_directives(),
        }
    }

    /// Returns all directives applicable for a given location(Query, Field, etc).
    pub fn directives_for_location(&self, location: DirectiveLocation) -> Vec<&Directive> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.directives_for_location(location),
        }
    }

    pub fn get_fields(&self) -> impl Iterator<Item = &Field> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_fields(),
        }
    }

    pub fn get_interfaces(&self) -> impl Iterator<Item = &Interface> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_interfaces(),
        }
    }

    pub fn get_enums(&self) -> impl Iterator<Item = &Enum> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_enums(),
        }
    }

    pub fn get_objects(&self) -> impl Iterator<Item = &Object> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.get_objects(),
        }
    }

    pub fn has_directive(&self, directive_name: StringKey) -> bool {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.has_directive(directive_name),
        }
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.has_type(type_name),
        }
    }

    pub fn add_directive(&mut self, directive: Directive) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_directive(directive),
        }
    }

    pub fn add_field(&mut self, field: Field) -> DiagnosticsResult<FieldID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_field(field),
        }
    }

    pub fn add_enum(&mut self, enum_: Enum) -> DiagnosticsResult<EnumID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_enum(enum_),
        }
    }

    pub fn add_input_object(
        &mut self,
        input_object: InputObject,
    ) -> DiagnosticsResult<InputObjectID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_input_object(input_object),
        }
    }

    pub fn add_interface(&mut self, interface: Interface) -> DiagnosticsResult<InterfaceID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_interface(interface),
        }
    }

    pub fn add_object(&mut self, object: Object) -> DiagnosticsResult<ObjectID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_object(object),
        }
    }

    pub fn add_scalar(&mut self, scalar: Scalar) -> DiagnosticsResult<ScalarID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_scalar(scalar),
        }
    }

    pub fn add_union(&mut self, union: Union) -> DiagnosticsResult<UnionID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_union(union),
        }
    }

    pub fn add_field_to_interface(
        &mut self,
        interface_id: InterfaceID,
        field_id: FieldID,
    ) -> DiagnosticsResult<InterfaceID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_field_to_interface(interface_id, field_id),
        }
    }

    pub fn add_field_to_object(
        &mut self,
        obj_id: ObjectID,
        field_id: FieldID,
    ) -> DiagnosticsResult<ObjectID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_field_to_object(obj_id, field_id),
        }
    }

    pub fn add_interface_to_object(
        &mut self,
        obj_id: ObjectID,
        interface_id: InterfaceID,
    ) -> DiagnosticsResult<ObjectID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_interface_to_object(obj_id, interface_id),
        }
    }

    pub fn add_parent_interface_to_interface(
        &mut self,
        interface_id: InterfaceID,
        parent_interface_id: InterfaceID,
    ) -> DiagnosticsResult<InterfaceID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => {
                schema.add_parent_interface_to_interface(interface_id, parent_interface_id)
            }
        }
    }

    pub fn add_implementing_object_to_interface(
        &mut self,
        interface_id: InterfaceID,
        object_id: ObjectID,
    ) -> DiagnosticsResult<InterfaceID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => {
                schema.add_implementing_object_to_interface(interface_id, object_id)
            }
        }
    }

    pub fn add_member_to_union(
        &mut self,
        union_id: UnionID,
        object_id: ObjectID,
    ) -> DiagnosticsResult<UnionID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.add_member_to_union(union_id, object_id),
        }
    }

    /// Sets argument definitions for a given input object.
    /// Any existing argument definitions will be erased.
    pub fn set_input_object_args(
        &mut self,
        input_object_id: InputObjectID,
        fields: ArgumentDefinitions,
    ) -> DiagnosticsResult<InputObjectID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.set_input_object_args(input_object_id, fields),
        }
    }

    /// Sets argument definitions for a given field.
    /// Any existing argument definitions on the field will be erased.
    pub fn set_field_args(
        &mut self,
        field_id: FieldID,
        args: ArgumentDefinitions,
    ) -> DiagnosticsResult<FieldID> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.set_field_args(field_id, args),
        }
    }

    /// Replaces the definition of interface type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_interface(
        &mut self,
        id: InterfaceID,
        interface: Interface,
    ) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_interface(id, interface),
        }
    }

    /// Replaces the definition of object type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_object(&mut self, id: ObjectID, object: Object) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_object(id, object),
        }
    }

    /// Replaces the definition of enum type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_enum(&mut self, id: EnumID, enum_: Enum) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_enum(id, enum_),
        }
    }

    /// Replaces the definition of input object type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_input_object(
        &mut self,
        id: InputObjectID,
        input_object: InputObject,
    ) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_input_object(id, input_object),
        }
    }

    /// Replaces the definition of union type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_union(&mut self, id: UnionID, union: Union) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_union(id, union),
        }
    }

    /// Replaces the definition of field, but keeps the same id.
    /// Existing references to the old field now reference the replacement.
    pub fn replace_field(&mut self, id: FieldID, field: Field) -> DiagnosticsResult<()> {
        match self {
            SDLSchema::FlatBuffer(_schema) => todo!(),
            SDLSchema::SDL(schema) => schema.replace_field(id, field),
        }
    }
}
