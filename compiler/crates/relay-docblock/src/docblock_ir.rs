/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::ARGUMENT_DEFINITIONS;
use docblock_shared::ARGUMENT_TYPE;
use docblock_shared::DEFAULT_VALUE;
use docblock_shared::KEY_RESOLVER_ID_FIELD;
use docblock_shared::PROVIDER_ARG_NAME;
use docblock_shared::ResolverSourceHash;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::reexport::StringKey;
use graphql_syntax::ConstantValue;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::List;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::parse_field_definition;
use graphql_syntax::parse_field_definition_stub;
use graphql_syntax::parse_identifier;
use graphql_syntax::parse_identifier_and_implements_interfaces;
use graphql_syntax::parse_type;
use intern::Lookup;
use intern::string_key::Intern;
use relay_config::ProjectName;

use crate::DocblockIr;
use crate::LegacyVerboseResolverIr;
use crate::On;
use crate::ParseOptions;
use crate::ResolverFieldDocblockIr;
use crate::ResolverTypeDocblockIr;
use crate::errors::ErrorMessagesWithData;
use crate::errors::IrParsingErrorMessages;
use crate::ir::Argument;
use crate::ir::IrField;
use crate::ir::OutputType;
use crate::ir::PopulatedIrField;
use crate::ir::StrongObjectIr;
use crate::ir::TerseRelayResolverIr;
use crate::ir::UnpopulatedIrField;
use crate::ir::WeakObjectIr;
use crate::untyped_representation::AllowedFieldName;
use crate::untyped_representation::UntypedDocblockRepresentation;

pub(crate) fn parse_docblock_ir(
    project_name: &ProjectName,
    untyped_representation: UntypedDocblockRepresentation,
    definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    parse_options: &ParseOptions<'_>,
    // The location corresponding to the entire docblock. Used for error messages like
    // "this field is missing".
    docblock_location: Location,
) -> DiagnosticsResult<Option<DocblockIr>> {
    // Categorization:
    // - If there is no @RelayResolver field, return Ok(None)
    // - If there is an unpopulated @RelayResolver field, parse a RelayResolverIr
    // - If there is a populated @RelayResolver field and its value contains a '.'
    //   (dot character), parse a TerseRelayResolver
    // - If there is a populated @RelayResolver field and a populated @weak field,
    //   emit an error.
    // - If there is a populated @RelayResolver field and an unpopulated @weak field,
    //   parse a WeakResolverIr
    // - Otherwise, if there is a populated @RelayResolver field and no @weak field,
    //   parse a StrongResolverIr
    //
    // Categorization is infallible (except as detailed above); we assume that the user
    // got that part right and surface errors accordingly, even though it might be better
    // (for example) if a user includes multiple strong-only fields *and* a @weak field to
    // suggest the the user removes the @weak field. But we don't do that.

    let UntypedDocblockRepresentation {
        description,
        mut fields,
        source_hash,
    } = untyped_representation;

    let resolver_field = match fields.remove(&AllowedFieldName::RelayResolverField) {
        Some(resolver_field) => resolver_field,
        None => return Ok(None),
    };
    let parsed_docblock_ir = match resolver_field {
        IrField::UnpopulatedIrField(unpopulated_ir_field) => {
            // Check if legacy verbose syntax is enabled
            if !parse_options
                .enable_legacy_verbose_resolver_syntax
                .is_fully_enabled()
            {
                return Err(vec![Diagnostic::error(
                    IrParsingErrorMessages::LegacyVerboseSyntaxDeprecated,
                    unpopulated_ir_field.key_location,
                )]);
            }

            let legacy_verbose_resolver = parse_relay_resolver_ir(
                &mut fields,
                definitions_in_file,
                description,
                None, // This might be necessary for field hack source links
                docblock_location,
                unpopulated_ir_field,
                source_hash,
            )?;

            DocblockIr::Field(ResolverFieldDocblockIr::LegacyVerboseResolver(
                legacy_verbose_resolver,
            ))
        }
        IrField::PopulatedIrField(populated_ir_field) => {
            if populated_ir_field.value.item.lookup().contains('.') {
                DocblockIr::Field(ResolverFieldDocblockIr::TerseRelayResolver(
                    parse_terse_relay_resolver_ir(
                        &mut fields,
                        description,
                        populated_ir_field,
                        definitions_in_file,
                        docblock_location,
                        source_hash,
                        parse_options,
                    )?,
                ))
            } else {
                match get_optional_unpopulated_field_named(
                    &mut fields,
                    AllowedFieldName::WeakField,
                )? {
                    Some(weak_field) => DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(
                        parse_weak_object_ir(
                            &mut fields,
                            description,
                            None, // This might be necessary for field hack source links
                            docblock_location,
                            populated_ir_field,
                            weak_field,
                            source_hash,
                            parse_options,
                        )?,
                    )),
                    None => DocblockIr::Type(ResolverTypeDocblockIr::StrongObjectResolver(
                        parse_strong_object_ir(
                            project_name,
                            &mut fields,
                            description,
                            docblock_location,
                            populated_ir_field,
                            source_hash,
                        )?,
                    )),
                }
            }
        }
    };

    assert_all_fields_removed(
        fields,
        resolver_field.key_location(),
        parsed_docblock_ir.get_variant_name(),
    )?;

    Ok(Some(parsed_docblock_ir))
}

