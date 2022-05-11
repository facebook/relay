/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use ::intern::{
    intern,
    string_key::{Intern, StringKey},
};
use common::NamedItem;
use graphql_ir::{FragmentDefinition, OperationDefinition, ProvidedVariableMetadata, Selection};
use itertools::Itertools;
use relay_config::{JsModuleFormat, TypegenLanguage};
use relay_transforms::{
    RefetchableDerivedFromMetadata, RefetchableMetadata, RelayDirective, ASSIGNABLE_DIRECTIVE,
    CHILDREN_CAN_BUBBLE_METADATA_KEY,
};
use schema::Schema;
use std::fmt::Result as FmtResult;

use crate::{
    typegen_state::{
        ActorChangeStatus, EncounteredEnums, EncounteredFragments, ImportedRawResponseTypes,
        ImportedResolvers, InputObjectTypes, MatchFields, RuntimeImports,
    },
    visit::{
        get_data_type, get_input_variables_type, get_operation_type_export,
        raw_response_selections_to_babel, raw_response_visit_selections, transform_input_type,
        visit_selections,
    },
    writer::{
        ExactObject, InexactObject, KeyValuePairProp, Prop, SortedASTList, SortedStringKeyList,
        StringLiteral, Writer, AST,
    },
    MaskStatus, TypegenOptions, ACTOR_CHANGE_POINT, FUTURE_ENUM_VALUE, KEY_CLIENTID, KEY_DATA,
    KEY_FRAGMENT_SPREADS, KEY_FRAGMENT_TYPE, KEY_RAW_RESPONSE, KEY_TYPENAME,
    KEY_UPDATABLE_FRAGMENT_SPREADS, PROVIDED_VARIABLE_TYPE, RAW_RESPONSE_TYPE_DIRECTIVE_NAME,
    REACT_RELAY_MULTI_ACTOR, VALIDATOR_EXPORT_NAME,
};

pub(crate) fn write_operation_type_exports_section(
    typegen_options: &'_ TypegenOptions<'_>,
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let mut encountered_enums = Default::default();
    let mut encountered_fragments = Default::default();
    let mut imported_resolvers = Default::default();
    let mut actor_change_status = ActorChangeStatus::NoActorChange;
    let mut runtime_imports = Default::default();
    let type_selections = visit_selections(
        typegen_options,
        &typegen_operation.selections,
        &mut encountered_enums,
        &mut encountered_fragments,
        &mut imported_resolvers,
        &mut actor_change_status,
    );
    let mut imported_raw_response_types = Default::default();
    let data_type = get_data_type(
        typegen_options,
        type_selections.into_iter(),
        MaskStatus::Masked, // Queries are never unmasked
        None,
        typegen_operation
            .directives
            .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
            .is_some(),
        false, // Query types can never be plural
        &mut encountered_enums,
        &mut encountered_fragments,
    );

    let raw_response_type_and_match_fields =
        if has_raw_response_type_directive(normalization_operation) {
            let mut match_fields = Default::default();
            let raw_response_selections = raw_response_visit_selections(
                typegen_options,
                &normalization_operation.selections,
                &mut encountered_enums,
                &mut match_fields,
                &mut encountered_fragments,
                &mut imported_raw_response_types,
                &mut runtime_imports,
            );
            Some((
                raw_response_selections_to_babel(
                    typegen_options,
                    raw_response_selections.into_iter(),
                    None,
                    &mut encountered_enums,
                    &mut runtime_imports,
                ),
                match_fields,
            ))
        } else {
            None
        };

    let refetchable_fragment_name =
        RefetchableDerivedFromMetadata::find(&typegen_operation.directives);
    if refetchable_fragment_name.is_some() {
        runtime_imports.generic_fragment_type_should_be_imported = true;
    }

    // Always include 'FragmentRef' for typescript codegen for operations that have fragment spreads
    if typegen_options.typegen_config.language == TypegenLanguage::TypeScript
        && has_fragment_spread(&typegen_operation.selections)
    {
        runtime_imports.generic_fragment_type_should_be_imported = true;
    }

    write_import_actor_change_point(actor_change_status, writer)?;
    runtime_imports.write_runtime_imports(writer)?;
    write_fragment_imports(typegen_options, None, encountered_fragments, writer)?;
    write_relay_resolver_imports(imported_resolvers, writer)?;
    write_split_raw_response_type_imports(typegen_options, imported_raw_response_types, writer)?;

    let (input_variables_type, input_object_types) =
        get_input_variables_type(typegen_options, typegen_operation, &mut encountered_enums);

    write_enum_definitions(typegen_options, encountered_enums, writer)?;
    write_input_object_types(input_object_types, writer)?;

    let variables_identifier = format!("{}$variables", typegen_operation.name.item);
    let variables_identifier_key = variables_identifier.as_str().intern();

    writer.write_export_type(&variables_identifier, &input_variables_type.into())?;

    let response_identifier = format!("{}$data", typegen_operation.name.item);
    let response_identifier_key = response_identifier.as_str().intern();
    writer.write_export_type(&response_identifier, &data_type)?;

    let raw_response_prop = write_raw_response_and_get_raw_response_prop(
        raw_response_type_and_match_fields,
        writer,
        typegen_operation,
    )?;
    let query_wrapper_type = get_operation_type_export(
        variables_identifier_key,
        response_identifier_key,
        raw_response_prop,
    )?;
    writer.write_export_type(
        typegen_operation.name.item.lookup(),
        &query_wrapper_type.into(),
    )?;

    // Note: this is a "bug", though in practice probably affects nothing.
    // We pass an unused InputObjectTypes, which is mutated by some of the nested calls.
    // However, we never end up using this. Pre-cleanup:
    // - generated_input_object_types was used in write_input_object_types (above)
    // - generate_provided_variables_type would nonetheless mutate this field
    //
    // Likewise, there is the same bug with enountered_enums
    generate_provided_variables_type(
        typegen_options,
        normalization_operation,
        &mut Default::default(),
        &mut Default::default(),
        writer,
    )?;
    Ok(())
}

