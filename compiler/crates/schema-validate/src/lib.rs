/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;

use common::Named;
use errors::*;
use fnv::{FnvHashMap, FnvHashSet};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use rayon::prelude::*;
use regex::Regex;
use schema::{
    EnumID, Field, FieldID, InputObjectID, Interface, SDLSchema, Schema, Type, TypeReference,
    TypeWithFields, UnionID,
};
use schema_print::{print_directive, print_type};
use std::time::Instant;
use std::{fmt::Write, sync::Mutex};

lazy_static! {
    static ref INTROSPECTION_TYPES: FnvHashSet<StringKey> = vec![
        "__Schema".intern(),
        "__Directive".intern(),
        "__DirectiveLocation".intern(),
        "__Type".intern(),
        "__Field".intern(),
        "__InputValue".intern(),
        "__EnumValue".intern(),
        "__TypeKind".intern(),
    ]
    .into_iter()
    .collect();
    static ref QUERY: StringKey = "Query".intern();
    static ref SUBSCRIPTION: StringKey = "Subscription".intern();
    static ref MUTATION: StringKey = "Mutation".intern();
    static ref TYPE_NAME_REGEX: Regex = Regex::new(r"^[_a-zA-Z][_a-zA-Z0-9]*$").unwrap();
}

pub fn validate(schema: &SDLSchema) -> ValidationContext<'_> {
    let mut validation_context = ValidationContext::new(schema);
    validation_context.validate();
    validation_context
}

#[derive(Clone, Copy, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ValidationContextType {
    TypeNode(StringKey),
    DirectiveNode(StringKey),
    None,
}

impl ValidationContextType {
    pub fn type_name(self) -> String {
        match self {
            ValidationContextType::DirectiveNode(type_name)
            | ValidationContextType::TypeNode(type_name) => type_name.lookup().to_string(),
            _ => "None".to_string(),
        }
    }
}

pub struct ValidationContext<'schema> {
    pub schema: &'schema SDLSchema,
    pub errors: Mutex<FnvHashMap<ValidationContextType, Vec<SchemaValidationError>>>,
}

impl<'schema> ValidationContext<'schema> {
    pub fn new(schema: &'schema SDLSchema) -> Self {
        Self {
            schema,
            errors: Mutex::new(FnvHashMap::default()),
        }
    }

    fn validate(&mut self) {
        let now = Instant::now();
        self.validate_root_types();
        self.validate_directives();
        self.validate_types();
        println!("Validated Schema in {}ms", now.elapsed().as_millis());
        println!(
            "Found {} validation errors",
            self.errors.lock().unwrap().len()
        )
    }

    fn validate_root_types(&mut self) {
        self.validate_root_type(self.schema.query_type(), *QUERY);
        self.validate_root_type(self.schema.subscription_type(), *SUBSCRIPTION);
        self.validate_root_type(self.schema.mutation_type(), *MUTATION);
    }

    fn validate_root_type(&self, root_type: Option<Type>, type_name: StringKey) {
        if let Some(type_) = root_type {
            if !type_.is_object() {
                self.report_error(
                    SchemaValidationError::InvalidRootType(type_name, type_),
                    ValidationContextType::TypeNode(type_name),
                );
            }
        } else if type_name == *QUERY {
            self.add_error(SchemaValidationError::MissingRootType(type_name));
        }
    }

    fn validate_directives(&mut self) {
        for directive in self.schema.get_directives() {
            let context = ValidationContextType::DirectiveNode(directive.name);
            self.validate_name(directive.name, context);
            let mut arg_names = FnvHashSet::default();
            for argument in directive.arguments.iter() {
                self.validate_name(argument.name, context);

                // Ensure unique arguments per directive.
                if arg_names.contains(&argument.name) {
                    self.report_error(
                        SchemaValidationError::DuplicateArgument(argument.name, directive.name),
                        context,
                    );
                    continue;
                }
                arg_names.insert(argument.name);
            }
        }
    }