fn parse_relay_resolver_ir(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    description: Option<WithLocation<StringKey>>,
    hack_source: Option<WithLocation<StringKey>>,
    location: Location,
    _resolver_field: UnpopulatedIrField,
    source_hash: ResolverSourceHash,
) -> DiagnosticsResult<LegacyVerboseResolverIr> {
    let root_fragment =
        get_optional_populated_field_named(fields, AllowedFieldName::RootFragmentField)?;
    let return_fragment =
        get_optional_populated_field_named(fields, AllowedFieldName::ReturnFragmentField)?;
    let field_name =
        get_required_populated_field_named(fields, AllowedFieldName::FieldNameField, location)?;
    let field_string = field_name.value;
    let field_string_offset = field_string.location.span().start;
    let field_definition_stub = parse_field_definition_stub(
        field_string.item.lookup(),
        field_string.location.source_location(),
        field_string_offset,
    )?;
    let (fragment_type_condition, fragment_arguments) = parse_fragment_definition(
        root_fragment,
        field_name.value.location.source_location(),
        &field_definition_stub.arguments,
        definitions_in_file,
    )?;

    let edge_to_opt = get_optional_populated_field_named(fields, AllowedFieldName::EdgeToField)?;
    let output_type_opt =
        get_optional_populated_field_named(fields, AllowedFieldName::OutputTypeField)?;

    if let Some(output_type) = output_type_opt {
        return Err(vec![Diagnostic::error(
            IrParsingErrorMessages::UnexpectedOutputType {
                field_name: field_definition_stub.name.value,
            },
            output_type.key_location,
        )]);
    }

    let output_type = combine_edge_to_and_output_type(edge_to_opt, output_type_opt)?;

    let on_type_opt = fields.remove(&AllowedFieldName::OnTypeField);
    let on_interface_opt = fields.remove(&AllowedFieldName::OnInterfaceField);
    let on = combine_on_type_on_interface_fields(
        on_type_opt,
        on_interface_opt,
        location,
        &fragment_type_condition,
    )?;

    validate_field_arguments(&field_definition_stub.arguments, location.source_location())?;

    Ok(LegacyVerboseResolverIr {
        live: get_optional_unpopulated_field_named(fields, AllowedFieldName::LiveField)?,
        on,
        root_fragment: root_fragment
            .map(|root_fragment| root_fragment.value.map(FragmentDefinitionName)),
        return_fragment: return_fragment
            .map(|return_fragment| return_fragment.value.map(FragmentDefinitionName)),
        description,
        hack_source,
        deprecated: fields.remove(&AllowedFieldName::DeprecatedField),
        location,
        field: field_definition_stub,
        output_type,
        fragment_arguments,
        source_hash,
        semantic_non_null: None,
    })
}