fn write_raw_response_and_get_raw_response_prop(
    raw_response_type_and_match_fields: Option<(SortedASTList, MatchFields)>,
    writer: &mut Box<dyn Writer>,
    typegen_operation: &OperationDefinition,
) -> Result<Option<KeyValuePairProp>, std::fmt::Error> {
    if let Some((raw_response_type, match_fields)) = raw_response_type_and_match_fields {
        for (key, ast) in match_fields.0 {
            writer.write_export_type(key.lookup(), &ast)?;
        }
        let raw_response_identifier = format!("{}$rawResponse", typegen_operation.name.item);
        writer.write_export_type(&raw_response_identifier, &raw_response_type)?;

        Ok(Some(KeyValuePairProp {
            key: *KEY_RAW_RESPONSE,
            read_only: false,
            optional: false,
            value: AST::Identifier(raw_response_identifier.intern()),
        }))
    } else {
        Ok(None)
    }
}

pub(crate) fn write_split_operation_type_exports_section(
    typegen_options: &'_ TypegenOptions<'_>,
    typegen_operation: &OperationDefinition,
    normalization_operation: &OperationDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let mut encountered_enums = Default::default();
    let mut match_fields = Default::default();
    let mut encountered_fragments = Default::default();
    let mut imported_raw_response_types = Default::default();
    let mut runtime_imports = Default::default();

    let raw_response_selections = raw_response_visit_selections(
        typegen_options,
        &normalization_operation.selections,
        &mut encountered_enums,
        &mut match_fields,
        &mut encountered_fragments,
        &mut imported_raw_response_types,
        &mut runtime_imports,
    );
    let raw_response_type = raw_response_selections_to_babel(
        typegen_options,
        raw_response_selections.into_iter(),
        None,
        &mut encountered_enums,
        &mut runtime_imports,
    );

    runtime_imports.write_runtime_imports(writer)?;
    write_fragment_imports(typegen_options, None, encountered_fragments, writer)?;
    write_split_raw_response_type_imports(typegen_options, imported_raw_response_types, writer)?;

    write_enum_definitions(typegen_options, encountered_enums, writer)?;

    for (key, ast) in match_fields.0 {
        writer.write_export_type(key.lookup(), &ast)?;
    }

    writer.write_export_type(typegen_operation.name.item.lookup(), &raw_response_type)?;

    Ok(())
}

