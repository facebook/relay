/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::errors::SchemaError;
use common::{Diagnostic, DiagnosticsResult, Location, Named, NamedItem};
use graphql_syntax::*;
use interner::{Intern, StringKey};
use std::collections::{BTreeMap, HashMap, HashSet};
use std::convert::TryInto;
use std::fmt;
use std::fmt::{Result as FormatResult, Write};
use std::hash::Hash;
use std::slice::Iter;

type TypeMap = HashMap<StringKey, Type>;

fn todo_add_location<T>(error: SchemaError) -> DiagnosticsResult<T> {
    Err(vec![Diagnostic::error(error, Location::generated())])
}

#[derive(Debug)]
pub struct Schema {
    query_type: Option<ObjectID>,
    mutation_type: Option<ObjectID>,
    subscription_type: Option<ObjectID>,
    type_map: TypeMap,

    clientid_field: FieldID,
    typename_field: FieldID,

    clientid_field_name: StringKey,
    typename_field_name: StringKey,

    string_type: Type,
    id_type: Type,

    unchecked_argument_type_sentinel: TypeReference,

    directives: HashMap<StringKey, Directive>,

    enums: Vec<Enum>,
    fields: Vec<Field>,
    input_objects: Vec<InputObject>,
    interfaces: Vec<Interface>,
    objects: Vec<Object>,
    scalars: Vec<Scalar>,
    unions: Vec<Union>,
}

impl Schema {
    pub fn query_type(&self) -> Option<Type> {
        self.query_type.as_ref().map(|x| Type::Object(*x))
    }

    pub fn mutation_type(&self) -> Option<Type> {
        self.mutation_type.as_ref().map(|x| Type::Object(*x))
    }

    pub fn subscription_type(&self) -> Option<Type> {
        self.subscription_type.as_ref().map(|x| Type::Object(*x))
    }

    pub fn clientid_field(&self) -> FieldID {
        self.clientid_field
    }

    pub fn typename_field(&self) -> FieldID {
        self.typename_field
    }

    pub fn get_type(&self, type_name: StringKey) -> Option<Type> {
        self.type_map.get(&type_name).cloned()
    }

    /// A value that represents a type of unchecked arguments where we don't
    /// have a type to instantiate the argument.
    ///
    /// TODO: we probably want to replace this with a proper `Unknown` type.
    pub fn unchecked_argument_type_sentinel(&self) -> &TypeReference {
        &self.unchecked_argument_type_sentinel
    }

    pub fn is_type_subtype_of(
        &self,
        maybe_subtype: &TypeReference,
        super_type: &TypeReference,
    ) -> bool {
        match (maybe_subtype, super_type) {
            (TypeReference::NonNull(of_sub), TypeReference::NonNull(of_super)) => {
                self.is_type_subtype_of(of_sub, of_super)
            }
            // If supertype is non-null, maybeSubType must be non-nullable too
            (_, TypeReference::NonNull(_)) => false,
            // If supertype is nullable, maybeSubType may be non-nullable or nullable
            (TypeReference::NonNull(of_sub), _) => self.is_type_subtype_of(of_sub, super_type),
            (TypeReference::List(of_sub), TypeReference::List(of_super)) => {
                self.is_type_subtype_of(of_sub, of_super)
            }
            // If supertype is a list, maybeSubType must be a list too
            (_, TypeReference::List(_)) => false,
            // If supertype is not a list, maybeSubType must also not be a list
            (TypeReference::List(_), _) => false,
            (TypeReference::Named(named_subtype), TypeReference::Named(named_supertype)) => {
                self.is_named_type_subtype_of(*named_subtype, *named_supertype)
            }
        }
    }

    pub fn is_named_type_subtype_of(&self, maybe_subtype: Type, super_type: Type) -> bool {
        match (maybe_subtype, super_type) {
            (Type::Object(sub_id), Type::Interface(super_id)) => {
                // does object implement the interface
                let object = self.object(sub_id);
                object.interfaces.contains(&super_id)
            }
            (Type::Object(sub_id), Type::Union(super_id)) => {
                // is object a member of the union
                let union = self.union(super_id);
                union.members.contains(&sub_id)
            }
            (Type::Interface(sub_id), Type::Interface(super_id)) => {
                // does interface implement the interface
                let interface = self.interface(sub_id);
                sub_id == super_id || interface.interfaces.contains(&super_id)
            }
            _ => maybe_subtype == super_type,
        }
    }

    pub fn are_overlapping_types(&self, a: Type, b: Type) -> bool {
        if a == b {
            return true;
        };
        match (a, b) {
            (Type::Interface(a), Type::Interface(b)) => {
                let b_implementors = &self.interface(b).implementing_objects;
                self.interface(a)
                    .implementing_objects
                    .iter()
                    .any(|x| b_implementors.contains(x))
            }
            (Type::Interface(a), Type::Union(b)) => {
                let b_members = &self.union(b).members;
                self.interface(a)
                    .implementing_objects
                    .iter()
                    .any(|x| b_members.contains(x))
            }
            (Type::Interface(a), Type::Object(b)) => {
                self.interface(a).implementing_objects.contains(&b)
            }
            (Type::Union(a), Type::Interface(b)) => {
                let b_implementors = &self.interface(b).implementing_objects;
                self.union(a)
                    .members
                    .iter()
                    .any(|x| b_implementors.contains(x))
            }
            (Type::Union(a), Type::Union(b)) => {
                let b_members = &self.union(b).members;
                self.union(a).members.iter().any(|x| b_members.contains(x))
            }
            (Type::Union(a), Type::Object(b)) => self.union(a).members.contains(&b),
            (Type::Object(a), Type::Interface(b)) => {
                self.interface(b).implementing_objects.contains(&a)
            }
            (Type::Object(a), Type::Union(b)) => self.union(b).members.contains(&a),
            (Type::Object(a), Type::Object(b)) => a == b,
            _ => false, // todo: change Type representation to allow only Interface/Union/Object as input
        }
    }

    pub fn is_abstract_type(&self, type_: Type) -> bool {
        type_.is_abstract_type()
    }

    pub fn is_object(&self, type_: Type) -> bool {
        type_.is_object()
    }

    pub fn is_interface(&self, type_: Type) -> bool {
        type_.is_interface()
    }

