/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::associated_data_impl;
use crate::build::{
    build_constant_value, build_type_annotation, build_variable_definitions, ValidationLevel,
};
use crate::constants::ARGUMENT_DEFINITION;
use crate::errors::{ValidationMessage, ValidationMessageWithData};
use crate::ir::{ConstantValue, VariableDefinition};
use crate::GraphQLSuggestions;
use common::{Diagnostic, DiagnosticsResult, FeatureFlag, Location, WithLocation};
use errors::{par_try_map, try2};
use fnv::FnvHashMap;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{SDLSchema, Schema, Type, TypeReference};

lazy_static! {
    static ref TYPE: StringKey = "type".intern();
    static ref DEFAULT_VALUE: StringKey = "defaultValue".intern();
    static ref PROVIDER: StringKey = "provider".intern();
    pub static ref UNUSED_LOCAL_VARIABLE_DEPRECATED: StringKey =
        "unusedLocalVariable_DEPRECATED".intern();
}

pub type FragmentSignatures = FnvHashMap<StringKey, FragmentSignature>;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ProvidedVariableMetadata {
    module_name: StringKey,
}

associated_data_impl!(ProvidedVariableMetadata);

/// Describes the public API of a fragment, excluding its selections.
/// When translating ASTs to IR, fragment spread arguments must be
/// checked against the corresponding fragment definition. However,
/// this process can't use the IR fragment definition, since that
/// would depend on having checked its body! Since recursive fragments
/// are allowed, we break the cycle by first computing signatures
/// and using these to type check fragment spreads in selections.
#[derive(Debug, Eq, PartialEq)]
pub struct FragmentSignature {
    pub name: WithLocation<StringKey>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub type_condition: Type,
}

pub fn build_signatures(
    schema: &SDLSchema,
    definitions: &[graphql_syntax::ExecutableDefinition],
    enable_provided_variables: &FeatureFlag,
) -> DiagnosticsResult<FragmentSignatures> {
    let suggestions = GraphQLSuggestions::new(schema);
    let mut seen_signatures: FnvHashMap<StringKey, FragmentSignature> =
        FnvHashMap::with_capacity_and_hasher(definitions.len(), Default::default());
    let signatures = par_try_map(definitions, |definition| match definition {
        graphql_syntax::ExecutableDefinition::Fragment(fragment) => Ok(Some(
            build_fragment_signature(schema, fragment, &suggestions, enable_provided_variables)?,
        )),
        graphql_syntax::ExecutableDefinition::Operation(_) => Ok(None),
    })?;
    let mut errors = Vec::new();
    for signature in signatures.into_iter().flatten() {
        let previous_signature = seen_signatures.get(&signature.name.item);
        if let Some(previous_signature) = previous_signature {
            errors.push(
                Diagnostic::error(
                    ValidationMessage::DuplicateDefinition(signature.name.item),
                    previous_signature.name.location,
                )
                .annotate("also defined here", signature.name.location),
            );
            continue;
        }
        seen_signatures.insert(signature.name.item, signature);
    }
    if errors.is_empty() {
        Ok(seen_signatures)
    } else {
        Err(errors)
    }
}