pub(crate) fn write_fragment_type_exports_section(
    typegen_options: &'_ TypegenOptions<'_>,
    fragment_definition: &FragmentDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    // Assignable fragments do not require $data and $ref type exports, and their aliases
    let is_assignable_fragment = fragment_definition
        .directives
        .named(*ASSIGNABLE_DIRECTIVE)
        .is_some();

    let mut encountered_enums = Default::default();
    let mut encountered_fragments = Default::default();
    let mut imported_resolvers = Default::default();
    let mut actor_change_status = ActorChangeStatus::NoActorChange;
    let mut type_selections = visit_selections(
        typegen_options,
        &fragment_definition.selections,
        &mut encountered_enums,
        &mut encountered_fragments,
        &mut imported_resolvers,
        &mut actor_change_status,
    );
    if !fragment_definition.type_condition.is_abstract_type() {
        let num_concrete_selections = type_selections
            .iter()
            .filter(|sel| sel.get_enclosing_concrete_type().is_some())
            .count();
        if num_concrete_selections <= 1 {
            for selection in type_selections.iter_mut().filter(|sel| sel.is_typename()) {
                selection.set_concrete_type(fragment_definition.type_condition);
            }
        }
    }

    let data_type = fragment_definition.name.item;
    let data_type_name = format!("{}$data", data_type);

    let ref_type_data_property = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_DATA,
        optional: true,
        read_only: true,
        value: AST::Identifier(data_type_name.as_str().intern()),
    });
    let fragment_name = fragment_definition.name.item;
    let ref_type_fragment_spreads_property = Prop::KeyValuePair(KeyValuePairProp {
        key: if typegen_options.generating_updatable_types {
            *KEY_UPDATABLE_FRAGMENT_SPREADS
        } else {
            *KEY_FRAGMENT_SPREADS
        },
        optional: false,
        read_only: true,
        value: AST::FragmentReference(SortedStringKeyList::new(vec![fragment_name])),
    });
    let is_plural_fragment = is_plural(fragment_definition);
    let mut ref_type = AST::InexactObject(InexactObject::new(vec![
        ref_type_data_property,
        ref_type_fragment_spreads_property,
    ]));
    if is_plural_fragment {
        ref_type = AST::ReadOnlyArray(Box::new(ref_type));
    }

    let mask_status = if RelayDirective::is_unmasked_fragment_definition(fragment_definition) {
        MaskStatus::Unmasked
    } else {
        MaskStatus::Masked
    };

    let data_type = get_data_type(
        typegen_options,
        type_selections.into_iter(),
        mask_status,
        if mask_status == MaskStatus::Unmasked {
            None
        } else {
            Some(fragment_name)
        },
        fragment_definition
            .directives
            .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
            .is_some(),
        is_plural_fragment,
        &mut encountered_enums,
        &mut encountered_fragments,
    );

    let runtime_imports = RuntimeImports {
        generic_fragment_type_should_be_imported: true,
        ..Default::default()
    };
    write_import_actor_change_point(actor_change_status, writer)?;
    write_fragment_imports(
        typegen_options,
        Some(fragment_definition.name.item),
        encountered_fragments,
        writer,
    )?;

    write_enum_definitions(typegen_options, encountered_enums, writer)?;

    runtime_imports.write_runtime_imports(writer)?;
    write_relay_resolver_imports(imported_resolvers, writer)?;

    let refetchable_metadata = RefetchableMetadata::find(&fragment_definition.directives);
    let fragment_type_name = format!("{}$fragmentType", fragment_name);
    writer.write_export_fragment_type(&fragment_type_name)?;
    if let Some(refetchable_metadata) = refetchable_metadata {
        let variables_name = format!("{}$variables", refetchable_metadata.operation_name);
        match typegen_options.js_module_format {
            JsModuleFormat::CommonJS => {
                if typegen_options.has_unified_output {
                    writer.write_import_fragment_type(
                        &[&variables_name],
                        &format!("./{}.graphql", refetchable_metadata.operation_name),
                    )?;
                } else {
                    writer.write_any_type_definition(&variables_name)?;
                }
            }
            JsModuleFormat::Haste => {
                writer.write_import_fragment_type(
                    &[&variables_name],
                    &format!("{}.graphql", refetchable_metadata.operation_name),
                )?;
            }
        }
    }

    if !is_assignable_fragment {
        writer.write_export_type(&data_type_name, &data_type)?;
        writer.write_export_type(&format!("{}$key", fragment_definition.name.item), &ref_type)?;
    }

    Ok(())
}