fn parse_strong_object_ir(
    project_name: &ProjectName,
    fields: &mut HashMap<AllowedFieldName, IrField>,
    description: Option<WithLocation<StringKey>>,
    location: Location,
    relay_resolver_field: PopulatedIrField,
    source_hash: ResolverSourceHash,
) -> DiagnosticsResult<StrongObjectIr> {
    let type_str = relay_resolver_field.value;
    let (identifier, implements_interfaces) = parse_identifier_and_implements_interfaces(
        type_str.item.lookup(),
        type_str.location.source_location(),
        type_str.location.span().start,
    )?;

    let fragment_name = FragmentDefinitionName(
        project_name
            .generate_name_for_object_and_field(identifier.value, *KEY_RESOLVER_ID_FIELD)
            .intern(),
    );
    Ok(StrongObjectIr {
        type_name: identifier,
        rhs_location: relay_resolver_field.value.location,
        root_fragment: WithLocation::generated(fragment_name),
        description,
        deprecated: fields.remove(&AllowedFieldName::DeprecatedField),
        live: get_optional_unpopulated_field_named(fields, AllowedFieldName::LiveField)?,
        location,
        implements_interfaces,
        source_hash,
        semantic_non_null: None,
        type_confirmed: false,
    })
}

fn parse_weak_object_ir(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    description: Option<WithLocation<StringKey>>,
    hack_source: Option<WithLocation<StringKey>>,
    location: Location,
    relay_resolver_field: PopulatedIrField,
    _weak_field: UnpopulatedIrField,
    source_hash: ResolverSourceHash,
    parse_options: &ParseOptions<'_>,
) -> DiagnosticsResult<WeakObjectIr> {
    // Validate that the right hand side of the @RelayResolver field is a valid identifier
    let (identifier, implements_interfaces) = if parse_options
        .enable_interface_output_type
        .is_fully_enabled()
    {
        let type_str = relay_resolver_field.value;
        parse_identifier_and_implements_interfaces(
            type_str.item.lookup(),
            type_str.location.source_location(),
            type_str.location.span().start,
        )?
    } else {
        (assert_only_identifier(relay_resolver_field)?, vec![])
    };

    Ok(WeakObjectIr {
        type_name: identifier,
        rhs_location: relay_resolver_field.value.location,
        description,
        hack_source,
        deprecated: fields.remove(&AllowedFieldName::DeprecatedField),
        location,
        implements_interfaces,
        source_hash,
        type_confirmed: false,
    })
}

fn parse_terse_relay_resolver_ir(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    description: Option<WithLocation<StringKey>>,
    relay_resolver_field: PopulatedIrField,
    definitions_in_file: Option<&Vec<ExecutableDefinition>>,
    location: Location,
    source_hash: ResolverSourceHash,
    parse_options: &ParseOptions<'_>,
) -> DiagnosticsResult<TerseRelayResolverIr> {
    let root_fragment =
        get_optional_populated_field_named(fields, AllowedFieldName::RootFragmentField)?;
    let return_fragment =
        get_optional_populated_field_named(fields, AllowedFieldName::ReturnFragmentField)?;
    let type_str: WithLocation<StringKey> = relay_resolver_field.value;

    // Validate that the right hand side of the @RelayResolver field is a valid identifier
    let type_name = extract_identifier(relay_resolver_field)?;

    let (start, end) = type_name.span.as_usize();
    let offset = end - start;
    let remaining_source = &type_str.item.lookup()[offset..];
    let span_start = type_str.location.span().start + offset as u32;

    match remaining_source.chars().next() {
        Some('.') => {}
        Some(other) => {
            return Err(vec![Diagnostic::error(
                IrParsingErrorMessages::UnexpectedNonDot { found: other },
                type_str
                    .location
                    .with_span(Span::new(span_start, span_start + 1)),
            )]);
        }
        None => {
            // This won't happen, unless the dot was parsed as part of
            // the identifier.
            panic!("Unexpected missing next char. This indicates a bug in the Relay compiler.");
        }
    };

    let mut field: graphql_syntax::FieldDefinition = parse_field_definition(
        &remaining_source[1..],
        type_str.location.source_location(),
        span_start + 1,
    )?;

    field.description = description.map(|description| StringNode {
        token: Token {
            span: description.location.span(),
            kind: TokenKind::Empty,
        },
        value: description.item,
    });

    validate_field_type_annotation(&field, type_str, parse_options)?;
    validate_field_arguments(&field.arguments, location.source_location())?;

    let (fragment_type_condition, fragment_arguments) = parse_fragment_definition(
        root_fragment,
        relay_resolver_field.value.location.source_location(),
        &field.arguments,
        definitions_in_file,
    )?;

    if let Some(fragment_type_condition) = fragment_type_condition {
        if fragment_type_condition.item != type_name.value {
            return Err(vec![
                Diagnostic::error(
                    IrParsingErrorMessages::MismatchRootFragmentTypeConditionTerseSyntax {
                        fragment_type_condition: fragment_type_condition.item,
                        type_name: type_name.value,
                    },
                    type_str.location.with_span(type_name.span),
                )
                .annotate(
                    "with fragment type condition",
                    fragment_type_condition.location,
                ),
            ]);
        }
    }

    let semantic_non_null = field.directives.named("semanticNonNull".intern()).cloned();

    Ok(TerseRelayResolverIr {
        field,
        type_: WithLocation::new(type_str.location.with_span(type_name.span), type_name.value),
        root_fragment: root_fragment
            .map(|root_fragment| root_fragment.value.map(FragmentDefinitionName)),
        return_fragment: return_fragment
            .map(|return_fragment| return_fragment.value.map(FragmentDefinitionName)),
        location,
        deprecated: fields.remove(&AllowedFieldName::DeprecatedField),
        live: get_optional_unpopulated_field_named(fields, AllowedFieldName::LiveField)?,
        semantic_non_null,
        fragment_arguments,
        source_hash,
        type_confirmed: false,
        property_lookup_name: None,
    })
}