fn build_fragment_signature(
    schema: &SDLSchema,
    fragment: &graphql_syntax::FragmentDefinition,
    suggestions: &GraphQLSuggestions<'_>,
    enable_provided_variables: &FeatureFlag,
) -> DiagnosticsResult<FragmentSignature> {
    let type_name = fragment.type_condition.type_.value;
    let type_condition = match schema.get_type(type_name) {
        Some(type_condition) => match type_condition {
            Type::Interface(..) | Type::Object(..) | Type::Union(..) => Ok(type_condition),
            _ => Err(Diagnostic::error(
                ValidationMessage::ExpectedCompositeType(type_condition),
                fragment
                    .location
                    .with_span(fragment.type_condition.type_.span),
            )
            .into()),
        },
        None => Err(Diagnostic::error_with_data(
            ValidationMessageWithData::UnknownType {
                type_name,
                suggestions: suggestions.composite_type_suggestions(type_name),
            },
            fragment
                .location
                .with_span(fragment.type_condition.type_.span),
        )
        .into()),
    };
    let argument_definition_directives = fragment
        .directives
        .iter()
        .filter(|x| x.name.value == *ARGUMENT_DEFINITION)
        .collect::<Vec<_>>();
    if fragment.variable_definitions.is_some() && !argument_definition_directives.is_empty() {
        return Err(Diagnostic::error(
            ValidationMessage::VariableDefinitionsAndArgumentDirective(),
            fragment
                .location
                .with_span(argument_definition_directives[0].span),
        )
        .annotate(
            "variables are previously defined here",
            fragment.location.with_span(
                fragment
                    .variable_definitions
                    .as_ref()
                    .map(|list| list.span)
                    .unwrap(),
            ),
        )
        .into());
    } else if argument_definition_directives.len() > 1 {
        return Err(Diagnostic::error(
            ValidationMessage::ExpectedOneArgumentDefinitionsDirective(),
            fragment
                .location
                .with_span(argument_definition_directives[1].span),
        )
        .into());
    }
    let variable_definitions = fragment
        .variable_definitions
        .as_ref()
        .map(|variable_definitions| {
            build_variable_definitions(schema, &variable_definitions.items, fragment.location)
        })
        .or_else(|| {
            argument_definition_directives.get(0).map(|x| {
                build_fragment_variable_definitions(schema, fragment, x, enable_provided_variables)
            })
        })
        .unwrap_or_else(|| Ok(Default::default()));

    let (type_condition, variable_definitions) = try2(type_condition, variable_definitions)?;
    Ok(FragmentSignature {
        name: fragment
            .name
            .name_with_location(fragment.location.source_location()),
        type_condition,
        variable_definitions,
    })
}

fn build_fragment_variable_definitions(
    schema: &SDLSchema,
    fragment: &graphql_syntax::FragmentDefinition,
    directive: &graphql_syntax::Directive,
    enable_provided_variables: &FeatureFlag,
) -> DiagnosticsResult<Vec<VariableDefinition>> {
    if let Some(arguments) = &directive.arguments {
        Ok(arguments
            .items
            .iter()
            .map(|variable_arg| {
                if let graphql_syntax::Value::Constant(graphql_syntax::ConstantValue::Object(
                    object,
                )) = &variable_arg.value
                {
                    let variable_name = &variable_arg.name;
                    let mut extra_items = Vec::new();
                    let mut type_arg = None;
                    let mut default_arg = None;
                    let mut unused_local_variable_arg = None;
                    let mut provider_arg = None;
                    for item in &object.items {
                        let name = item.name.value;
                        if name == *TYPE {
                            type_arg = Some(item);
                        } else if name == *DEFAULT_VALUE {
                            default_arg = Some(item);
                        } else if name == *UNUSED_LOCAL_VARIABLE_DEPRECATED {
                            unused_local_variable_arg = Some(item);
                        } else if name == *PROVIDER {
                            if !enable_provided_variables.is_enabled_for(fragment.name.value) {
                                return Err(vec![Diagnostic::error(
                                    format!("Invalid usage of provided variable: this feature is gated and currently set to {}",
                                                    enable_provided_variables),
                                     fragment.location.with_span(item.span),
                                )]);
                            }
                            provider_arg = Some(item);
                        } else {
                            extra_items.push(item);
                        }
                    }
                    // Check that no extraneous keys were supplied
                    if !extra_items.is_empty() {
                        return Err(extra_items
                            .iter()
                            .map(|item| {
                                Diagnostic::error(
                                    ValidationMessage::InvalidArgumentDefinitionsKey(
                                        item.name.value,
                                    ),
                                    fragment.location.with_span(item.span),
                                )
                            })
                            .collect());
                    }

                    // Convert variable type, validate that it's an input type
                    let type_ = get_argument_type(schema, fragment.location, type_arg, object)?;
                    if !type_.inner().is_input_type() {
                        return Err(Diagnostic::error(
                            ValidationMessage::ExpectedFragmentArgumentToHaveInputType(
                                schema.get_type_name(type_.inner()),
                            ),
                            fragment.location.with_span(variable_arg.value.span()),
                        )
                        .into());
                    }

                    let mut directives = Vec::new();
                        if let Some(unused_local_variable_arg) = unused_local_variable_arg {
                            if !matches!(
                                unused_local_variable_arg,
                                graphql_syntax::ConstantArgument {
                                    value: graphql_syntax::ConstantValue::Boolean(
                                        graphql_syntax::BooleanNode { value: true, .. }
                                    ),
                                    ..
                                }
                            ) {
                                return Err(vec![Diagnostic::error(
                                    ValidationMessage::InvalidUnusedFragmentVariableSuppressionArg,
                                    fragment
                                        .location
                                        .with_span(unused_local_variable_arg.value.span()),
                                )]);
                            }
                            directives.push(crate::Directive {
                                name: WithLocation::new(
                                    fragment.location.with_span(unused_local_variable_arg.span),
                                    *UNUSED_LOCAL_VARIABLE_DEPRECATED,
                                ),
                                arguments: Vec::new(),
                                data: None,
                            });
                        }
                        if let Some(provider_arg) = provider_arg {
                            if let graphql_syntax::ConstantValue::String(provider_module_name) = &provider_arg.value {
                                if let Some(default_arg_) = default_arg {
                                    return Err(vec![Diagnostic::error(
                                        ValidationMessage::ProvidedVariableIncompatibleWithDefaultValue{argument_name: variable_name.value},
                                        fragment
                                            .location
                                            .with_span(provider_arg.span),
                                    ).annotate("Default value declared here",
                                    fragment
                                    .location
                                    .with_span(default_arg_.span))]);
                                }
                                directives.push(crate::Directive {
                                    name: WithLocation::new(
                                        fragment.location.with_span(provider_arg.span),
                                        ProvidedVariableMetadata::directive_name(),
                                    ),
                                    arguments: Vec::new(),
                                    data: Some(Box::new(ProvidedVariableMetadata{module_name: provider_module_name.value})),
                                });

                            } else{
                                return Err(vec![Diagnostic::error(
                                    ValidationMessage::LiteralStringArgumentExpectedForDirective{arg_name: *PROVIDER, directive_name: *ARGUMENT_DEFINITION },
                                    fragment
                                        .location
                                        .with_span(provider_arg.value.span()),
                                )]);
                            }

                        }

                    let default_value =
                        get_default_value(schema, fragment.location, default_arg, &type_)?;

                    Ok(VariableDefinition {
                        name: variable_name
                            .name_with_location(fragment.location.source_location()),
                        type_,
                        directives,
                        default_value,
                    })
                } else {
                    Err(Diagnostic::error(
                        ValidationMessage::ExpectedArgumentDefinitionToBeObject(),
                        fragment.location.with_span(variable_arg.value.span()),
                    )
                    .into())
                }
            })
            .collect::<DiagnosticsResult<Vec<VariableDefinition>>>()?)
    } else {
        Ok(Default::default())
    }
}

