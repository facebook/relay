/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_DIRECTIVE_NAME;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::Program;
use graphql_ir::Value;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::OperationDefinition;
use graphql_syntax::VariableDefinition;
use graphql_text_printer::PrinterOptions;
use graphql_text_printer::print_value;
use intern::Lookup;
use intern::string_key::StringKey;
use lsp_types::Hover;
use lsp_types::HoverContents;
use lsp_types::MarkedString;
use resolution_path::ArgumentPath;
use resolution_path::ArgumentRoot;
use resolution_path::ConstantArgumentParent;
use resolution_path::ConstantArgumentPath;
use resolution_path::ConstantBooleanPath;
use resolution_path::ConstantEnumPath;
use resolution_path::ConstantFloatPath;
use resolution_path::ConstantIntPath;
use resolution_path::ConstantListPath;
use resolution_path::ConstantNullPath;
use resolution_path::ConstantObjPath;
use resolution_path::ConstantObjectPath;
use resolution_path::ConstantStringPath;
use resolution_path::ConstantValueParent;
use resolution_path::ConstantValuePath;
use resolution_path::ConstantValueRoot;
use resolution_path::DefaultValueParent;
use resolution_path::DefaultValuePath;
use resolution_path::DirectivePath;
use resolution_path::FragmentDefinitionPath;
use resolution_path::FragmentSpreadPath;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::InlineFragmentPath;
use resolution_path::LinkedFieldPath;
use resolution_path::ListTypeAnnotationPath;
use resolution_path::NamedTypeAnnotationPath;
use resolution_path::NonNullTypeAnnotationPath;
use resolution_path::OperationDefinitionPath;
use resolution_path::OperationPath;
use resolution_path::ResolutionPath;
use resolution_path::ScalarFieldPath;
use resolution_path::SelectionPath;
use resolution_path::TypeAnnotationPath;
use resolution_path::TypeConditionParent;
use resolution_path::TypeConditionPath;
use resolution_path::ValueListPath;
use resolution_path::ValuePath;
use resolution_path::VariableDefinitionPath;
use resolution_path::VariableIdentifierParent;
use resolution_path::VariableIdentifierPath;
use schema::SDLSchema;
use schema::Schema;
use schema_documentation::SchemaDocumentation;
use schema_print::print_directive;

use crate::LSPExtraDataProvider;
use crate::hover::GraphQLSchemaExplorerParams;
use crate::hover::get_open_schema_explorer_command_link;

/// Enum, that allows us to adjust content of the hover
/// tooltip based on the consumer type (Relay, GraphQL)
#[derive(Clone, Copy)]
pub enum ContentConsumerType {
    Relay,
    GraphQL,
}

impl ContentConsumerType {
    /// This method returns a rendered string (with encoded schema search params)
    fn render_text_with_params(
        &self,
        text: &str,
        params: &GraphQLSchemaExplorerParams<'_>,
    ) -> String {
        match self {
            ContentConsumerType::Relay => get_open_schema_explorer_command_link(text, params),
            ContentConsumerType::GraphQL => text.to_string(),
        }
    }
}

pub fn get_hover<'a>(
    path: &'a ResolutionPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    extra_data_provider: &dyn LSPExtraDataProvider,
    schema_documentation: &impl SchemaDocumentation,
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<Hover> {
    let hover_behavior = get_hover_behavior_from_resolution_path(path);
    let hover_content = get_hover_contents(
        hover_behavior,
        schema,
        schema_name,
        extra_data_provider,
        schema_documentation,
        program,
        content_consumer_type,
    );

    hover_content.map(|contents| Hover {
        contents,
        range: None,
    })
}

