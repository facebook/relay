/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::{Program, Value};
use graphql_syntax::{Identifier, OperationDefinition, VariableDefinition};
use graphql_text_printer::print_value;
use interner::StringKey;
use lsp_types::{HoverContents, MarkedString};
use schema::{SDLSchema, Schema};
use schema_documentation::SchemaDocumentation;
use schema_print::print_directive;

use crate::{
    hover::{get_open_schema_explorer_command_link, GraphQLSchemaExplorerParams},
    resolution_path::{
        ArgumentPath, ArgumentRoot, ConstantArgPath, ConstantBooleanPath, ConstantEnumPath,
        ConstantFloatPath, ConstantIntPath, ConstantListPath, ConstantNullPath, ConstantObjPath,
        ConstantObjectPath, ConstantStringPath, ConstantValueParent, ConstantValuePath,
        ConstantValueRoot, DefaultValuePath, DirectivePath, FragmentSpreadPath, IdentParent,
        IdentPath, InlineFragmentPath, LinkedFieldPath, ListTypeAnnotationPath,
        NamedTypeAnnotationPath, NonNullTypeAnnotationPath, OperationDefinitionPath, OperationPath,
        ResolutionPath, ScalarFieldPath, SelectionPath, TypeAnnotationPath, TypeConditionParent,
        TypeConditionPath, ValueListPath, ValuePath, VariableDefinitionPath,
        VariableIdentifierParent, VariableIdentifierPath,
    },
    LSPExtraDataProvider,
};

