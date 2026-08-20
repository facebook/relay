/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod errors;
pub mod find_nodes_after_comments;
mod find_property_lookup_resolvers;
mod find_resolver_imports;

use std::collections::HashSet;
use std::collections::hash_map::Entry;
use std::path::Path;
use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;
use std::sync::LazyLock;

use ::errors::try_all;
use ::intern::Lookup;
use ::intern::intern;
use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::FeatureFlag;
use common::Location;
use common::ScalarName;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::DEPRECATED_FIELD;
use docblock_shared::ResolverSourceHash;
use docblock_shared::contains_resolver_tag;
use docblock_syntax::DocblockAST;
use docblock_syntax::DocblockSection;
use docblock_syntax::parse_docblock_with_offset;
use errors::SchemaGenerationError;
use errors::SchemaGenerationErrorWithData;
use find_nodes_after_comments::AttachedComments;
use find_nodes_after_comments::AttachedNode;
use find_nodes_after_comments::find_nodes_after_comments;
use find_resolver_imports::ImportExportVisitor;
use find_resolver_imports::JSImportType;
use find_resolver_imports::ModuleResolution;
use find_resolver_imports::ModuleResolutionKey;
use flow_parser::PERMISSIVE_PARSE_OPTIONS;
use flow_parser::ast::Program;
use flow_parser::ast::expression::object::Key;
use flow_parser::ast::function::Function;
use flow_parser::ast::function::Param;
use flow_parser::ast::function::ReturnAnnot;
use flow_parser::ast::pattern::Pattern;
use flow_parser::ast::statement::StatementInner;
use flow_parser::ast::statement::TypeAlias;
use flow_parser::ast::types::AnnotationOrHint;
use flow_parser::ast::types::Type as FlowTypeAnnotation;
use flow_parser::ast::types::TypeInner;
use flow_parser::ast::types::object::Property as ObjectTypeProperty;
use flow_parser::ast::types::object::PropertyValue;
use flow_parser::ast_visitor::AstVisitor;
use flow_parser::loc::Loc;
use flow_parser::offset_utils::OffsetTable;
use flow_parser::parse_program_without_file;
use fnv::FnvBuildHasher;
use fnv::FnvHashMap;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::IntNode;
use graphql_syntax::List;
use graphql_syntax::ListTypeAnnotation;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use indexmap::IndexMap;
use relay_config::CustomType;
use relay_config::CustomTypeImport;
use relay_docblock::Argument;
use relay_docblock::DocblockIr;
use relay_docblock::IrField;
use relay_docblock::PopulatedIrField;
use relay_docblock::ResolverTypeDocblockIr;
use relay_docblock::StrongObjectIr;
use relay_docblock::TerseRelayResolverIr;
use relay_docblock::UnpopulatedIrField;
use relay_docblock::WeakObjectIr;
use rustc_hash::FxHashMap;
use schema_extractor::LocationResolver;
use schema_extractor::SchemaExtractor;
use schema_extractor::type_annotation_name;

use crate::find_property_lookup_resolvers::PropertyVisitor;

pub static LIVE_FLOW_TYPE_NAME: &str = "LiveState";

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

/**
 * Reprensents a subset of supported Flow type definitions
 */
#[derive(Debug)]
pub enum ResolverFlowData {
    Strong(FieldData), // strong object or field on an object
    Weak(WeakObjectData),
}

#[derive(Debug)]
pub struct FieldData {
    pub field_name: WithLocation<StringKey>,
    pub return_type: FlowTypeAnnotation<Loc, Loc>,
    pub entity_type: Option<FlowTypeAnnotation<Loc, Loc>>,
    pub arguments: Option<FlowTypeAnnotation<Loc, Loc>>,
    pub is_live: Option<Location>,
}

#[derive(Debug)]
pub struct WeakObjectData {
    pub field_name: WithLocation<StringKey>,
    pub type_alias: FlowTypeAnnotation<Loc, Loc>,
}

pub struct RelayResolverExtractor {
    /// Cross module states
    type_definitions: FxHashMap<ModuleResolutionKey, DocblockIr>,
    unresolved_field_definitions: Vec<(UnresolvedFieldDefinition, LocationResolver)>,
    resolved_field_definitions: Vec<TerseRelayResolverIr>,
    module_resolutions: FxHashMap<SourceLocationKey, ModuleResolution>,

    // The Flow parser reports line/column positions, so mapping a node back to
    // a Relay span needs the offset table of the document being parsed
    current_locations: LocationResolver,

    // Used to map Flow types in return/argument types to GraphQL custom scalars
    custom_scalar_map: FnvIndexMap<CustomType, ScalarName>,

    // Feature flag controlling whether the legacy @RelayResolver tag is allowed
    // in place of @relayType / @relayField
    allow_legacy_relay_resolver_tag: FeatureFlag,
}

enum FieldDefinitionInfo {
    ResolverFunctionInfo {
        arguments: Option<FlowTypeAnnotation<Loc, Loc>>,
        is_live: Option<Location>,
        root_fragment: Option<(WithLocation<FragmentDefinitionName>, Vec<Argument>)>,
    },
    PropertyLookupInfo {
        // If an alias is used, this may differ from the field name
        property_name: WithLocation<StringKey>,
    },
}

enum UsedTag {
    LegacyResolver,
    Type,
    Field,
}

struct UnresolvedFieldDefinition {
    entity_name: Option<WithLocation<StringKey>>,
    field_name: WithLocation<StringKey>,
    return_type: FlowTypeAnnotation<Loc, Loc>,
    source_hash: ResolverSourceHash,
    description: Option<WithLocation<StringKey>>,
    deprecated: Option<IrField>,
    entity_type: Option<WithLocation<StringKey>>,
    field_info: FieldDefinitionInfo,
}