fn write_fragment_imports(
    typegen_options: &'_ TypegenOptions<'_>,
    fragment_name_to_skip: Option<StringKey>,
    encountered_fragments: EncounteredFragments,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    for current_referenced_fragment in encountered_fragments.0.into_iter().sorted() {
        // Do not write the fragment if it is the "top-level" fragment that we are
        // working on.
        let should_write_current_referenced_fragment = fragment_name_to_skip
            .map_or(true, |fragment_name_to_skip| {
                fragment_name_to_skip != current_referenced_fragment
            });

        if should_write_current_referenced_fragment {
            let fragment_type_name = format!("{}$fragmentType", current_referenced_fragment);
            match typegen_options.js_module_format {
                JsModuleFormat::CommonJS => {
                    if typegen_options.has_unified_output {
                        writer.write_import_fragment_type(
                            &[&fragment_type_name],
                            &format!("./{}.graphql", current_referenced_fragment),
                        )?;
                    } else {
                        writer.write_any_type_definition(&fragment_type_name)?;
                    }
                }
                JsModuleFormat::Haste => {
                    writer.write_import_fragment_type(
                        &[&fragment_type_name],
                        &format!("{}.graphql", current_referenced_fragment),
                    )?;
                }
            }
        }
    }
    Ok(())
}

fn write_import_actor_change_point(
    actor_change_status: ActorChangeStatus,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    if matches!(actor_change_status, ActorChangeStatus::HasActorChange) {
        writer.write_import_type(&[ACTOR_CHANGE_POINT], REACT_RELAY_MULTI_ACTOR)
    } else {
        Ok(())
    }
}

fn write_relay_resolver_imports(
    mut imported_resolvers: ImportedResolvers,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    imported_resolvers.0.sort_keys();
    for (from, name) in imported_resolvers.0 {
        writer.write_import_module_default(name.lookup(), from.lookup())?
    }
    Ok(())
}

fn write_split_raw_response_type_imports(
    typegen_options: &'_ TypegenOptions<'_>,
    mut imported_raw_response_types: ImportedRawResponseTypes,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    if imported_raw_response_types.0.is_empty() {
        return Ok(());
    }

    imported_raw_response_types.0.sort();
    for imported_raw_response_type in imported_raw_response_types.0 {
        match typegen_options.js_module_format {
            JsModuleFormat::CommonJS => {
                if typegen_options.has_unified_output {
                    writer.write_import_fragment_type(
                        &[imported_raw_response_type.lookup()],
                        &format!("./{}.graphql", imported_raw_response_type),
                    )?;
                } else {
                    writer.write_any_type_definition(imported_raw_response_type.lookup())?;
                }
            }
            JsModuleFormat::Haste => {
                writer.write_import_fragment_type(
                    &[imported_raw_response_type.lookup()],
                    &format!("{}.graphql", imported_raw_response_type),
                )?;
            }
        }
    }

    Ok(())
}

fn write_enum_definitions(
    typegen_options: &'_ TypegenOptions<'_>,
    encountered_enums: EncounteredEnums,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let enum_ids = encountered_enums.into_sorted_vec(typegen_options.schema);
    for enum_id in enum_ids {
        let enum_type = typegen_options.schema.enum_(enum_id);
        if let Some(enum_module_suffix) = &typegen_options.typegen_config.enum_module_suffix {
            writer.write_import_type(
                &[enum_type.name.item.lookup()],
                &format!("{}{}", enum_type.name.item, enum_module_suffix),
            )?;
        } else {
            let mut members: Vec<AST> = enum_type
                .values
                .iter()
                .map(|enum_value| AST::StringLiteral(StringLiteral(enum_value.value)))
                .collect();

            if !typegen_options
                .typegen_config
                .flow_typegen
                .no_future_proof_enums
            {
                members.push(AST::StringLiteral(StringLiteral(*FUTURE_ENUM_VALUE)));
            }

            writer.write_export_type(
                enum_type.name.item.lookup(),
                &AST::Union(SortedASTList::new(members)),
            )?;
        }
    }
    Ok(())
}

fn generate_provided_variables_type(
    typegen_options: &'_ TypegenOptions<'_>,
    node: &OperationDefinition,
    input_object_types: &mut InputObjectTypes,
    encountered_enums: &mut EncounteredEnums,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let fields = node
        .variable_definitions
        .iter()
        .filter_map(|def| {
            def.directives
                .named(ProvidedVariableMetadata::directive_name())?;

            let provider_func = AST::Callable(Box::new(transform_input_type(
                typegen_options,
                &def.type_,
                input_object_types,
                encountered_enums,
            )));
            let provider_module = Prop::KeyValuePair(KeyValuePairProp {
                key: "get".intern(),
                read_only: true,
                optional: false,
                value: provider_func,
            });
            Some(Prop::KeyValuePair(KeyValuePairProp {
                key: def.name.item,
                read_only: true,
                optional: false,
                value: AST::ExactObject(ExactObject::new(vec![provider_module])),
            }))
        })
        .collect_vec();
    if !fields.is_empty() {
        writer.write_local_type(
            PROVIDED_VARIABLE_TYPE,
            &AST::ExactObject(ExactObject::new(fields)),
        )?;
    }
    Ok(())
}