    pub fn is_string(&self, type_: Type) -> bool {
        type_ == self.string_type
    }

    fn write_type_string<W: Write>(&self, writer: &mut W, type_: &TypeReference) -> FormatResult {
        match type_ {
            TypeReference::Named(inner) => {
                write!(writer, "{}", self.get_type_name(*inner).lookup())
            }
            TypeReference::NonNull(of) => {
                self.write_type_string(writer, of)?;
                write!(writer, "!")
            }
            TypeReference::List(of) => {
                write!(writer, "[")?;
                self.write_type_string(writer, of)?;
                write!(writer, "]")
            }
        }
    }

    pub fn get_type_string(&self, type_: &TypeReference) -> String {
        let mut result = String::new();
        self.write_type_string(&mut result, type_).unwrap();
        result
    }

    pub fn get_type_name(&self, type_: Type) -> StringKey {
        match type_ {
            Type::Enum(id) => self.enums[id.as_usize()].name,
            Type::InputObject(id) => self.input_objects[id.as_usize()].name,
            Type::Interface(id) => self.interfaces[id.as_usize()].name,
            Type::Object(id) => self.objects[id.as_usize()].name,
            Type::Scalar(id) => self.scalars[id.as_usize()].name,
            Type::Union(id) => self.unions[id.as_usize()].name,
        }
    }

    pub fn is_extension_type(&self, type_: Type) -> bool {
        match type_ {
            Type::Enum(id) => self.enums[id.as_usize()].is_extension,
            Type::Interface(id) => self.interfaces[id.as_usize()].is_extension,
            Type::Object(id) => self.objects[id.as_usize()].is_extension,
            Type::Scalar(id) => self.scalars[id.as_usize()].is_extension,
            Type::Union(id) => self.unions[id.as_usize()].is_extension,
            Type::InputObject(_) => false,
        }
    }

    pub fn get_directive(&self, name: StringKey) -> Option<&Directive> {
        self.directives.get(&name)
    }

    pub fn is_extension_directive(&self, name: StringKey) -> bool {
        if let Some(directive) = self.get_directive(name) {
            directive.is_extension
        } else {
            panic!("Unknown directive {}.", name.lookup())
        }
    }

    pub fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID> {
        // Special case for __typename and __id fields, which should not be in the list of type fields
        // but should be fine to select.
        let can_have_typename = parent_type.is_object() || parent_type.is_abstract_type();
        if can_have_typename {
            if name == self.typename_field_name {
                return Some(self.typename_field);
            }
            if name == self.clientid_field_name {
                return Some(self.clientid_field);
            }
        }

        let fields = match parent_type {
            Type::Object(id) => {
                let object = &self.objects[id.as_usize()];
                &object.fields
            }
            Type::Interface(id) => {
                let interface = &self.interfaces[id.as_usize()];
                &interface.fields
            }
            // Unions don't have any fields, but can have selections like __typename
            // or a field with @fixme_fat_interface
            Type::Union(_) => return None,
            _ => panic!(
                "Cannot get field {} on type '{:?}', this type does not have fields",
                name.lookup(),
                self.get_type_name(parent_type)
            ),
        };
        fields
            .iter()
            .find(|field_id| {
                let field = &self.fields[field_id.as_usize()];
                field.name == name
            })
            .cloned()
    }

    pub fn input_object(&self, id: InputObjectID) -> &InputObject {
        &self.input_objects[id.as_usize()]
    }

    pub fn enum_(&self, id: EnumID) -> &Enum {
        &self.enums[id.as_usize()]
    }

    pub fn scalar(&self, id: ScalarID) -> &Scalar {
        &self.scalars[id.as_usize()]
    }

    pub fn field(&self, id: FieldID) -> &Field {
        &self.fields[id.as_usize()]
    }

    pub fn object(&self, id: ObjectID) -> &Object {
        &self.objects[id.as_usize()]
    }

    pub fn union(&self, id: UnionID) -> &Union {
        &self.unions[id.as_usize()]
    }

    pub fn interface(&self, id: InterfaceID) -> &Interface {
        &self.interfaces[id.as_usize()]
    }

    pub fn is_id(&self, type_: Type) -> bool {
        type_ == self.id_type
    }

    pub fn get_type_map(&self) -> impl Iterator<Item = (&StringKey, &Type)> {
        self.type_map.iter()
    }

    pub fn get_directives(&self) -> impl Iterator<Item = &Directive> {
        self.directives.values()
    }

    /// Returns all directives applicable for a given location(Query, Field, etc).
    pub fn directives_for_location(&self, location: DirectiveLocation) -> Vec<&Directive> {
        self.directives
            .values()
            .filter(|directive| directive.locations.contains(&location))
            .collect()
    }

    pub fn get_fields(&self) -> impl Iterator<Item = &Field> {
        self.fields.iter()
    }

    pub fn get_interfaces(&self) -> impl Iterator<Item = &Interface> {
        self.interfaces.iter()
    }

    pub fn get_enums(&self) -> impl Iterator<Item = &Enum> {
        self.enums.iter()
    }

    pub fn get_objects(&self) -> impl Iterator<Item = &Object> {
        self.objects.iter()
    }

    pub fn has_directive(&self, directive_name: StringKey) -> bool {
        self.directives.contains_key(&directive_name)
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        self.type_map.contains_key(&type_name)
    }

    pub fn add_directive(&mut self, directive: Directive) -> DiagnosticsResult<()> {
        if self.directives.contains_key(&directive.name) {
            return todo_add_location(SchemaError::DuplicateDirectiveDefinition(directive.name));
        }
        self.directives.insert(directive.name, directive);
        Ok(())
    }

    pub fn add_field(&mut self, field: Field) -> DiagnosticsResult<FieldID> {
        Ok(self.build_field(field))
    }

    pub fn add_enum(&mut self, enum_: Enum) -> DiagnosticsResult<EnumID> {
        if self.type_map.contains_key(&enum_.name) {
            return todo_add_location(SchemaError::DuplicateType(enum_.name));
        }
        let index: u32 = self.enums.len().try_into().unwrap();
        let name = enum_.name;
        self.enums.push(enum_);
        self.type_map.insert(name, Type::Enum(EnumID(index)));
        Ok(EnumID(index))
    }