impl RelayResolverExtractor {
    pub fn new(allow_legacy_relay_resolver_tag: &FeatureFlag) -> Self {
        let mut self_ = Self {
            type_definitions: Default::default(),
            unresolved_field_definitions: Default::default(),
            resolved_field_definitions: vec![],
            module_resolutions: Default::default(),
            current_locations: LocationResolver::new(
                SourceLocationKey::generated(),
                Arc::new(OffsetTable::make("")),
            ),
            custom_scalar_map: FnvIndexMap::default(),
            allow_legacy_relay_resolver_tag: allow_legacy_relay_resolver_tag.clone(),
        };
        self_.add_relay_runtime_flow_scalars();
        self_
    }

    fn add_relay_runtime_flow_scalars(&mut self) {
        self.custom_scalar_map.insert(
            CustomType::Path(CustomTypeImport {
                name: intern!("DataID"),
                path: PathBuf::from_str("relay-runtime").unwrap(),
            }),
            ScalarName("ID".intern()),
        );
    }

    pub fn set_custom_scalar_map(
        &mut self,
        custom_scalar_types: &FnvIndexMap<ScalarName, CustomType>,
    ) -> DiagnosticsResult<()> {
        self.custom_scalar_map = invert_custom_scalar_map(custom_scalar_types)?;
        self.add_relay_runtime_flow_scalars();
        Ok(())
    }

    /// Parses `text` as a Flow module and points the extractor at it, so that
    /// positions in the returned AST map onto locations in that document.
    pub fn parse_source(
        &mut self,
        text: &str,
        source_location: SourceLocationKey,
    ) -> DiagnosticsResult<Program<Loc, Loc>> {
        self.current_locations =
            LocationResolver::new(source_location, Arc::new(OffsetTable::make(text)));

        let (ast, parse_errors) =
            parse_program_without_file(false, None, Some(PERMISSIVE_PARSE_OPTIONS), Ok(text));
        if !parse_errors.is_empty() {
            return Err(parse_errors
                .iter()
                .map(|(loc, error)| {
                    Diagnostic::error(error.to_string(), self.current_locations.to_location(loc))
                })
                .collect::<Vec<_>>());
        }
        Ok(ast)
    }

    /// First pass to extract all object definitions and field definitions
    pub fn parse_document(
        &mut self,
        text: &str,
        source_module_path: &str,
        fragment_definitions: Option<&Vec<ExecutableDefinition>>,
    ) -> DiagnosticsResult<()> {
        // Assume the caller knows the text contains at least one resolver docblock tag
        // (@relayType, @relayField, or the legacy @RelayResolver)

        let source_hash = ResolverSourceHash::new(text);
        let ast = self.parse_source(text, SourceLocationKey::standalone(source_module_path))?;

        let import_export_visitor =
            ImportExportVisitor::new(self.current_locations.clone(), source_module_path);
        let module_resolution = import_export_visitor.get_module_resolution(&ast);

        let attached_comments = find_nodes_after_comments(&ast);
        let (gql_field_comments, attached_comments): (AttachedComments<'_>, AttachedComments<'_>) =
            attached_comments
                .into_iter()
                .partition(|(comment, _, _, _)| comment.contains("@gqlField"));

        let gql_comments = FnvHashMap::from_iter(
            gql_field_comments
                .into_iter()
                .map(|(comment, comment_loc, _, node_loc)| (node_loc, (comment, comment_loc))),
        );

        let result = try_all(
            attached_comments
                .into_iter()
                .filter(|(comment, _, _, _)| contains_resolver_tag(comment))
                .map(|(comment, comment_loc, node, node_loc)| {
                    // TODO: Handle unwraps
                    let comment_span = self.current_locations.to_span(&comment_loc);
                    // The comment text has the /* and */ delimiters stripped
                    // but the comment span covers the full delimiters, so we
                    // pass comment_span.start + 2 as the base offset to produce
                    // file-relative spans.
                    let docblock = parse_docblock_with_offset(
                        comment,
                        self.current_locations.source_location(),
                        comment_span.start + 2,
                    )?;
                    let (used_tag, resolver_value) =
                        if let Some(field) = docblock.find_field(intern!("RelayResolver")) {
                            (UsedTag::LegacyResolver, field)
                        } else if let Some(field) = docblock.find_field(intern!("relayType")) {
                            (UsedTag::Type, field)
                        } else if let Some(field) = docblock.find_field(intern!("relayField")) {
                            (UsedTag::Field, field)
                        } else {
                            return Ok(());
                        };

                    let deprecated = get_deprecated(&docblock);
                    let description = get_description(&docblock, comment_span)?;

                    match self.extract_graphql_types(&node, &node_loc)? {
                        ResolverFlowData::Strong(FieldData {
                            field_name,
                            return_type,
                            entity_type,
                            arguments,
                            is_live,
                        }) => {
                            let name = resolver_value.field_value.unwrap_or(field_name);

                            // Heuristic to treat lowercase name as field definition, otherwise object definition.
                            // If there is a `.` in the name, it is the old verbose syntax,
                            // e.g. @relayField Client.field; we should treat it as a field definition
                            let is_field_definition = {
                                let name_str = name.item.lookup();
                                let is_lowercase_initial =
                                    name_str.chars().next().unwrap().is_lowercase();
                                is_lowercase_initial || name_str.contains('.')
                            };

                            match used_tag {
                                UsedTag::LegacyResolver => {
                                    if !self
                                        .allow_legacy_relay_resolver_tag
                                        .is_enabled_for(name.item)
                                    {
                                        return Err(vec![Diagnostic::error_with_data(
                                            if is_field_definition {
                                                SchemaGenerationErrorWithData::UseRelayFieldTag
                                            } else {
                                                SchemaGenerationErrorWithData::UseRelayTypeTag
                                            },
                                            resolver_value.field_name.location,
                                        )]);
                                    }
                                }
                                UsedTag::Type => {
                                    if is_field_definition {
                                        return Err(vec![Diagnostic::error_with_data(
                                            SchemaGenerationErrorWithData::RelayTypeTagUsedForField,
                                            resolver_value.field_name.location,
                                        )]);
                                    }
                                }
                                UsedTag::Field => {
                                    if !is_field_definition {
                                        return Err(vec![Diagnostic::error_with_data(
                                            SchemaGenerationErrorWithData::RelayFieldTagUsedForType,
                                            resolver_value.field_name.location,
                                        )]);
                                    }
                                }
                            }

                            if is_field_definition {
                                let entity_name = match entity_type {
                                    Some(entity_type) => {
                                        Some(self.extract_entity_name(&entity_type)?)
                                    }
                                    None => None,
                                };

                                self.add_field_definition(
                                    &module_resolution,
                                    fragment_definitions,
                                    UnresolvedFieldDefinition {
                                        entity_name,
                                        field_name: name,
                                        return_type,
                                        source_hash,
                                        description,
                                        deprecated,
                                        entity_type: None,
                                        field_info: FieldDefinitionInfo::ResolverFunctionInfo {
                                            arguments,
                                            is_live,
                                            root_fragment: None,
                                        },
                                    },
                                )?
                            } else {
                                self.add_type_definition(
                                    &module_resolution,
                                    name,
                                    return_type,
                                    source_hash,
                                    is_live,
                                    description,
                                )?
                            }
                        }
                        ResolverFlowData::Weak(WeakObjectData {
                            field_name,
                            type_alias,
                        }) => {
                            let name = resolver_value.field_value.unwrap_or(field_name);

                            match used_tag {
                                UsedTag::LegacyResolver => {
                                    if !self
                                        .allow_legacy_relay_resolver_tag
                                        .is_enabled_for(name.item)
                                    {
                                        return Err(vec![Diagnostic::error_with_data(
                                            SchemaGenerationErrorWithData::UseRelayTypeTag,
                                            resolver_value.field_name.location,
                                        )]);
                                    }
                                }
                                UsedTag::Field => {
                                    return Err(vec![Diagnostic::error_with_data(
                                        SchemaGenerationErrorWithData::RelayFieldTagUsedForType,
                                        resolver_value.field_name.location,
                                    )]);
                                }
                                UsedTag::Type => {
                                    // This is the expected tag! No errors to report.
                                }
                            }

                            let mut prop_visitor = PropertyVisitor::new(
                                self.current_locations.clone(),
                                source_hash,
                                name,
                                &gql_comments,
                            );
                            prop_visitor
                                .type_(&type_alias)
                                .unwrap_or_else(|never| match never {});
                            if !prop_visitor.errors.is_empty() {
                                return Err(prop_visitor.errors);
                            }
                            let field_definitions: Vec<(
                                UnresolvedFieldDefinition,
                                LocationResolver,
                            )> = prop_visitor
                                .field_definitions
                                .into_iter()
                                .map(|def| (def, prop_visitor.locations.clone()))
                                .collect();

                            self.add_weak_type_definition(
                                name,
                                type_alias,
                                source_hash,
                                source_module_path,
                                description,
                                false,
                            )?;
                            self.unresolved_field_definitions.extend(field_definitions);
                        }
                    }
                    Ok(())
                }),
        );

        self.module_resolutions
            .insert(self.current_locations.source_location(), module_resolution);

        result?;
        Ok(())
    }

