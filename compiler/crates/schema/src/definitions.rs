/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast;
use crate::errors::{Result, SchemaError};
use common::{Named, NamedItem};
use interner::{Intern, StringKey};
use std::collections::{BTreeMap, HashMap, HashSet};
use std::convert::TryInto;
use std::fmt;
use std::fmt::{Result as FormatResult, Write};
use std::slice::Iter;

// TODO: consider a common Value representation with the IR
type ConstValue = ast::Value;

pub use ast::DirectiveLocation;

type TypeMap = HashMap<StringKey, Type>;

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
    pub fn mutation_type(&self) -> Option<Type> {
        self.mutation_type.as_ref().map(|x| Type::Object(*x))
    }

    pub fn query_type(&self) -> Option<Type> {
        self.query_type.as_ref().map(|x| Type::Object(*x))
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
                self.is_named_type_subtype_of(named_subtype.clone(), named_supertype.clone())
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
            _ => maybe_subtype == super_type,
        }
    }

    pub fn are_overlapping_types(&self, a: Type, b: Type) -> bool {
        if a == b {
            return true;
        };
        match (a, b) {
            (Type::Interface(a), Type::Interface(b)) => {
                let b_implementors = &self.interface(b).implementors;
                self.interface(a)
                    .implementors
                    .iter()
                    .any(|x| b_implementors.contains(x))
            }
            (Type::Interface(a), Type::Union(b)) => {
                let b_members = &self.union(b).members;
                self.interface(a)
                    .implementors
                    .iter()
                    .any(|x| b_members.contains(x))
            }
            (Type::Interface(a), Type::Object(b)) => self.interface(a).implementors.contains(&b),
            (Type::Union(a), Type::Interface(b)) => {
                let b_implementors = &self.interface(b).implementors;
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
            (Type::Object(a), Type::Interface(b)) => self.interface(b).implementors.contains(&a),
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
                write!(writer, "{}", self.get_type_name(inner.clone()).lookup())
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

    pub fn has_directive(&self, directive_name: StringKey) -> bool {
        self.directives.contains_key(&directive_name)
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        self.type_map.contains_key(&type_name)
    }

    pub fn add_directive(&mut self, directive: Directive) -> Result<()> {
        if self.directives.contains_key(&directive.name) {
            return Err(SchemaError::DuplicateDirectiveDefinition(directive.name));
        }
        self.directives.insert(directive.name, directive);
        Ok(())
    }

    pub fn add_field(&mut self, field: Field) -> Result<FieldID> {
        Ok(self.build_field(field))
    }

    pub fn add_enum(&mut self, enum_: Enum) -> Result<EnumID> {
        if self.type_map.contains_key(&enum_.name) {
            return Err(SchemaError::DuplicateType(enum_.name));
        }
        let index: u32 = self.enums.len().try_into().unwrap();
        let name = enum_.name;
        self.enums.push(enum_);
        self.type_map.insert(name, Type::Enum(EnumID(index)));
        Ok(EnumID(index))
    }

    pub fn add_input_object(&mut self, input_object: InputObject) -> Result<InputObjectID> {
        if self.type_map.contains_key(&input_object.name) {
            return Err(SchemaError::DuplicateType(input_object.name));
        }
        let index: u32 = self.input_objects.len().try_into().unwrap();
        let name = input_object.name;
        self.input_objects.push(input_object);
        self.type_map
            .insert(name, Type::InputObject(InputObjectID(index)));
        Ok(InputObjectID(index))
    }

    pub fn add_interface(&mut self, interface: Interface) -> Result<InterfaceID> {
        if self.type_map.contains_key(&interface.name) {
            return Err(SchemaError::DuplicateType(interface.name));
        }
        let index: u32 = self.interfaces.len().try_into().unwrap();
        let name = interface.name;
        self.interfaces.push(interface);
        self.type_map
            .insert(name, Type::Interface(InterfaceID(index)));
        Ok(InterfaceID(index))
    }

    pub fn add_object(&mut self, object: Object) -> Result<ObjectID> {
        if self.type_map.contains_key(&object.name) {
            return Err(SchemaError::DuplicateType(object.name));
        }
        let index: u32 = self.objects.len().try_into().unwrap();
        let name = object.name;
        self.objects.push(object);
        self.type_map.insert(name, Type::Object(ObjectID(index)));
        Ok(ObjectID(index))
    }

    pub fn add_scalar(&mut self, scalar: Scalar) -> Result<ScalarID> {
        if self.type_map.contains_key(&scalar.name) {
            return Err(SchemaError::DuplicateType(scalar.name));
        }
        let index: u32 = self.scalars.len().try_into().unwrap();
        let name = scalar.name;
        self.scalars.push(scalar);
        self.type_map.insert(name, Type::Scalar(ScalarID(index)));
        Ok(ScalarID(index))
    }

    pub fn add_union(&mut self, union: Union) -> Result<UnionID> {
        if self.type_map.contains_key(&union.name) {
            return Err(SchemaError::DuplicateType(union.name));
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
    ) -> Result<InterfaceID> {
        let interface = self.interfaces.get_mut(interface_id.as_usize()).unwrap();
        interface.fields.push(field_id);
        Ok(interface_id)
    }

    pub fn add_field_to_object(&mut self, obj_id: ObjectID, field_id: FieldID) -> Result<ObjectID> {
        let object = self.objects.get_mut(obj_id.as_usize()).unwrap();
        object.fields.push(field_id);
        Ok(obj_id)
    }

    pub fn add_interface_to_object(
        &mut self,
        obj_id: ObjectID,
        interface_id: InterfaceID,
    ) -> Result<ObjectID> {
        let object = self.objects.get_mut(obj_id.as_usize()).unwrap();
        object.interfaces.push(interface_id);
        Ok(obj_id)
    }

    pub fn add_member_to_union(
        &mut self,
        union_id: UnionID,
        object_id: ObjectID,
    ) -> Result<UnionID> {
        let union = self.unions.get_mut(union_id.as_usize()).unwrap();
        union.members.push(object_id);
        Ok(union_id)
    }

    pub fn set_input_object_args(
        &mut self,
        input_object_id: InputObjectID,
        fields: ArgumentDefinitions,
    ) -> Result<InputObjectID> {
        let input_object = self
            .input_objects
            .get_mut(input_object_id.as_usize())
            .unwrap();
        input_object.fields = fields;
        Ok(input_object_id)
    }

    pub fn set_field_args(
        &mut self,
        field_id: FieldID,
        args: ArgumentDefinitions,
    ) -> Result<FieldID> {
        let field = self.fields.get_mut(field_id.as_usize()).unwrap();
        field.arguments = args;
        Ok(field_id)
    }

    pub fn replace_interface(&mut self, id: InterfaceID, interface: Interface) -> Result<()> {
        if id.as_usize() >= self.interfaces.len() {
            return Err(SchemaError::UnknownTypeID(
                id.as_usize(),
                String::from("Interface"),
            ));
        }
        self.type_map
            .remove(&self.get_type_name(Type::Interface(id)));
        self.type_map.insert(interface.name, Type::Interface(id));
        std::mem::replace(&mut self.interfaces[id.as_usize()], interface);
        Ok(())
    }

    pub fn replace_field(&mut self, id: FieldID, field: Field) -> Result<()> {
        let id = id.as_usize();
        if id >= self.fields.len() {
            return Err(SchemaError::UnknownTypeID(id, String::from("Field")));
        }
        std::mem::replace(&mut self.fields[id], field);
        Ok(())
    }

    pub fn build(
        schema_definitions: &[ast::Definition],
        client_definitions: &[ast::Definition],
    ) -> Result<Self> {
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
                ast::Definition::SchemaDefinition { .. } => {}
                ast::Definition::DirectiveDefinition { .. } => {
                    directive_count += 1;
                }
                ast::Definition::ObjectTypeDefinition { name, fields, .. } => {
                    type_map.insert(*name, Type::Object(ObjectID(next_object_id)));
                    field_count += fields.len();
                    next_object_id += 1;
                }
                ast::Definition::InterfaceTypeDefinition { name, fields, .. } => {
                    type_map.insert(*name, Type::Interface(InterfaceID(next_interface_id)));
                    field_count += fields.len();
                    next_interface_id += 1;
                }
                ast::Definition::UnionTypeDefinition { name, .. } => {
                    type_map.insert(*name, Type::Union(UnionID(next_union_id)));
                    next_union_id += 1;
                }
                ast::Definition::InputObjectTypeDefinition { name, .. } => {
                    type_map.insert(
                        *name,
                        Type::InputObject(InputObjectID(next_input_object_id)),
                    );
                    next_input_object_id += 1;
                }
                ast::Definition::EnumTypeDefinition { name, .. } => {
                    type_map.insert(*name, Type::Enum(EnumID(next_enum_id)));
                    next_enum_id += 1;
                }
                ast::Definition::ScalarTypeDefinition { name, .. } => {
                    type_map.insert(*name, Type::Scalar(ScalarID(next_scalar_id)));
                    next_scalar_id += 1;
                }
                ast::Definition::ObjectTypeExtension { .. } => {}
                ast::Definition::InterfaceTypeExtension { .. } => {}
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
            if let ast::Definition::ObjectTypeDefinition {
                name, interfaces, ..
            } = definition
            {
                let object_id = match schema.type_map.get(&name) {
                    Some(Type::Object(id)) => id,
                    _ => unreachable!("Must be an Object type"),
                };
                for interface in interfaces {
                    let type_ = schema.type_map.get(&interface).unwrap();
                    match type_ {
                        Type::Interface(id) => {
                            let interface = schema.interfaces.get_mut(id.as_usize()).unwrap();
                            interface.implementors.push(*object_id)
                        }
                        _ => unreachable!("Must be an interface"),
                    }
                }
            }
        }

        // In case the schema doesn't define a query, mutation or subscription
        // type, but there is a Query, Mutation, or Subscription object type
        // defined, default to those.
        // This is not standard GraphQL behavior, and we might want to remove
        // this at some point.
        if schema.query_type.is_none() {
            if let Some(Type::Object(id)) = schema.type_map.get(&"Query".intern()) {
                schema.query_type = Some(*id);
            }
        }
        if schema.mutation_type.is_none() {
            if let Some(Type::Object(id)) = schema.type_map.get(&"Mutation".intern()) {
                schema.mutation_type = Some(*id);
            }
        }
        if schema.subscription_type.is_none() {
            if let Some(Type::Object(id)) = schema.type_map.get(&"Subscription".intern()) {
                schema.subscription_type = Some(*id);
            }
        }

        let typename_field_id = schema.fields.len();
        schema.typename_field = FieldID(typename_field_id.try_into().unwrap());
        schema.fields.push(Field {
            name: schema.typename_field_name,
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(string_type))),
            directives: Vec::new(),
        });

        let clientid_field_id = schema.fields.len();
        schema.clientid_field = FieldID(clientid_field_id.try_into().unwrap());
        schema.fields.push(Field {
            name: schema.clientid_field_name,
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(id_type))),
            directives: Vec::new(),
        });

        Ok(schema)
    }

    fn add_definition(&mut self, definition: &ast::Definition, is_extension: bool) -> Result<()> {
        match definition {
            ast::Definition::SchemaDefinition {
                operation_types,
                directives: _directives,
            } => {
                for ast::OperationTypeDefinition { operation, type_ } in operation_types {
                    let operation_id = self.build_object_id(*type_)?;
                    match operation {
                        ast::OperationType::Query => {
                            if let Some(prev_query_type) = self.query_type {
                                return Err(SchemaError::DuplicateOperationDefinition(
                                    *operation,
                                    *type_,
                                    self.object(prev_query_type).name,
                                ));
                            } else {
                                self.query_type = Some(operation_id);
                            }
                        }
                        ast::OperationType::Mutation => {
                            if let Some(prev_mutation_type) = self.mutation_type {
                                return Err(SchemaError::DuplicateOperationDefinition(
                                    *operation,
                                    *type_,
                                    self.object(prev_mutation_type).name,
                                ));
                            } else {
                                self.mutation_type = Some(operation_id);
                            }
                        }
                        ast::OperationType::Subscription => {
                            if let Some(prev_subscription_type) = self.subscription_type {
                                return Err(SchemaError::DuplicateOperationDefinition(
                                    *operation,
                                    *type_,
                                    self.object(prev_subscription_type).name,
                                ));
                            } else {
                                self.subscription_type = Some(operation_id);
                            }
                        }
                    }
                }
            }
            ast::Definition::DirectiveDefinition {
                name,
                arguments,
                repeatable: _repeatable,
                locations,
            } => {
                if self.directives.contains_key(name) {
                    let str_name = name.lookup();
                    if str_name != "skip" && str_name != "include" {
                        // TODO(T63941319) @skip and @include directives are duplicated in our schema
                        return Err(SchemaError::DuplicateDirectiveDefinition(*name));
                    }
                }
                let arguments = self.build_arguments(arguments)?;
                self.directives.insert(
                    *name,
                    Directive {
                        name: *name,
                        arguments,
                        locations: locations.clone(),
                        is_extension,
                    },
                );
            }
            ast::Definition::ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
            } => {
                let fields = if is_extension {
                    self.build_extend_fields(&fields, &mut HashSet::with_capacity(fields.len()))?
                } else {
                    self.build_fields(&fields)?
                };
                let interfaces = interfaces
                    .iter()
                    .map(|name| self.build_interface_id(*name))
                    .collect::<Result<Vec<_>>>()?;
                let directives = self.build_directive_values(&directives);
                self.objects.push(Object {
                    name: *name,
                    fields,
                    is_extension,
                    interfaces,
                    directives,
                });
            }
            ast::Definition::InterfaceTypeDefinition {
                name,
                directives,
                fields,
            } => {
                let fields = if is_extension {
                    self.build_extend_fields(&fields, &mut HashSet::with_capacity(fields.len()))?
                } else {
                    self.build_fields(&fields)?
                };
                let directives = self.build_directive_values(&directives);
                self.interfaces.push(Interface {
                    name: *name,
                    implementors: vec![],
                    is_extension,
                    fields,
                    directives,
                });
            }
            ast::Definition::UnionTypeDefinition {
                name,
                directives,
                members,
            } => {
                let members = members
                    .iter()
                    .map(|name| self.build_object_id(*name))
                    .collect::<Result<Vec<_>>>()?;
                let directives = self.build_directive_values(&directives);
                self.unions.push(Union {
                    name: *name,
                    is_extension,
                    members,
                    directives,
                });
            }
            ast::Definition::InputObjectTypeDefinition {
                name,
                fields,
                directives,
            } => {
                let fields = self.build_arguments(fields)?;
                let directives = self.build_directive_values(&directives);
                self.input_objects.push(InputObject {
                    name: *name,
                    fields,
                    directives,
                });
            }
            ast::Definition::EnumTypeDefinition {
                name,
                directives,
                values,
            } => {
                let directives = self.build_directive_values(&directives);
                let values = values
                    .iter()
                    .map(|enum_def| EnumValue {
                        value: enum_def.name,
                        directives: self.build_directive_values(&enum_def.directives),
                    })
                    .collect();
                self.enums.push(Enum {
                    name: *name,
                    is_extension,
                    values,
                    directives,
                });
            }
            ast::Definition::ScalarTypeDefinition { name, directives } => {
                let directives = self.build_directive_values(&directives);
                self.scalars.push(Scalar {
                    name: *name,
                    is_extension,
                    directives,
                })
            }
            ast::Definition::ObjectTypeExtension {
                name,
                interfaces: _interfaces,
                fields,
                directives: _directives,
            } => match self.type_map.get(&name) {
                Some(Type::Object(id)) => {
                    let index = id.as_usize();
                    let field_ids = &self.objects[index].fields;
                    let mut existing_fields =
                        HashSet::with_capacity(field_ids.len() + fields.len());
                    for field_id in field_ids {
                        existing_fields.insert(self.fields[field_id.as_usize()].name);
                    }
                    let client_fields = self.build_extend_fields(fields, &mut existing_fields)?;
                    self.objects[index].fields.extend(client_fields);
                }
                _ => {
                    return Err(SchemaError::ExtendUndefinedType(*name));
                }
            },
            ast::Definition::InterfaceTypeExtension { name, fields, .. } => {
                match self.type_map.get(&name) {
                    Some(Type::Interface(id)) => {
                        let index = id.as_usize();
                        let field_ids = &self.interfaces[index].fields;
                        let mut existing_fields =
                            HashSet::with_capacity(field_ids.len() + fields.len());
                        for field_id in field_ids {
                            existing_fields.insert(self.fields[field_id.as_usize()].name);
                        }
                        let client_fields =
                            self.build_extend_fields(fields, &mut existing_fields)?;
                        self.interfaces[index].fields.extend(client_fields);
                    }
                    _ => {
                        return Err(SchemaError::ExtendUndefinedType(*name));
                    }
                }
            }
        }
        Ok(())
    }

    fn build_object_id(&mut self, name: StringKey) -> Result<ObjectID> {
        match self.type_map.get(&name) {
            Some(Type::Object(id)) => Ok(*id),
            Some(non_object_type) => {
                Err(SchemaError::ExpectedObjectReference(name, *non_object_type))
            }
            None => Err(SchemaError::UndefinedType(name)),
        }
    }

    fn build_interface_id(&mut self, name: StringKey) -> Result<InterfaceID> {
        match self.type_map.get(&name) {
            Some(Type::Interface(id)) => Ok(*id),
            Some(non_interface_type) => Err(SchemaError::ExpectedInterfaceReference(
                name,
                *non_interface_type,
            )),
            None => Err(SchemaError::UndefinedType(name)),
        }
    }

    fn build_field(&mut self, field: Field) -> FieldID {
        let field_index = self.fields.len().try_into().unwrap();
        self.fields.push(field);
        FieldID(field_index)
    }

    fn build_fields(&mut self, field_defs: &[ast::FieldDefinition]) -> Result<Vec<FieldID>> {
        field_defs
            .iter()
            .map(|field_def| {
                let arguments = self.build_arguments(&field_def.arguments)?;
                let type_ = self.build_type_reference(&field_def.type_)?;
                let directives = self.build_directive_values(&field_def.directives);
                Ok(self.build_field(Field {
                    name: field_def.name,
                    is_extension: false,
                    arguments,
                    type_,
                    directives,
                }))
            })
            .collect()
    }

    fn build_extend_fields(
        &mut self,
        field_defs: &[ast::FieldDefinition],
        existing_fields: &mut HashSet<StringKey>,
    ) -> Result<Vec<FieldID>> {
        let mut field_ids: Vec<FieldID> = Vec::with_capacity(field_defs.len());
        for field_def in field_defs {
            if !existing_fields.insert(field_def.name) {
                return Err(SchemaError::DuplicateField(field_def.name));
            }
            let arguments = self.build_arguments(&field_def.arguments)?;
            let directives = self.build_directive_values(&field_def.directives);
            let type_ = self.build_type_reference(&field_def.type_)?;
            field_ids.push(self.build_field(Field {
                name: field_def.name,
                is_extension: true,
                arguments,
                type_,
                directives,
            }));
        }
        Ok(field_ids)
    }

    fn build_arguments(
        &mut self,
        arg_defs: &[ast::InputValueDefinition],
    ) -> Result<ArgumentDefinitions> {
        let arg_defs: Result<Vec<Argument>> = arg_defs
            .iter()
            .map(|arg_def| {
                Ok(Argument {
                    name: arg_def.name,
                    type_: self.build_type_reference(&arg_def.type_)?,
                    default_value: arg_def.default_value.clone(),
                })
            })
            .collect();
        Ok(ArgumentDefinitions(arg_defs?))
    }

    fn build_type_reference(&mut self, ast_type: &ast::Type) -> Result<TypeReference> {
        Ok(match ast_type {
            ast::Type::Named(name) => TypeReference::Named(
                *self
                    .type_map
                    .get(name)
                    .ok_or_else(|| SchemaError::UndefinedType(*name))?,
            ),
            ast::Type::NonNull(of_type) => {
                TypeReference::NonNull(Box::new(self.build_type_reference(of_type)?))
            }
            ast::Type::List(of_type) => {
                TypeReference::List(Box::new(self.build_type_reference(of_type)?))
            }
        })
    }

    fn build_directive_values(&mut self, directives: &[ast::Directive]) -> Vec<DirectiveValue> {
        directives
            .iter()
            .map(|directive| DirectiveValue {
                name: directive.name,
                arguments: directive
                    .arguments
                    .iter()
                    .map(|argument| ArgumentValue {
                        name: argument.name,
                        value: argument.value.clone(),
                    })
                    .collect(),
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
            string_type: _,
            id_type: _,
            unchecked_argument_type_sentinel: _,
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

#[derive(Clone, Debug)]
pub struct Scalar {
    pub name: StringKey,
    pub is_extension: bool,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct Object {
    pub name: StringKey,
    pub is_extension: bool,
    pub fields: Vec<FieldID>,
    pub interfaces: Vec<InterfaceID>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct InputObject {
    pub name: StringKey,
    pub fields: ArgumentDefinitions,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct Enum {
    pub name: StringKey,
    pub is_extension: bool,
    pub values: Vec<EnumValue>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct Union {
    pub name: StringKey,
    pub is_extension: bool,
    pub members: Vec<ObjectID>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct Interface {
    pub name: StringKey,
    pub is_extension: bool,
    pub implementors: Vec<ObjectID>,
    pub fields: Vec<FieldID>,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug)]
pub struct Field {
    pub name: StringKey,
    pub is_extension: bool,
    pub arguments: ArgumentDefinitions,
    pub type_: TypeReference,
    pub directives: Vec<DirectiveValue>,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: StringKey,
    pub type_: TypeReference,
    pub default_value: Option<ConstValue>,
}

impl Named for Argument {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug)]
pub struct ArgumentValue {
    pub name: StringKey,
    pub value: ConstValue,
}

impl Named for ArgumentValue {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug)]
pub struct DirectiveValue {
    pub name: StringKey,
    pub arguments: Vec<ArgumentValue>,
}

impl Named for DirectiveValue {
    fn name(&self) -> StringKey {
        self.name
    }
}

#[derive(Clone, Debug)]
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
    fn fields(&self) -> &Vec<FieldID>;
}

impl TypeWithFields for Interface {
    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }
}

impl TypeWithFields for Object {
    fn fields(&self) -> &Vec<FieldID> {
        &self.fields
    }
}
