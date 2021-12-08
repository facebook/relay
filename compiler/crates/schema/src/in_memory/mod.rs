/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::definitions::{Argument, Directive, *};
use crate::errors::SchemaError;
use crate::graphql_schema::Schema;
use common::{Diagnostic, DiagnosticsResult, Location, SourceLocationKey, WithLocation};
use graphql_syntax::*;
use intern::string_key::{Intern, StringKey};
use std::collections::{BTreeMap, HashMap};

fn todo_add_location<T>(error: SchemaError) -> DiagnosticsResult<T> {
    Err(vec![Diagnostic::error(error, Location::generated())])
}

#[derive(Debug)]
pub struct InMemorySchema {
    query_type: Option<ObjectID>,
    mutation_type: Option<ObjectID>,
    subscription_type: Option<ObjectID>,
    type_map: TypeMap,

    clientid_field: FieldID,
    strongid_field: FieldID,
    typename_field: FieldID,
    fetch_token_field: FieldID,
    is_fulfilled_field: FieldID,

    clientid_field_name: StringKey,
    strongid_field_name: StringKey,
    typename_field_name: StringKey,
    fetch_token_field_name: StringKey,
    is_fulfilled_field_name: StringKey,

    string_type: Option<Type>,
    id_type: Option<Type>,

    unchecked_argument_type_sentinel: Option<TypeReference>,

    directives: HashMap<StringKey, Directive>,

    enums: Vec<Enum>,
    fields: Vec<Field>,
    input_objects: Vec<InputObject>,
    interfaces: Vec<Interface>,
    objects: Vec<Object>,
    scalars: Vec<Scalar>,
    unions: Vec<Union>,
}

impl Schema for InMemorySchema {
    fn query_type(&self) -> Option<Type> {
        self.query_type.map(Type::Object)
    }

    fn mutation_type(&self) -> Option<Type> {
        self.mutation_type.map(Type::Object)
    }

    fn subscription_type(&self) -> Option<Type> {
        self.subscription_type.map(Type::Object)
    }

    fn clientid_field(&self) -> FieldID {
        self.clientid_field
    }

    fn strongid_field(&self) -> FieldID {
        self.strongid_field
    }

    fn typename_field(&self) -> FieldID {
        self.typename_field
    }

    fn fetch_token_field(&self) -> FieldID {
        self.fetch_token_field
    }

    fn is_fulfilled_field(&self) -> FieldID {
        self.is_fulfilled_field
    }

    fn get_type(&self, type_name: StringKey) -> Option<Type> {
        self.type_map.get(&type_name).copied()
    }

    fn get_directive(&self, name: StringKey) -> Option<&Directive> {
        self.directives.get(&name)
    }

    fn input_object(&self, id: InputObjectID) -> &InputObject {
        &self.input_objects[id.as_usize()]
    }

    fn enum_(&self, id: EnumID) -> &Enum {
        &self.enums[id.as_usize()]
    }

    fn scalar(&self, id: ScalarID) -> &Scalar {
        &self.scalars[id.as_usize()]
    }

    fn field(&self, id: FieldID) -> &Field {
        &self.fields[id.as_usize()]
    }

    fn object(&self, id: ObjectID) -> &Object {
        &self.objects[id.as_usize()]
    }

    fn union(&self, id: UnionID) -> &Union {
        &self.unions[id.as_usize()]
    }

    fn interface(&self, id: InterfaceID) -> &Interface {
        &self.interfaces[id.as_usize()]
    }

    fn get_type_name(&self, type_: Type) -> StringKey {
        match type_ {
            Type::Enum(id) => self.enums[id.as_usize()].name,
            Type::InputObject(id) => self.input_objects[id.as_usize()].name,
            Type::Interface(id) => self.interfaces[id.as_usize()].name,
            Type::Object(id) => self.objects[id.as_usize()].name.item,
            Type::Scalar(id) => self.scalars[id.as_usize()].name,
            Type::Union(id) => self.unions[id.as_usize()].name,
        }
    }

    fn is_extension_type(&self, type_: Type) -> bool {
        match type_ {
            Type::Enum(id) => self.enums[id.as_usize()].is_extension,
            Type::Interface(id) => self.interfaces[id.as_usize()].is_extension,
            Type::Object(id) => self.objects[id.as_usize()].is_extension,
            Type::Scalar(id) => self.scalars[id.as_usize()].is_extension,
            Type::Union(id) => self.unions[id.as_usize()].is_extension,
            Type::InputObject(_) => false,
        }
    }