    /// Second pass to resolve all field definitions
    pub fn resolve(mut self) -> DiagnosticsResult<(Vec<DocblockIr>, Vec<TerseRelayResolverIr>)> {
        try_all(
            self.unresolved_field_definitions
                .into_iter()
                .map(|(field, locations)| {
                    let source_location = locations.source_location();
                    let module_resolution = self
                        .module_resolutions
                        .get(&source_location)
                        .ok_or_else(|| {
                            vec![Diagnostic::error(
                                SchemaGenerationError::UnexpectedFailedToFindModuleResolution {
                                    path: source_location.path(),
                                },
                                field.field_name.location,
                            )]
                        })?;

                    let type_ = if let Some(entity_type) = field.entity_type {
                        entity_type
                    } else if let Some(entity_name) = field.entity_name {
                        let key = module_resolution.get(entity_name.item).ok_or_else(|| {
                            vec![Diagnostic::error(
                                SchemaGenerationError::ExpectedFlowDefinitionForType {
                                    name: entity_name.item,
                                },
                                entity_name.location,
                            )]
                        })?;
                        match self.type_definitions.get(key) {
                            Some(DocblockIr::Type(
                                ResolverTypeDocblockIr::StrongObjectResolver(object),
                            )) => Ok(object
                                .type_name
                                .name_with_location(object.location.source_location())),
                            Some(DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(
                                object,
                            ))) => Ok(object
                                .type_name
                                .name_with_location(object.location.source_location())),
                            _ => Err(vec![Diagnostic::error(
                                SchemaGenerationError::ModuleNotFound {
                                    entity_name: entity_name.item,
                                    export_type: key.import_type,
                                    module_name: key.module_name,
                                },
                                entity_name.location,
                            )]),
                        }?
                    } else {
                        // Special case: we attach the field to the `Query` type when there is no entity
                        WithLocation::new(field.field_name.location, intern!("Query"))
                    };
                    let property_lookup_name = match field.field_info {
                        FieldDefinitionInfo::PropertyLookupInfo { property_name } => {
                            Some(property_name)
                        }
                        FieldDefinitionInfo::ResolverFunctionInfo { .. } => None,
                    };
                    let (arguments, is_live, (root_fragment, fragment_arguments)) =
                        match field.field_info {
                            FieldDefinitionInfo::ResolverFunctionInfo {
                                arguments,
                                is_live,
                                root_fragment,
                            } => {
                                let args = if let Some(args) = arguments {
                                    Some(flow_type_to_field_arguments(
                                        &locations,
                                        &self.custom_scalar_map,
                                        &args,
                                        module_resolution,
                                        &self.type_definitions,
                                    )?)
                                } else {
                                    None
                                };

                                if let (
                                    Some(field_arguments),
                                    Some((root_fragment, fragment_arguments)),
                                ) = (&args, &root_fragment)
                                {
                                    relay_docblock::validate_fragment_arguments(
                                        source_location,
                                        field_arguments,
                                        root_fragment.location.source_location(),
                                        fragment_arguments,
                                    )?;
                                }

                                (args, is_live, root_fragment.unzip())
                            }
                            FieldDefinitionInfo::PropertyLookupInfo { .. } => {
                                (None, None, (None, None))
                            }
                        };
                    let live = is_live.map(|loc| UnpopulatedIrField { key_location: loc });
                    let description_node = field.description.map(|desc| StringNode {
                        token: Token {
                            span: desc.location.span(),
                            kind: TokenKind::Empty,
                        },
                        value: desc.item,
                    });
                    let (type_annotation, semantic_non_null_levels) =
                        return_type_to_type_annotation(
                            &locations,
                            &self.custom_scalar_map,
                            &field.return_type,
                            module_resolution,
                            &self.type_definitions,
                            true,
                        )?;
                    let field_definition = FieldDefinition {
                        name: string_key_to_identifier(field.field_name),
                        type_: type_annotation,
                        arguments,
                        directives: vec![],
                        description: description_node,
                        hack_source: None,
                        span: field.field_name.location.span(),
                    };
                    self.resolved_field_definitions.push(TerseRelayResolverIr {
                        field: field_definition,
                        type_,
                        root_fragment,
                        return_fragment: None,
                        may_waterfall: None,
                        location: field.field_name.location,
                        deprecated: field.deprecated,
                        live,
                        fragment_arguments,
                        source_hash: field.source_hash,
                        semantic_non_null: semantic_non_null_levels_to_directive(
                            semantic_non_null_levels,
                            field.field_name.location,
                        ),
                        type_confirmed: true,
                        property_lookup_name,
                    });
                    Ok(())
                }),
        )?;
        Ok((
            self.type_definitions.into_values().collect(),
            self.resolved_field_definitions,
        ))
    }

    fn add_field_definition(
        &mut self,
        module_resolution: &ModuleResolution,
        fragment_definitions: Option<&Vec<ExecutableDefinition>>,
        mut field_definition: UnresolvedFieldDefinition,
    ) -> DiagnosticsResult<()> {
        if let Some(entity_name) = field_definition.entity_name {
            let name = entity_name.item;
            let key = module_resolution.get(name).ok_or_else(|| {
                vec![Diagnostic::error(
                    SchemaGenerationError::ExpectedFlowDefinitionForType { name },
                    entity_name.location,
                )]
            })?;

            if key.module_name.lookup().ends_with(".graphql") && name.lookup().ends_with("$key") {
                let fragment_name = name.lookup().strip_suffix("$key").unwrap();
                let fragment_definition_result = relay_docblock::assert_fragment_definition(
                    entity_name,
                    fragment_name.intern(),
                    fragment_definitions,
                );
                let fragment_definition = fragment_definition_result.map_err(|err| vec![err])?;

                field_definition.entity_type = Some(WithLocation::from_span(
                    fragment_definition.location.source_location(),
                    fragment_definition.type_condition.span,
                    fragment_definition.type_condition.type_.value,
                ));
                let fragment = WithLocation::from_span(
                    fragment_definition.location.source_location(),
                    fragment_definition.name.span,
                    FragmentDefinitionName(fragment_definition.name.value),
                );
                let fragment_arguments =
                    relay_docblock::extract_fragment_arguments(&fragment_definition).transpose()?;
                field_definition.field_info = match field_definition.field_info {
                    FieldDefinitionInfo::ResolverFunctionInfo {
                        arguments,
                        is_live,
                        root_fragment: _,
                    } => FieldDefinitionInfo::ResolverFunctionInfo {
                        arguments,
                        is_live,
                        root_fragment: Some((fragment, fragment_arguments.unwrap_or(vec![]))),
                    },
                    FieldDefinitionInfo::PropertyLookupInfo { .. } => {
                        return Err(vec![Diagnostic::error(
                            SchemaGenerationError::ExpectedResolverFunctionWithRootFragment,
                            entity_name.location,
                        )]);
                    }
                }
            }
        }
        self.unresolved_field_definitions
            .push((field_definition, self.current_locations.clone()));

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    fn add_type_definition(
        &mut self,
        module_resolution: &ModuleResolution,
        name: WithLocation<StringKey>,
        mut return_type: FlowTypeAnnotation<Loc, Loc>,
        source_hash: ResolverSourceHash,
        is_live: Option<Location>,
        description: Option<WithLocation<StringKey>>,
    ) -> DiagnosticsResult<()> {
        let strong_object = StrongObjectIr {
            type_name: string_key_to_identifier(name),
            rhs_location: name.location,
            root_fragment: WithLocation::new(
                name.location,
                FragmentDefinitionName(format!("{}__id", name.item).intern()),
            ),
            description,
            deprecated: None,
            live: is_live.map(|loc| UnpopulatedIrField { key_location: loc }),
            location: name.location,
            implements_interfaces: vec![],
            source_hash,
            semantic_non_null: None,
            type_confirmed: true,
        };

        // We ignore nullable annotation since both nullable and non-nullable types are okay for
        // defining a strong object
        return_type = if let TypeInner::Nullable { inner, .. } = &*return_type {
            inner.argument.clone()
        } else {
            return_type
        };
        // For now, we assume the flow type for the strong object is always imported
        // from a separate file
        match &*return_type {
            TypeInner::Generic { loc, inner } => {
                let name = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: inner.as_ref(),
                    location: self.to_location(loc),
                })?;
                if inner.targs.is_some() {
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::GenericNotSupported,
                        name.location,
                    )]);
                }

                let key = module_resolution.get(name.item).ok_or_else(|| {
                    vec![Diagnostic::error(
                        SchemaGenerationError::ExpectedFlowDefinitionForType { name: name.item },
                        name.location,
                    )]
                })?;
                if let JSImportType::Namespace(import_location) = key.import_type {
                    return Err(vec![
                        Diagnostic::error(
                            SchemaGenerationError::UseNamedOrDefaultImport,
                            name.location,
                        )
                        .annotate(format!("{} is imported from", name.item), import_location),
                    ]);
                };

                self.insert_type_definition(
                    key.clone(),
                    DocblockIr::Type(ResolverTypeDocblockIr::StrongObjectResolver(strong_object)),
                )
            }
            TypeInner::Object { loc, .. } => Err(vec![Diagnostic::error(
                SchemaGenerationError::ObjectNotSupported,
                self.to_location(loc),
            )]),
            _ => self.error_result(
                SchemaGenerationError::UnsupportedType {
                    name: type_annotation_name(&return_type),
                },
                return_type.loc(),
            ),
        }
    }

    fn add_weak_type_definition(
        &mut self,
        name: WithLocation<StringKey>,
        type_alias: FlowTypeAnnotation<Loc, Loc>,
        source_hash: ResolverSourceHash,
        source_module_path: &str,
        description: Option<WithLocation<StringKey>>,
        should_generate_fields: bool,
    ) -> DiagnosticsResult<()> {
        let weak_object = WeakObjectIr {
            type_name: string_key_to_identifier(name),
            rhs_location: name.location,
            description,
            hack_source: None,
            deprecated: None,
            location: name.location,
            implements_interfaces: vec![],
            source_hash,
            type_confirmed: true,
        };
        let haste_module_name = Path::new(source_module_path)
            .file_stem()
            .unwrap()
            .to_str()
            .unwrap();
        let key = ModuleResolutionKey {
            module_name: haste_module_name.intern(),
            import_type: JSImportType::Named(name.item),
        };

        // TODO: this generates the IR but not the runtime JS
        if should_generate_fields {
            if let TypeInner::Object { loc, inner } = &*type_alias {
                let field_map = self.get_object_fields(inner)?;
                if !field_map.is_empty() {
                    try_all(field_map.into_iter().map(|(field_name, field_type)| {
                        self.unresolved_field_definitions.push((
                            UnresolvedFieldDefinition {
                                entity_name: Some(name),
                                field_name,
                                return_type: field_type.clone(),
                                source_hash,
                                description,
                                deprecated: None,
                                entity_type: Some(
                                    weak_object
                                        .type_name
                                        .name_with_location(weak_object.location.source_location()),
                                ),
                                field_info: FieldDefinitionInfo::PropertyLookupInfo {
                                    property_name: field_name,
                                },
                            },
                            self.current_locations.clone(),
                        ));
                        Ok(())
                    }))?;
                } else {
                    let location = self.to_location(loc);
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::ExpectedWeakObjectToHaveFields,
                        location,
                    )]);
                }
            } else {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::ExpectedTypeAliasToBeObject,
                    self.to_location(type_alias.loc()),
                )]);
            }
        }

        // Add weak object
        self.insert_type_definition(
            key,
            DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(weak_object)),
        )
    }

    pub fn extract_function(
        &self,
        node: &Function<Loc, Loc>,
    ) -> DiagnosticsResult<ResolverFlowData> {
        let ident = node.id.as_ref().ok_or_else(|| {
            Diagnostic::error(
                SchemaGenerationError::MissingFunctionName,
                self.to_location(&node.sig_loc),
            )
        })?;
        let field_name = WithLocation {
            item: ident.name.as_str().intern(),
            location: self.to_location(&ident.loc),
        };

        let flow_return_type = match &node.return_ {
            ReturnAnnot::Available(annotation) => &annotation.annotation,
            ReturnAnnot::Missing(_) => {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::MissingReturnType,
                    self.to_location(&node.sig_loc),
                )]);
            }
            ReturnAnnot::TypeGuard(guard) => {
                return self.error_result(
                    SchemaGenerationError::UnsupportedType {
                        name: "TypeGuardAnnotation",
                    },
                    &guard.loc,
                );
            }
        };
        let (return_type_with_live, is_optional) =
            schema_extractor::unwrap_nullable_type(flow_return_type);

        // unwrap is_live from the return type
        let (return_type, is_live) = match &**return_type_with_live {
            TypeInner::Generic { loc, inner } => {
                let name = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: inner.as_ref(),
                    location: self.to_location(loc),
                })?;
                if let Some(targs) = &inner.targs {
                    match targs.arguments.as_ref() {
                        [param] => {
                            if name.item.lookup() == LIVE_FLOW_TYPE_NAME {
                                if is_optional {
                                    return Err(vec![Diagnostic::error(
                                        SchemaGenerationError::NoOptionalLiveType,
                                        name.location,
                                    )]);
                                }
                                (param, Some(name.location))
                            } else {
                                (flow_return_type, None)
                            }
                        }
                        _ => {
                            // Does not support multiple type params for now
                            return self.error_result(
                                SchemaGenerationError::UnsupportedType {
                                    name: "Multiple type params",
                                },
                                loc,
                            );
                        }
                    }
                } else {
                    (flow_return_type, None)
                }
            }
            _ => (flow_return_type, None),
        };

        let entity_type = match node.params.params.first() {
            None => None,
            Some(param) => Some(self.extract_param_annotation(param, |pattern| {
                SchemaGenerationError::UnsupportedType {
                    name: pattern_name(pattern),
                }
            })?),
        };

        let arguments = match node.params.params.get(1) {
            None => None,
            Some(arg_param) => Some(self.extract_param_annotation(arg_param, |_| {
                SchemaGenerationError::IncorrectArgumentsDefinition
            })?),
        };

        Ok(ResolverFlowData::Strong(FieldData {
            field_name,
            return_type: return_type.clone(),
            entity_type,
            arguments,
            is_live,
        }))
    }

    /// Reads the Flow type annotation off a resolver parameter. `unsupported`
    /// builds the error for a parameter that isn't a plain annotated
    /// identifier, which differs between the entity and the argument param.
    fn extract_param_annotation(
        &self,
        param: &Param<Loc, Loc>,
        unsupported: impl Fn(&Pattern<Loc, Loc>) -> SchemaGenerationError,
    ) -> DiagnosticsResult<FlowTypeAnnotation<Loc, Loc>> {
        let Param::RegularParam { argument, .. } = param else {
            return self.error_result(
                SchemaGenerationError::IncorrectArgumentsDefinition,
                param_loc(param),
            );
        };
        let Pattern::Identifier { inner, .. } = argument else {
            return self.error_result(unsupported(argument), param_loc(param));
        };
        match &inner.annot {
            AnnotationOrHint::Available(annotation) => Ok(annotation.annotation.clone()),
            AnnotationOrHint::Missing(_) => Err(vec![Diagnostic::error(
                SchemaGenerationError::MissingParamType,
                self.to_location(param_loc(param)),
            )]),
        }
    }

    fn extract_type_alias(&self, node: &TypeAlias<Loc, Loc>) -> DiagnosticsResult<WeakObjectData> {
        let field_name = WithLocation {
            item: node.id.name.as_str().intern(),
            location: self.to_location(&node.id.loc),
        };
        Ok(WeakObjectData {
            field_name,
            type_alias: node.right.clone(),
        })
    }

    fn extract_graphql_types(
        &self,
        node: &AttachedNode<'_>,
        loc: &Loc,
    ) -> DiagnosticsResult<ResolverFlowData> {
        let AttachedNode::Statement(statement) = node else {
            return Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedNamedExport,
                self.to_location(loc),
            )]);
        };
        let StatementInner::ExportNamedDeclaration { inner, .. } = &***statement else {
            return Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedNamedExport,
                self.to_location(loc),
            )]);
        };
        match inner.declaration.as_deref() {
            Some(StatementInner::FunctionDeclaration { inner, .. }) => self.extract_function(inner),
            Some(StatementInner::TypeAlias { inner, .. }) => {
                let data = self.extract_type_alias(inner)?;
                Ok(ResolverFlowData::Weak(data))
            }
            _ => Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedFunctionOrTypeAlias,
                self.to_location(loc),
            )]),
        }
    }

    fn extract_entity_name(
        &self,
        entity_type: &FlowTypeAnnotation<Loc, Loc>,
    ) -> DiagnosticsResult<WithLocation<StringKey>> {
        match &**entity_type {
            TypeInner::Number { loc, .. } => Ok(WithLocation {
                item: intern!("Float"),
                location: self.to_location(loc),
            }),
            TypeInner::String { loc, .. } => Ok(WithLocation {
                item: intern!("String"),
                location: self.to_location(loc),
            }),
            TypeInner::Generic { loc, inner } => {
                let id = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: inner.as_ref(),
                    location: self.to_location(loc),
                })?;
                if inner.targs.is_some() {
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::GenericNotSupported,
                        self.to_location(loc),
                    )]);
                }
                Ok(id)
            }
            TypeInner::Nullable { loc, .. } => Err(vec![Diagnostic::error(
                SchemaGenerationError::UnexpectedNullableStrongType,
                self.to_location(loc),
            )]),
            _ => Err(vec![Diagnostic::error(
                SchemaGenerationError::UnsupportedType {
                    name: type_annotation_name(entity_type),
                },
                self.to_location(entity_type.loc()),
            )]),
        }
    }

    fn insert_type_definition(
        &mut self,
        key: ModuleResolutionKey,
        data: DocblockIr,
    ) -> DiagnosticsResult<()> {
        match self.type_definitions.entry(key) {
            Entry::Occupied(entry) => Err(vec![
                Diagnostic::error(
                    SchemaGenerationError::DuplicateTypeDefinitions {
                        module_name: entry.key().module_name,
                        import_type: entry.key().import_type,
                    },
                    data.location(),
                )
                .annotate("Previous type definition", entry.get().location()),
            ]),
            Entry::Vacant(entry) => {
                entry.insert(data);
                Ok(())
            }
        }
    }
}