fn combine_on_type_on_interface_fields(
    on_type_opt: Option<IrField>,
    on_interface_opt: Option<IrField>,
    location: Location,
    fragment_type_condition: &Option<WithLocation<StringKey>>,
) -> Result<On, Diagnostic> {
    match (on_type_opt, on_interface_opt) {
        (None, None) => Err(Diagnostic::error(
            IrParsingErrorMessages::ExpectedOneOrTheOther {
                field_1: AllowedFieldName::OnTypeField,
                field_2: AllowedFieldName::OnInterfaceField,
            },
            location,
        )),
        (Some(on_type), None) => {
            let on_type: PopulatedIrField = on_type.try_into().map_err(|_| {
                Diagnostic::error(
                    IrParsingErrorMessages::MissingFieldValue {
                        field_name: AllowedFieldName::OnTypeField,
                    },
                    on_type.key_location(),
                )
            })?;
            match fragment_type_condition {
                Some(fragment_type_condition) => {
                    if on_type.value.item == fragment_type_condition.item {
                        Ok(On::Type(on_type))
                    } else {
                        Err(Diagnostic::error(
                            IrParsingErrorMessages::MismatchRootFragmentTypeCondition {
                                fragment_type_condition: fragment_type_condition.item,
                                on_field_value: on_type.value.item,
                                on_field_name: AllowedFieldName::OnTypeField,
                            },
                            on_type.value.location,
                        )
                        .annotate(
                            "with fragment type condition",
                            fragment_type_condition.location,
                        ))
                    }
                }
                None => Ok(On::Type(on_type)),
            }
        }
        (None, Some(on_interface)) => {
            let on_interface: PopulatedIrField = on_interface.try_into().map_err(|_| {
                Diagnostic::error(
                    IrParsingErrorMessages::MissingFieldValue {
                        field_name: AllowedFieldName::OnInterfaceField,
                    },
                    on_interface.key_location(),
                )
            })?;
            match fragment_type_condition {
                Some(fragment_type_condition) => {
                    if on_interface.value.item == fragment_type_condition.item {
                        Ok(On::Interface(on_interface))
                    } else {
                        Err(Diagnostic::error(
                            IrParsingErrorMessages::MismatchRootFragmentTypeCondition {
                                fragment_type_condition: fragment_type_condition.item,
                                on_field_value: on_interface.value.item,
                                on_field_name: AllowedFieldName::OnInterfaceField,
                            },
                            on_interface.value.location,
                        )
                        .annotate(
                            "with fragment type condition",
                            fragment_type_condition.location,
                        ))
                    }
                }
                None => Ok(On::Interface(on_interface)),
            }
        }
        (Some(on_type), Some(on_interface)) => Err(Diagnostic::error(
            IrParsingErrorMessages::IncompatibleFields {
                field_1: AllowedFieldName::OnTypeField,
                field_2: AllowedFieldName::OnInterfaceField,
            },
            on_type.key_location(),
        )
        .annotate("@onInterface", on_interface.key_location())),
    }
}