    pub fn add_input_object(
        &mut self,
        input_object: InputObject,
    ) -> DiagnosticsResult<InputObjectID> {
        if self.type_map.contains_key(&input_object.name) {
            return todo_add_location(SchemaError::DuplicateType(input_object.name));
        }
        let index: u32 = self.input_objects.len().try_into().unwrap();
        let name = input_object.name;
        self.input_objects.push(input_object);
        self.type_map
            .insert(name, Type::InputObject(InputObjectID(index)));
        Ok(InputObjectID(index))
    }

    pub fn add_interface(&mut self, interface: Interface) -> DiagnosticsResult<InterfaceID> {
        if self.type_map.contains_key(&interface.name) {
            return todo_add_location(SchemaError::DuplicateType(interface.name));
        }
        let index: u32 = self.interfaces.len().try_into().unwrap();
        let name = interface.name;
        self.interfaces.push(interface);
        self.type_map
            .insert(name, Type::Interface(InterfaceID(index)));
        Ok(InterfaceID(index))
    }

    pub fn add_object(&mut self, object: Object) -> DiagnosticsResult<ObjectID> {
        if self.type_map.contains_key(&object.name) {
            return todo_add_location(SchemaError::DuplicateType(object.name));
        }
        let index: u32 = self.objects.len().try_into().unwrap();
        let name = object.name;
        self.objects.push(object);
        self.type_map.insert(name, Type::Object(ObjectID(index)));
        Ok(ObjectID(index))
    }

    pub fn add_scalar(&mut self, scalar: Scalar) -> DiagnosticsResult<ScalarID> {
        if self.type_map.contains_key(&scalar.name) {
            return todo_add_location(SchemaError::DuplicateType(scalar.name));
        }
        let index: u32 = self.scalars.len().try_into().unwrap();
        let name = scalar.name;
        self.scalars.push(scalar);
        self.type_map.insert(name, Type::Scalar(ScalarID(index)));
        Ok(ScalarID(index))
    }

    pub fn add_union(&mut self, union: Union) -> DiagnosticsResult<UnionID> {
        if self.type_map.contains_key(&union.name) {
            return todo_add_location(SchemaError::DuplicateType(union.name));
        }
        let index: u32 = self.unions.len().try_into().unwrap();
        let name = union.name;
        self.unions.push(union);
        self.type_map.insert(name, Type::Union(UnionID(index)));
        Ok(UnionID(index))
    }

    pub fn add_field_to_interface(
        &mut self,
        interface_id: InterfaceID,
        field_id: FieldID,
    ) -> DiagnosticsResult<InterfaceID> {
        let interface = self.interfaces.get_mut(interface_id.as_usize()).unwrap();
        interface.fields.push(field_id);
        Ok(interface_id)
    }

    pub fn add_field_to_object(
        &mut self,
        obj_id: ObjectID,
        field_id: FieldID,
    ) -> DiagnosticsResult<ObjectID> {
        let object = self.objects.get_mut(obj_id.as_usize()).unwrap();
        object.fields.push(field_id);
        Ok(obj_id)
    }

    pub fn add_interface_to_object(
        &mut self,
        obj_id: ObjectID,
        interface_id: InterfaceID,
    ) -> DiagnosticsResult<ObjectID> {
        let object = self.objects.get_mut(obj_id.as_usize()).unwrap();
        object.interfaces.push(interface_id);
        Ok(obj_id)
    }

    pub fn add_parent_interface_to_interface(
        &mut self,
        interface_id: InterfaceID,
        parent_interface_id: InterfaceID,
    ) -> DiagnosticsResult<InterfaceID> {
        let interface = self.interfaces.get_mut(interface_id.as_usize()).unwrap();
        interface.interfaces.push(parent_interface_id);
        Ok(interface_id)
    }

    pub fn add_member_to_union(
        &mut self,
        union_id: UnionID,
        object_id: ObjectID,
    ) -> DiagnosticsResult<UnionID> {
        let union = self.unions.get_mut(union_id.as_usize()).unwrap();
        union.members.push(object_id);
        Ok(union_id)
    }

    /// Sets argument definitions for a given input object.
    /// Any existing argument definitions will be erased.
    pub fn set_input_object_args(
        &mut self,
        input_object_id: InputObjectID,
        fields: ArgumentDefinitions,
    ) -> DiagnosticsResult<InputObjectID> {
        let input_object = self
            .input_objects
            .get_mut(input_object_id.as_usize())
            .unwrap();
        input_object.fields = fields;
        Ok(input_object_id)
    }

    /// Sets argument definitions for a given field.
    /// Any existing argument definitions on the field will be erased.
    pub fn set_field_args(
        &mut self,
        field_id: FieldID,
        args: ArgumentDefinitions,
    ) -> DiagnosticsResult<FieldID> {
        let field = self.fields.get_mut(field_id.as_usize()).unwrap();
        field.arguments = args;
        Ok(field_id)
    }