impl SchemaExtractor for RelayResolverExtractor {
    fn to_location(&self, loc: &Loc) -> Location {
        self.current_locations.to_location(loc)
    }
}

fn param_loc(param: &Param<Loc, Loc>) -> &Loc {
    match param {
        Param::RegularParam { loc, .. } => loc,
        Param::ParamProperty { loc, .. } => loc,
    }
}

/// The ESTree name of a binding pattern, used to describe unsupported resolver
/// parameters in user facing diagnostics.
fn pattern_name(pattern: &Pattern<Loc, Loc>) -> &'static str {
    match pattern {
        Pattern::Object { .. } => "ObjectPattern",
        Pattern::Array { .. } => "ArrayPattern",
        Pattern::Identifier { .. } => "Identifier",
        Pattern::Expression { .. } => "Expression",
    }
}

fn key_loc(key: &Key<Loc, Loc>) -> &Loc {
    match key {
        Key::StringLiteral((loc, _)) => loc,
        Key::NumberLiteral((loc, _)) => loc,
        Key::BigIntLiteral((loc, _)) => loc,
        Key::Identifier(id) => &id.loc,
        Key::PrivateName(name) => &name.loc,
        Key::Computed(computed) => &computed.loc,
    }
}

fn string_key_to_identifier(name: WithLocation<StringKey>) -> Identifier {
    Identifier {
        span: name.location.span(),
        token: Token {
            span: name.location.span(),
            kind: TokenKind::Identifier,
        },
        value: name.item,
    }
}