fn combine_edge_to_and_output_type(
    edge_to_opt: Option<PopulatedIrField>,
    output_type_opt: Option<PopulatedIrField>,
) -> DiagnosticsResult<Option<OutputType>> {
    match (edge_to_opt, output_type_opt) {
        (None, None) => Ok(None),
        (Some(edge_to), None) => {
            parse_type_annotation(edge_to.value).map(|val| Some(OutputType::EdgeTo(val)))
        }
        (None, Some(output_type)) => {
            parse_type_annotation(output_type.value).map(|val| Some(OutputType::Output(val)))
        }
        (Some(edge_to), Some(output_type)) => Err(vec![
            Diagnostic::error(
                IrParsingErrorMessages::IncompatibleFields {
                    field_1: AllowedFieldName::EdgeToField,
                    field_2: AllowedFieldName::OutputTypeField,
                },
                edge_to.key_location,
            )
            .annotate("@outputType", output_type.key_location),
        ]),
    }
}

fn parse_type_annotation(
    value: WithLocation<StringKey>,
) -> DiagnosticsResult<WithLocation<TypeAnnotation>> {
    let type_annotation = parse_type(
        value.item.lookup(),
        value.location.source_location(),
        value.location.span().start,
    )?;

    let valid_type_annotation = match &type_annotation {
        TypeAnnotation::Named(_) => type_annotation,
        TypeAnnotation::List(item_type) => match &item_type.type_ {
            TypeAnnotation::NonNull(_) => {
                return Err(vec![Diagnostic::error(
                    IrParsingErrorMessages::UnexpectedNonNullableItemInListEdgeTo {},
                    value.location,
                )]);
            }
            _ => type_annotation,
        },
        TypeAnnotation::NonNull(_) => {
            return Err(vec![Diagnostic::error(
                IrParsingErrorMessages::UnexpectedNonNullableEdgeTo {},
                value.location,
            )]);
        }
    };
    Ok(WithLocation::new(value.location, valid_type_annotation))
}

fn get_optional_unpopulated_field_named(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    field_name: AllowedFieldName,
) -> Result<Option<UnpopulatedIrField>, Diagnostic> {
    fields
        .remove(&field_name)
        .map(|field_value| try_into_unpopulated_field(field_name, field_value))
        .transpose()
}

fn get_optional_populated_field_named(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    field_name: AllowedFieldName,
) -> Result<Option<PopulatedIrField>, Diagnostic> {
    fields
        .remove(&field_name)
        .map(|field_value| try_into_populated_field(field_name, field_value))
        .transpose()
}

fn get_required_populated_field_named(
    fields: &mut HashMap<AllowedFieldName, IrField>,
    field_name: AllowedFieldName,
    location: Location,
) -> Result<PopulatedIrField, Diagnostic> {
    get_optional_populated_field_named(fields, field_name).and_then(|e| {
        e.ok_or_else(|| {
            Diagnostic::error(
                IrParsingErrorMessages::MissingField { field_name },
                location,
            )
        })
    })
}

fn try_into_unpopulated_field(
    field_name: AllowedFieldName,
    field_value: IrField,
) -> Result<UnpopulatedIrField, Diagnostic> {
    field_value.try_into().map_err(|_| {
        Diagnostic::error(
            IrParsingErrorMessages::FieldWithUnexpectedData { field_name },
            field_value.key_location(),
        )
    })
}

fn try_into_populated_field(
    field_name: AllowedFieldName,
    field_value: IrField,
) -> Result<PopulatedIrField, Diagnostic> {
    field_value.try_into().map_err(|_| {
        Diagnostic::error(
            IrParsingErrorMessages::FieldWithMissingData { field_name },
            field_value.key_location(),
        )
    })
}