fn write_input_object_types(
    input_object_types: impl Iterator<Item = (StringKey, ExactObject)>,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    for (type_identifier, input_object_type) in input_object_types {
        writer.write_export_type(type_identifier.lookup(), &input_object_type.into())?;
    }
    Ok(())
}

/// Write the assignable fragment validator function.
///
/// Validators accept an item which *may* be valid for assignment and returns either
/// a sentinel value or something which is necessarily valid for assignment.
///
/// The types of the validator:
///
/// - For fragments whose type condition is abstract:
/// ({ __id: string, __isFragmentName: ?string, $fragmentSpreads: FragmentRefType }) =>
///   ({ __id: string, __isFragmentName: string, $fragmentSpreads: FragmentRefType })
///   | false
///
/// - For fragments whose type condition is concrete:
/// ({ __id: string, __typename: string, $fragmentSpreads: FragmentRefType }) =>
///   ({ __id: string, __typename: FragmentType, $fragmentSpreads: FragmentRefType })
///   | false
///
/// Validators' runtime behavior checks for the presence of the __isFragmentName marker
/// (for abstract fragment types) or a matching concrete type (for concrete fragment
/// types), and returns false iff the parameter didn't pass.
/// Validators return the parameter (unmodified) if it did pass validation, but with
/// a changed flowtype.
pub(crate) fn write_validator_function(
    typegen_options: &'_ TypegenOptions<'_>,
    fragment_definition: &FragmentDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    if fragment_definition.type_condition.is_abstract_type() {
        write_abstract_validator_function(
            typegen_options.typegen_config.language,
            fragment_definition,
            writer,
        )
    } else {
        write_concrete_validator_function(typegen_options, fragment_definition, writer)
    }
}

/// Write an abstract validator function. Flow example:
/// function validate(value/*: {
///   +__id: string,
///   +$fragmentSpreads: Assignable_node$fragmentType,
///   +__isAssignable_node: ?string,
///   ...
/// }*/)/*: ({
///   +__id: string,
///   +$fragmentSpreads: Assignable_node$fragmentType,
///   +__isAssignable_node: string,
///   ...
/// } | false)*/ {
///   return value.__isAssignable_node != null ? (value/*: any*/) : null
/// };
fn write_abstract_validator_function(
    language: TypegenLanguage,
    fragment_definition: &FragmentDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let fragment_name = fragment_definition.name.item.lookup();
    let abstract_fragment_spread_marker = format!("__is{}", fragment_name).intern();
    let id_prop = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_CLIENTID,
        value: AST::String,
        read_only: true,
        optional: false,
    });
    let fragment_spread_prop = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_FRAGMENT_SPREADS,
        value: AST::Identifier(format!("{}{}", fragment_name, *KEY_FRAGMENT_TYPE).intern()),
        read_only: true,
        optional: false,
    });
    let parameter_discriminator = Prop::KeyValuePair(KeyValuePairProp {
        key: abstract_fragment_spread_marker,
        value: AST::String,
        read_only: true,
        optional: true,
    });
    let return_value_discriminator = Prop::KeyValuePair(KeyValuePairProp {
        key: abstract_fragment_spread_marker,
        value: AST::String,
        read_only: true,
        optional: false,
    });

    let parameter_type = AST::InexactObject(InexactObject::new(vec![
        id_prop.clone(),
        fragment_spread_prop.clone(),
        parameter_discriminator,
    ]));
    let return_type = AST::Union(SortedASTList::new(vec![
        AST::InexactObject(InexactObject::new(vec![
            id_prop,
            fragment_spread_prop,
            return_value_discriminator,
        ])),
        AST::RawType(intern!("false")),
    ]));

    let (open_comment, close_comment) = match language {
        TypegenLanguage::Flow | TypegenLanguage::JavaScript => ("/*", "*/"),
        TypegenLanguage::TypeScript => ("", ""),
    };

    write!(
        writer,
        "function {}(value{}: ",
        VALIDATOR_EXPORT_NAME, &open_comment
    )?;

    writer.write(&parameter_type)?;
    write!(writer, "{}){}: ", &close_comment, &open_comment)?;
    writer.write(&return_type)?;
    write!(
        writer,
        "{} {{\n  return value.{} != null ? (value{}: ",
        &close_comment,
        abstract_fragment_spread_marker.lookup(),
        open_comment
    )?;
    writer.write(&AST::Any)?;
    write!(writer, "{}) : false;\n}}", &close_comment)?;

    Ok(())
}