/// Converts a Flow type annotation to a GraphQL type annotation.
/// The second return value is a list of semantic non-null levels.
/// If empty, the value is not semantically non-null.
fn return_type_to_type_annotation(
    locations: &LocationResolver,
    custom_scalar_map: &FnvIndexMap<CustomType, ScalarName>,
    return_type: &FlowTypeAnnotation<Loc, Loc>,
    module_resolution: &ModuleResolution,
    type_definitions: &FxHashMap<ModuleResolutionKey, DocblockIr>,
    use_semantic_non_null: bool,
) -> DiagnosticsResult<(TypeAnnotation, Vec<i64>)> {
    let (return_type, is_optional) = schema_extractor::unwrap_nullable_type(return_type);
    let mut semantic_non_null_levels: Vec<i64> = vec![];

    let location = locations.to_location(return_type.loc());
    let type_annotation = match &**return_type {
        TypeInner::Generic { loc, inner } => {
            let identifier = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                item: inner.as_ref(),
                location: locations.to_location(loc),
            })?;
            match &inner.targs {
                None => {
                    let module_key_opt = module_resolution.get(identifier.item);
                    let scalar_key = match module_key_opt {
                        Some(key) => CustomType::Path(CustomTypeImport {
                            name: identifier.item,
                            path: PathBuf::from_str(key.module_name.lookup()).unwrap(),
                        }),
                        None => CustomType::Name(identifier.item),
                    };
                    let custom_scalar = custom_scalar_map.get(&scalar_key);

                    let graphql_typename = match custom_scalar {
                        Some(scalar_name) => identifier.map(|_| scalar_name.0), // map identifier to keep the location
                        None => {
                            // If there is no custom scalar, expect that the Flow type is imported
                            let module_key = module_key_opt.ok_or_else(|| {
                                vec![Diagnostic::error(
                                    SchemaGenerationError::ExpectedFlowDefinitionForType {
                                        name: identifier.item,
                                    },
                                    identifier.location,
                                )]
                            })?;
                            match type_definitions.get(module_key) {
                                Some(DocblockIr::Type(
                                    ResolverTypeDocblockIr::StrongObjectResolver(object),
                                )) => Err(vec![Diagnostic::error(
                                    SchemaGenerationError::StrongReturnTypeNotAllowed {
                                        typename: object.type_name.value,
                                    },
                                    identifier.location,
                                )]),
                                Some(DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(
                                    object,
                                ))) => Ok(object
                                    .type_name
                                    .name_with_location(object.location.source_location())),
                                _ => Err(vec![Diagnostic::error(
                                    SchemaGenerationError::ModuleNotFound {
                                        entity_name: identifier.item,
                                        export_type: module_key.import_type,
                                        module_name: module_key.module_name,
                                    },
                                    identifier.location,
                                )]),
                            }?
                        }
                    };

                    TypeAnnotation::Named(NamedTypeAnnotation {
                        name: string_key_to_identifier(graphql_typename),
                    })
                }
                Some(type_parameters) if type_parameters.arguments.len() == 1 => {
                    let identifier_name = identifier.item.lookup();
                    match identifier_name {
                        "Array" | "$ReadOnlyArray" | "ReadonlyArray" => {
                            let param = &type_parameters.arguments[0];
                            let (type_annotation, inner_semantic_non_null_levels) =
                                return_type_to_type_annotation(
                                    locations,
                                    custom_scalar_map,
                                    param,
                                    module_resolution,
                                    type_definitions,
                                    // use_semantic_non_null is false because a resolver returning an array of
                                    // non-null items doesn't need to express that a single item will be null
                                    // due to error. So, array items can just be regular non-null.
                                    false,
                                )?;

                            // increment each inner level by one
                            semantic_non_null_levels.extend(
                                inner_semantic_non_null_levels.iter().map(|level| level + 1),
                            );

                            TypeAnnotation::List(Box::new(ListTypeAnnotation {
                                span: location.span(),
                                open: generated_token(),
                                type_: type_annotation,
                                close: generated_token(),
                            }))
                        }
                        "IdOf" => {
                            let param = &type_parameters.arguments[0];
                            let location = locations.to_location(param.loc());
                            if let TypeInner::StringLiteral { literal, .. } = &**param {
                                TypeAnnotation::Named(NamedTypeAnnotation {
                                    name: Identifier {
                                        span: location.span(),
                                        token: Token {
                                            span: location.span(),
                                            kind: TokenKind::Identifier,
                                        },
                                        value: literal.value.as_str().intern(),
                                    },
                                })
                            } else {
                                return Err(vec![Diagnostic::error(
                                    SchemaGenerationError::Todo,
                                    location,
                                )]);
                            }
                        }
                        "RelayResolverValue" => TypeAnnotation::Named(NamedTypeAnnotation {
                            name: Identifier {
                                span: location.span(),
                                token: Token {
                                    span: location.span(),
                                    kind: TokenKind::Identifier,
                                },
                                value: intern!("RelayResolverValue"),
                            },
                        }),
                        _ => {
                            return Err(vec![Diagnostic::error(
                                SchemaGenerationError::UnSupportedGeneric {
                                    name: identifier.item,
                                },
                                location,
                            )]);
                        }
                    }
                }
                _ => {
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::Todo,
                        location,
                    )]);
                }
            }
        }
        TypeInner::String { loc, .. } => {
            let identifier = WithLocation {
                item: intern!("String"),
                location: locations.to_location(loc),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        TypeInner::Number { loc, .. } => {
            let identifier = WithLocation {
                item: intern!("Float"),
                location: locations.to_location(loc),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        TypeInner::Boolean { loc, .. } => {
            let identifier = WithLocation {
                item: intern!("Boolean"),
                location: locations.to_location(loc),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        TypeInner::BooleanLiteral { loc, .. } => {
            let identifier = WithLocation {
                item: intern!("Boolean"),
                location: locations.to_location(loc),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        _ => {
            return Err(vec![Diagnostic::error(
                SchemaGenerationError::UnsupportedType {
                    name: type_annotation_name(return_type),
                },
                location,
            )]);
        }
    };

    if !is_optional {
        if use_semantic_non_null {
            // Special case to add self (level 0)
            semantic_non_null_levels.push(0);
        } else {
            // Normal GraphQL non-null (`!``)
            let non_null_annotation = TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                span: location.span(),
                type_: type_annotation,
                exclamation: generated_token(),
            }));
            return Ok((non_null_annotation, vec![]));
        }
    }

    Ok((type_annotation, semantic_non_null_levels))
}

fn flow_type_to_field_arguments(
    locations: &LocationResolver,
    custom_scalar_map: &FnvIndexMap<CustomType, ScalarName>,
    args_type: &FlowTypeAnnotation<Loc, Loc>,
    module_resolution: &ModuleResolution,
    type_definitions: &FxHashMap<ModuleResolutionKey, DocblockIr>,
) -> DiagnosticsResult<List<InputValueDefinition>> {
    let TypeInner::Object { inner: obj, .. } = &**args_type else {
        return Err(vec![Diagnostic::error(
            SchemaGenerationError::IncorrectArgumentsDefinition,
            locations.to_location(args_type.loc()),
        )]);
    };
    let mut items = vec![];
    for prop_type in obj.properties.iter() {
        if let ObjectTypeProperty::NormalProperty(prop) = prop_type {
            let prop_span = locations.to_span(&prop.loc);
            let Key::Identifier(ident) = &prop.key else {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::IncorrectArgumentsDefinition,
                    locations.to_location(key_loc(&prop.key)),
                )]);
            };
            let PropertyValue::Init(Some(value)) = &prop.value else {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::IncorrectArgumentsDefinition,
                    locations.to_location(&prop.loc),
                )]);
            };

            let name_span = locations.to_span(&ident.loc);
            let (type_annotation, _) = return_type_to_type_annotation(
                locations,
                custom_scalar_map,
                value,
                module_resolution,
                type_definitions,
                false, // Semantic-non-null doesn't make sense for argument types.
            )?;
            let arg = InputValueDefinition {
                name: graphql_syntax::Identifier {
                    span: name_span,
                    token: Token {
                        span: name_span,
                        kind: TokenKind::Identifier,
                    },
                    value: StringKey::from_str(&ident.name).map_err(|_| {
                        vec![Diagnostic::error(
                            SchemaGenerationError::IncorrectArgumentsDefinition,
                            locations.to_location(args_type.loc()),
                        )]
                    })?,
                },
                type_: type_annotation,
                default_value: None,
                directives: vec![],
                description: None,
                span: prop_span,
            };
            items.push(arg);
        }
    }

    let list_span = locations.to_span(args_type.loc());
    Ok(List {
        items,
        span: list_span,
        start: Token {
            span: Span {
                start: list_span.start,
                end: list_span.start + 1,
            },
            kind: TokenKind::OpenBrace,
        },
        end: Token {
            span: Span {
                start: list_span.end - 1,
                end: list_span.end,
            },
            kind: TokenKind::CloseBrace,
        },
    })
}