    fn is_string(&self, type_: Type) -> bool {
        type_ == self.string_type.unwrap()
    }

    fn is_id(&self, type_: Type) -> bool {
        type_ == self.id_type.unwrap()
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
                return Some(self.typename_field);
            }
            // TODO(inanc): Also check if the parent type is fetchable?
            if name == self.fetch_token_field_name {
                return Some(self.fetch_token_field);
            }
            if name == self.clientid_field_name {
                return Some(self.clientid_field);
            }
            if name == self.strongid_field_name {
                return Some(self.strongid_field);
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
                name,
                self.get_type_name(parent_type)
            ),
        };
        fields
            .iter()
            .find(|field_id| {
                let field = &self.fields[field_id.as_usize()];
                field.name.item == name
            })
            .cloned()
    }

    /// A value that represents a type of unchecked arguments where we don't
    /// have a type to instantiate the argument.
    ///
    /// TODO: we probably want to replace this with a proper `Unknown` type.
    fn unchecked_argument_type_sentinel(&self) -> &TypeReference {
        self.unchecked_argument_type_sentinel.as_ref().unwrap()
    }

    fn snapshot_print(&self) -> String {
        let Self {
            query_type,
            mutation_type,
            subscription_type,
            directives,
            clientid_field: _clientid_field,
            strongid_field: _strongid_field,
            typename_field: _typename_field,
            fetch_token_field: _fetch_token_field,
            is_fulfilled_field: _is_fulfilled_field,
            clientid_field_name: _clientid_field_name,
            strongid_field_name: _strongid_field_name,
            typename_field_name: _typename_field_name,
            fetch_token_field_name: _fetch_token_field_name,
            is_fulfilled_field_name: _is_fulfilled_field_name,
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
        let ordered_type_map: BTreeMap<_, _> = type_map.iter().collect();

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

    fn input_objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a InputObject> + 'a> {
        Box::new(self.input_objects.iter())
    }

    fn enums<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Enum> + 'a> {
        Box::new(self.enums.iter())
    }

    fn scalars<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Scalar> + 'a> {
        Box::new(self.scalars.iter())
    }

    fn fields<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Field> + 'a> {
        Box::new(self.fields.iter())
    }

    fn objects<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Object> + 'a> {
        Box::new(self.objects.iter())
    }

    fn unions<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Union> + 'a> {
        Box::new(self.unions.iter())
    }

    fn interfaces<'a>(&'a self) -> Box<dyn Iterator<Item = &'a Interface> + 'a> {
        Box::new(self.interfaces.iter())
    }
}

impl InMemorySchema {
    pub fn get_directive_mut(&mut self, name: StringKey) -> Option<&mut Directive> {
        self.directives.get_mut(&name)
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
        if self.type_map.contains_key(&object.name.item) {
            return Err(vec![Diagnostic::error(
                SchemaError::DuplicateType(object.name.item),
                object.name.location,
            )]);
        }
        let index: u32 = self.objects.len().try_into().unwrap();
        let name = object.name;
        self.objects.push(object);
        self.type_map
            .insert(name.item, Type::Object(ObjectID(index)));
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

    pub fn add_implementing_object_to_interface(
        &mut self,
        interface_id: InterfaceID,
        object_id: ObjectID,
    ) -> DiagnosticsResult<InterfaceID> {
        let interface = self.interfaces.get_mut(interface_id.as_usize()).unwrap();
        interface.implementing_objects.push(object_id);
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
        self.type_map.insert(object.name.item, Type::Object(id));
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
            return Err(vec![Diagnostic::error(
                SchemaError::UnknownTypeID(id, String::from("Field")),
                field.name.location,
            )]);
        }
        self.fields[id] = field;
        Ok(())
    }

