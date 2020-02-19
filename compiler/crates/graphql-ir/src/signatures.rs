/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build::{build_constant_value, build_type_annotation, ValidationLevel};
use crate::errors::{ValidationError, ValidationMessage, ValidationResult};
use crate::ir::{ConstantValue, VariableDefinition};
use common::{Location, Spanned};
use errors::{try2, try_map};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_syntax;
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use schema::{Schema, Type, TypeReference};

lazy_static! {
    static ref ARGUMENTS_KEYS: FnvHashSet<StringKey> = {
        let mut set = FnvHashSet::with_capacity_and_hasher(2, Default::default());
        set.insert("type".intern());
        set.insert("defaultValue".intern());
        set
    };
}

pub type FragmentSignatures = FnvHashMap<StringKey, FragmentSignature>;

/// Describes the public API of a fragment, excluding its selections.
/// When translating ASTs to IR, fragment spread arguments must be
/// checked against the corresponding fragment definition. However,
/// this process can't use the IR fragment definition, since that
/// would depend on having checked its body! Since recursive fragments
/// are allowed, we break the cycle by first computing signatures
/// and using these to type check fragment spreads in selections.
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct FragmentSignature {
    pub location: Location,
    pub name: Spanned<StringKey>,
    pub variable_definitions: Vec<VariableDefinition>,
    pub type_condition: Type,
}

pub fn build_signatures(
    schema: &Schema,
    definitions: &[graphql_syntax::ExecutableDefinition],
) -> ValidationResult<FragmentSignatures> {
    let mut seen_signatures: FnvHashMap<StringKey, FragmentSignature> =
        FnvHashMap::with_capacity_and_hasher(definitions.len(), Default::default());
    let signatures = try_map(definitions, |definition| match definition {
        graphql_syntax::ExecutableDefinition::Fragment(fragment) => {
            Ok(Some(build_fragment_signature(schema, &fragment)?))
        }
        graphql_syntax::ExecutableDefinition::Operation(_) => Ok(None),
    })?;
    let mut errors = Vec::new();
    for signature in signatures {
        if let Some(signature) = signature {
            let previous_signature = seen_signatures.get(&signature.name.item);
            if let Some(previous_signature) = previous_signature {
                errors.push(ValidationError::new(
                    ValidationMessage::DuplicateDefinition(signature.name.item),
                    vec![
                        signature.location.clone(),
                        previous_signature.location.clone(),
                    ],
                ));
                continue;
            }
            seen_signatures.insert(signature.name.item, signature);
        }
    }
    if errors.is_empty() {
        Ok(seen_signatures)
    } else {
        Err(errors)
    }
}

fn build_fragment_signature(
    schema: &Schema,
    fragment: &graphql_syntax::FragmentDefinition,
) -> ValidationResult<FragmentSignature> {
    let type_name = fragment.type_condition.type_.value;
    let type_condition = match schema.get_type(type_name) {
        Some(type_condition) => match type_condition {
            Type::Interface(..) | Type::Object(..) | Type::Union(..) => Ok(type_condition),
            _ => Err(ValidationError::new(
                ValidationMessage::ExpectedCompositeType(type_condition),
                vec![fragment
                    .location
                    .with_span(fragment.type_condition.type_.span)],
            )
            .into()),
        },
        None => Err(ValidationError::new(
            ValidationMessage::UnknownType(type_name),
            vec![fragment
                .location
                .with_span(fragment.type_condition.type_.span)],
        )
        .into()),
    };
    let argument_definition_directives = fragment
        .directives
        .iter()
        .filter(|x| x.name.value.lookup() == "argumentDefinitions")
        .collect::<Vec<_>>();
    if argument_definition_directives.len() > 1 {
        return Err(ValidationError::new(
            ValidationMessage::ExpectedOneArgumentDefinitionsDirective(),
            vec![fragment
                .location
                .with_span(argument_definition_directives[1].span)],
        )
        .into());
    }
    let variable_definitions = argument_definition_directives
        .get(0)
        .map(|x| build_fragment_variable_definitions(schema, fragment, x))
        .unwrap_or_else(|| Ok(Default::default()));

    let (type_condition, variable_definitions) = try2(type_condition, variable_definitions)?;
    Ok(FragmentSignature {
        location: fragment.location.clone(),
        name: fragment.name.spanned_name(),
        type_condition,
        variable_definitions,
    })
}

