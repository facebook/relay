/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast;
use crate::errors::{Result, SchemaError};
use interner::{Intern, StringKey};
use std::collections::{BTreeMap, HashMap, HashSet};
use std::convert::TryInto;
use std::fmt;
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

    directives: Vec<Directive>,

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

    pub fn get_type_string(&self, type_: &TypeReference) -> String {
        match type_ {
            TypeReference::Named(inner) => self.get_type_name(inner.clone()).lookup().to_string(),
            TypeReference::NonNull(of) => format!("{}!", self.get_type_string(of)),
            TypeReference::List(of) => format!("[{}]", self.get_type_string(of)),
        }
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

    pub fn get_directive(&self, name: StringKey) -> Option<&Directive> {
        self.directives.iter().find(|x| x.name == name)
    }

    pub fn named_field(&self, parent_type: Type, name: StringKey) -> Option<FieldID> {
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
        match type_ {
            Type::Scalar(id) => {
                let scalar = &self.scalars[id.as_usize()];
                scalar.name == "ID".intern()
            }
            _ => false,
        }
    }

    pub fn build(
        builtins: Vec<ast::Definition>,
        schema_definitions: Vec<ast::Definition>,
        client_definitions: Vec<ast::Definition>,
    ) -> Result<Self> {
        let definitions = builtins.iter().chain(schema_definitions.iter());

        // Step 1: build the type_map from type names to type keys
        let mut type_map = HashMap::with_capacity(
            builtins.len() + schema_definitions.len() + client_definitions.len(),
        );
        let mut next_object_id = 0;
        let mut next_interface_id = 0;
        let mut next_union_id = 0;
        let mut next_input_object_id = 0;
        let mut next_enum_id = 0;
        let mut next_scalar_id = 0;
        let mut field_count = 0;
        let mut directive_count = 0;
        for definition in definitions.clone().chain(client_definitions.iter()) {
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
        let mut schema = Schema {
            query_type: None,
            mutation_type: None,
            subscription_type: None,
            type_map,
            clientid_field: FieldID(0), // dummy value, overwritten later
            typename_field: FieldID(0), // dummy value, overwritten later
            directives: Vec::with_capacity(directive_count),
            enums: Vec::with_capacity(next_enum_id.try_into().unwrap()),
            fields: Vec::with_capacity(field_count),
            input_objects: Vec::with_capacity(next_input_object_id.try_into().unwrap()),
            interfaces: Vec::with_capacity(next_interface_id.try_into().unwrap()),
            objects: Vec::with_capacity(next_object_id.try_into().unwrap()),
            scalars: Vec::with_capacity(next_scalar_id.try_into().unwrap()),
            unions: Vec::with_capacity(next_union_id.try_into().unwrap()),
        };

        for definition in definitions {
            schema.add_definition(&definition, false)?;
        }

        for definition in client_definitions.iter() {
            schema.add_definition(&definition, true)?;
        }

        for definition in schema_definitions.iter().chain(client_definitions.iter()) {
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

        let typename_field_id = schema.fields.len();
        schema.typename_field = FieldID(typename_field_id.try_into().unwrap());
        schema.fields.push(Field {
            name: "__typename".intern(),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::Named(*schema.type_map.get(&"String".intern()).unwrap()),
        });

        let clientid_field_id = schema.fields.len();
        schema.clientid_field = FieldID(clientid_field_id.try_into().unwrap());
        schema.fields.push(Field {
            name: "__id".intern(),
            is_extension: false,
            arguments: ArgumentDefinitions::new(Default::default()),
            type_: TypeReference::Named(*schema.type_map.get(&"ID".intern()).unwrap()),
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
                let arguments = self.build_arguments(arguments)?;
                self.directives.push(Directive {
                    name: *name,
                    arguments,
                    locations: locations.clone(),
                });
            }
            ast::Definition::ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives: _directives,
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
                self.objects.push(Object {
                    name: *name,
                    fields,
                    is_extension,
                    interfaces,
                });
            }
            ast::Definition::InterfaceTypeDefinition {
                name,
                directives: _directives,
                fields,
            } => {
                let fields = if is_extension {
                    self.build_extend_fields(&fields, &mut HashSet::with_capacity(fields.len()))?
                } else {
                    self.build_fields(&fields)?
                };
                self.interfaces.push(Interface {
                    name: *name,
                    implementors: vec![],
                    is_extension,
                    fields,
                });
            }
            ast::Definition::UnionTypeDefinition {
                name,
                directives: _directives,
                members,
            } => {
                let members = members
                    .iter()
                    .map(|name| self.build_object_id(*name))
                    .collect::<Result<Vec<_>>>()?;
                self.unions.push(Union {
                    name: *name,
                    is_extension,
                    members,
                });
            }
            ast::Definition::InputObjectTypeDefinition {
                name,
                fields,
                directives: _directives,
            } => {
                let fields = self.build_arguments(fields)?;
                self.input_objects.push(InputObject {
                    name: *name,
                    fields,
                });
            }
            ast::Definition::EnumTypeDefinition {
                name,
                directives: _directives,
                values,
            } => self.enums.push(Enum {
                name: *name,
                is_extension,
                values: values.iter().map(|enum_def| enum_def.name).collect(),
            }),
            ast::Definition::ScalarTypeDefinition {
                name,
                directives: _directives,
            } => self.scalars.push(Scalar {
                name: *name,
                is_extension,
            }),
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
                Ok(self.build_field(Field {
                    name: field_def.name,
                    is_extension: false,
                    arguments,
                    type_,
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
            let type_ = self.build_type_reference(&field_def.type_)?;
            field_ids.push(self.build_field(Field {
                name: field_def.name,
                is_extension: true,
                arguments,
                type_,
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
                    // TODO
                    default_value: None,
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

    pub fn snapshot_print(self) -> String {
        let Self {
            query_type,
            mutation_type,
            subscription_type,
            directives,
            clientid_field: _clientid_field,
            typename_field: _typename_field,
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
            directives,
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
        pub struct $name($type);
        impl $name {
            #[allow(dead_code)]
            fn as_usize(&self) -> usize {
                self.0 as usize
            }
        }
    };
}

type_id!(EnumID, u16);
type_id!(InputObjectID, u16);
type_id!(InterfaceID, u16);
type_id!(ObjectID, u16);
type_id!(ScalarID, u16);
type_id!(UnionID, u16);
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
}

#[derive(Debug)]
pub struct Directive {
    pub name: StringKey,
    pub arguments: ArgumentDefinitions,
    pub locations: Vec<DirectiveLocation>,
}

#[derive(Debug)]
pub struct Scalar {
    pub name: StringKey,
    pub is_extension: bool,
}

#[derive(Debug)]
pub struct Object {
    pub name: StringKey,
    pub is_extension: bool,
    pub fields: Vec<FieldID>,
    pub interfaces: Vec<InterfaceID>,
}

#[derive(Debug)]
pub struct InputObject {
    pub name: StringKey,
    pub fields: ArgumentDefinitions,
}

#[derive(Debug)]
pub struct Enum {
    pub name: StringKey,
    pub is_extension: bool,
    pub values: Vec<StringKey>,
}

#[derive(Debug)]
pub struct Union {
    pub name: StringKey,
    pub is_extension: bool,
    pub members: Vec<ObjectID>,
}

#[derive(Debug)]
pub struct Interface {
    pub name: StringKey,
    pub is_extension: bool,
    pub implementors: Vec<ObjectID>,
    pub fields: Vec<FieldID>,
}

#[derive(Debug)]
pub struct Field {
    pub name: StringKey,
    pub is_extension: bool,
    pub arguments: ArgumentDefinitions,
    pub type_: TypeReference,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Argument {
    pub name: StringKey,
    pub type_: TypeReference,
    pub default_value: Option<ConstValue>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ArgumentDefinitions(Vec<Argument>);

impl ArgumentDefinitions {
    pub fn new(arguments: Vec<Argument>) -> Self {
        Self(arguments)
    }

    pub fn get(&self, name: StringKey) -> Option<&Argument> {
        self.0.iter().find(|x| x.name == name)
    }

    pub fn contains(&self, name: StringKey) -> bool {
        self.0.iter().any(|x| x.name == name)
    }

    pub fn iter(&self) -> Iter<'_, Argument> {
        self.0.iter()
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
