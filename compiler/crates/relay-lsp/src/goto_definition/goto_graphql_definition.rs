/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::DirectiveName;
use common::Span;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::ExecutableDocument;
use intern::string_key::StringKey;
use resolution_path::ArgumentParent;
use resolution_path::ArgumentPath;
use resolution_path::ConstantEnumPath;
use resolution_path::ConstantValuePath;
use resolution_path::ConstantValueRoot;
use resolution_path::DirectivePath;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::LinkedFieldPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolvePosition;
use resolution_path::ScalarFieldPath;
use resolution_path::SelectionParent;
use resolution_path::TypeConditionPath;
use schema::SDLSchema;
use schema::Schema;

use super::DefinitionDescription;
use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

pub fn get_graphql_definition_description(
    document: ExecutableDocument,
    position_span: Span,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<DefinitionDescription> {
    let node_path = document.resolve((), position_span);

    match node_path {
        ResolutionPath::Ident(IdentPath {
            inner: fragment_name,
            parent: IdentParent::FragmentSpreadName(_),
        }) => Ok(DefinitionDescription::Fragment {
            fragment_name: FragmentDefinitionName(fragment_name.value),
        }),
        ResolutionPath::Ident(IdentPath {
            inner: argument_name,
            parent:
                IdentParent::ArgumentName(ArgumentPath {
                    inner: _,
                    parent:
                        ArgumentParent::Directive(DirectivePath {
                            inner: directive, ..
                        }),
                }),
        }) => Ok(DefinitionDescription::DirectiveArgument {
            directive_name: DirectiveName(directive.name.value),
            argument_name: ArgumentName(argument_name.value),
        }),
        ResolutionPath::Ident(IdentPath {
            inner: argument_name,
            parent:
                IdentParent::ArgumentName(ArgumentPath {
                    inner: _,
                    parent:
                        ArgumentParent::ScalarField(ScalarFieldPath {
                            inner: field,
                            parent: selection_path,
                        }),
                }),
        }) => resolve_field_argument(
            field.name.value,
            ArgumentName(argument_name.value),
            selection_path.parent,
            schema,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: argument_name,
            parent:
                IdentParent::ArgumentName(ArgumentPath {
                    inner: _,
                    parent:
                        ArgumentParent::LinkedField(LinkedFieldPath {
                            inner: field,
                            parent: selection_path,
                        }),
                }),
        }) => resolve_field_argument(
            field.name.value,
            ArgumentName(argument_name.value),
            selection_path.parent,
            schema,
        ),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::LinkedFieldName(LinkedFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(field_name.value, selection_path.parent, schema),
        ResolutionPath::Ident(IdentPath {
            inner: field_name,
            parent:
                IdentParent::ScalarFieldName(ScalarFieldPath {
                    inner: _,
                    parent: selection_path,
                }),
        }) => resolve_field(field_name.value, selection_path.parent, schema),
        ResolutionPath::Ident(IdentPath {
            inner: _,
            parent:
                IdentParent::TypeConditionType(TypeConditionPath {
                    inner: type_condition,
                    parent: _,
                }),
        }) => Ok(DefinitionDescription::Type {
            type_name: type_condition.type_.value,
        }),
        ResolutionPath::Ident(IdentPath {
            inner: directive_name,
            parent: IdentParent::DirectiveName(_),
        }) => Ok(DefinitionDescription::Directive {
            directive_name: DirectiveName(directive_name.value),
        }),
        ResolutionPath::Ident(IdentPath {
            inner: type_name,
            parent: IdentParent::NamedTypeAnnotation(_),
        }) => Ok(DefinitionDescription::Type {
            type_name: type_name.value,
        }),
        ResolutionPath::ConstantEnum(ConstantEnumPath {
            inner: enum_value,
            parent: ConstantValuePath { inner: _, parent },
        }) => {
            let constant_value_root = parent.find_constant_value_root();

            match constant_value_root {
                ConstantValueRoot::VariableDefinition(variable_definition_path) => {
                    let enum_name = variable_definition_path.inner.type_.inner().name.value;

                    Ok(DefinitionDescription::EnumValue {
                        enum_name,
                        enum_value: enum_value.value,
                    })
                }
                ConstantValueRoot::Argument(argument_path) => {
                    let argument_name = argument_path.inner.name.value;

                    match &argument_path.parent {
                        ArgumentParent::LinkedField(LinkedFieldPath {
                            inner: field,
                            parent: selection_path,
                        }) => {
                            let enum_name = resolve_enum_name_from_field_argument(
                                field.name.value,
                                argument_name,
                                &selection_path.parent,
                                schema,
                            )?;

                            Ok(DefinitionDescription::EnumValue {
                                enum_name,
                                enum_value: enum_value.value,
                            })
                        }
                        ArgumentParent::ScalarField(ScalarFieldPath {
                            inner: field,
                            parent: selection_path,
                        }) => {
                            let enum_name = resolve_enum_name_from_field_argument(
                                field.name.value,
                                argument_name,
                                &selection_path.parent,
                                schema,
                            )?;

                            Ok(DefinitionDescription::EnumValue {
                                enum_name,
                                enum_value: enum_value.value,
                            })
                        }
                        // TODO: Implement
                        ArgumentParent::Directive(_) => todo!(),
                        ArgumentParent::ConstantObject(_) => todo!(),
                        ArgumentParent::FragmentSpread(_) => todo!(),
                    }
                }
                ConstantValueRoot::InputValueDefinition(_) => todo!(),
                ConstantValueRoot::ConstantArgument(_) => todo!(),
            }
        }
        _ => Err(LSPRuntimeError::ExpectedError),
    }
}

fn resolve_field(
    field_name: StringKey,
    selection_parent: SelectionParent<'_>,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<DefinitionDescription> {
    let parent_type = selection_parent
        .find_parent_type(schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    Ok(DefinitionDescription::Field {
        parent_type,
        field_name,
    })
}

fn resolve_field_argument(
    field_name: StringKey,
    argument_name: ArgumentName,
    selection_parent: SelectionParent<'_>,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<DefinitionDescription> {
    let parent_type = selection_parent
        .find_parent_type(schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    Ok(DefinitionDescription::FieldArgument {
        parent_type,
        field_name,
        argument_name,
    })
}

fn resolve_enum_name_from_field_argument(
    field_name: StringKey,
    argument_name: StringKey,
    selection_parent: &SelectionParent<'_>,
    schema: &Arc<SDLSchema>,
) -> LSPRuntimeResult<StringKey> {
    let parent_type = selection_parent
        .find_parent_type(schema)
        .ok_or(LSPRuntimeError::ExpectedError)?;

    let field = schema.field(schema.named_field(parent_type, field_name).ok_or_else(|| {
        LSPRuntimeError::UnexpectedError(format!("Could not find field with name {}", field_name))
    })?);

    let argument = field
        .arguments
        .iter()
        .find(|argument| argument.name.item == ArgumentName(argument_name))
        .ok_or_else(|| {
            LSPRuntimeError::UnexpectedError(format!(
                "Could not find argument with name {} on field with name {}",
                argument_name, field_name,
            ))
        })?;

    argument
        .type_
        .inner()
        .get_enum_id()
        .map(|enum_id| schema.enum_(enum_id))
        .map(|enum_| enum_.name.item.0)
        .ok_or(LSPRuntimeError::ExpectedError)
}