fn build_fragment_variable_definitions(
    schema: &Schema,
    fragment: &graphql_syntax::FragmentDefinition,
    directive: &graphql_syntax::Directive,
) -> ValidationResult<Vec<VariableDefinition>> {
    if let Some(arguments) = &directive.arguments {
        Ok(arguments
            .items
            .iter()
            .map(|variable_arg| {
                if let graphql_syntax::Value::Constant(graphql_syntax::ConstantValue::Object(
                    object,
                )) = &variable_arg.value
                {
                    // Check that no extraneous keys were supplied
                    let keys = object
                        .items
                        .iter()
                        .map(|x| x.name.value)
                        .collect::<FnvHashSet<_>>();
                    if contains_extra_items(&keys, &ARGUMENTS_KEYS) {
                        let mut keys = keys
                            .difference(&ARGUMENTS_KEYS)
                            .map(|x| x.lookup().to_owned())
                            .collect::<Vec<_>>();
                        keys.sort();
                        return Err(ValidationError::new(
                            ValidationMessage::InvalidArgumentsKeys(keys.join(", ")),
                            vec![fragment.location.with_span(object.span)],
                        )
                        .into());
                    }

                    // Convert variable type, validate that it's an input type
                    let type_ = get_argument_type(schema, fragment.location.clone(), &object)?;
                    if !type_.inner().is_input_type() {
                        return Err(ValidationError::new(
                            ValidationMessage::ExpectedFragmentArgumentToHaveInputType(
                                schema.get_type_name(type_.inner()),
                            ),
                            vec![],
                        )
                        .into());
                    }

                    let default_value =
                        get_default_value(schema, fragment.location.clone(), &object, &type_)?;
                    Ok(VariableDefinition {
                        name: variable_arg.name.spanned_name(),
                        type_,
                        directives: Default::default(),
                        default_value,
                    })
                } else {
                    Err(ValidationError::new(
                        ValidationMessage::ExpectedArgumentDefinitionToBeObject(),
                        vec![fragment.location.with_span(variable_arg.value.span())],
                    )
                    .into())
                }
            })
            .collect::<ValidationResult<Vec<VariableDefinition>>>()?)
    } else {
        Ok(Default::default())
    }
}

fn get_argument_type(
    schema: &Schema,
    location: Location,
    object: &graphql_syntax::List<graphql_syntax::ConstantArgument>,
) -> ValidationResult<TypeReference> {
    let type_arg = object
        .items
        .iter()
        .find(|x| x.name.value.lookup() == "type");
    let type_name = match type_arg {
        Some(graphql_syntax::ConstantArgument {
            value: graphql_syntax::ConstantValue::String(type_name_node),
            ..
        }) => Some(type_name_node.value.lookup()),
        Some(graphql_syntax::ConstantArgument {
            value: graphql_syntax::ConstantValue::Enum(type_name_node),
            ..
        }) => Some(type_name_node.value.lookup()),
        _ => None,
    };
    if let Some(type_name) = type_name {
        let type_ast = graphql_syntax::parse_type(type_name, "TODO").map_err(|errors| {
            errors
                .into_iter()
                .map(|x| {
                    ValidationError::new(
                        ValidationMessage::SyntaxError(x),
                        vec![/* TODO: preserve location of error */],
                    )
                })
                .collect::<Vec<_>>()
        })?;
        let type_ = build_type_annotation(schema, &type_ast, location)?;
        Ok(type_)
    } else {
        Err(ValidationError::new(
            ValidationMessage::ExpectedArgumentDefinitionLiteralType(),
            vec![location.with_span(type_arg.map(|x| x.span).unwrap_or(object.span))],
        )
        .into())
    }
}

fn get_default_value(
    schema: &Schema,
    location: Location,
    object: &graphql_syntax::List<graphql_syntax::ConstantArgument>,
    type_: &TypeReference,
) -> ValidationResult<Option<ConstantValue>> {
    Ok(object
        .items
        .iter()
        .find(|x| x.name.value.lookup() == "defaultValue")
        .map(|x| {
            build_constant_value(
                schema,
                &x.value,
                &type_,
                location.clone(),
                ValidationLevel::Loose,
            )
        })
        .transpose()?)
}

fn contains_extra_items(actual: &FnvHashSet<StringKey>, expected: &FnvHashSet<StringKey>) -> bool {
    actual.iter().any(|x| !expected.contains(x))
}