enum HoverBehavior<'a> {
    OperationDefinitionName(&'a OperationDefinition),
    OperationDefinitionRemainder,
    VariableDefinition(&'a VariableDefinition),
    VariableDefinitionList,
    ConstantValue(&'a ConstantValueParent<'a>),
    ScalarOrLinkedField(&'a Identifier, &'a SelectionPath<'a>),
    ArgumentPath(&'a ArgumentPath<'a>),
    InlineFragment(&'a InlineFragmentPath<'a>),
    FragmentSpread(&'a FragmentSpreadPath<'a>),
    Directive(&'a DirectivePath<'a>),
    FragmentDefinition(&'a FragmentDefinition),
    None,
}

fn get_hover_behavior_from_resolution_path<'a>(path: &'a ResolutionPath<'a>) -> HoverBehavior<'a> {
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
        }) => HoverBehavior::OperationDefinitionName(operation_definition),
        ResolutionPath::Operation(OperationPath {
            inner: _,
            parent:
                OperationDefinitionPath {
                    inner: operation_definition,
                    parent: _,
                },
        }) => HoverBehavior::OperationDefinitionName(operation_definition),
        // Explicitly show no hover in other parts of the operation definition.
        // For example, the curly braces after the operation variables are included in
        // this match arm.
        ResolutionPath::OperationDefinition(_) => HoverBehavior::OperationDefinitionRemainder,

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
        }) => HoverBehavior::VariableDefinition(variable_definition),
        ResolutionPath::DefaultValue(DefaultValuePath {
            inner: _,
            parent:
                DefaultValueParent::VariableDefinition(VariableDefinitionPath {
                    inner: variable_definition,
                    parent: _,
                }),
        }) => HoverBehavior::VariableDefinition(variable_definition),
        ResolutionPath::VariableDefinition(VariableDefinitionPath {
            inner: variable_definition,
            parent: _,
        }) => HoverBehavior::VariableDefinition(variable_definition),
        ResolutionPath::NonNullTypeAnnotation(NonNullTypeAnnotationPath {
            inner: _,
            parent: non_null_annotation_parent,
        }) => non_null_annotation_parent
            .parent
            .find_variable_definition_path()
            .map_or(HoverBehavior::None, |path| {
                HoverBehavior::VariableDefinition(path.inner)
            }),
        ResolutionPath::ListTypeAnnotation(ListTypeAnnotationPath {
            inner: _,
            parent: list_type_annotation_parent,
        }) => list_type_annotation_parent
            .parent
            .find_variable_definition_path()
            .map_or(HoverBehavior::None, |path| {
                HoverBehavior::VariableDefinition(path.inner)
            }),
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
        }) => type_annotation_parent
            .find_variable_definition_path()
            .map_or(HoverBehavior::None, |path| {
                HoverBehavior::VariableDefinition(path.inner)
            }),

        // Explicitly don't show hovers for VariableDefinitionList
        ResolutionPath::VariableDefinitionList(_) => HoverBehavior::VariableDefinitionList,

        // Constant values can either be rooted in variable definitions or arguments to
        // directives or fields. Handle those cases.
        ResolutionPath::ConstantInt(ConstantIntPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantFloat(ConstantFloatPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantString(ConstantStringPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantBoolean(ConstantBooleanPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantNull(ConstantNullPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantEnum(ConstantEnumPath {
            inner: _,
            parent:
                ConstantValuePath {
                    inner: _,
                    parent: constant_value_parent,
                },
        }) => HoverBehavior::ConstantValue(constant_value_parent),
        ResolutionPath::ConstantList(ConstantListPath {
            inner: _,
            parent: constant_value_path,
        }) => HoverBehavior::ConstantValue(&constant_value_path.parent),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ConstantArgumentKey(ConstantArgumentPath {
                    inner: _,
                    parent:
                        ConstantArgumentParent::ConstantObj(ConstantObjPath {
                            inner: _,
                            parent: constant_value_path,
                        }),
                }),
        }) => HoverBehavior::ConstantValue(&constant_value_path.parent),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ConstantArgumentKey(ConstantArgumentPath {
                    inner: _,
                    parent: ConstantArgumentParent::ConstantDirective(_),
                }),
        }) => HoverBehavior::None,
        ResolutionPath::ConstantObj(ConstantObjPath {
            inner: _,
            parent: constant_value_path,
        }) => HoverBehavior::ConstantValue(&constant_value_path.parent),
        ResolutionPath::ConstantArgument(ConstantArgumentPath {
            inner: _,
            parent: ConstantArgumentParent::ConstantObj(constant_obj_path),
        }) => HoverBehavior::ConstantValue(&constant_obj_path.parent.parent),
        ResolutionPath::ConstantArgument(ConstantArgumentPath {
            inner: _,
            parent: ConstantArgumentParent::ConstantDirective(_),
        }) => HoverBehavior::None,

        // Scalar and linked fields
        ResolutionPath::ScalarField(ScalarFieldPath {
            inner: scalar_field,
            parent: selection_path,
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ScalarFieldAlias(ScalarFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),
        ResolutionPath::LinkedField(LinkedFieldPath {
            inner: scalar_field,
            parent: selection_path,
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::LinkedFieldAlias(LinkedFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: scalar_field,
                    parent: selection_path,
                }),
        }) => HoverBehavior::ScalarOrLinkedField(&scalar_field.name, selection_path),

        // Field and directive arguments
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ArgumentValue(argument_path),
        }) => HoverBehavior::ArgumentPath(argument_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ArgumentName(argument_path),
        }) => HoverBehavior::ArgumentPath(argument_path),
        ResolutionPath::VariableIdentifier(VariableIdentifierPath {
            inner: _,
            parent:
                VariableIdentifierParent::Value(ValuePath {
                    inner: _,
                    parent: value_parent,
                }),
        }) => HoverBehavior::ArgumentPath(value_parent.find_enclosing_argument_path()),
        ResolutionPath::ValueList(ValueListPath {
            inner: _,
            parent: value_path,
        }) => HoverBehavior::ArgumentPath(value_path.parent.find_enclosing_argument_path()),
        ResolutionPath::ConstantObject(ConstantObjectPath {
            inner: _,
            parent: value_path,
        }) => HoverBehavior::ArgumentPath(value_path.parent.find_enclosing_argument_path()),
        ResolutionPath::Argument(argument_path) => HoverBehavior::ArgumentPath(argument_path),

        // inline fragments
        ResolutionPath::InlineFragment(inline_fragment_path) => {
            HoverBehavior::InlineFragment(inline_fragment_path)
        }
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: _,
                    parent: TypeConditionParent::InlineFragment(inline_fragment_path),
                }),
        }) => HoverBehavior::InlineFragment(inline_fragment_path),
        ResolutionPath::TypeCondition(TypeConditionPath {
            inner: _,
            parent: TypeConditionParent::InlineFragment(inline_fragment_path),
        }) => HoverBehavior::InlineFragment(inline_fragment_path),

        // Fragment spreads
        ResolutionPath::FragmentSpread(fragment_spread_path) => {
            HoverBehavior::FragmentSpread(fragment_spread_path)
        }
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::FragmentSpreadName(fragment_spread_path),
        }) => HoverBehavior::FragmentSpread(fragment_spread_path),

        ResolutionPath::Directive(directive_path) => HoverBehavior::Directive(directive_path),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::DirectiveName(directive_path),
        }) => HoverBehavior::Directive(directive_path),

        ResolutionPath::FragmentDefinition(FragmentDefinitionPath {
            inner: fragment_definition,
            parent: _,
        }) => HoverBehavior::FragmentDefinition(fragment_definition),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::FragmentDefinitionName(FragmentDefinitionPath {
                    inner: fragment_definition,
                    parent: _,
                }),
        }) => HoverBehavior::FragmentDefinition(fragment_definition),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: _,
                    parent:
                        TypeConditionParent::FragmentDefinition(FragmentDefinitionPath {
                            inner: fragment_definition,
                            parent: _,
                        }),
                }),
        }) => HoverBehavior::FragmentDefinition(fragment_definition),
        ResolutionPath::TypeCondition(TypeConditionPath {
            inner: _,
            parent:
                TypeConditionParent::FragmentDefinition(FragmentDefinitionPath {
                    inner: fragment_definition,
                    parent: _,
                }),
        }) => HoverBehavior::FragmentDefinition(fragment_definition),

        // Explicitly show no hover content of operation/fragment definitions
        ResolutionPath::ExecutableDocument(_) => HoverBehavior::None,
        ResolutionPath::SchemaDocument(_) => HoverBehavior::None,
        ResolutionPath::SchemaDefinition(_) => HoverBehavior::None,
        ResolutionPath::SchemaExtension(_) => HoverBehavior::None,
        ResolutionPath::OperationTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::OperationTypeDefinitionType(_),
        }) => HoverBehavior::None,
        ResolutionPath::DirectiveDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::DirectiveDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::InputValueDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::InputValueDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::DefaultValue(DefaultValuePath {
            inner: _,
            parent: DefaultValueParent::InputValueDefinition(_),
        }) => HoverBehavior::None,
        ResolutionPath::UnionTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::UnionTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::UnionTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::UnionTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::UnionTypeMemberType(_),
        }) => HoverBehavior::None,
        ResolutionPath::InterfaceTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::InterfaceTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::InterfaceTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::InterfaceTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ImplementedInterfaceName(_),
        }) => HoverBehavior::None,
        ResolutionPath::ObjectTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ObjectTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::ObjectTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ObjectTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::InputObjectTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::InputObjectTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::InputObjectTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::InputObjectTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::EnumTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::EnumTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::EnumTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::EnumTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::EnumValueDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::EnumValueDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::ScalarTypeDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ScalarTypeDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::ScalarTypeExtension(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ScalarTypeExtensionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::FieldDefinition(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::FieldDefinitionName(_),
        }) => HoverBehavior::None,
        ResolutionPath::ConstantDirective(_) => HoverBehavior::None,
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent: IdentParent::ConstantDirectiveName(_),
        }) => HoverBehavior::None,
    }
}