/// Write a concrete validator function. Flow example:
/// function validate(value/*: {
///   +__id: string,
///   +$fragmentSpreads: Assignable_user$fragmentType,
///   +__typename: ?string,
///   ...
/// }*/)/*: ({
///   +__id: string,
///   +$fragmentSpreads: Assignable_user$fragmentType,
///   +__typename: 'User',
///   ...
/// } | false)*/ {
///   return value.__typename === 'User' ? (value/*: any*/) : null
/// };
fn write_concrete_validator_function(
    typegen_options: &'_ TypegenOptions<'_>,
    fragment_definition: &FragmentDefinition,
    writer: &mut Box<dyn Writer>,
) -> FmtResult {
    let fragment_name = fragment_definition.name.item.lookup();
    let concrete_typename = typegen_options
        .schema
        .get_type_name(fragment_definition.type_condition);
    let id_prop = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_CLIENTID,
        value: AST::String,
        read_only: true,
        optional: false,
    });
    let fragment_spread_prop = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_FRAGMENT_SPREADS,
        value: AST::Identifier(format!("{}{}", fragment_name, *KEY_FRAGMENT_TYPE).intern()),
        read_only: true,
        optional: false,
    });
    let parameter_discriminator = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_TYPENAME,
        value: AST::String,
        read_only: true,
        optional: false,
    });
    let return_value_discriminator = Prop::KeyValuePair(KeyValuePairProp {
        key: *KEY_TYPENAME,
        value: AST::StringLiteral(StringLiteral(concrete_typename)),
        read_only: true,
        optional: false,
    });

    let parameter_type = AST::InexactObject(InexactObject::new(vec![
        id_prop.clone(),
        fragment_spread_prop.clone(),
        parameter_discriminator,
    ]));
    let return_type = AST::Union(SortedASTList::new(vec![
        AST::InexactObject(InexactObject::new(vec![
            id_prop,
            fragment_spread_prop,
            return_value_discriminator,
        ])),
        AST::RawType(intern!("false")),
    ]));

    let (open_comment, close_comment) = match typegen_options.typegen_config.language {
        TypegenLanguage::Flow | TypegenLanguage::JavaScript => ("/*", "*/"),
        TypegenLanguage::TypeScript => ("", ""),
    };

    write!(
        writer,
        "function {}(value{}: ",
        VALIDATOR_EXPORT_NAME, &open_comment
    )?;
    writer.write(&parameter_type)?;
    write!(writer, "{}){}: ", &close_comment, &open_comment)?;
    writer.write(&return_type)?;
    write!(
        writer,
        "{} {{\n  return value.{} === '{}' ? (value{}: ",
        &close_comment,
        KEY_TYPENAME.lookup(),
        concrete_typename.lookup(),
        open_comment
    )?;
    writer.write(&AST::Any)?;
    write!(writer, "{}) : false;\n}}", &close_comment)?;

    Ok(())
}

fn is_plural(node: &FragmentDefinition) -> bool {
    RelayDirective::find(&node.directives).map_or(false, |relay_directive| relay_directive.plural)
}

fn has_fragment_spread(selections: &[Selection]) -> bool {
    selections.iter().any(|selection| match selection {
        Selection::FragmentSpread(_) => true,
        Selection::Condition(condition) => has_fragment_spread(&condition.selections),
        Selection::LinkedField(linked_field) => has_fragment_spread(&linked_field.selections),
        Selection::InlineFragment(inline_fragment) => {
            has_fragment_spread(&inline_fragment.selections)
        }
        Selection::ScalarField(_) => false,
    })
}

pub fn has_raw_response_type_directive(operation: &OperationDefinition) -> bool {
    operation
        .directives
        .named(*RAW_RESPONSE_TYPE_DIRECTIVE_NAME)
        .is_some()
}