fn get_description(
    docblock: &DocblockAST,
    span: Span,
) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
    let mut description = None;
    for section in docblock.sections.iter() {
        match section {
            DocblockSection::Field(_) => (),
            DocblockSection::FreeText(text) => {
                let location = Location::new(text.location.source_location(), span);
                if description.is_none() {
                    description = Some(WithLocation {
                        location,
                        item: text.item,
                    })
                } else {
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::MultipleDocblockDescriptions,
                        location,
                    )]);
                }
            }
        }
    }
    Ok(description)
}

fn get_deprecated(docblock: &DocblockAST) -> Option<IrField> {
    let mut deprecated = None;
    if let Some(deprecated_field) = docblock.find_field(*DEPRECATED_FIELD) {
        let key_location = deprecated_field.field_name.location;
        if let Some(deprecated_value) = deprecated_field.field_value {
            deprecated = Some(IrField::PopulatedIrField(PopulatedIrField {
                key_location,
                value: deprecated_value,
            }));
        } else {
            deprecated = Some(IrField::UnpopulatedIrField(UnpopulatedIrField {
                key_location,
            }));
        }
    }
    deprecated
}

fn generated_token() -> Token {
    Token {
        span: Span::empty(),
        kind: TokenKind::Empty,
    }
}

static FLOW_PRIMATIVES: LazyLock<HashSet<&str>> = LazyLock::new(|| {
    HashSet::from([
        "boolean", "string", "number", "null", "void", "symbol", "bigint",
    ])
});