fn get_hover_contents(
    hover_behavior: HoverBehavior<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    extra_data_provider: &dyn LSPExtraDataProvider,
    schema_documentation: &impl SchemaDocumentation,
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    match hover_behavior {
        HoverBehavior::OperationDefinitionName(operation_definition) => {
            on_hover_operation(operation_definition, extra_data_provider)
        }
        HoverBehavior::OperationDefinitionRemainder => None,
        HoverBehavior::VariableDefinition(variable_definition) => Some(
            on_hover_variable_definition(variable_definition, schema_name, content_consumer_type),
        ),
        HoverBehavior::VariableDefinitionList => None,
        HoverBehavior::ConstantValue(constant_value_parent) => on_hover_constant_value(
            constant_value_parent,
            schema,
            schema_name,
            schema_documentation,
            program,
            content_consumer_type,
        ),
        HoverBehavior::ScalarOrLinkedField(field_name, selection_path) => {
            on_hover_scalar_or_linked_field(
                field_name,
                selection_path,
                schema,
                schema_name,
                schema_documentation,
                content_consumer_type,
            )
        }
        HoverBehavior::ArgumentPath(argument_path) => on_hover_argument_path(
            argument_path,
            schema,
            schema_name,
            schema_documentation,
            program,
            content_consumer_type,
        ),
        HoverBehavior::InlineFragment(inline_fragment_path) => on_hover_inline_fragment(
            inline_fragment_path,
            schema,
            schema_name,
            schema_documentation,
            content_consumer_type,
        ),
        HoverBehavior::FragmentSpread(fragment_spread_path) => on_hover_fragment_spread(
            fragment_spread_path,
            schema,
            schema_name,
            schema_documentation,
            program,
            content_consumer_type,
        ),
        HoverBehavior::Directive(directive_path) => on_hover_directive(directive_path, schema),
        HoverBehavior::FragmentDefinition(fragment_definition) => on_hover_fragment_definition(
            fragment_definition,
            schema,
            schema_name,
            schema_documentation,
            content_consumer_type,
        ),

        HoverBehavior::None => None,
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
    content_consumer_type: ContentConsumerType,
) -> HoverContents {
    let variable_identifier = &variable_definition.name;
    let variable_inner_type = variable_definition.type_.inner().name.value;
    let variable_type = &variable_definition.type_;
    let variable_default_value = variable_definition.default_value.as_ref().map_or_else(
        || "".to_string(),
        |default_value| format!(" with default value `{}`", default_value.value),
    );

    HoverContents::Scalar(MarkedString::String(format!(
        "`{}`: **{}**{}",
        variable_identifier,
        content_consumer_type.render_text_with_params(
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
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    match constant_value_parent.find_constant_value_root() {
        ConstantValueRoot::VariableDefinition(variable_definition_path) => {
            Some(on_hover_variable_definition(
                variable_definition_path.inner,
                schema_name,
                content_consumer_type,
            ))
        }
        ConstantValueRoot::Argument(argument_path) => on_hover_argument_path(
            argument_path,
            schema,
            schema_name,
            schema_documentation,
            program,
            content_consumer_type,
        ),
        ConstantValueRoot::InputValueDefinition(_) => None,
        ConstantValueRoot::ConstantArgument(_) => None,
    }
}

fn on_hover_argument_path(
    argument_path: &ArgumentPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    let ArgumentPath {
        inner: argument,
        parent,
    } = argument_path;

    let argument_name = argument.name.value.lookup();
    let argument_value = argument.value.to_string();
    let argument_info =
        MarkedString::String(format!("Argument `{argument_name}: {argument_value}`"));

    let field_hover_info = match parent.find_argument_root() {
        ArgumentRoot::LinkedField(linked_field_path) => get_scalar_or_linked_field_hover_content(
            &linked_field_path.inner.name,
            &linked_field_path.parent,
            schema,
            schema_name,
            schema_documentation,
            content_consumer_type,
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
            content_consumer_type,
        ),
        ArgumentRoot::FragmentSpread(fragment_spread_path) => get_fragment_spread_hover_content(
            fragment_spread_path,
            schema,
            schema_name,
            schema_documentation,
            program,
            content_consumer_type,
        ),
    }?;

    let mut contents = vec![argument_info];
    contents.extend(field_hover_info);

    Some(HoverContents::Array(contents))
}

fn on_hover_scalar_or_linked_field(
    field_name: &Identifier,
    field_selection_path: &SelectionPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    let content = get_scalar_or_linked_field_hover_content(
        field_name,
        field_selection_path,
        schema,
        schema_name,
        schema_documentation,
        content_consumer_type,
    )?;
    Some(HoverContents::Array(content))
}

fn get_scalar_or_linked_field_hover_content(
    field_name: &Identifier,
    field_selection_path: &SelectionPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    content_consumer_type: ContentConsumerType,
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

    let is_resolver = field
        .directives
        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
        .is_some();

    let field_type_name = schema.get_type_name(field.type_.inner()).lookup();

    let mut hover_contents: Vec<MarkedString> = vec![MarkedString::String(format!(
        "Field: **{}**",
        field.name.item
    ))];

    if let Some(field_description) =
        schema_documentation.get_field_description(parent_type_name, field.name.item.lookup())
    {
        hover_contents.push(MarkedString::String(field_description.to_string()));
    } else if let Some(description) = field.description {
        hover_contents.push(MarkedString::String(description.to_string()));
    }

    type_path.push(field_type_name);

    let type_name = content_consumer_type.render_text_with_params(
        &schema.get_type_string(&field.type_),
        &GraphQLSchemaExplorerParams {
            path: type_path,
            schema_name: schema_name.lookup(),
            filter: None,
        },
    );

    if let Some(field_type_hack_source) = schema_documentation.get_hack_source(field_type_name) {
        hover_contents.push(MarkedString::String(format!(
            "Type: [**{}**]({})",
            type_name,
            codex_url_for_symbol(field_type_hack_source),
        )));
    } else {
        hover_contents.push(MarkedString::String(format!("Type: **{type_name}**",)));
    }

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
                arg.name.item,
                content_consumer_type.render_text_with_params(
                    &schema.get_type_string(&arg.type_),
                    &GraphQLSchemaExplorerParams {
                        path: vec![field_type_name, arg_type_name],
                        schema_name: schema_name.lookup(),
                        filter: None,
                    }
                ),
                if let Some(default_value) = &arg.default_value {
                    format!(" = {default_value}")
                } else {
                    "".to_string()
                },
                if let Some(description) = schema_documentation.get_field_argument_description(
                    parent_type_name,
                    field.name.item.lookup(),
                    arg.name.item.0.lookup(),
                ) {
                    description.to_string()
                } else {
                    "".to_string()
                }
            )));
        }
    }

    if is_resolver {
        let msg = "**Relay Resolver**: This field is backed by a Relay Resolver, and is therefore only avaliable in Relay code. [Learn More](https://relay.dev/docs/guides/relay-resolvers/introduction/).";
        hover_contents.push(MarkedString::String(msg.to_string()))
    } else if field.is_extension {
        let msg = match content_consumer_type {
            ContentConsumerType::Relay => {
                "**Client Schema Extension**: This field was declared as a Relay Client Schema Extension, and is therefore only avalaible in Relay code. [Learn More](https://relay.dev/docs/guided-tour/updating-data/client-only-data/#client-only-data-client-schema-extensions)."
            }
            ContentConsumerType::GraphQL => {
                "**Client Schema Extension**: This field was declared as a GraphQL client schema extension explicitly among [these](https://fburl.com/code/9qg1gghd) files etc."
            }
        };
        hover_contents.push(MarkedString::String(msg.to_string()))
    }

    if let Some(field_hack_source) =
        schema_documentation.get_field_hack_source(parent_type_name, field.name.item.lookup())
    {
        hover_contents.push(MarkedString::String(format!(
            "View [**{}**]({}) in CodeHub",
            field_hack_source,
            codex_url_for_symbol(field_hack_source),
        )));
    }

    Some(hover_contents)
}