    fn validate_types(&mut self) {
        let types = self.schema.get_type_map().collect::<Vec<_>>();
        types.par_iter().for_each(|(type_name, type_)| {
            // Ensure it is named correctly (excluding introspection types).
            if !is_introspection_type(type_, **type_name) {
                self.validate_name(**type_name, ValidationContextType::TypeNode(**type_name));
            }
            match type_ {
                Type::Enum(id) => {
                    // Ensure Enums have valid values.
                    self.validate_enum_type(*id);
                }
                Type::InputObject(id) => {
                    // Ensure Input Object fields are valid.
                    self.validate_input_object_fields(*id);
                }
                Type::Interface(id) => {
                    let interface = self.schema.interface(*id);
                    // Ensure fields are valid
                    self.validate_fields(**type_name, &interface.fields);

                    // Validate cyclic references
                    if !self.validate_cyclic_implements_reference(interface) {
                        // Ensure interface implement the interfaces they claim to.
                        self.validate_type_with_interfaces(interface);
                    }
                }
                Type::Object(id) => {
                    let object = self.schema.object(*id);
                    // Ensure fields are valid
                    self.validate_fields(**type_name, &object.fields);

                    // Ensure objects implement the interfaces they claim to.
                    self.validate_type_with_interfaces(object);
                }
                Type::Union(id) => {
                    // Ensure Unions include valid member types.
                    self.validate_union_members(*id);
                }
                Type::Scalar(_id) => {}
            };
        });
    }

    fn validate_fields(&self, type_name: StringKey, fields: &[FieldID]) {
        let context = ValidationContextType::TypeNode(type_name);
        // Must define one or more fields.
        if fields.is_empty() {
            self.report_error(SchemaValidationError::TypeWithNoFields, context)
        }

        let mut field_names = FnvHashSet::default();
        for field_id in fields {
            let field = self.schema.field(*field_id);
            if field_names.contains(&field.name) {
                self.report_error(
                    SchemaValidationError::DuplicateField(field.name.item),
                    context,
                );
                continue;
            }
            field_names.insert(field.name);

            // Ensure they are named correctly.
            self.validate_name(field.name.item, context);

            // Ensure the type is an output type
            if !is_output_type(&field.type_) {
                self.report_error(
                    SchemaValidationError::InvalidFieldType(
                        type_name,
                        field.name.item,
                        field.type_.clone(),
                    ),
                    context,
                )
            }

            let mut arg_names = FnvHashSet::default();
            for argument in field.arguments.iter() {
                // Ensure they are named correctly.
                self.validate_name(argument.name, context);

                // Ensure they are unique per field.
                // Ensure unique arguments per directive.
                if arg_names.contains(&argument.name) {
                    self.report_error(
                        SchemaValidationError::DuplicateArgument(argument.name, field.name.item),
                        context,
                    );
                    continue;
                }
                arg_names.insert(argument.name);

                // Ensure the type is an input type
                if !is_input_type(&argument.type_) {
                    self.report_error(
                        SchemaValidationError::InvalidArgumentType(
                            type_name,
                            field.name.item,
                            argument.name,
                            argument.type_.clone(),
                        ),
                        context,
                    );
                }
            }
        }
    }

    fn validate_union_members(&self, id: UnionID) {
        let union = self.schema.union(id);
        let context = ValidationContextType::TypeNode(union.name);
        if union.members.is_empty() {
            self.report_error(
                SchemaValidationError::UnionWithNoMembers(union.name),
                context,
            );
        }

        let mut member_names = FnvHashSet::default();
        for member in union.members.iter() {
            let member_name = self.schema.object(*member).name.item;
            if member_names.contains(&member_name) {
                self.report_error(SchemaValidationError::DuplicateMember(member_name), context);
                continue;
            }
            member_names.insert(member_name);
        }
    }

    fn validate_enum_type(&self, id: EnumID) {
        let enum_ = self.schema.enum_(id);
        let context = ValidationContextType::TypeNode(enum_.name);
        if enum_.values.is_empty() {
            self.report_error(SchemaValidationError::EnumWithNoValues, context);
        }

        for value in enum_.values.iter() {
            // Ensure valid name.
            self.validate_name(value.value, context);
            let value_name = value.value.lookup();
            if value_name == "true" || value_name == "false" || value_name == "null" {
                self.report_error(
                    SchemaValidationError::InvalidEnumValue(value.value),
                    context,
                );
            }
        }
    }