fn parse_fragment_definition(
    root_fragment: Option<PopulatedIrField>,
    source_location: SourceLocationKey,
    field_arguments: &Option<List<InputValueDefinition>>,
    definitions_in_file: Option<&Vec<ExecutableDefinition>>,
) -> DiagnosticsResult<(Option<WithLocation<StringKey>>, Option<Vec<Argument>>)> {
    let fragment_definition = root_fragment
        .map(|root_fragment| {
            assert_fragment_definition(
                root_fragment.value,
                root_fragment.value.item,
                definitions_in_file,
            )
        })
        .transpose()?;

    let fragment_arguments = fragment_definition
        .as_ref()
        .and_then(extract_fragment_arguments)
        .transpose()?;

    if let (Some(field_arguments), Some(fragment_definition), Some(fragment_arguments)) =
        (&field_arguments, &fragment_definition, &fragment_arguments)
    {
        validate_fragment_arguments(
            source_location,
            field_arguments,
            fragment_definition.location.source_location(),
            fragment_arguments,
        )?;
    }
    let fragment_type_condition = fragment_definition.as_ref().map(|fragment_definition| {
        WithLocation::from_span(
            fragment_definition.location.source_location(),
            fragment_definition.type_condition.span,
            fragment_definition.type_condition.type_.value,
        )
    });
    Ok((fragment_type_condition, fragment_arguments))
}

// Validate that the field arguments don't collide with the fragment arguments.
pub fn validate_fragment_arguments(
    field_source_location: SourceLocationKey,
    field_arguments: &List<InputValueDefinition>,
    fragment_source_location: SourceLocationKey,
    fragment_arguments: &[Argument],
) -> DiagnosticsResult<()> {
    for field_arg in &field_arguments.items {
        if let Some(fragment_arg) = fragment_arguments.named(field_arg.name.value) {
            return Err(vec![
                Diagnostic::error(
                    IrParsingErrorMessages::ConflictingArguments,
                    Location::new(field_source_location, field_arg.name.span),
                )
                .annotate(
                    "conflicts with this fragment argument",
                    Location::new(fragment_source_location, fragment_arg.name.span),
                ),
            ]);
        }
    }
    Ok(())
}

pub fn assert_fragment_definition(
    root_fragment: WithLocation<StringKey>,
    fragment_name: StringKey,
    definitions_in_file: Option<&Vec<ExecutableDefinition>>,
) -> Result<FragmentDefinition, Diagnostic> {
    let fragment_definition = definitions_in_file.and_then(|defs| {
        defs.iter().find(|item| {
            if let ExecutableDefinition::Fragment(fragment) = item {
                fragment.name.value == fragment_name
            } else {
                false
            }
        })
    });
    if let Some(ExecutableDefinition::Fragment(fragment_definition)) = fragment_definition {
        Ok(fragment_definition.clone())
    } else {
        let suggestions = definitions_in_file
            .map(|defs| defs.iter().filter_map(|def| def.name()).collect::<Vec<_>>())
            .unwrap_or_default();

        Err(Diagnostic::error(
            ErrorMessagesWithData::FragmentNotFound {
                fragment_name,
                suggestions,
            },
            root_fragment.location,
        ))
    }
}

pub fn extract_fragment_arguments(
    fragment_definition: &FragmentDefinition,
) -> Option<DiagnosticsResult<Vec<Argument>>> {
    fragment_definition
        .directives
        .named(ARGUMENT_DEFINITIONS.0)
        .and_then(|directive| directive.arguments.as_ref())
        .map(|arguments| {
            arguments
                .items
                .iter()
                .filter_map(|arg: &graphql_syntax::Argument| {
                    let (type_, default_value) =
                        if let graphql_syntax::Value::Constant(ConstantValue::Object(object)) =
                            &arg.value
                        {
                            if object
                                .items
                                .iter()
                                .any(|item| item.name.value == *PROVIDER_ARG_NAME)
                            {
                                return None;
                            }

                            let type_value = &object
                                .items
                                .iter()
                                .find(|item| item.name.value == *ARGUMENT_TYPE)
                                .map(|type_| type_.value.clone());

                            let default_value = &object
                                .items
                                .iter()
                                .find(|item| item.name.value == *DEFAULT_VALUE)
                                .map(|default_value| default_value.value.clone());

                            if let Some(ConstantValue::String(string_value)) = type_value {
                                (
                                    parse_type(
                                        string_value.value.lookup(),
                                        fragment_definition.location.source_location(),
                                        // We don't currently have span information
                                        // for constant values, so we can't derive a
                                        // reasonable offset here.
                                        0,
                                    ),
                                    default_value.clone(),
                                )
                            } else {
                                panic!("Expect ConstantValue::String as a type");
                            }
                        } else {
                            panic!("Expect the constant value for the argDef: {:?}", &arg.value);
                        };

                    Some(type_.map(|type_| Argument {
                        name: arg.name.clone(),
                        type_,
                        default_value,
                    }))
                })
                .collect::<Result<_, _>>()
        })
}