fn get_argument_type(
    schema: &SDLSchema,
    location: Location,
    type_arg: Option<&graphql_syntax::ConstantArgument>,
    object: &graphql_syntax::List<graphql_syntax::ConstantArgument>,
) -> DiagnosticsResult<TypeReference> {
    let type_name_and_span = match type_arg {
        Some(graphql_syntax::ConstantArgument {
            value: graphql_syntax::ConstantValue::String(type_name_node),
            span,
            ..
        }) => Some((type_name_node.value, span)),
        Some(graphql_syntax::ConstantArgument {
            value: graphql_syntax::ConstantValue::Enum(type_name_node),
            span,
            ..
        }) => Some((type_name_node.value, span)),
        _ => None,
    };
    if let Some((type_name, &span)) = type_name_and_span {
        let type_ast = graphql_syntax::parse_type(type_name.lookup(), location.source_location())
            .map_err(|diagnostics| {
            diagnostics
                .into_iter()
                .map(|diagnostic| {
                    let message = diagnostic.message().to_string();
                    Diagnostic::error(
                        message,
                        // TODO: ideally, `parse_type()` would take in the offset
                        // location and report the error at the right location.
                        location.with_span(span),
                    )
                })
                .collect::<Vec<_>>()
        })?;
        let type_ = build_type_annotation(schema, &type_ast, location)?;
        Ok(type_)
    } else {
        Err(Diagnostic::error(
            ValidationMessage::ExpectedArgumentDefinitionLiteralType(),
            location.with_span(type_arg.map_or(object.span, |x| x.span)),
        )
        .into())
    }
}

fn get_default_value(
    schema: &SDLSchema,
    location: Location,
    default_arg: Option<&graphql_syntax::ConstantArgument>,
    type_: &TypeReference,
) -> DiagnosticsResult<Option<WithLocation<ConstantValue>>> {
    default_arg
        .map(|x| {
            let constant_value_span = x.value.span();
            build_constant_value(schema, &x.value, type_, location, ValidationLevel::Strict).map(
                |constant_value| {
                    WithLocation::from_span(
                        location.source_location(),
                        constant_value_span,
                        constant_value,
                    )
                },
            )
        })
        .transpose()
}