    fn validate_input_object_fields(&self, id: InputObjectID) {
        let input_object = self.schema.input_object(id);
        let context = ValidationContextType::TypeNode(input_object.name);
        if input_object.fields.is_empty() {
            self.report_error(SchemaValidationError::TypeWithNoFields, context);
        }

        // Ensure the arguments are valid
        for field in input_object.fields.iter() {
            // Ensure they are named correctly.
            self.validate_name(field.name, context);

            // Ensure the type is an input type
            if !is_input_type(&field.type_) {
                self.report_error(
                    SchemaValidationError::InvalidArgumentType(
                        input_object.name,
                        field.name,
                        field.name,
                        field.type_.clone(),
                    ),
                    context,
                );
            }
        }
    }

    fn validate_type_with_interfaces<T: TypeWithFields + Named>(&self, type_: &T) {
        let mut interface_names = FnvHashSet::default();
        for interface_id in type_.interfaces().iter() {
            let interface = self.schema.interface(*interface_id);
            if interface_names.contains(&interface.name) {
                self.report_error(
                    SchemaValidationError::DuplicateInterfaceImplementation(
                        type_.name(),
                        interface.name,
                    ),
                    ValidationContextType::TypeNode(type_.name()),
                );
                continue;
            }
            interface_names.insert(interface.name);
            self.validate_type_implements_interface(type_, interface);
        }
    }

    fn validate_type_implements_interface<T: TypeWithFields + Named>(
        &self,
        type_: &T,
        interface: &Interface,
    ) {
        let object_field_map = self.field_map(type_.fields());
        let interface_field_map = self.field_map(&interface.fields);
        let context = ValidationContextType::TypeNode(type_.name());

        // Assert each interface field is implemented.
        for (field_name, interface_field) in interface_field_map {
            // Assert interface field exists on object.
            if !object_field_map.contains_key(&field_name) {
                self.report_error(
                    SchemaValidationError::InterfaceFieldNotProvided(
                        interface.name,
                        field_name,
                        type_.name(),
                    ),
                    context,
                );
                continue;
            }

            let object_field = object_field_map.get(&field_name).unwrap();
            // Assert interface field type is satisfied by object field type, by being
            // a valid subtype. (covariant)
            if !self
                .schema
                .is_type_subtype_of(&object_field.type_, &interface_field.type_)
            {
                self.report_error(
                    SchemaValidationError::NotASubType(
                        interface.name,
                        field_name,
                        self.schema.get_type_name(interface_field.type_.inner()),
                        type_.name(),
                        self.schema.get_type_name(object_field.type_.inner()),
                    ),
                    context,
                );
            }

            // Assert each interface field arg is implemented.
            for interface_argument in interface_field.arguments.iter() {
                let object_argument = object_field
                    .arguments
                    .iter()
                    .find(|arg| arg.name == interface_argument.name);

                // Assert interface field arg exists on object field.
                if object_argument.is_none() {
                    self.report_error(
                        SchemaValidationError::InterfaceFieldArgumentNotProvided(
                            interface.name,
                            field_name,
                            interface_argument.name,
                            type_.name(),
                        ),
                        context,
                    );
                    continue;
                }
                let object_argument = object_argument.unwrap();

                // Assert interface field arg type matches object field arg type.
                // (invariant)
                // TODO: change to contravariant?
                if interface_argument.type_ != object_argument.type_ {
                    self.report_error(
                        SchemaValidationError::NotEqualType(
                            interface.name,
                            field_name,
                            interface_argument.name,
                            self.schema.get_type_name(interface_argument.type_.inner()),
                            type_.name(),
                            self.schema.get_type_name(object_argument.type_.inner()),
                        ),
                        context,
                    );
                }
                // TODO: validate default values?
            }

            // Assert additional arguments must not be required.
            for object_argument in object_field.arguments.iter() {
                if !interface_field.arguments.contains(object_argument.name)
                    && object_argument.type_.is_non_null()
                {
                    self.report_error(
                        SchemaValidationError::MissingRequiredArgument(
                            type_.name(),
                            field_name,
                            object_argument.name,
                            interface.name,
                        ),
                        context,
                    );
                }
            }
        }
    }