    /// Creates an uninitialized, invalid schema which can then be added to using the add_*
    /// methods. Note that we still bake in some assumptions about the clientid and typename
    /// fields, but in practice this is not an issue.
    pub fn create_uninitialized() -> InMemorySchema {
        InMemorySchema {
            query_type: None,
            mutation_type: None,
            subscription_type: None,
            type_map: HashMap::new(),
            clientid_field: FieldID(0),
            strongid_field: FieldID(0),
            typename_field: FieldID(0),
            fetch_token_field: FieldID(0),
            is_fulfilled_field: FieldID(0),
            clientid_field_name: "__id".intern(),
            strongid_field_name: "strong_id__".intern(),
            typename_field_name: "__typename".intern(),
            fetch_token_field_name: "__token".intern(),
            is_fulfilled_field_name: "is_fulfilled__".intern(),
            string_type: None,
            id_type: None,
            unchecked_argument_type_sentinel: None,
            directives: HashMap::new(),
            enums: Vec::new(),
            fields: Vec::new(),
            input_objects: Vec::new(),
            interfaces: Vec::new(),
            objects: Vec::new(),
            scalars: Vec::new(),
            unions: Vec::new(),
        }
    }

    pub fn build(
        schema_documents: &[SchemaDocument],
        client_schema_documents: &[SchemaDocument],
    ) -> DiagnosticsResult<Self> {
        let schema_definitions: Vec<&TypeSystemDefinition> = schema_documents
            .iter()
            .flat_map(|document| &document.definitions)
            .collect();

        let client_definitions: Vec<&TypeSystemDefinition> = client_schema_documents
            .iter()
            .flat_map(|document| &document.definitions)
            .collect();

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

        for definition in schema_definitions.iter().chain(&client_definitions) {
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
        let string_type = *type_map
            .get(&"String".intern())
            .expect("Missing String type");
        let id_type = *type_map.get(&"ID".intern()).expect("Missing ID type");

        let unchecked_argument_type_sentinel = Some(TypeReference::Named(
            *type_map
                .get(&"Boolean".intern())
                .expect("Missing Boolean type"),
        ));

        let mut schema = InMemorySchema {
            query_type: None,
            mutation_type: None,
            subscription_type: None,
            type_map,
            clientid_field: FieldID(0), // dummy value, overwritten later
            strongid_field: FieldID(0), // dummy value, overwritten later
            typename_field: FieldID(0), // dummy value, overwritten later
            fetch_token_field: FieldID(0), // dummy value, overwritten later
            is_fulfilled_field: FieldID(0), // dummy value, overwritten later
            clientid_field_name: "__id".intern(),
            strongid_field_name: "strong_id__".intern(),
            typename_field_name: "__typename".intern(),
            fetch_token_field_name: "__token".intern(),
            is_fulfilled_field_name: "is_fulfilled__".intern(),
            string_type: Some(string_type),
            id_type: Some(id_type),
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

        for document in schema_documents {
            for definition in &document.definitions {
                schema.add_definition(definition, &document.location.source_location(), false)?;
            }
        }

        for document in client_schema_documents {
            for definition in &document.definitions {
                schema.add_definition(definition, &document.location.source_location(), true)?;
            }
        }

        for document in schema_documents.iter().chain(client_schema_documents) {
            for definition in &document.definitions {
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
        }
        schema.load_defaults();

        Ok(schema)
    }

    fn load_defaults(&mut self) {
        self.load_default_root_types();
        self.load_default_typename_field();
        self.load_default_fetch_token_field();
        self.load_default_clientid_field();
        self.load_default_strongid_field();
        self.load_default_is_fulfilled_field();
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
        let string_type = *self
            .type_map
            .get(&"String".intern())
            .expect("Missing String type");
        let typename_field_id = self.fields.len();
        self.typename_field = FieldID(typename_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: WithLocation::generated(self.typename_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(string_type))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
        });
    }

    fn load_default_fetch_token_field(&mut self) {
        let id_type = *self.type_map.get(&"ID".intern()).expect("Missing ID type");
        let fetch_token_field_id = self.fields.len();
        self.fetch_token_field = FieldID(fetch_token_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: WithLocation::generated(self.fetch_token_field_name),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(id_type))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
        });
    }