fn on_hover_inline_fragment(
    inline_fragment: &InlineFragmentPath<'_>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    content_consumer_type: ContentConsumerType,
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
        content_consumer_type.render_text_with_params(
            parent_type_name.lookup(),
            &GraphQLSchemaExplorerParams {
                path: parent_type_path,
                schema_name: schema_name.lookup(),
                filter: None,
            },
        ),
        content_consumer_type.render_text_with_params(
            inline_fragment_condition,
            &GraphQLSchemaExplorerParams {
                path: inline_fragment_type_path,
                schema_name: schema_name.lookup(),
                filter: None,
            },
        )
    ));

    let mut hover_contents: Vec<MarkedString> = vec![first_line];

    if let Some(description) = description {
        hover_contents.push(MarkedString::String(description.to_string()));
    }

    if let Some(hack_source) = schema_documentation.get_hack_source(inline_fragment_condition) {
        let codex_link = MarkedString::String(format!(
            "View [**{}**]({}) in CodeHub",
            hack_source,
            codex_url_for_symbol(hack_source),
        ));
        hover_contents.push(codex_link);
    }

    Some(HoverContents::Array(hover_contents))
}

fn on_hover_fragment_spread<'a>(
    fragment_spread_path: &'a FragmentSpreadPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    let hover_contents = get_fragment_spread_hover_content(
        fragment_spread_path,
        schema,
        schema_name,
        schema_documentation,
        program,
        content_consumer_type,
    )?;

    Some(HoverContents::Array(hover_contents))
}

