/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::StringKey;
use schema::{
    DirectiveValue, EnumID, FieldID, InputObjectID, InterfaceID, ObjectID, SDLSchema, ScalarID,
    Schema, Type, UnionID,
};
use schema_documentation::SchemaDocumentation;
use serde::{Deserialize, Serialize};

const DEFAULT_COUNT: usize = 100;

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerTypeReference<T> {
    name: String,
    description: Option<String>,
    kind: String,
    #[serde(flatten)]
    inner: T,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "kind")]
pub(crate) enum SchemaExplorerSchemaType {
    Object(SchemaExplorerObject),
    Interface(SchemaExplorerInterface),
    Enum(SchemaExplorerEnum),
    Union(SchemaExplorerUnion),
    Scalar(SchemaExplorerScalar),
    InputObject(SchemaExplorerInputObject),
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerInterface {
    implementing_objects: Vec<SchemaExplorerTypeReference<()>>,
    fields: Vec<SchemaExplorerField>,
    interfaces: Vec<SchemaExplorerTypeReference<()>>,
    is_extension: bool,
    directives: Vec<SchemaExplorerDirective>,
}
#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerObject {
    fields: Vec<SchemaExplorerField>,
    interfaces: Vec<SchemaExplorerTypeReference<()>>,
    is_extension: bool,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerInputObject {
    // This is named differently than in definitions.rs
    arguments: Vec<SchemaExplorerFieldArgument>,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerEnum {
    values: Vec<String>,
    is_extension: bool,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerUnion {
    is_extension: bool,
    members: Vec<SchemaExplorerTypeReference<()>>,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerField {
    field_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    field_description: Option<String>,
    arguments: Vec<SchemaExplorerFieldArgument>,
    rendered_type_name: String,
    type_reference: SchemaExplorerTypeReference<()>,
    is_extension: bool,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerFieldArgument {
    argument_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    argument_description: Option<String>,
    default_value: Option<String>,
    rendered_type_name: String,
    type_reference: SchemaExplorerTypeReference<()>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerScalar {
    is_extension: bool,
    directives: Vec<SchemaExplorerDirective>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerDirective {
    directive_name: String,
    arguments: Vec<SchemaExplorerDirectiveArgument>,
}

#[derive(Deserialize, Serialize)]
pub(crate) struct SchemaExplorerDirectiveArgument {
    argument_name: String,
    value: String,
}

pub(crate) fn get_full_schema_explorer_type_reference(
    type_: Type,
    type_name: &str,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
    filter: &Option<String>,
    count: Option<usize>,
) -> SchemaExplorerTypeReference<SchemaExplorerSchemaType> {
    let description = documentation
        .get_type_description(type_name)
        .map(|description| description.to_string());

    let schema_explorer_schema_type = match type_ {
        Type::Object(object_id) => {
            let object =
                get_schema_explorer_object(object_id, schema, documentation, filter, count);
            SchemaExplorerSchemaType::Object(object)
        }
        Type::Interface(interface_id) => {
            let interface =
                get_schema_explorer_interface(interface_id, schema, documentation, filter);
            SchemaExplorerSchemaType::Interface(interface)
        }
        Type::Enum(enum_id) => {
            let enum_ = get_schema_explorer_enum(enum_id, schema);
            SchemaExplorerSchemaType::Enum(enum_)
        }
        Type::InputObject(input_object_id) => {
            let input_object =
                get_schema_explorer_input_object(input_object_id, schema, documentation);
            SchemaExplorerSchemaType::InputObject(input_object)
        }
        Type::Union(union_id) => {
            let union_ = get_schema_explorer_union(union_id, schema, documentation);
            SchemaExplorerSchemaType::Union(union_)
        }
        Type::Scalar(scalar_id) => {
            let scalar = get_schema_explorer_scalar(scalar_id, schema);
            SchemaExplorerSchemaType::Scalar(scalar)
        }
    };

    SchemaExplorerTypeReference {
        kind: get_kind(type_),
        name: type_name.to_string(),
        description,
        inner: schema_explorer_schema_type,
    }
}

fn get_empty_schema_explorer_type_reference(
    type_: Type,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
) -> SchemaExplorerTypeReference<()> {
    let name = schema.get_type_name(type_).to_string();
    let description = documentation
        .get_type_description(&name)
        .map(|description| description.to_string());
    SchemaExplorerTypeReference {
        kind: get_kind(type_),
        name,
        description,
        inner: (),
    }
}

fn get_schema_explorer_enum(enum_id: EnumID, schema: &SDLSchema) -> SchemaExplorerEnum {
    let enum_ = schema.enum_(enum_id);
    let values = enum_
        .values
        .iter()
        .map(|value| value.value.to_string())
        .collect::<Vec<_>>();
    SchemaExplorerEnum {
        values,
        is_extension: enum_.is_extension,
        directives: get_schema_explorer_directives(&enum_.directives),
    }
}

fn get_schema_explorer_interface(
    interface_id: InterfaceID,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
    filter: &Option<String>,
) -> SchemaExplorerInterface {
    let interface = schema.interface(interface_id);
    let implementing_objects = interface
        .implementing_objects
        .iter()
        .map(|object_id| {
            get_empty_schema_explorer_type_reference(
                Type::Object(*object_id),
                schema,
                documentation,
            )
        })
        .collect::<Vec<_>>();

    let interface_type_name = schema.get_type_name(Type::Interface(interface_id));
    let fields = interface
        .fields
        .iter()
        .filter_map(|field_id| {
            get_schema_explorer_field(
                *field_id,
                interface_type_name,
                schema,
                documentation,
                filter,
            )
        })
        .collect::<Vec<_>>();

    let subinterfaces = interface
        .interfaces
        .iter()
        .map(|interface_id| {
            get_empty_schema_explorer_type_reference(
                Type::Interface(*interface_id),
                schema,
                documentation,
            )
        })
        .collect::<Vec<_>>();

    SchemaExplorerInterface {
        implementing_objects,
        fields,
        interfaces: subinterfaces,
        is_extension: interface.is_extension,
        directives: get_schema_explorer_directives(&interface.directives),
    }
}

fn get_schema_explorer_input_object(
    input_object_id: InputObjectID,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
) -> SchemaExplorerInputObject {
    let input_object = schema.input_object(input_object_id);
    let arguments = input_object
        .fields
        .iter()
        .map(|arg| {
            let type_reference =
                get_empty_schema_explorer_type_reference(arg.type_.inner(), schema, documentation);

            SchemaExplorerFieldArgument {
                argument_name: arg.name.to_string(),
                argument_description: None,
                default_value: arg.default_value.as_ref().map(|value| value.to_string()),
                rendered_type_name: schema.get_type_string(&arg.type_),
                type_reference,
            }
        })
        .collect::<Vec<_>>();

    SchemaExplorerInputObject {
        arguments,
        directives: get_schema_explorer_directives(&input_object.directives),
    }
}

fn get_schema_explorer_object(
    object_id: ObjectID,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
    filter: &Option<String>,
    count: Option<usize>,
) -> SchemaExplorerObject {
    let object = schema.object(object_id);
    let object_type_name = schema.get_type_name(Type::Object(object_id));
    let fields = object
        .fields
        .iter()
        .filter_map(|field_id| {
            get_schema_explorer_field(*field_id, object_type_name, schema, documentation, filter)
        })
        .take(count.unwrap_or(DEFAULT_COUNT))
        .collect::<Vec<_>>();

    let interfaces = object
        .interfaces
        .iter()
        .map(|interface_id| {
            get_empty_schema_explorer_type_reference(
                Type::Interface(*interface_id),
                schema,
                documentation,
            )
        })
        .collect::<Vec<_>>();

    SchemaExplorerObject {
        fields,
        interfaces,
        is_extension: object.is_extension,
        directives: get_schema_explorer_directives(&object.directives),
    }
}

fn get_schema_explorer_union(
    union_id: UnionID,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
) -> SchemaExplorerUnion {
    let union_ = schema.union(union_id);

    let members = union_
        .members
        .iter()
        .map(|id| {
            get_empty_schema_explorer_type_reference(Type::Object(*id), schema, documentation)
        })
        .collect::<Vec<_>>();

    SchemaExplorerUnion {
        members,
        is_extension: union_.is_extension,
        directives: get_schema_explorer_directives(&union_.directives),
    }
}

fn get_schema_explorer_scalar(scalar_id: ScalarID, schema: &SDLSchema) -> SchemaExplorerScalar {
    let scalar = schema.scalar(scalar_id);

    SchemaExplorerScalar {
        is_extension: scalar.is_extension,
        directives: get_schema_explorer_directives(&scalar.directives),
    }
}

fn get_schema_explorer_field(
    field_id: FieldID,
    parent_type_name: StringKey,
    schema: &SDLSchema,
    documentation: &impl SchemaDocumentation,
    filter: &Option<String>,
) -> Option<SchemaExplorerField> {
    let field = schema.field(field_id);
    let field_name = field.name.item.to_string();

    let field_type_name = schema.get_type_name(field.type_.inner()).to_string();

    let field_type_description = documentation
        .get_type_description(&field_type_name)
        .map(|field_type_description| field_type_description.to_string());
    let field_description = documentation
        .get_field_description(parent_type_name.lookup(), &field_name)
        .map(|field_description| field_description.to_string());

    if let Some(filter) = filter {
        if !field_passes_filter(
            filter,
            field_name.to_lowercase(),
            field_type_name.to_lowercase(),
            field_type_description.as_ref().map(|s| s.to_lowercase()),
        ) {
            return None;
        }
    }

    let type_reference =
        get_empty_schema_explorer_type_reference(field.type_.inner(), schema, documentation);

    let arguments = field
        .arguments
        .iter()
        .map(|arg| {
            let type_reference =
                get_empty_schema_explorer_type_reference(arg.type_.inner(), schema, documentation);

            let argument_description = documentation
                .get_field_argument_description(
                    parent_type_name.lookup(),
                    &field_name,
                    arg.name.lookup(),
                )
                .map(|field_argument_description| field_argument_description.to_string());

            SchemaExplorerFieldArgument {
                argument_name: arg.name.to_string(),
                argument_description,
                rendered_type_name: schema.get_type_string(&arg.type_),
                type_reference,
                default_value: arg.default_value.as_ref().map(|value| value.to_string()),
            }
        })
        .collect::<Vec<_>>();

    Some(SchemaExplorerField {
        field_name,
        field_description,
        type_reference,
        rendered_type_name: schema.get_type_string(&field.type_),
        arguments,
        is_extension: field.is_extension,
        directives: get_schema_explorer_directives(&field.directives),
    })
}

fn field_passes_filter(
    filter: &str,
    field_name: String,
    field_type_name: String,
    field_type_description: Option<String>,
) -> bool {
    if field_name.contains(filter) || field_type_name.contains(filter) {
        true
    } else if let Some(field_type_description) = field_type_description {
        field_type_description.contains(filter)
    } else {
        false
    }
}

fn get_schema_explorer_directives(directives: &[DirectiveValue]) -> Vec<SchemaExplorerDirective> {
    directives
        .iter()
        .map(|directive| -> SchemaExplorerDirective {
            SchemaExplorerDirective {
                directive_name: directive.name.to_string(),
                arguments: directive
                    .arguments
                    .iter()
                    .map(|arg| SchemaExplorerDirectiveArgument {
                        argument_name: arg.name.to_string(),
                        value: arg.value.to_string(),
                    })
                    .collect::<Vec<_>>(),
            }
        })
        .collect::<Vec<_>>()
}

fn get_kind(type_: Type) -> String {
    match type_ {
        Type::Enum(_) => "Enum".to_string(),
        Type::Union(_) => "Union".to_string(),
        Type::InputObject(_) => "InputObject".to_string(),
        Type::Object(_) => "Object".to_string(),
        Type::Scalar(_) => "Scalar".to_string(),
        Type::Interface(_) => "Interface".to_string(),
    }
}