fn invert_custom_scalar_map(
    custom_scalar_types: &FnvIndexMap<ScalarName, CustomType>,
) -> DiagnosticsResult<FnvIndexMap<CustomType, ScalarName>> {
    let mut custom_scalar_map = FnvIndexMap::default();
    for (graphql_scalar, flow_type) in custom_scalar_types.iter() {
        if let CustomType::Name(scalar) = flow_type
            && FLOW_PRIMATIVES.contains(scalar.lookup())
        {
            continue;
        }
        if custom_scalar_map.contains_key(flow_type) {
            // Multiple custom GraphQL scalars map to one Flow type
            return Err(vec![Diagnostic::error(
                SchemaGenerationError::DuplicateCustomScalars {
                    flow_type: graphql_scalar.0,
                },
                Location::generated(), // TODO is it possible to error in the config file?
            )]);
        } else {
            custom_scalar_map.insert(flow_type.clone(), *graphql_scalar);
        }
    }
    Ok(custom_scalar_map)
}

fn generate_int_value(value: i64) -> ConstantValue {
    ConstantValue::Int(IntNode {
        token: Token {
            kind: TokenKind::IntegerLiteral,
            span: Span::new(0, 0),
        },
        value,
    })
}

fn generate_int_values(values: Vec<i64>) -> ConstantValue {
    let mut items = Vec::new();
    for value in values {
        items.push(generate_int_value(value))
    }
    ConstantValue::List(List::generated(items))
}

fn as_identifier(value: WithLocation<StringKey>) -> Identifier {
    let span = value.location.span();
    Identifier {
        span,
        token: generated_token(),
        value: value.item,
    }
}

/// Generate a semantic non-null directive from a list of levels.
/// Empty list is equivalent to no directive.
fn semantic_non_null_levels_to_directive(
    levels: Vec<i64>,
    location: Location,
) -> Option<ConstantDirective> {
    match levels.len() {
        0 => None,
        _ => {
            let arguments = if levels.len() == 1 && levels[0] == 0 {
                // Special case where levels argument can be omitted
                None
            } else {
                Some(List::generated(vec![ConstantArgument {
                    name: as_identifier(WithLocation::generated(intern!("levels"))),
                    value: generate_int_values(levels),
                    colon: generated_token(),
                    span: location.span(),
                }]))
            };

            Some(ConstantDirective {
                name: Identifier {
                    span: location.span(),
                    value: intern!("semanticNonNull"),
                    token: generated_token(),
                },
                span: location.span(),
                arguments,
                at: generated_token(),
            })
        }
    }
}