    fn validate_cyclic_implements_reference(&self, interface: &Interface) -> bool {
        for id in interface.interfaces() {
            let mut path = Vec::new();
            let mut visited = FnvHashSet::default();
            if self.has_path(
                self.schema.interface(*id),
                interface.name,
                &mut path,
                &mut visited,
            ) {
                self.report_error(
                    SchemaValidationError::CyclicInterfaceInheritance(format!(
                        "{}->{}",
                        path.iter()
                            .map(|name| name.lookup())
                            .collect::<Vec<_>>()
                            .join("->"),
                        interface.name
                    )),
                    ValidationContextType::TypeNode(interface.name),
                );
                return true;
            }
        }
        false
    }

    fn has_path(
        &self,
        root: &Interface,
        target: StringKey,
        path: &mut Vec<StringKey>,
        visited: &mut FnvHashSet<StringKey>,
    ) -> bool {
        if visited.contains(&root.name) {
            return false;
        }

        if root.name == target {
            return true;
        }

        path.push(root.name);
        visited.insert(root.name);
        for id in root.interfaces() {
            if self.has_path(self.schema.interface(*id), target, path, visited) {
                return true;
            }
        }
        path.remove(path.len() - 1);
        false
    }

    fn validate_name(&self, name: StringKey, context: ValidationContextType) {
        let name = name.lookup();
        let mut chars = name.chars();
        if name.len() > 1 && chars.next() == Some('_') && chars.next() == Some('_') {
            self.report_error(
                SchemaValidationError::InvalidNamePrefix(name.to_string()),
                context,
            );
        }
        if !TYPE_NAME_REGEX.is_match(name) {
            self.report_error(
                SchemaValidationError::InvalidName(name.to_string()),
                context,
            );
        }
    }

    fn field_map(&self, fields: &[FieldID]) -> FnvHashMap<StringKey, Field> {
        fields
            .iter()
            .map(|id| self.schema.field(*id))
            .map(|field| (field.name.item, field.clone()))
            .collect::<FnvHashMap<_, _>>()
    }

    fn report_error(&self, error: SchemaValidationError, context: ValidationContextType) {
        self.errors
            .lock()
            .unwrap()
            .entry(context)
            .or_insert_with(Vec::new)
            .push(error);
    }

    fn add_error(&self, error: SchemaValidationError) {
        self.report_error(error, ValidationContextType::None);
    }

    pub fn print_errors(&self) -> String {
        let mut builder: String = String::new();
        let errors = self.errors.lock().unwrap();
        let mut contexts: Vec<_> = errors.keys().collect();
        contexts.sort_by_key(|context| context.type_name());
        for context in contexts {
            match context {
                ValidationContextType::None => writeln!(builder, "Errors:").unwrap(),
                ValidationContextType::TypeNode(type_name) => writeln!(
                    builder,
                    "Type {} with definition:\n\t{}\nhad errors:",
                    type_name,
                    print_type(self.schema, self.schema.get_type(*type_name).unwrap()).trim_end()
                )
                .unwrap(),
                ValidationContextType::DirectiveNode(directive_name) => writeln!(
                    builder,
                    "Directive {} with definition:\n\t{}\nhad errors:",
                    directive_name,
                    print_directive(
                        self.schema,
                        self.schema.get_directive(*directive_name).unwrap()
                    )
                    .trim_end()
                )
                .unwrap(),
            }
            let mut error_strings = errors
                .get(context)
                .unwrap()
                .iter()
                .map(|error| format!("\t* {}", error))
                .collect::<Vec<_>>();
            error_strings.sort();
            writeln!(builder, "{}", error_strings.join("\n")).unwrap();
            writeln!(builder).unwrap();
        }
        builder
    }
}

fn is_named_type(type_: &Type) -> bool {
    type_.is_enum()
        || type_.is_input_type()
        || type_.is_interface()
        || type_.is_object()
        || type_.is_scalar()
        || type_.is_union()
}

fn is_introspection_type(type_: &Type, type_name: StringKey) -> bool {
    is_named_type(type_) && INTROSPECTION_TYPES.contains(&type_name)
}

fn is_output_type(type_: &TypeReference) -> bool {
    let type_ = type_.inner();
    type_.is_enum()
        || type_.is_interface()
        || type_.is_object()
        || type_.is_scalar()
        || type_.is_union()
}

fn is_input_type(type_: &TypeReference) -> bool {
    let type_ = type_.inner();
    type_.is_enum() || type_.is_input_type() || type_.is_scalar()
}