fn validate_field_type_annotation(
    field: &FieldDefinition,
    type_str: WithLocation<StringKey>,
    parse_options: &ParseOptions<'_>,
) -> DiagnosticsResult<()> {
    if let TypeAnnotation::NonNull(non_null) = &field.type_ {
        if !parse_options
            .allow_resolver_non_nullable_return_type
            .is_enabled_for(field.name.value)
        {
            return Err(vec![Diagnostic::error(
                IrParsingErrorMessages::FieldWithNonNullType,
                Location::new(type_str.location.source_location(), non_null.span),
            )]);
        }
    }
    Ok(())
}

fn validate_field_arguments(
    arguments: &Option<List<InputValueDefinition>>,
    source_location: SourceLocationKey,
) -> DiagnosticsResult<()> {
    let mut errors = vec![];
    if let Some(field_arguments) = &arguments {
        for argument in field_arguments.items.iter() {
            if let Some(default_value) = &argument.default_value {
                errors.push(Diagnostic::error(
                    IrParsingErrorMessages::ArgumentDefaultValuesNoSupported,
                    Location::new(source_location, default_value.value.span()),
                ));
            }
        }
    }
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

fn assert_all_fields_removed(
    fields: HashMap<AllowedFieldName, IrField>,
    location: Location,
    resolver_type: &'static str,
) -> Result<(), Diagnostic> {
    if fields.is_empty() {
        Ok(())
    } else {
        let field_string = format_remaining_fields(&fields);
        let mut err = Diagnostic::error(
            IrParsingErrorMessages::LeftoverFields {
                resolver_type,
                field_string,
            },
            location,
        );
        let mut fields: Vec<_> = fields.into_iter().collect();
        fields.sort_by_key(|x| x.1.key_location());
        for (_name, field) in fields {
            err = err.annotate("Unexpected field", field.key_location());
        }
        Err(err)
    }
}

fn format_remaining_fields(fields: &HashMap<AllowedFieldName, IrField>) -> String {
    let mut remaining_keys: Vec<_> = fields.keys().collect();
    let len = remaining_keys.len();
    if len == 1 {
        let item = remaining_keys
            .first()
            .expect("Just checked that there was one item");
        return format!("@{item}");
    }
    remaining_keys.sort();
    remaining_keys
        .into_iter()
        .enumerate()
        .fold(String::new(), |a, (index, b)| {
            if index == len - 1 {
                a + "and @" + &b.to_string()
            } else {
                a + "@" + &b.to_string() + ", "
            }
        })
}

fn extract_identifier(relay_resolver_field: PopulatedIrField) -> DiagnosticsResult<Identifier> {
    let type_str = relay_resolver_field.value;
    parse_identifier(
        type_str.item.lookup(),
        type_str.location.source_location(),
        type_str.location.span().start,
    )
}

fn assert_only_identifier(relay_resolver_field: PopulatedIrField) -> DiagnosticsResult<Identifier> {
    // Extract the identifier, then assert that nothing unparsed remains
    let identifier = extract_identifier(relay_resolver_field)?;
    if identifier.value == relay_resolver_field.value.item {
        Ok(identifier)
    } else {
        let user_provided = relay_resolver_field.value.item;
        let parsed = identifier.value;
        Err(vec![Diagnostic::error(
            IrParsingErrorMessages::RemainingCharsWhenParsingIdentifier {
                user_provided,
                parsed,
            },
            relay_resolver_field.value.location,
        )])
    }
}