    /// Replaces the definition of interface type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_interface(
        &mut self,
        id: InterfaceID,
        interface: Interface,
    ) -> DiagnosticsResult<()> {
        if id.as_usize() >= self.interfaces.len() {
            return todo_add_location(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Interface"),
            ));
        }
        self.type_map
            .remove(&self.get_type_name(Type::Interface(id)));
        self.type_map.insert(interface.name, Type::Interface(id));
        self.interfaces[id.as_usize()] = interface;
        Ok(())
    }

    /// Replaces the definition of object type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_object(&mut self, id: ObjectID, object: Object) -> DiagnosticsResult<()> {
        if id.as_usize() >= self.objects.len() {
            return todo_add_location(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Object"),
            ));
        }
        self.type_map.remove(&self.get_type_name(Type::Object(id)));
        self.type_map.insert(object.name, Type::Object(id));
        self.objects[id.as_usize()] = object;
        Ok(())
    }

    /// Replaces the definition of enum type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_enum(&mut self, id: EnumID, enum_: Enum) -> DiagnosticsResult<()> {
        if id.as_usize() >= self.enums.len() {
            return todo_add_location(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Enum"),
            ));
        }
        self.type_map.remove(&self.get_type_name(Type::Enum(id)));
        self.type_map.insert(enum_.name, Type::Enum(id));
        self.enums[id.as_usize()] = enum_;
        Ok(())
    }

    /// Replaces the definition of input object type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_input_object(
        &mut self,
        id: InputObjectID,
        input_object: InputObject,
    ) -> DiagnosticsResult<()> {
        if id.as_usize() >= self.enums.len() {
            return todo_add_location(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Input Object"),
            ));
        }
        self.type_map
            .remove(&self.get_type_name(Type::InputObject(id)));
        self.type_map
            .insert(input_object.name, Type::InputObject(id));
        self.input_objects[id.as_usize()] = input_object;
        Ok(())
    }

    /// Replaces the definition of union type, but keeps the same id.
    /// Existing references to the old type now reference the replacement.
    pub fn replace_union(&mut self, id: UnionID, union: Union) -> DiagnosticsResult<()> {
        if id.as_usize() >= self.enums.len() {
            return todo_add_location(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Union"),
            ));
        }
        self.type_map.remove(&self.get_type_name(Type::Union(id)));
        self.type_map.insert(union.name, Type::Union(id));
        self.unions[id.as_usize()] = union;
        Ok(())
    }

    /// Replaces the definition of field, but keeps the same id.
    /// Existing references to the old field now reference the replacement.
    pub fn replace_field(&mut self, id: FieldID, field: Field) -> DiagnosticsResult<()> {
        let id = id.as_usize();
        if id >= self.fields.len() {
            return todo_add_location(SchemaError::UnknownTypeID(id, String::from("Field")));
        }
        self.fields[id] = field;
        Ok(())
    }

    pub fn build(
        schema_definitions: &[graphql_syntax::TypeSystemDefinition],
        client_definitions: &[graphql_syntax::TypeSystemDefinition],
    ) -> DiagnosticsResult<Self> {
        // Step 1: build the type_map from type names to type keys
        let mut type_map =
            HashMap::with_capacity(schema_definitions.len() + client_definitions.len());
        let mut next_object_id = 0;
        let mut next_interface_id = 0;
        let mut next_union_id = 0;
        let mut next_input_object_id = 0;
        let mut next_enum_id = 0;
        let mut next_scalar_id = 0;
        let mut field_count = 0;
        let mut directive_count = 0;
        for definition in schema_definitions.iter().chain(client_definitions) {
            match definition {
                TypeSystemDefinition::SchemaDefinition { .. } => {}
                TypeSystemDefinition::DirectiveDefinition { .. } => {
                    directive_count += 1;
                }
                TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                    name,
                    fields,
                    ..
                }) => {
                    type_map.insert(name.value, Type::Object(ObjectID(next_object_id)));
                    field_count += len_of_option_list(fields);
                    next_object_id += 1;
                }
                TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                    name,
                    fields,
                    ..
                }) => {
                    type_map.insert(name.value, Type::Interface(InterfaceID(next_interface_id)));
                    field_count += len_of_option_list(fields);
                    next_interface_id += 1;
                }
                TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition { name, .. }) => {
                    type_map.insert(name.value, Type::Union(UnionID(next_union_id)));
                    next_union_id += 1;
                }
                TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                    name,
                    ..
                }) => {
                    type_map.insert(
                        name.value,
                        Type::InputObject(InputObjectID(next_input_object_id)),
                    );
                    next_input_object_id += 1;
                }
                TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition { name, .. }) => {
                    type_map.insert(name.value, Type::Enum(EnumID(next_enum_id)));
                    next_enum_id += 1;
                }
                TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                    name, ..
                }) => {
                    type_map.insert(name.value, Type::Scalar(ScalarID(next_scalar_id)));
                    next_scalar_id += 1;
                }
                TypeSystemDefinition::ObjectTypeExtension { .. } => {}
                TypeSystemDefinition::InterfaceTypeExtension { .. } => {}
                TypeSystemDefinition::SchemaExtension { .. } => todo!("SchemaExtension"),
                TypeSystemDefinition::EnumTypeExtension { .. } => todo!("EnumTypeExtension"),
                TypeSystemDefinition::UnionTypeExtension { .. } => todo!("UnionTypeExtension"),
                TypeSystemDefinition::InputObjectTypeExtension { .. } => {
                    todo!("InputObjectTypeExtension")
                }
                TypeSystemDefinition::ScalarTypeExtension { .. } => todo!("ScalarTypeExtension"),
            }
        }

        // Step 2: define operation types, directives, and types
        let string_type = *type_map.get(&"String".intern()).unwrap();
        let id_type = *type_map.get(&"ID".intern()).unwrap();

        let unchecked_argument_type_sentinel =
            TypeReference::Named(*type_map.get(&"Boolean".intern()).unwrap());

        let mut schema = Schema {
            query_type: None,
            mutation_type: None,
            subscription_type: None,
            type_map,
            clientid_field: FieldID(0), // dummy value, overwritten later
            typename_field: FieldID(0), // dummy value, overwritten later
            clientid_field_name: "__id".intern(),
            typename_field_name: "__typename".intern(),
            string_type,
            id_type,
            unchecked_argument_type_sentinel,
            directives: HashMap::with_capacity(directive_count),
            enums: Vec::with_capacity(next_enum_id.try_into().unwrap()),
            fields: Vec::with_capacity(field_count),
            input_objects: Vec::with_capacity(next_input_object_id.try_into().unwrap()),
            interfaces: Vec::with_capacity(next_interface_id.try_into().unwrap()),
            objects: Vec::with_capacity(next_object_id.try_into().unwrap()),
            scalars: Vec::with_capacity(next_scalar_id.try_into().unwrap()),
            unions: Vec::with_capacity(next_union_id.try_into().unwrap()),
        };

        for definition in schema_definitions {
            schema.add_definition(definition, false)?;
        }

        for definition in client_definitions {
            schema.add_definition(definition, true)?;
        }

        for definition in schema_definitions.iter().chain(client_definitions) {
            if let TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                name,
                interfaces,
                ..
            }) = definition
            {
                let object_id = match schema.type_map.get(&name.value) {
                    Some(Type::Object(id)) => id,
                    _ => unreachable!("Must be an Object type"),
                };
                for interface in interfaces {
                    let type_ = schema.type_map.get(&interface.value).unwrap();
                    match type_ {
                        Type::Interface(id) => {
                            let interface = schema.interfaces.get_mut(id.as_usize()).unwrap();
                            interface.implementing_objects.push(*object_id)
                        }
                        _ => unreachable!("Must be an interface"),
                    }
                }
            }
        }

        schema.load_default_root_types();
        schema.load_default_typename_field();
        schema.load_default_clientid_field();

        Ok(schema)
    }

    // In case the schema doesn't define a query, mutation or subscription
    // type, but there is a Query, Mutation, or Subscription object type
    // defined, default to those.
    // This is not standard GraphQL behavior, and we might want to remove
    // this at some point.
    fn load_default_root_types(&mut self) {
        if self.query_type.is_none() {
            if let Some(Type::Object(id)) = self.type_map.get(&"Query".intern()) {
                self.query_type = Some(*id);
            }
        }
        if self.mutation_type.is_none() {
            if let Some(Type::Object(id)) = self.type_map.get(&"Mutation".intern()) {
                self.mutation_type = Some(*id);
            }
        }
        if self.subscription_type.is_none() {
            if let Some(Type::Object(id)) = self.type_map.get(&"Subscription".intern()) {
                self.subscription_type = Some(*id);
            }
        }
    }

    fn load_default_typename_field(&mut self) {
        let string_type = *self.type_map.get(&"String".intern()).unwrap();
        let typename_field_id = self.fields.len();
        self.typename_field = FieldID(typename_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: self.typename_field_name,
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(string_type))),
            directives: Vec::new(),
            parent_type: None,
        });
    }

    fn load_default_clientid_field(&mut self) {
        let id_type = *self.type_map.get(&"ID".intern()).unwrap();
        let clientid_field_id = self.fields.len();
        self.clientid_field = FieldID(clientid_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: self.clientid_field_name,
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(id_type))),
            directives: Vec::new(),
            parent_type: None,
        });
    }

    fn add_definition(
        &mut self,
        definition: &TypeSystemDefinition,
        is_extension: bool,
    ) -> DiagnosticsResult<()> {
        match definition {
            TypeSystemDefinition::SchemaDefinition(SchemaDefinition {
                operation_types,
                directives: _directives,
            }) => {
                for OperationTypeDefinition { operation, type_ } in &operation_types.items {
                    let operation_id = self.build_object_id(type_.value)?;
                    match operation {
                        OperationType::Query => {
                            if let Some(prev_query_type) = self.query_type {
                                return todo_add_location(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        self.object(prev_query_type).name,
                                    ),
                                );
                            } else {
                                self.query_type = Some(operation_id);
                            }
                        }
                        OperationType::Mutation => {
                            if let Some(prev_mutation_type) = self.mutation_type {
                                return todo_add_location(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        self.object(prev_mutation_type).name,
                                    ),
                                );
                            } else {
                                self.mutation_type = Some(operation_id);
                            }
                        }
                        OperationType::Subscription => {
                            if let Some(prev_subscription_type) = self.subscription_type {
                                return todo_add_location(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        self.object(prev_subscription_type).name,
                                    ),
                                );
                            } else {
                                self.subscription_type = Some(operation_id);
                            }
                        }
                    }
                }
            }
            TypeSystemDefinition::DirectiveDefinition(DirectiveDefinition {
                name,
                arguments,
                repeatable: _repeatable,
                locations,
            }) => {
                if self.directives.contains_key(&name.value) {
                    let str_name = name.value.lookup();
                    if str_name != "skip" && str_name != "include" {
                        // TODO(T63941319) @skip and @include directives are duplicated in our schema
                        return todo_add_location(SchemaError::DuplicateDirectiveDefinition(
                            name.value,
                        ));
                    }
                }
                let arguments = self.build_arguments(arguments)?;
                self.directives.insert(
                    name.value,
                    Directive {
                        name: name.value,
                        arguments,
                        locations: locations.clone(),
                        is_extension,
                    },
                );
            }
            TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
            }) => {
                let parent_id = Type::Object(ObjectID(self.objects.len() as u32));
                let fields = if is_extension {
                    self.build_extend_fields(
                        &fields,
                        &mut HashSet::with_capacity(len_of_option_list(fields)),
                        Some(parent_id),
                    )?
                } else {
                    self.build_fields(&fields, Some(parent_id))?
                };
                let interfaces = interfaces
                    .iter()
                    .map(|name| self.build_interface_id(name.value))
                    .collect::<DiagnosticsResult<Vec<_>>>()?;
                let directives = self.build_directive_values(&directives);
                self.objects.push(Object {
                    name: name.value,
                    fields,
                    is_extension,
                    interfaces,
                    directives,
                });
            }
            TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                name,
                interfaces,
                directives,
                fields,
            }) => {
                let parent_id = Type::Interface(InterfaceID(self.interfaces.len() as u32));
                let fields = if is_extension {
                    self.build_extend_fields(
                        &fields,
                        &mut HashSet::with_capacity(len_of_option_list(fields)),
                        Some(parent_id),
                    )?
                } else {
                    self.build_fields(&fields, Some(parent_id))?
                };
                let interfaces = interfaces
                    .iter()
                    .map(|name| self.build_interface_id(name.value))
                    .collect::<DiagnosticsResult<Vec<_>>>()?;
                let directives = self.build_directive_values(&directives);
                self.interfaces.push(Interface {
                    name: name.value,
                    implementing_objects: vec![],
                    is_extension,
                    fields,
                    directives,
                    interfaces,
                });
            }
            TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition {
                name,
                directives,
                members,
            }) => {
                let members = members
                    .iter()
                    .map(|name| self.build_object_id(name.value))
                    .collect::<DiagnosticsResult<Vec<_>>>()?;
                let directives = self.build_directive_values(&directives);
                self.unions.push(Union {
                    name: name.value,
                    is_extension,
                    members,
                    directives,
                });
            }
            TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                fields,
                directives,
            }) => {
                let fields = self.build_arguments(fields)?;
                let directives = self.build_directive_values(&directives);
                self.input_objects.push(InputObject {
                    name: name.value,
                    fields,
                    directives,
                });
            }
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                name,
                directives,
                values,
            }) => {
                let directives = self.build_directive_values(&directives);
                let values = if let Some(values) = values {
                    values
                        .items
                        .iter()
                        .map(|enum_def| EnumValue {
                            value: enum_def.name.value,
                            directives: self.build_directive_values(&enum_def.directives),
                        })
                        .collect()
                } else {
                    Vec::new()
                };
                self.enums.push(Enum {
                    name: name.value,
                    is_extension,
                    values,
                    directives,
                });
            }
            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                name,
                directives,
            }) => {
                let directives = self.build_directive_values(&directives);
                self.scalars.push(Scalar {
                    name: name.value,
                    is_extension,
                    directives,
                })
            }
            TypeSystemDefinition::ObjectTypeExtension(ObjectTypeExtension {
                name,
                interfaces,
                fields,
                directives,
            }) => match self.type_map.get(&name.value).cloned() {
                Some(Type::Object(id)) => {
                    let index = id.as_usize();
                    let field_ids = &self.objects[index].fields;
                    let mut existing_fields =
                        HashSet::with_capacity(field_ids.len() + len_of_option_list(fields));
                    for field_id in field_ids {
                        existing_fields.insert(self.fields[field_id.as_usize()].name);
                    }
                    let client_fields = self.build_extend_fields(
                        fields,
                        &mut existing_fields,
                        Some(Type::Object(id)),
                    )?;

                    self.objects[index].fields.extend(client_fields);

                    let built_interfaces = interfaces
                        .iter()
                        .map(|name| self.build_interface_id(name.value))
                        .collect::<DiagnosticsResult<Vec<_>>>()?;
                    let filtered_interfaces =
                        _filter_duplicates(&self.objects[index].interfaces, built_interfaces);
                    self.objects[index].interfaces.extend(filtered_interfaces);

                    let built_directives = self.build_directive_values(&directives);
                    let filtered_directives =
                        _filter_duplicates(&self.objects[index].directives, built_directives);
                    self.objects[index].directives.extend(filtered_directives);
                }
                _ => {
                    return todo_add_location(SchemaError::ExtendUndefinedType(name.value));
                }
            },
            TypeSystemDefinition::InterfaceTypeExtension(InterfaceTypeExtension {
                name,
                fields,
                directives,
                ..
            }) => match self.type_map.get(&name.value).cloned() {
                Some(Type::Interface(id)) => {
                    let index = id.as_usize();
                    let field_ids = &self.interfaces[index].fields;
                    let mut existing_fields =
                        HashSet::with_capacity(field_ids.len() + len_of_option_list(fields));
                    for field_id in field_ids {
                        existing_fields.insert(self.fields[field_id.as_usize()].name);
                    }
                    let client_fields = self.build_extend_fields(
                        fields,
                        &mut existing_fields,
                        Some(Type::Interface(id)),
                    )?;
                    self.interfaces[index].fields.extend(client_fields);

                    let built_directives = self.build_directive_values(&directives);
                    let filtered_directives =
                        _filter_duplicates(&self.interfaces[index].directives, built_directives);
                    self.interfaces[index]
                        .directives
                        .extend(filtered_directives);
                }
                _ => {
                    return todo_add_location(SchemaError::ExtendUndefinedType(name.value));
                }
            },
            TypeSystemDefinition::SchemaExtension { .. } => todo!("SchemaExtension"),
            TypeSystemDefinition::EnumTypeExtension { .. } => todo!("EnumTypeExtension"),
            TypeSystemDefinition::UnionTypeExtension { .. } => todo!("UnionTypeExtension"),
            TypeSystemDefinition::InputObjectTypeExtension { .. } => {
                todo!("InputObjectTypeExtension")
            }
            TypeSystemDefinition::ScalarTypeExtension { .. } => todo!("ScalarTypeExtension"),
        }
        Ok(())
    }

    fn build_object_id(&mut self, name: StringKey) -> DiagnosticsResult<ObjectID> {
        match self.type_map.get(&name) {
            Some(Type::Object(id)) => Ok(*id),
            Some(non_object_type) => {
                todo_add_location(SchemaError::ExpectedObjectReference(name, *non_object_type))
            }
            None => todo_add_location(SchemaError::UndefinedType(name)),
        }
    }

    fn build_interface_id(&mut self, name: StringKey) -> DiagnosticsResult<InterfaceID> {
        match self.type_map.get(&name) {
            Some(Type::Interface(id)) => Ok(*id),
            Some(non_interface_type) => todo_add_location(SchemaError::ExpectedInterfaceReference(
                name,
                *non_interface_type,
            )),
            None => todo_add_location(SchemaError::UndefinedType(name)),
        }
    }

    fn build_field(&mut self, field: Field) -> FieldID {
        let field_index = self.fields.len().try_into().unwrap();
        self.fields.push(field);
        FieldID(field_index)
    }

    fn build_fields(
        &mut self,
        field_defs: &Option<List<FieldDefinition>>,
        parent_type: Option<Type>,
    ) -> DiagnosticsResult<Vec<FieldID>> {
        if let Some(field_defs) = field_defs {
            field_defs
                .items
                .iter()
                .map(|field_def| {
                    let arguments = self.build_arguments(&field_def.arguments)?;
                    let type_ = self.build_type_reference(&field_def.type_)?;
                    let directives = self.build_directive_values(&field_def.directives);
                    Ok(self.build_field(Field {
                        name: field_def.name.value,
                        is_extension: false,
                        arguments,
                        type_,
                        directives,
                        parent_type,
                    }))
                })
                .collect()
        } else {
            Ok(Vec::new())
        }
    }

    fn build_extend_fields(
        &mut self,
        field_defs: &Option<List<FieldDefinition>>,
        existing_fields: &mut HashSet<StringKey>,
        parent_type: Option<Type>,
    ) -> DiagnosticsResult<Vec<FieldID>> {
        if let Some(field_defs) = field_defs {
            let mut field_ids: Vec<FieldID> = Vec::with_capacity(field_defs.items.len());
            for field_def in &field_defs.items {
                if !existing_fields.insert(field_def.name.value) {
                    return todo_add_location(SchemaError::DuplicateField(field_def.name.value));
                }
                let arguments = self.build_arguments(&field_def.arguments)?;
                let directives = self.build_directive_values(&field_def.directives);
                let type_ = self.build_type_reference(&field_def.type_)?;
                field_ids.push(self.build_field(Field {
                    name: field_def.name.value,
                    is_extension: true,
                    arguments,
                    type_,
                    directives,
                    parent_type,
                }));
            }
            Ok(field_ids)
        } else {
            Ok(Vec::new())
        }
    }

    fn build_arguments(
        &mut self,
        arg_defs: &Option<List<InputValueDefinition>>,
    ) -> DiagnosticsResult<ArgumentDefinitions> {
        if let Some(arg_defs) = arg_defs {
            let arg_defs: DiagnosticsResult<Vec<Argument>> = arg_defs
                .items
                .iter()
                .map(|arg_def| {
                    Ok(Argument {
                        name: arg_def.name.value,
                        type_: self.build_type_reference(&arg_def.type_)?,
                        default_value: arg_def.default_value.clone(),
                    })
                })
                .collect();
            Ok(ArgumentDefinitions(arg_defs?))
        } else {
            Ok(ArgumentDefinitions(Vec::new()))
        }
    }

    fn build_type_reference(
        &mut self,
        ast_type: &TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference> {
        Ok(match ast_type {
            TypeAnnotation::Named(name) => {
                TypeReference::Named(*self.type_map.get(&name.value).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaError::UndefinedType(name.value),
                        Location::generated(),
                    )]
                })?)
            }
            TypeAnnotation::NonNull(of_type) => {
                TypeReference::NonNull(Box::new(self.build_type_reference(&of_type.type_)?))
            }
            TypeAnnotation::List(of_type) => {
                TypeReference::List(Box::new(self.build_type_reference(&of_type.type_)?))
            }
        })
    }

    fn build_directive_values(&mut self, directives: &[ConstantDirective]) -> Vec<DirectiveValue> {
        directives
            .iter()
            .map(|directive| {
                let arguments = if let Some(arguments) = &directive.arguments {
                    arguments
                        .items
                        .iter()
                        .map(|argument| ArgumentValue {
                            name: argument.name.value,
                            value: argument.value.clone(),
                        })
                        .collect()
                } else {
                    Vec::new()
                };
                DirectiveValue {
                    name: directive.name.value,
                    arguments,
                }
            })
            .collect()
    }

    pub fn snapshot_print(self) -> String {
        let Self {
            query_type,
            mutation_type,
            subscription_type,
            directives,
            clientid_field: _clientid_field,
            typename_field: _typename_field,
            clientid_field_name: _clientid_field_name,
            typename_field_name: _typename_field_name,
            string_type: _string_type,
            id_type: _id_type,
            unchecked_argument_type_sentinel: _unchecked_argument_type_sentinel,
            type_map,
            enums,
            fields,
            input_objects,
            interfaces,
            objects,
            scalars,
            unions,
        } = self;
        let ordered_type_map: BTreeMap<String, Type> = type_map
            .into_iter()
            .map(|(key, value)| (key.lookup().to_owned(), value))
            .collect();

        let mut ordered_directives = directives.values().collect::<Vec<&Directive>>();
        ordered_directives.sort_by_key(|dir| dir.name.lookup());

        format!(
            r#"Schema {{
 query_type: {:#?}
 mutation_type: {:#?}
 subscription_type: {:#?}
 directives: {:#?}
 type_map: {:#?}
 enums: {:#?}
 fields: {:#?}
 input_objects: {:#?}
 interfaces: {:#?}
 objects: {:#?}
 scalars: {:#?}
 unions: {:#?}
 }}"#,
            query_type,
            mutation_type,
            subscription_type,
            ordered_directives,
            ordered_type_map,
            enums,
            fields,
            input_objects,
            interfaces,
            objects,
            scalars,
            unions,
        )
    }
}

fn _filter_duplicates<T: std::cmp::Eq + std::hash::Hash>(left: &[T], right: Vec<T>) -> Vec<T> {
    let mut hs = HashSet::new();
    for t in left {
        hs.insert(t);
    }

    let mut v = Vec::new();
    for t in right {
        if !hs.contains(&t) {
            v.push(t);
        }
    }

    v
}

macro_rules! type_id {
    ($name:ident, $type:ident) => {
        #[derive(Copy, Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
        pub struct $name(pub $type);
        impl $name {
            #[allow(dead_code)]
            fn as_usize(&self) -> usize {
                self.0 as usize
            }
        }
    };
}

type_id!(EnumID, u32);
type_id!(InputObjectID, u32);
type_id!(InterfaceID, u32);
type_id!(ObjectID, u32);
type_id!(ScalarID, u32);
type_id!(UnionID, u32);
type_id!(FieldID, u32);

#[derive(Copy, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum Type {
    Enum(EnumID),
    InputObject(InputObjectID),
    Interface(InterfaceID),
    Object(ObjectID),
    Scalar(ScalarID),
    Union(UnionID),
}

impl Type {
    pub fn is_scalar(self) -> bool {
        match self {
            Type::Scalar(_) => true,
            _ => false,
        }
    }

    pub fn is_enum(self) -> bool {
        match self {
            Type::Enum(_) => true,
            _ => false,
        }
    }

    pub fn is_input_type(self) -> bool {
        match self {
            Type::Scalar(_) | Type::Enum(_) | Type::InputObject(_) => true,
            _ => false,
        }
    }

    pub fn is_abstract_type(self) -> bool {
        match self {
            Type::Union(_) | Type::Interface(_) => true,
            _ => false,
        }
    }

    pub fn is_object(self) -> bool {
        match self {
            Type::Object(_) => true,
            _ => false,
        }
    }

    pub fn is_interface(self) -> bool {
        match self {
            Type::Interface(_) => true,
            _ => false,
        }
    }

    pub fn is_union(self) -> bool {
        match self {
            Type::Union(_) => true,
            _ => false,
        }
    }

    pub fn get_enum_id(self) -> Option<EnumID> {
        match self {
            Type::Enum(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_input_object_id(self) -> Option<InputObjectID> {
        match self {
            Type::InputObject(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_interface_id(self) -> Option<InterfaceID> {
        match self {
            Type::Interface(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_object_id(self) -> Option<ObjectID> {
        match self {
            Type::Object(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_scalar_id(self) -> Option<ScalarID> {
        match self {
            Type::Scalar(id) => Some(id),
            _ => None,
        }
    }

    pub fn get_union_id(self) -> Option<UnionID> {
        match self {
            Type::Union(id) => Some(id),
            _ => None,
        }
    }
}

impl fmt::Debug for Type {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Type::Enum(id) => f.write_fmt(format_args!("Enum({:?})", id.0)),
            Type::InputObject(id) => f.write_fmt(format_args!("InputObject({:?})", id.0)),
            Type::Interface(id) => f.write_fmt(format_args!("Interface({:?})", id.0)),
            Type::Object(id) => f.write_fmt(format_args!("Object({:?})", id.0)),
            Type::Scalar(id) => f.write_fmt(format_args!("Scalar({:?})", id.0)),
            Type::Union(id) => f.write_fmt(format_args!("Union({:?})", id.0)),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum TypeReference {
    Named(Type),
    NonNull(Box<TypeReference>),
    List(Box<TypeReference>),
}

impl TypeReference {
    pub fn inner(&self) -> Type {
        match self {
            TypeReference::Named(type_) => *type_,
            TypeReference::List(of) => of.inner(),
            TypeReference::NonNull(of) => of.inner(),
        }
    }

    pub fn non_null(&self) -> TypeReference {
        match self {
            TypeReference::Named(_) => TypeReference::NonNull(Box::new(self.clone())),
            TypeReference::List(_) => TypeReference::NonNull(Box::new(self.clone())),
            TypeReference::NonNull(_) => self.clone(),
        }
    }

    pub fn nullable_type(&self) -> &TypeReference {
        match self {
            TypeReference::Named(_) => self,
            TypeReference::List(_) => self,
            TypeReference::NonNull(of) => of,
        }
    }

    pub fn is_non_null(&self) -> bool {
        match self {
            TypeReference::NonNull(_) => true,
            _ => false,
        }
    }

    pub fn is_list(&self) -> bool {
        match self.nullable_type() {
            TypeReference::List(_) => true,
            _ => false,
        }
    }

    // If the type is Named or NonNull<Named> return the inner named.
    // If the type is a List or NonNull<List> returns a matching list with nullable items.
    pub fn with_nullable_item_type(&self) -> TypeReference {
        match self {
            TypeReference::Named(_) => self.clone(),
            TypeReference::List(of) => TypeReference::List(Box::new(of.nullable_type().clone())),
            TypeReference::NonNull(of) => {
                let inner: &TypeReference = of;
                match inner {
                    TypeReference::List(_) => {
                        TypeReference::NonNull(Box::new(of.with_nullable_item_type()))
                    }
                    TypeReference::Named(_) => inner.clone(),
                    TypeReference::NonNull(_) => {
                        unreachable!("Invalid nested TypeReference::NonNull")
                    }
                }
            }
        }
    }

    pub fn list_item_type(&self) -> Option<&TypeReference> {
        match self.nullable_type() {
            TypeReference::List(of) => Some(of),
            _ => None,
        }
    }

    // Return None if the type is a List, otherwise return the inner type
    pub fn non_list_type(&self) -> Option<Type> {
        match self {
            TypeReference::List(_) => None,
            TypeReference::Named(type_) => Some(*type_),
            TypeReference::NonNull(of) => of.non_list_type(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct Directive {
    pub name: StringKey,
    pub arguments: ArgumentDefinitions,
    pub locations: Vec<DirectiveLocation>,
    pub is_extension: bool,
}

impl Named for Directive {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug)]
pub struct Scalar {
    pub name: StringKey,
    pub is_extension: bool,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Object {
    pub name: StringKey,
    pub is_extension: bool,
    pub fields: Vec<FieldID>,
    pub interfaces: Vec<InterfaceID>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct InputObject {
    pub name: StringKey,
    pub fields: ArgumentDefinitions,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Enum {
    pub name: StringKey,
    pub is_extension: bool,
    pub values: Vec<EnumValue>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Union {
    pub name: StringKey,
    pub is_extension: bool,
    pub members: Vec<ObjectID>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Interface {
    pub name: StringKey,
    pub is_extension: bool,
    pub implementing_objects: Vec<ObjectID>,
    pub fields: Vec<FieldID>,
    pub directives: Vec<DirectiveValue>,
    pub interfaces: Vec<InterfaceID>,
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct Field {
    pub name: StringKey,
    pub is_extension: bool,
    pub arguments: ArgumentDefinitions,
    pub type_: TypeReference,
    pub directives: Vec<DirectiveValue>,
    /// The type on which this field was defined. This field is (should)
    /// always be set, except for special fields such as __typename and
    /// __id, which are queryable on all types and therefore don't have
    /// a single parent type.
    pub parent_type: Option<Type>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: StringKey,
    pub type_: TypeReference,
    pub default_value: Option<ConstantValue>,
}

impl Named for Argument {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct ArgumentValue {
    pub name: StringKey,
    pub value: ConstantValue,
}

impl Named for ArgumentValue {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct DirectiveValue {
    pub name: StringKey,
    pub arguments: Vec<ArgumentValue>,
}

impl Named for DirectiveValue {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Hash)]
pub struct EnumValue {
    pub value: StringKey,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ArgumentDefinitions(Vec<Argument>);

impl ArgumentDefinitions {
    pub fn new(arguments: Vec<Argument>) -> Self {
        Self(arguments)
    }

    pub fn named(&self, name: StringKey) -> Option<&Argument> {
        self.0.named(name)
    }

    pub fn contains(&self, name: StringKey) -> bool {
        self.0.iter().any(|x| x.name == name)
    }

    pub fn iter(&self) -> Iter<'_, Argument> {
        self.0.iter()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }
}

impl fmt::Debug for ArgumentDefinitions {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_fmt(format_args!("{:#?}", self.0))
    }
}

impl IntoIterator for ArgumentDefinitions {
    type Item = Argument;
    type IntoIter = std::vec::IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.0.into_iter()
    }
}

pub trait TypeWithFields {
    fn name(&self) -> StringKey;
    fn fields(&self) -> &Vec<FieldID>;
    fn interfaces(&self) -> &Vec<InterfaceID>;
}

impl TypeWithFields for Interface {
    fn name(&self) -> StringKey {
        self.name
    }

    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }

    fn interfaces(&self) -> &Vec<InterfaceID> {
        &self.interfaces
    }
}

impl TypeWithFields for Object {
    fn name(&self) -> StringKey {
        self.name
    }

    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }

    fn interfaces(&self) -> &Vec<InterfaceID> {
        &self.interfaces
    }
}

fn len_of_option_list<T>(option_list: &Option<List<T>>) -> usize {
    option_list.as_ref().map_or(0, |list| list.items.len())
}