pub(crate) fn hover_with_node_resolution_path<'a>(
    path: ResolutionPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    extra_data_provider: &dyn LSPExtraDataProvider,
    schema_documentation: &impl SchemaDocumentation,
    source_program: &Program,
) -> Option<HoverContents> {
    match path {
        // Show query stats on the operation definition name
        // and "query/subscription/mutation" token
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::OperationDefinitionName(OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                }),
        }) => on_hover_operation(operation_definition, extra_data_provider),
        ResolutionPath::Operation(OperationPath {
            inner: _,
            parent:
                OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                },
        }) => on_hover_operation(operation_definition, extra_data_provider),
        // Explicity show no hover in other parts of the operation definition.
        // For example, the curly braces after the operation variables are included in
        // this match arm.
        ResolutionPath::OperationDefinition(_) => None,

        // Variables definition for both operations and fragments (?):
        // Name, Type and Default Value => info about variable and link to types
        // Directives handled later
        ResolutionPath::VariableIdentifier(VariableIdentifierPath {
            inner: _,
            parent:
                VariableIdentifierParent::VariableDefinition(VariableDefinitionPath {
                    inner: variable_definition,
                    parent: _,
                }),
        }) => Some(on_hover_variable_definition(
            variable_definition,
            schema_name,
        )),
        ResolutionPath::DefaultValue(DefaultValuePath {
            inner: _,
            parent:
                VariableDefinitionPath {
                    inner: variable_definition,
                    parent: _,
                },
        }) => Some(on_hover_variable_definition(
            variable_definition,
            schema_name,
        )),
        ResolutionPath::VariableDefinition(VariableDefinitionPath {
            inner: variable_definition,
            parent: _,
        }) => Some(on_hover_variable_definition(
            variable_definition,
            schema_name,
        )),
        ResolutionPath::NonNullTypeAnnotation(NonNullTypeAnnotationPath {
            inner: _,
            parent: non_null_annotation_parent,
        }) => Some(on_hover_variable_definition(
            non_null_annotation_parent
                .parent
                .find_variable_definition_path()
                .inner,
            schema_name,
        )),
        ResolutionPath::ListTypeAnnotation(ListTypeAnnotationPath {
            inner: _,
            parent: list_type_annotation_parent,
        }) => Some(on_hover_variable_definition(
            list_type_annotation_parent
                .parent
                .find_variable_definition_path()
                .inner,
            schema_name,
        )),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                    inner: _,
                    parent:
                        TypeAnnotationPath {
                            inner: _,
                            parent: type_annotation_parent,
                        },
                }),
        }) => Some(on_hover_variable_definition(
            type_annotation_parent.find_variable_definition_path().inner,
            schema_name,
        )),

        // Explicitly don't show hovers for VariableDefinitionList
        ResolutionPath::VariableDefinitionList(_) => None,

        // Constant values can either be rooted in variable definitions or arguments to
        // directives or fields. Handle those cases.
        ResolutionPath::ConstantInt(ConstantIntPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantFloat(ConstantFloatPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantString(ConstantStringPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantBoolean(ConstantBooleanPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantNull(ConstantNullPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantEnum(ConstantEnumPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => on_hover_constant_value(
            &constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantList(ConstantListPath {
            inner: _,
            parent: constant_value_path,
        }) => on_hover_constant_value(
            &constant_value_path.parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ConstantArgKey(ConstantArgPath {
                    inner: _,
                    parent:
                        ConstantObjPath {
                            inner: _,
                            parent: constant_value_path,
                        },
                }),
        }) => on_hover_constant_value(
            &constant_value_path.parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantObj(ConstantObjPath {
            inner: _,
            parent: constant_value_path,
        }) => on_hover_constant_value(
            &constant_value_path.parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantArg(ConstantArgPath {
            inner: _,
            parent: constant_obj_path,
        }) => on_hover_constant_value(
            &constant_obj_path.parent.parent,
            schema,
            schema_name,
            schema_documentation,
        ),

        // Scalar and linked fields
        ResolutionPath::ScalarField(ScalarFieldPath {
            inner: scalar_field,
            parent: selection_path,
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ScalarFieldAlias(ScalarFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::LinkedField(LinkedFieldPath {
            inner: scalar_field,
            parent: selection_path,
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::LinkedFieldAlias(LinkedFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => on_hover_scalar_or_linked_field(
            &scalar_field.name,
            &selection_path,
            schema,
            schema_name,
            schema_documentation,
        ),

        // Field and directive arguments
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ArgumentValue(argument_path),
        }) => on_hover_argument_path(&argument_path, schema, schema_name, schema_documentation),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ArgumentName(argument_path),
        }) => on_hover_argument_path(&argument_path, schema, schema_name, schema_documentation),
        ResolutionPath::VariableIdentifier(VariableIdentifierPath {
            inner: _,
            parent:
                VariableIdentifierParent::Value(ValuePath {
                    inner: _,
                    parent: value_parent,
                }),
        }) => on_hover_argument_path(
            value_parent.find_enclosing_argument_path(),
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ValueList(ValueListPath {
            inner: _,
            parent: value_path,
        }) => on_hover_argument_path(
            value_path.parent.find_enclosing_argument_path(),
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::ConstantObject(ConstantObjectPath {
            inner: _,
            parent: value_path,
        }) => on_hover_argument_path(
            value_path.parent.find_enclosing_argument_path(),
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Argument(argument_path) => {
            on_hover_argument_path(&argument_path, schema, schema_name, schema_documentation)
        }

        // inline fragments
        ResolutionPath::InlineFragment(inline_fragment_path) => on_hover_inline_fragment(
            &inline_fragment_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: _,
                    parent: TypeConditionParent::InlineFragment(inline_fragment_path),
                }),
        }) => on_hover_inline_fragment(
            &inline_fragment_path,
            schema,
            schema_name,
            schema_documentation,
        ),
        ResolutionPath::TypeCondition(TypeConditionPath {
            inner: _,
            parent: TypeConditionParent::InlineFragment(inline_fragment_path),
        }) => on_hover_inline_fragment(
            &inline_fragment_path,
            schema,
            schema_name,
            schema_documentation,
        ),

        // Fragment spreads
        ResolutionPath::FragmentSpread(fragment_spread_path) => {
            on_hover_fragment_spread(&fragment_spread_path, schema, schema_name, source_program)
        }
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::FragmentSpreadName(fragment_spread_path),
        }) => on_hover_fragment_spread(&fragment_spread_path, schema, schema_name, source_program),

        ResolutionPath::Directive(directive_path) => on_hover_directive(&directive_path, schema),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::DirectiveName(directive_path),
        }) => on_hover_directive(&directive_path, schema),

        _ => None,
    }
}

fn on_hover_operation(
    operation_definition: &OperationDefinition,
    extra_data_provider: &dyn LSPExtraDataProvider,
) -> Option<HoverContents> {
    let name = operation_definition.name.as_ref()?;
    let extra_data = extra_data_provider.fetch_query_stats(name.value.lookup());
    if !extra_data.is_empty() {
        Some(HoverContents::Array(
            extra_data
                .iter()
                .map(|str| MarkedString::String(str.to_string()))
                .collect::<_>(),
        ))
    } else {
        None
    }
}

fn on_hover_variable_definition(
    variable_definition: &VariableDefinition,
    schema_name: StringKey,
) -> HoverContents {
    let variable_identifier = &variable_definition.name;
    let variable_inner_type = variable_definition.type_.inner().name.value;
    let variable_type = &variable_definition.type_;
    let variable_default_value = variable_definition
        .default_value
        .as_ref()
        .map(|default_value| format!(" with default value `{}`", default_value.value))
        .unwrap_or_else(|| "".to_string());

    HoverContents::Scalar(MarkedString::String(format!(
        "`{}`: **{}**{}",
        variable_identifier,
        get_open_schema_explorer_command_link(
            &variable_type.to_string(),
            &GraphQLSchemaExplorerParams {
                path: vec![variable_inner_type.lookup()],
                schema_name: schema_name.lookup(),
                filter: None,
            }
        ),
        variable_default_value
    )))
}

fn on_hover_constant_value<'a>(
    constant_value_parent: &'a ConstantValueParent<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
) -> Option<HoverContents> {
    match constant_value_parent.find_constant_value_root() {
        ConstantValueRoot::VariableDefinition(variable_definition_path) => Some(
            on_hover_variable_definition(variable_definition_path.inner, schema_name),
        ),
        ConstantValueRoot::Argument(argument_path) => {
            on_hover_argument_path(argument_path, schema, schema_name, schema_documentation)
        }
    }
}

fn on_hover_argument_path<'a>(
    argument_path: &ArgumentPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
) -> Option<HoverContents> {
    let ArgumentPath {
        inner: argument,
        parent,
    } = argument_path;

    let argument_name = argument.name.value.lookup();
    let argument_value = argument.value.to_string();
    let argument_info =
        MarkedString::String(format!("Argument `{}: {}`", argument_name, argument_value));

    let field_hover_info = match parent.find_argument_root() {
        ArgumentRoot::LinkedField(linked_field_path) => get_scalar_or_linked_field_hover_content(
            &linked_field_path.inner.name,
            &linked_field_path.parent,
            schema,
            schema_name,
            schema_documentation,
        ),
        ArgumentRoot::Directive(directive_path) => {
            get_directive_hover_content(directive_path, schema)
        }
        ArgumentRoot::ScalarField(scalar_field_path) => get_scalar_or_linked_field_hover_content(
            &scalar_field_path.inner.name,
            &scalar_field_path.parent,
            schema,
            schema_name,
            schema_documentation,
        ),
    }?;

    let mut contents = vec![argument_info];
    contents.extend(field_hover_info.into_iter());

    Some(HoverContents::Array(contents))
}

fn on_hover_scalar_or_linked_field(
    field_name: &Identifier,
    field_selection_path: &SelectionPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
) -> Option<HoverContents> {
    let content = get_scalar_or_linked_field_hover_content(
        field_name,
        field_selection_path,
        schema,
        schema_name,
        schema_documentation,
    )?;
    Some(HoverContents::Array(content))
}

fn get_scalar_or_linked_field_hover_content(
    field_name: &Identifier,
    field_selection_path: &SelectionPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
) -> Option<Vec<MarkedString>> {
    let parent_types = field_selection_path.parent.find_type_path(schema);
    let parent_type = parent_types.last()?;

    let mut type_path = parent_types
        .iter()
        .map(|parent_type| schema.get_type_name(*parent_type).lookup())
        .collect::<Vec<_>>();
    let parent_type_name = schema.get_type_name(*parent_type).lookup();

    let field = schema
        .named_field(*parent_type, field_name.value)
        .map(|id| schema.field(id))?;

    let rendered_type_string = schema.get_type_string(&field.type_);
    let field_type_name = schema.get_type_name(field.type_.inner()).lookup();

    let mut hover_contents: Vec<MarkedString> =
        vec![MarkedString::String(format!("Field: **{}**", field.name))];

    if let Some(field_description) =
        schema_documentation.get_field_description(parent_type_name, field.name.lookup())
    {
        hover_contents.push(MarkedString::String(field_description.to_string()));
    }

    type_path.push(field_type_name);

    hover_contents.push(MarkedString::String(format!(
        "Type: **{}**",
        get_open_schema_explorer_command_link(
            &rendered_type_string,
            &GraphQLSchemaExplorerParams {
                path: type_path,
                schema_name: schema_name.lookup(),
                filter: None,
            }
        )
    )));

    if let Some(type_description) = schema_documentation.get_type_description(field_type_name) {
        hover_contents.push(MarkedString::String(type_description.to_string()));
    }

    if !field.arguments.is_empty() {
        hover_contents.push(MarkedString::String(
            "This field accepts these arguments".to_string(),
        ));

        for arg in field.arguments.iter() {
            let arg_type_name = schema.get_type_name(arg.type_.inner()).lookup();
            hover_contents.push(MarkedString::from_markdown(format!(
                "{}: **{}**{}\n\n{}",
                arg.name,
                get_open_schema_explorer_command_link(
                    &schema.get_type_string(&arg.type_),
                    &GraphQLSchemaExplorerParams {
                        path: vec![field_type_name, arg_type_name],
                        schema_name: schema_name.lookup(),
                        filter: None,
                    }
                ),
                if let Some(default_value) = &arg.default_value {
                    format!(" = {}", default_value)
                } else {
                    "".to_string()
                },
                if let Some(description) = schema_documentation.get_field_argument_description(
                    parent_type_name,
                    field.name.lookup(),
                    arg.name.lookup(),
                ) {
                    description.to_string()
                } else {
                    "".to_string()
                }
            )));
        }
    }
    Some(hover_contents)
}

fn on_hover_inline_fragment(
    inline_fragment: &InlineFragmentPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
) -> Option<HoverContents> {
    let InlineFragmentPath {
        inner: inline_fragment,
        parent: selection_path,
    } = inline_fragment;

    let type_condition = inline_fragment.type_condition.as_ref()?;
    let parent_types = selection_path.parent.find_type_path(schema);
    let parent_type = parent_types.last()?;

    let parent_type_name = schema.get_type_name(*parent_type);
    let parent_type_path = parent_types
        .iter()
        .map(|parent_type| schema.get_type_name(*parent_type).lookup())
        .collect::<Vec<_>>();

    let inline_fragment_condition = type_condition.type_.value.lookup();
    let inline_fragment_type_path = {
        let mut inline_fragment_type_path = parent_type_path.clone();
        inline_fragment_type_path.push(inline_fragment_condition);
        inline_fragment_type_path
    };

    let description = schema_documentation.get_type_description(inline_fragment_condition);

    let first_line = MarkedString::String(format!(
        "An inline fragment refining **{}** to **{}**",
        get_open_schema_explorer_command_link(
            parent_type_name.lookup(),
            &GraphQLSchemaExplorerParams {
                path: parent_type_path,
                schema_name: schema_name.lookup(),
                filter: None,
            },
        ),
        get_open_schema_explorer_command_link(
            inline_fragment_condition,
            &GraphQLSchemaExplorerParams {
                path: inline_fragment_type_path,
                schema_name: schema_name.lookup(),
                filter: None,
            },
        )
    ));

    if let Some(description) = description {
        return Some(HoverContents::Array(vec![
            first_line,
            MarkedString::String(description.to_string()),
        ]));
    } else {
        return Some(HoverContents::Scalar(first_line));
    }
}

fn on_hover_fragment_spread<'a>(
    fragment_spread_path: &'a FragmentSpreadPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    source_program: &Program,
) -> Option<HoverContents> {
    // TODO eventually show information about whether the fragment spread is
    // infallible, fallible, interface-on-interface, etc.

    let mut hover_contents = vec![];

    let FragmentSpreadPath {
        inner: fragment_spread,
        parent: _,
    } = fragment_spread_path;
    let fragment_name = fragment_spread.name.value;

    let fragment_definition = source_program.fragment(fragment_name)?;

    let fragment_type_name = schema
        .get_type_name(fragment_definition.type_condition)
        .lookup();

    hover_contents.push(MarkedString::String(format!(
        "fragment {} on {}",
        fragment_spread.name.value.lookup(),
        get_open_schema_explorer_command_link(
            fragment_type_name,
            &GraphQLSchemaExplorerParams {
                path: vec![fragment_type_name],
                schema_name: schema_name.lookup(),
                filter: None
            }
        )
    )));

    if !fragment_definition.variable_definitions.is_empty() {
        let mut variables_string: Vec<String> =
            vec!["This fragment accepts these arguments:".to_string()];
        for var in &fragment_definition.variable_definitions {
            let default_value = match var.default_value.clone() {
                Some(default_value) => format!(
                    ", with a default value of {}",
                    print_value(schema, &Value::Constant(default_value.item))
                ),
                None => "".to_string(),
            };
            variables_string.push(format!(
                "* {}: {}{}",
                var.name.item,
                get_open_schema_explorer_command_link(
                    &schema.get_type_string(&var.type_),
                    &GraphQLSchemaExplorerParams {
                        path: vec![schema.get_type_name(var.type_.inner()).lookup()],
                        schema_name: schema_name.lookup(),
                        filter: None,
                    }
                ),
                default_value,
            ));
        }
        hover_contents.push(MarkedString::from_markdown(variables_string.join("\n")))
    }

    let fragment_name_details: Vec<&str> = fragment_name.lookup().split('_').collect();
    // We expect the fragment name to be `ComponentName_propName`
    if fragment_name_details.len() == 2 {
        hover_contents.push(MarkedString::from_markdown(format!(
            r#"
To consume this fragment spread,
pass it to the component where it was defined.

For example:
```js
    <{} {}={{data.{}}} />
```
"#,
            fragment_name_details[0], fragment_name_details[1], fragment_name_details[1],
        )));
    } // We may log an error (later), if that is not the case.

    hover_contents.push(MarkedString::String(
        "@see: https://relay.dev/docs/en/thinking-in-relay#data-masking".to_string(),
    ));

    Some(HoverContents::Array(hover_contents))
}

fn on_hover_directive<'a>(
    directive_path: &DirectivePath<'a>,
    schema: &SDLSchema,
) -> Option<HoverContents> {
    let content = get_directive_hover_content(directive_path, schema)?;
    Some(HoverContents::Array(content))
}

fn get_directive_hover_content<'a>(
    directive_path: &DirectivePath<'a>,
    schema: &SDLSchema,
) -> Option<Vec<MarkedString>> {
    let DirectivePath {
        inner: directive,
        parent: _,
    } = directive_path;

    let directive_name = directive.name.value;

    if let Some(argument_definition_hover_info) =
        super::argument_definition_hover_info(directive_name.lookup())
    {
        return Some(vec![argument_definition_hover_info]);
    }

    let schema_directive = schema.get_directive(directive_name)?;

    let directive_definition = print_directive(schema, &schema_directive);
    let markdown_definition = super::graphql_marked_string(directive_definition);
    let mut hover_contents: Vec<MarkedString> = vec![markdown_definition];
    if let Some(description) = schema_directive.description {
        hover_contents.push(MarkedString::String(description.to_string()));
    }

    Some(hover_contents)
}