fn get_fragment_spread_hover_content<'a>(
    fragment_spread_path: &'a FragmentSpreadPath<'a>,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    program: &Program,
    content_consumer_type: ContentConsumerType,
) -> Option<Vec<MarkedString>> {
    // TODO eventually show information about whether the fragment spread is
    // infallible, fallible, interface-on-interface, etc.

    let mut hover_contents = vec![];

    let FragmentSpreadPath {
        inner: fragment_spread,
        parent: _,
    } = fragment_spread_path;
    let fragment_name = FragmentDefinitionName(fragment_spread.name.value);

    let fragment_definition = program.fragment(fragment_name)?;

    let fragment_type_name = schema
        .get_type_name(fragment_definition.type_condition)
        .lookup();

    let rendered_fragment_type_name = content_consumer_type.render_text_with_params(
        fragment_type_name,
        &GraphQLSchemaExplorerParams {
            path: vec![fragment_type_name],
            schema_name: schema_name.lookup(),
            filter: None,
        },
    );

    hover_contents.push(MarkedString::String(format!(
        "fragment {} on {}",
        fragment_spread.name.value.lookup(),
        rendered_fragment_type_name,
    )));

    if !fragment_definition.variable_definitions.is_empty() {
        let mut variables_string: Vec<String> =
            vec!["This fragment accepts these arguments:".to_string()];
        for var in &fragment_definition.variable_definitions {
            let default_value = match var.default_value.clone() {
                Some(default_value) => format!(
                    ", with a default value of {}",
                    print_value(
                        schema,
                        &Value::Constant(default_value.item),
                        PrinterOptions::default()
                    )
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

    if matches!(content_consumer_type, ContentConsumerType::Relay) {
        let fragment_name_details: Vec<&str> = fragment_name.0.lookup().split('_').collect();
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
    }

    if let Some(type_description) = schema_documentation.get_type_description(fragment_type_name) {
        if let Some(hack_source) = schema_documentation.get_hack_source(fragment_type_name) {
            hover_contents.push(MarkedString::String(format!(
                "Type Condition: on [**{}**]({})",
                rendered_fragment_type_name,
                codex_url_for_symbol(hack_source),
            )));
        } else {
            hover_contents.push(MarkedString::String(format!(
                "Type Condition: on **{rendered_fragment_type_name}**",
            )));
        }

        hover_contents.push(MarkedString::String(type_description.to_string()));
    }

    Some(hover_contents)
}

fn on_hover_directive(
    directive_path: &DirectivePath<'_>,
    schema: &SDLSchema,
) -> Option<HoverContents> {
    let content = get_directive_hover_content(directive_path, schema)?;
    Some(HoverContents::Array(content))
}

fn get_directive_hover_content(
    directive_path: &DirectivePath<'_>,
    schema: &SDLSchema,
) -> Option<Vec<MarkedString>> {
    let DirectivePath {
        inner: directive,
        parent: _,
    } = directive_path;

    let directive_name = DirectiveName(directive.name.value);

    if let Some(argument_definition_hover_info) =
        super::argument_definition_hover_info(directive_name.0.lookup())
    {
        return Some(vec![argument_definition_hover_info]);
    }

    let schema_directive = schema.get_directive(directive_name)?;

    let directive_definition = print_directive(schema, schema_directive);
    let markdown_definition = super::graphql_marked_string(directive_definition);
    let mut hover_contents: Vec<MarkedString> = vec![markdown_definition];
    if let Some(description) = schema_directive.description {
        hover_contents.push(MarkedString::String(description.to_string()));
    }

    Some(hover_contents)
}

fn on_hover_fragment_definition(
    fragment_definition: &FragmentDefinition,
    schema: &SDLSchema,
    schema_name: StringKey,
    schema_documentation: &impl SchemaDocumentation,
    content_consumer_type: ContentConsumerType,
) -> Option<HoverContents> {
    let fragment_name = fragment_definition.name.value;
    let fragment_type_condition = fragment_definition.type_condition.type_.value;
    let fragment_type = schema.get_type(fragment_type_condition)?;

    let type_name = schema.get_type_name(fragment_type);

    let rendered_parent_type_name = content_consumer_type.render_text_with_params(
        type_name.lookup(),
        &GraphQLSchemaExplorerParams {
            path: vec![type_name.lookup()],
            schema_name: schema_name.lookup(),
            filter: None,
        },
    );

    let title = MarkedString::from_markdown(format!(
        "fragment {fragment_name} on {rendered_parent_type_name}"
    ));

    let mut hover_contents: Vec<MarkedString> = vec![title];

    if matches!(content_consumer_type, ContentConsumerType::Relay) {
        hover_contents.push(MarkedString::String(
            r#"Fragments let you select fields,
    and then include them in queries where you need to.

    ---
    @see: https://graphql.org/learn/queries/#fragments
    "#
            .to_string(),
        ))
    };

    if let Some(type_description) = schema_documentation.get_type_description(type_name.lookup()) {
        if let Some(hack_source) = schema_documentation.get_hack_source(type_name.lookup()) {
            hover_contents.push(MarkedString::String(format!(
                "Type Condition: on [**{}**]({})",
                rendered_parent_type_name,
                codex_url_for_symbol(hack_source),
            )));
        } else {
            hover_contents.push(MarkedString::String(format!(
                "Type Condition: on **{rendered_parent_type_name}**"
            )));
        }

        hover_contents.push(MarkedString::String(type_description.to_string()));
    }

    Some(HoverContents::Array(hover_contents))
}

fn codex_url_for_symbol(symbol: &str) -> String {
    // sanitize the symbol first by replacing instances of "::" with "/" to avoid breaking codex links
    let sanitized_symbol = str::replace(symbol, "::", "/");
    format!("https://www.internalfb.com/code/symbol/www/php/{sanitized_symbol}")
}