    fn load_default_clientid_field(&mut self) {
        let id_type = *self.type_map.get(&"ID".intern()).expect("Missing ID type");
        let clientid_field_id = self.fields.len();
        self.clientid_field = FieldID(clientid_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: WithLocation::generated(self.clientid_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(id_type))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
        });
    }

    fn load_default_strongid_field(&mut self) {
        let id_type = *self.type_map.get(&"ID".intern()).expect("Missing ID type");
        let strongid_field_id = self.fields.len();
        self.strongid_field = FieldID(strongid_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: WithLocation::generated(self.strongid_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::Named(id_type),
            directives: Vec::new(),
            parent_type: None,
            description: None,
        });
    }

    fn load_default_is_fulfilled_field(&mut self) {
        let string_type = *self
            .type_map
            .get(&"String".intern())
            .expect("Missing String type");
        let is_fulfilled_field_id = self.fields.len();
        self.is_fulfilled_field = FieldID(is_fulfilled_field_id.try_into().unwrap());
        self.fields.push(Field {
            name: WithLocation::generated(self.is_fulfilled_field_name),
            is_extension: true,
            arguments: ArgumentDefinitions::new(vec![Argument {
                name: "name".intern(),
                type_: TypeReference::NonNull(Box::new(TypeReference::Named(string_type))),
                default_value: None,
                description: None,
            }]),
            type_: TypeReference::NonNull(Box::new(TypeReference::Named(string_type))),
            directives: Vec::new(),
            parent_type: None,
            description: None,
        });
    }

    fn add_definition(
        &mut self,
        definition: &TypeSystemDefinition,
        location_key: &SourceLocationKey,
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
                                return Err(vec![Diagnostic::error(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        expect_object_type_name(&self.type_map, prev_query_type),
                                    ),
                                    Location::new(*location_key, type_.span),
                                )]);
                            } else {
                                self.query_type = Some(operation_id);
                            }
                        }
                        OperationType::Mutation => {
                            if let Some(prev_mutation_type) = self.mutation_type {
                                return Err(vec![Diagnostic::error(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        expect_object_type_name(&self.type_map, prev_mutation_type),
                                    ),
                                    Location::new(*location_key, type_.span),
                                )]);
                            } else {
                                self.mutation_type = Some(operation_id);
                            }
                        }
                        OperationType::Subscription => {
                            if let Some(prev_subscription_type) = self.subscription_type {
                                return Err(vec![Diagnostic::error(
                                    SchemaError::DuplicateOperationDefinition(
                                        *operation,
                                        type_.value,
                                        expect_object_type_name(
                                            &self.type_map,
                                            prev_subscription_type,
                                        ),
                                    ),
                                    Location::new(*location_key, type_.span),
                                )]);
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
                repeatable,
                locations,
                description,
            }) => {
                if self.directives.contains_key(&name.value) {
                    let str_name = name.value.lookup();
                    if str_name != "skip" && str_name != "include" {
                        // TODO(T63941319) @skip and @include directives are duplicated in our schema
                        return Err(vec![Diagnostic::error(
                            SchemaError::DuplicateDirectiveDefinition(name.value),
                            Location::new(*location_key, name.span),
                        )]);
                    }
                }
                let arguments = self.build_arguments(arguments)?;
                self.directives.insert(
                    name.value,
                    Directive {
                        name: name.value,
                        arguments,
                        locations: locations.clone(),
                        repeatable: *repeatable,
                        is_extension,
                        description: description.as_ref().map(|node| node.value),
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
                        fields,
                        &mut HashMap::with_capacity(len_of_option_list(fields)),
                        *location_key,
                        Some(parent_id),
                    )?
                } else {
                    self.build_fields(fields, *location_key, Some(parent_id))?
                };
                let interfaces = interfaces
                    .iter()
                    .map(|name| self.build_interface_id(name, location_key))
                    .collect::<DiagnosticsResult<Vec<_>>>()?;
                let directives = self.build_directive_values(directives);
                self.objects.push(Object {
                    name: WithLocation::new(Location::new(*location_key, name.span), name.value),
                    fields,
                    is_extension,
                    interfaces,
                    directives,
                    description: None,
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
                        fields,
                        &mut HashMap::with_capacity(len_of_option_list(fields)),
                        *location_key,
                        Some(parent_id),
                    )?
                } else {
                    self.build_fields(fields, *location_key, Some(parent_id))?
                };
                let interfaces = interfaces
                    .iter()
                    .map(|name| self.build_interface_id(name, location_key))
                    .collect::<DiagnosticsResult<Vec<_>>>()?;
                let directives = self.build_directive_values(directives);
                self.interfaces.push(Interface {
                    name: name.value,
                    implementing_objects: vec![],
                    is_extension,
                    fields,
                    directives,
                    interfaces,
                    description: None,
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
                let directives = self.build_directive_values(directives);
                self.unions.push(Union {
                    name: name.value,
                    is_extension,
                    members,
                    directives,
                    description: None,
                });
            }
            TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                fields,
                directives,
            }) => {
                let fields = self.build_arguments(fields)?;
                let directives = self.build_directive_values(directives);
                self.input_objects.push(InputObject {
                    name: name.value,
                    fields,
                    directives,
                    description: None,
                });
            }
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                name,
                directives,
                values,
            }) => {
                let directives = self.build_directive_values(directives);
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
                    description: None,
                });
            }
            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                name,
                directives,
            }) => {
                let directives = self.build_directive_values(directives);
                self.scalars.push(Scalar {
                    name: name.value,
                    is_extension,
                    directives,
                    description: None,
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
                    let obj = self.objects.get(index).ok_or_else(|| {
                        vec![Diagnostic::error(
                            SchemaError::ExtendUndefinedType(name.value),
                            Location::new(*location_key, name.span),
                        )]
                    })?;

                    let field_ids = &obj.fields;
                    let mut existing_fields =
                        HashMap::with_capacity(field_ids.len() + len_of_option_list(fields));
                    for field_id in field_ids {
                        let field_name = self.fields[field_id.as_usize()].name;
                        existing_fields.insert(field_name.item, field_name.location);
                    }
                    let client_fields = self.build_extend_fields(
                        fields,
                        &mut existing_fields,
                        *location_key,
                        Some(Type::Object(id)),
                    )?;

                    self.objects[index].fields.extend(client_fields);

                    let built_interfaces = interfaces
                        .iter()
                        .map(|name| self.build_interface_id(name, location_key))
                        .collect::<DiagnosticsResult<Vec<_>>>()?;
                    extend_without_duplicates(
                        &mut self.objects[index].interfaces,
                        built_interfaces,
                    );

                    let built_directives = self.build_directive_values(directives);
                    extend_without_duplicates(
                        &mut self.objects[index].directives,
                        built_directives,
                    );
                }
                _ => {
                    return Err(vec![Diagnostic::error(
                        SchemaError::ExtendUndefinedType(name.value),
                        Location::new(*location_key, name.span),
                    )]);
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
                    let interface = self.interfaces.get(index).ok_or_else(|| {
                        vec![Diagnostic::error(
                            SchemaError::ExtendUndefinedType(name.value),
                            Location::new(*location_key, name.span),
                        )]
                    })?;
                    let field_ids = &interface.fields;
                    let mut existing_fields =
                        HashMap::with_capacity(field_ids.len() + len_of_option_list(fields));
                    for field_id in field_ids {
                        let field_name = self.fields[field_id.as_usize()].name;
                        existing_fields.insert(field_name.item, field_name.location);
                    }
                    let client_fields = self.build_extend_fields(
                        fields,
                        &mut existing_fields,
                        *location_key,
                        Some(Type::Interface(id)),
                    )?;
                    self.interfaces[index].fields.extend(client_fields);

                    let built_directives = self.build_directive_values(directives);
                    extend_without_duplicates(
                        &mut self.interfaces[index].directives,
                        built_directives,
                    );
                }
                _ => {
                    return Err(vec![Diagnostic::error(
                        SchemaError::ExtendUndefinedType(name.value),
                        Location::new(*location_key, name.span),
                    )]);
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

    fn build_interface_id(
        &mut self,
        name: &Identifier,
        location_key: &SourceLocationKey,
    ) -> DiagnosticsResult<InterfaceID> {
        match self.type_map.get(&name.value) {
            Some(Type::Interface(id)) => Ok(*id),
            Some(non_interface_type) => Err(vec![Diagnostic::error(
                SchemaError::ExpectedInterfaceReference(name.value, *non_interface_type),
                Location::new(*location_key, name.span),
            )]),
            None => Err(vec![Diagnostic::error(
                SchemaError::UndefinedType(name.value),
                Location::new(*location_key, name.span),
            )]),
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
        field_location_key: SourceLocationKey,
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
                    let description = field_def.description.as_ref().map(|desc| desc.value);
                    Ok(self.build_field(Field {
                        name: WithLocation::new(
                            Location::new(field_location_key, field_def.name.span),
                            field_def.name.value,
                        ),
                        is_extension: false,
                        arguments,
                        type_,
                        directives,
                        parent_type,
                        description,
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
        existing_fields: &mut HashMap<StringKey, Location>,
        source_location_key: SourceLocationKey,
        parent_type: Option<Type>,
    ) -> DiagnosticsResult<Vec<FieldID>> {
        if let Some(field_defs) = field_defs {
            let mut field_ids: Vec<FieldID> = Vec::with_capacity(field_defs.items.len());
            for field_def in &field_defs.items {
                let field_name = field_def.name.value;
                let field_location = Location::new(source_location_key, field_def.name.span);
                if let Some(prev_location) = existing_fields.insert(field_name, field_location) {
                    return Err(vec![
                        Diagnostic::error(SchemaError::DuplicateField(field_name), field_location)
                            .annotate("previously defined here", prev_location),
                    ]);
                }
                let arguments = self.build_arguments(&field_def.arguments)?;
                let directives = self.build_directive_values(&field_def.directives);
                let type_ = self.build_type_reference(&field_def.type_)?;
                let description = field_def.description.as_ref().map(|desc| desc.value);
                field_ids.push(self.build_field(Field {
                    name: WithLocation::new(field_location, field_name),
                    is_extension: true,
                    arguments,
                    type_,
                    directives,
                    parent_type,
                    description,
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
                        type_: self.build_input_object_reference(&arg_def.type_)?,
                        default_value: arg_def.default_value.clone(),
                        description: None,
                    })
                })
                .collect();
            Ok(ArgumentDefinitions(arg_defs?))
        } else {
            Ok(ArgumentDefinitions(Vec::new()))
        }
    }

    fn build_input_object_reference(
        &mut self,
        ast_type: &TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference> {
        Ok(match ast_type {
            TypeAnnotation::Named(named_type) => {
                let type_ = self.type_map.get(&named_type.name.value).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaError::UndefinedType(named_type.name.value),
                        Location::new(SourceLocationKey::generated(), named_type.name.span),
                    )]
                })?;
                if !(type_.is_enum() || type_.is_scalar() || type_.is_input_object()) {
                    return Err(vec![Diagnostic::error(
                        SchemaError::ExpectedInputType(named_type.name.value),
                        Location::new(SourceLocationKey::generated(), named_type.name.span),
                    )]);
                }

                TypeReference::Named(*type_)
            }
            TypeAnnotation::NonNull(of_type) => {
                TypeReference::NonNull(Box::new(self.build_input_object_reference(&of_type.type_)?))
            }
            TypeAnnotation::List(of_type) => {
                TypeReference::List(Box::new(self.build_input_object_reference(&of_type.type_)?))
            }
        })
    }

    fn build_type_reference(
        &mut self,
        ast_type: &TypeAnnotation,
    ) -> DiagnosticsResult<TypeReference> {
        Ok(match ast_type {
            TypeAnnotation::Named(named_type) => {
                TypeReference::Named(*self.type_map.get(&named_type.name.value).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaError::UndefinedType(named_type.name.value),
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
}

/// Extends the `target` with `extensions` ignoring items that are already in
/// `target`.
fn extend_without_duplicates<T: PartialEq>(
    target: &mut Vec<T>,
    extensions: impl IntoIterator<Item = T>,
) {
    for extension in extensions {
        if !target.contains(&extension) {
            target.push(extension);
        }
    }
}

fn len_of_option_list<T>(option_list: &Option<List<T>>) -> usize {
    option_list.as_ref().map_or(0, |list| list.items.len())
}

fn expect_object_type_name(type_map: &TypeMap, object_id: ObjectID) -> StringKey {
    *type_map
        .iter()
        .find(|(_, type_)| match type_ {
            Type::Object(id_) => id_ == &object_id,
            _ => false,
        })
        .expect("Missing object in type_map")
        .0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extend_without_duplicates() {
        let mut target = vec![10, 11];
        extend_without_duplicates(&mut target, vec![1, 10, 100]);
        assert_eq!(target, vec![10, 11, 1, 100]);
    }
}
