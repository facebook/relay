/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Type information LSP request

use std::sync::Arc;

use intern::Lookup;
use intern::string_key::Intern;
use itertools::Itertools;
use lsp_types::Url;
use schema::DirectiveValue;
use schema::FieldID;
use schema::InterfaceID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

use crate::server::GlobalState;

// TODO: maybe reduce this after adding filtering arguments
const MAX_FIELDS: usize = 200;

/// Implementation of the `relay type-information` CLI command.
pub(crate) fn get_type_information(
    lsp_state: &impl GlobalState,
    uri: Url,
    type_name: String,
    string_filter: Option<String>,
) -> Result<String, String> {
    let Ok(project_name) = lsp_state.extract_project_name_from_url(&uri) else {
        return Err(format!(
            "Unable to extract Relay GraphQL project from uri: {uri:?}"
        ));
    };

    let schema = lsp_state
        .get_schema(&project_name)
        .map_err(|e| format!("{e:?}"))?;

    let type_ = match type_name.as_str() {
        "Query" => schema.query_type(),
        "Subscription" => schema.subscription_type(),
        "Mutation" => schema.mutation_type(),
        _ => schema.get_type((&type_name).intern()),
    };

    let Some(type_) = type_ else {
        return Err(format!(
            "Unable to find type information for `{type_name}`."
        ));
    };

    Ok(print_type(&schema, type_, string_filter))
}

type FieldPredicate = Box<dyn Fn(FieldID) -> bool>;

pub fn print_type(schema: &Arc<SDLSchema>, type_: Type, string_filter: Option<String>) -> String {
    let field_predicate: FieldPredicate = if let Some(string_filter) = string_filter {
        let schema = Arc::clone(schema);
        let string_filter = string_filter.to_lowercase();
        Box::new(move |field: FieldID| {
            schema
                .field(field)
                .name
                .item
                .lookup()
                .to_lowercase()
                .contains(&string_filter)
        })
    } else {
        Box::new(|_| true)
    };

    let type_directives = print_directives(schema.directives_for_type(type_));

    match type_ {
        Type::Scalar(x) => {
            let scalar = schema.scalar(x);
            let name = scalar.name.item;
            format!("scalar {name}{type_directives}")
        }
        Type::Enum(enum_id) => {
            let enum_ = schema.enum_(enum_id);
            let name = enum_.name.item;
            let values = enum_
                .values
                .iter()
                .map(|value| value.value.lookup())
                .join(", ");
            format!("enum {name}{type_directives} {{ {values} }}")
        }
        Type::InputObject(input_object_id) => {
            let input_object = schema.input_object(input_object_id);
            let name = input_object.name.item;
            let fields = input_object
                .fields
                .iter()
                .map(|field| {
                    let arg_name = field.name.item;
                    let arg_type = print_type_reference(schema, &field.type_);
                    format!("  {arg_name}: {arg_type}")
                })
                .join("\n");
            format!(
                r"input {name}{type_directives} {{
{fields}
}}"
            )
        }
        Type::Interface(interface) => {
            let interface = schema.interface(interface);
            let name = interface.name.item;
            let implements_interfaces = print_implements_interfaces(schema, &interface.interfaces);
            let fields = print_fields(schema, &interface.fields, &field_predicate);
            format!(
                r"interface {name}{implements_interfaces}{type_directives} {{
{fields}}}"
            )
        }
        Type::Object(_object_id) => {
            let object = schema.object(_object_id);
            let name = object.name.item;
            let implements_interfaces = print_implements_interfaces(schema, &object.interfaces);
            let fields = print_fields(schema, &object.fields, &field_predicate);
            format!(
                r"type {name}{implements_interfaces}{type_directives} {{
{fields}}}"
            )
        }
        Type::Union(union) => {
            let union = schema.union(union);
            let name = union.name.item;
            let members = union
                .members
                .iter()
                .map(|member| {
                    let member = schema.object(*member);
                    member.name.item.lookup()
                })
                .join(" | ");
            format!("union {name}{type_directives} = {members}")
        }
    }
}

fn print_implements_interfaces(schema: &SDLSchema, interfaces: &[InterfaceID]) -> String {
    if interfaces.is_empty() {
        String::new()
    } else {
        let interfaces = interfaces
            .iter()
            .map(|interface| schema.interface(*interface).name.item.lookup())
            .join(" & ");
        format!(" implements {interfaces}")
    }
}

fn print_directives(directives: &[DirectiveValue]) -> String {
    directives
        .iter()
        .map(|directive| {
            let name = directive.name;
            let args_string = if directive.arguments.is_empty() {
                String::new()
            } else {
                let args = directive
                    .arguments
                    .iter()
                    .map(|arg| {
                        format!(
                            "{arg_name} = {arg_value}",
                            arg_name = arg.name,
                            arg_value = arg.value
                        )
                    })
                    .join(", ");
                format!("({args})")
            };
            format!(" @{name}{args_string}")
        })
        .join("")
}

fn print_fields(
    schema: &SDLSchema,
    fields: &[schema::FieldID],
    field_predicate: &FieldPredicate,
) -> String {
    let mut result = String::new();
    let filtered_fields = fields
        .iter()
        .copied()
        .filter(|&field| field_predicate(field))
        .sorted_by_key(|&field| schema.field(field).name.item)
        .collect_vec();

    for (index, field) in filtered_fields.iter().enumerate() {
        if index >= MAX_FIELDS {
            let num_more_fields = filtered_fields.len() - index;
            result.push_str(&format!(
                "  # ... and {num_more_fields} more fields unable to display, use a filter to narrow down the options\n"
            ));
            break;
        }
        result.push_str(&print_field(schema, *field));
    }
    if filtered_fields.len() < fields.len() {
        result.push_str(&format!(
            "  # {} fields not matching filter\n",
            fields.len() - filtered_fields.len()
        ));
    }
    result
}

fn print_field(schema: &SDLSchema, field: FieldID) -> String {
    let field = schema.field(field);
    let arg_name = field.name.item;
    let args_string = if field.arguments.is_empty() {
        String::new()
    } else {
        let args = field
            .arguments
            .iter()
            .map(|arg| {
                let arg_name = arg.name.item;
                let arg_type = print_type_reference(schema, &arg.type_);
                format!("{arg_name}: {arg_type}")
            })
            .join(", ");
        format!("({args})")
    };
    let arg_type = print_type_reference(schema, &field.type_);
    let directives = print_directives(&field.directives);
    format!("  {arg_name}{args_string}: {arg_type}{directives}\n")
}

fn print_type_reference(schema: &SDLSchema, type_: &TypeReference<Type>) -> String {
    match type_ {
        TypeReference::Named(named_type) => match *named_type {
            Type::Scalar(id) => schema.scalar(id).name.item.lookup(),
            Type::Enum(id) => schema.enum_(id).name.item.lookup(),
            Type::InputObject(id) => schema.input_object(id).name.item.lookup(),
            Type::Interface(id) => schema.interface(id).name.item.lookup(),
            Type::Object(id) => schema.object(id).name.item.lookup(),
            Type::Union(id) => schema.union(id).name.item.lookup(),
        }
        .to_string(),
        TypeReference::NonNull(of_type) => {
            format!("{}!", print_type_reference(schema, of_type))
        }
        TypeReference::List(of_type) => {
            format!("[{}]", print_type_reference(schema, of_type))
        }
    }
}
