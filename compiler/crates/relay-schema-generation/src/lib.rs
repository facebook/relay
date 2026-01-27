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
mod find_property_lookup_resolvers;
mod find_resolver_imports;

use std::collections::HashSet;
use std::collections::hash_map::Entry;
use std::path::Path;
use std::path::PathBuf;
use std::str::FromStr;

use ::errors::try_all;
use ::intern::Lookup;
use ::intern::intern;
use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::ScalarName;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::DEPRECATED_FIELD;
use docblock_shared::ResolverSourceHash;
use docblock_syntax::DocblockAST;
use docblock_syntax::DocblockSection;
use docblock_syntax::parse_docblock;
use errors::SchemaGenerationError;
use find_resolver_imports::ImportExportVisitor;
use find_resolver_imports::JSImportType;
use find_resolver_imports::ModuleResolution;
use find_resolver_imports::ModuleResolutionKey;
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
use hermes_comments::AttachedComments;
use hermes_comments::find_nodes_after_comments;
use hermes_estree::Declaration;
use hermes_estree::FlowTypeAnnotation;
use hermes_estree::Function;
use hermes_estree::Introspection;
use hermes_estree::Node;
use hermes_estree::ObjectTypePropertyKey;
use hermes_estree::ObjectTypePropertyType;
use hermes_estree::Pattern;
use hermes_estree::Range;
use hermes_estree::SourceRange;
use hermes_estree::TypeAlias;
use hermes_estree::TypeAnnotationEnum;
use hermes_estree::Visitor;
use hermes_parser::ParseResult;
use hermes_parser::ParserDialect;
use hermes_parser::ParserFlags;
use hermes_parser::parse;
use indexmap::IndexMap;
use lazy_static::lazy_static;
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
use schema_extractor::SchemaExtractor;

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
    pub return_type: FlowTypeAnnotation,
    pub entity_type: Option<FlowTypeAnnotation>,
    pub arguments: Option<FlowTypeAnnotation>,
    pub is_live: Option<Location>,
}

#[derive(Debug)]
pub struct WeakObjectData {
    pub field_name: WithLocation<StringKey>,
    pub type_alias: FlowTypeAnnotation,
}

pub struct RelayResolverExtractor {
    /// Cross module states
    type_definitions: FxHashMap<ModuleResolutionKey, DocblockIr>,
    unresolved_field_definitions: Vec<(UnresolvedFieldDefinition, SourceLocationKey)>,
    resolved_field_definitions: Vec<TerseRelayResolverIr>,
    module_resolutions: FxHashMap<SourceLocationKey, ModuleResolution>,

    // Needs to keep track of source location because hermes_parser currently
    // does not embed the information
    current_location: SourceLocationKey,

    // Used to map Flow types in return/argument types to GraphQL custom scalars
    custom_scalar_map: FnvIndexMap<CustomType, ScalarName>,
}

enum FieldDefinitionInfo {
    ResolverFunctionInfo {
        arguments: Option<FlowTypeAnnotation>,
        is_live: Option<Location>,
        root_fragment: Option<(WithLocation<FragmentDefinitionName>, Vec<Argument>)>,
    },
    PropertyLookupInfo {
        // If an alias is used, this may differ from the field name
        property_name: WithLocation<StringKey>,
    },
}

struct UnresolvedFieldDefinition {
    entity_name: Option<WithLocation<StringKey>>,
    field_name: WithLocation<StringKey>,
    return_type: FlowTypeAnnotation,
    source_hash: ResolverSourceHash,
    description: Option<WithLocation<StringKey>>,
    deprecated: Option<IrField>,
    entity_type: Option<WithLocation<StringKey>>,
    field_info: FieldDefinitionInfo,
}

impl Default for RelayResolverExtractor {
    fn default() -> Self {
        Self::new()
    }
}

impl RelayResolverExtractor {
    pub fn new() -> Self {
        let mut self_ = Self {
            type_definitions: Default::default(),
            unresolved_field_definitions: Default::default(),
            resolved_field_definitions: vec![],
            module_resolutions: Default::default(),
            current_location: SourceLocationKey::generated(),
            custom_scalar_map: FnvIndexMap::default(),
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

    /// First pass to extract all object definitions and field definitions
    pub fn parse_document(
        &mut self,
        text: &str,
        source_module_path: &str,
        fragment_definitions: Option<&Vec<ExecutableDefinition>>,
    ) -> DiagnosticsResult<()> {
        // Assume the caller knows the text contains at least one RelayResolver decorator

        self.current_location = SourceLocationKey::standalone(source_module_path);

        let source_hash = ResolverSourceHash::new(text);
        let ParseResult { ast, comments } = parse(
            text,
            "", // Not used in hermes_parser
            ParserFlags {
                strict_mode: true,
                enable_jsx: true,
                dialect: ParserDialect::Flow,
                store_doc_block: false,
                store_comments: true,
            },
        )
        .map_err(|errs| {
            errs.into_iter()
                .map(|err| {
                    let source_span = err.span();
                    Diagnostic::error(
                        err.into_message(),
                        Location::new(
                            self.current_location,
                            Span::new(
                                source_span.offset().try_into().unwrap(),
                                (source_span.offset() + source_span.len())
                                    .try_into()
                                    .unwrap(),
                            ),
                        ),
                    )
                })
                .collect::<Vec<_>>()
        })?;

        let import_export_visitor = ImportExportVisitor::new(source_module_path);
        let module_resolution = import_export_visitor.get_module_resolution(&ast)?;

        let attached_comments = find_nodes_after_comments(&ast, &comments);
        let (gql_field_comments, attached_comments): (AttachedComments<'_>, AttachedComments<'_>) =
            attached_comments
                .into_iter()
                .partition(|(comment, _, _, _)| comment.contains("@gqlField"));

        let gql_comments =
            FnvHashMap::from_iter(gql_field_comments.into_iter().map(
                |(comment, comment_range, _, node_range)| (node_range, (comment, comment_range)),
            ));

        let result = try_all(
            attached_comments
                .into_iter()
                .filter(|(comment, _, _, _)| comment.contains("@RelayResolver"))
                .map(|(comment, comment_range, node, range)| {
                    // TODO: Handle unwraps
                    let docblock = parse_docblock(comment, self.current_location)?;
                    let resolver_value = docblock.find_field(intern!("RelayResolver")).unwrap();

                    let deprecated = get_deprecated(&docblock);
                    let description = get_description(&docblock, comment_range)?;

                    match self.extract_graphql_types(&node, range)? {
                        ResolverFlowData::Strong(FieldData {
                            field_name,
                            return_type,
                            entity_type,
                            arguments,
                            is_live,
                        }) => {
                            let name = resolver_value.field_value.unwrap_or(field_name);

                            // Heuristic to treat lowercase name as field definition, otherwise object definition
                            // if there is a `.` in the name, it is the old resolver synatx, e.g. @RelayResolver Client.field,
                            // we should treat it as a field definition
                            let is_field_definition = {
                                let name_str = name.item.lookup();
                                let is_lowercase_initial =
                                    name_str.chars().next().unwrap().is_lowercase();
                                is_lowercase_initial || name_str.contains('.')
                            };
                            if is_field_definition {
                                let entity_name = match entity_type {
                                    Some(entity_type) => {
                                        Some(self.extract_entity_name(entity_type)?)
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
                            let mut prop_visitor = PropertyVisitor::new(
                                source_module_path,
                                source_hash,
                                name,
                                &gql_comments,
                            );
                            prop_visitor.visit_flow_type_annotation(&type_alias);
                            if !prop_visitor.errors.is_empty() {
                                return Err(prop_visitor.errors);
                            }
                            let field_definitions: Vec<(
                                UnresolvedFieldDefinition,
                                SourceLocationKey,
                            )> = prop_visitor
                                .field_definitions
                                .into_iter()
                                .map(|def| (def, prop_visitor.location))
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
            .insert(self.current_location, module_resolution);

        result?;
        Ok(())
    }

    /// Second pass to resolve all field definitions
    pub fn resolve(mut self) -> DiagnosticsResult<(Vec<DocblockIr>, Vec<TerseRelayResolverIr>)> {
        try_all(
            self.unresolved_field_definitions
                .into_iter()
                .map(|(field, source_location)| {
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
                                        source_location,
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
                            source_location,
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
            .push((field_definition, self.current_location));

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    fn add_type_definition(
        &mut self,
        module_resolution: &ModuleResolution,
        name: WithLocation<StringKey>,
        mut return_type: FlowTypeAnnotation,
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
        return_type = if let FlowTypeAnnotation::NullableTypeAnnotation(return_type) = return_type {
            return_type.type_annotation
        } else {
            return_type
        };
        // For now, we assume the flow type for the strong object is always imported
        // from a separate file
        match return_type {
            FlowTypeAnnotation::GenericTypeAnnotation(generic_type) => {
                let name = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: generic_type.as_ref(),
                    location: self.to_location(generic_type.as_ref()),
                })?;
                if generic_type.type_parameters.is_some() {
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
            FlowTypeAnnotation::ObjectTypeAnnotation(object_type) => Err(vec![Diagnostic::error(
                SchemaGenerationError::ObjectNotSupported,
                self.to_location(object_type.as_ref()),
            )]),
            _ => self.error_result(
                SchemaGenerationError::UnsupportedType {
                    name: return_type.name(),
                },
                &return_type,
            ),
        }
    }

    fn add_weak_type_definition(
        &mut self,
        name: WithLocation<StringKey>,
        type_alias: FlowTypeAnnotation,
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
            if let FlowTypeAnnotation::ObjectTypeAnnotation(object_node) = type_alias {
                let field_map = self.get_object_fields(&object_node)?;
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
                            self.current_location,
                        ));
                        Ok(())
                    }))?;
                } else {
                    let location = self.to_location(object_node.as_ref());
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::ExpectedWeakObjectToHaveFields,
                        location,
                    )]);
                }
            } else {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::ExpectedTypeAliasToBeObject,
                    self.to_location(&type_alias),
                )]);
            }
        }

        // Add weak object
        self.insert_type_definition(
            key,
            DocblockIr::Type(ResolverTypeDocblockIr::WeakObjectType(weak_object)),
        )
    }

    pub fn extract_function(&self, node: &Function) -> DiagnosticsResult<ResolverFlowData> {
        let ident = node.id.as_ref().ok_or_else(|| {
            Diagnostic::error(
                SchemaGenerationError::MissingFunctionName,
                self.to_location(node),
            )
        })?;
        let field_name = WithLocation {
            item: (&ident.name).intern(),
            location: self.to_location(ident),
        };

        let return_type_annotation = node.return_type.as_ref().ok_or_else(|| {
            Diagnostic::error(
                SchemaGenerationError::MissingReturnType,
                self.to_location(node),
            )
        })?;
        let flow_return_type = self.unwrap_annotation_enum(return_type_annotation)?;
        let (return_type_with_live, is_optional) =
            schema_extractor::unwrap_nullable_type(flow_return_type);

        // unwrap is_live from the return type
        let (return_type, is_live) = match return_type_with_live {
            FlowTypeAnnotation::GenericTypeAnnotation(type_node) => {
                let name = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: type_node,
                    location: self.to_location(type_node.as_ref()),
                })?;
                if let Some(type_param) = &type_node.type_parameters {
                    match type_param.params.as_slice() {
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
                                type_node.as_ref(),
                            );
                        }
                    }
                } else {
                    (flow_return_type, None)
                }
            }
            _ => (flow_return_type, None),
        };

        let entity_type = {
            if node.params.is_empty() {
                None
            } else {
                let param = &node.params[0];
                if let Pattern::Identifier(identifier) = param {
                    let type_annotation = identifier.type_annotation.as_ref().ok_or_else(|| {
                        Diagnostic::error(
                            SchemaGenerationError::MissingParamType,
                            self.to_location(param),
                        )
                    })?;
                    if let TypeAnnotationEnum::FlowTypeAnnotation(type_) =
                        &type_annotation.type_annotation
                    {
                        Some(type_.clone())
                    } else {
                        return self.error_result(
                            SchemaGenerationError::UnsupportedType { name: param.name() },
                            param,
                        );
                    }
                } else {
                    return self.error_result(
                        SchemaGenerationError::UnsupportedType { name: param.name() },
                        param,
                    );
                }
            }
        };

        let arguments = if node.params.len() > 1 {
            let param = &node.params[0];
            let arg_param = &node.params[1];
            let args = if let Pattern::Identifier(identifier) = arg_param {
                let type_annotation = identifier.type_annotation.as_ref().ok_or_else(|| {
                    Diagnostic::error(
                        SchemaGenerationError::MissingParamType,
                        self.to_location(param),
                    )
                })?;
                if let TypeAnnotationEnum::FlowTypeAnnotation(type_) =
                    &type_annotation.type_annotation
                {
                    Some(type_)
                } else {
                    None
                }
            } else {
                None
            };
            if args.is_none() {
                return self.error_result(
                    SchemaGenerationError::IncorrectArgumentsDefinition,
                    arg_param,
                );
            }
            args
        } else {
            None
        };

        Ok(ResolverFlowData::Strong(FieldData {
            field_name,
            return_type: return_type.clone(),
            entity_type,
            arguments: arguments.cloned(),
            is_live,
        }))
    }

    fn extract_type_alias(&self, node: &TypeAlias) -> DiagnosticsResult<WeakObjectData> {
        let field_name = WithLocation {
            item: (&node.id.name).intern(),
            location: self.to_location(&node.id),
        };
        Ok(WeakObjectData {
            field_name,
            type_alias: node.right.clone(),
        })
    }

    fn extract_graphql_types(
        &self,
        node: &Node<'_>,
        range: SourceRange,
    ) -> DiagnosticsResult<ResolverFlowData> {
        if let Node::ExportNamedDeclaration(node) = node {
            match node.declaration {
                Some(Declaration::FunctionDeclaration(ref node)) => {
                    self.extract_function(&node.function)
                }
                Some(Declaration::TypeAlias(ref node)) => {
                    let data = self.extract_type_alias(node)?;
                    Ok(ResolverFlowData::Weak(data))
                }
                _ => Err(vec![Diagnostic::error(
                    SchemaGenerationError::ExpectedFunctionOrTypeAlias,
                    Location::new(self.current_location, Span::new(range.start, range.end)),
                )]),
            }
        } else {
            Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedNamedExport,
                Location::new(self.current_location, Span::new(range.start, range.end)),
            )])
        }
    }

    fn extract_entity_name(
        &self,
        entity_type: FlowTypeAnnotation,
    ) -> DiagnosticsResult<WithLocation<StringKey>> {
        match entity_type {
            FlowTypeAnnotation::NumberTypeAnnotation(annot) => Ok(WithLocation {
                item: intern!("Float"),
                location: self.to_location(annot.as_ref()),
            }),
            FlowTypeAnnotation::StringTypeAnnotation(annot) => Ok(WithLocation {
                item: intern!("String"),
                location: self.to_location(annot.as_ref()),
            }),
            FlowTypeAnnotation::GenericTypeAnnotation(annot) => {
                let id = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                    item: &annot,
                    location: self.to_location(annot.as_ref()),
                })?;
                if annot.type_parameters.is_some() {
                    return Err(vec![Diagnostic::error(
                        SchemaGenerationError::GenericNotSupported,
                        self.to_location(annot.as_ref()),
                    )]);
                }
                Ok(id)
            }
            FlowTypeAnnotation::NullableTypeAnnotation(annot) => Err(vec![Diagnostic::error(
                SchemaGenerationError::UnexpectedNullableStrongType,
                self.to_location(annot.as_ref()),
            )]),
            _ => Err(vec![Diagnostic::error(
                SchemaGenerationError::UnsupportedType {
                    name: entity_type.name(),
                },
                self.to_location(&entity_type),
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
    fn to_location<T: Range>(&self, node: &T) -> Location {
        to_location(self.current_location, node)
    }
}

fn to_location<T: Range>(source_location: SourceLocationKey, node: &T) -> Location {
    let range = node.range();
    Location::new(source_location, Span::new(range.start, range.end))
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
    source_location: SourceLocationKey,
    custom_scalar_map: &FnvIndexMap<CustomType, ScalarName>,
    return_type: &FlowTypeAnnotation,
    module_resolution: &ModuleResolution,
    type_definitions: &FxHashMap<ModuleResolutionKey, DocblockIr>,
    use_semantic_non_null: bool,
) -> DiagnosticsResult<(TypeAnnotation, Vec<i64>)> {
    let (return_type, is_optional) = schema_extractor::unwrap_nullable_type(return_type);
    let mut semantic_non_null_levels: Vec<i64> = vec![];

    let location = to_location(source_location, return_type);
    let type_annotation = match return_type {
        FlowTypeAnnotation::GenericTypeAnnotation(node) => {
            let identifier = schema_extractor::get_identifier_for_flow_generic(WithLocation {
                item: node,
                location: to_location(source_location, node.as_ref()),
            })?;
            match &node.type_parameters {
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
                Some(type_parameters) if type_parameters.params.len() == 1 => {
                    let identifier_name = identifier.item.lookup();
                    match identifier_name {
                        "Array" | "$ReadOnlyArray" | "ReadonlyArray" => {
                            let param = &type_parameters.params[0];
                            let (type_annotation, inner_semantic_non_null_levels) =
                                return_type_to_type_annotation(
                                    source_location,
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
                            let param = &type_parameters.params[0];
                            let location = to_location(source_location, param);
                            if let FlowTypeAnnotation::StringLiteralTypeAnnotation(node) = param {
                                TypeAnnotation::Named(NamedTypeAnnotation {
                                    name: Identifier {
                                        span: location.span(),
                                        token: Token {
                                            span: location.span(),
                                            kind: TokenKind::Identifier,
                                        },
                                        value: (&node.value).intern(),
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
        FlowTypeAnnotation::StringTypeAnnotation(node) => {
            let identifier = WithLocation {
                item: intern!("String"),
                location: to_location(source_location, node.as_ref()),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        FlowTypeAnnotation::NumberTypeAnnotation(node) => {
            let identifier = WithLocation {
                item: intern!("Float"),
                location: to_location(source_location, node.as_ref()),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        FlowTypeAnnotation::BooleanTypeAnnotation(node) => {
            let identifier = WithLocation {
                item: intern!("Boolean"),
                location: to_location(source_location, node.as_ref()),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        FlowTypeAnnotation::BooleanLiteralTypeAnnotation(node) => {
            let identifier = WithLocation {
                item: intern!("Boolean"),
                location: to_location(source_location, node.as_ref()),
            };
            TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(identifier),
            })
        }
        _ => {
            return Err(vec![Diagnostic::error(
                SchemaGenerationError::UnsupportedType {
                    name: return_type.name(),
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
    source_location: SourceLocationKey,
    custom_scalar_map: &FnvIndexMap<CustomType, ScalarName>,
    args_type: &FlowTypeAnnotation,
    module_resolution: &ModuleResolution,
    type_definitions: &FxHashMap<ModuleResolutionKey, DocblockIr>,
) -> DiagnosticsResult<List<InputValueDefinition>> {
    let obj = if let FlowTypeAnnotation::ObjectTypeAnnotation(type_) = &args_type {
        // unwrap the ref then the box, then re-add the ref
        type_
    } else {
        return Err(vec![Diagnostic::error(
            SchemaGenerationError::IncorrectArgumentsDefinition,
            to_location(source_location, args_type),
        )]);
    };
    let mut items = vec![];
    for prop_type in obj.properties.iter() {
        let prop_span = to_location(source_location, prop_type).span();
        if let ObjectTypePropertyType::ObjectTypeProperty(prop) = prop_type {
            let ident = if let ObjectTypePropertyKey::Identifier(ident) = &prop.key {
                ident
            } else {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::IncorrectArgumentsDefinition,
                    to_location(source_location, &prop.key),
                )]);
            };

            let ident_node: &hermes_estree::Identifier = ident;
            let name_span = to_location(source_location, ident_node).span();
            let (type_annotation, _) = return_type_to_type_annotation(
                source_location,
                custom_scalar_map,
                &prop.value,
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
                            to_location(source_location, args_type),
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

    let list_start: u32 = args_type.range().start;
    let list_end: u32 = args_type.range().end;
    Ok(List {
        items,
        span: to_location(source_location, args_type).span(),
        start: Token {
            span: Span {
                start: list_start,
                end: list_start + 1,
            },
            kind: TokenKind::OpenBrace,
        },
        end: Token {
            span: Span {
                start: list_end - 1,
                end: list_end,
            },
            kind: TokenKind::CloseBrace,
        },
    })
}

fn get_description(
    docblock: &DocblockAST,
    range: SourceRange,
) -> DiagnosticsResult<Option<WithLocation<StringKey>>> {
    let mut description = None;
    for section in docblock.sections.iter() {
        match section {
            DocblockSection::Field(_) => (),
            DocblockSection::FreeText(text) => {
                let location = Location::new(
                    text.location.source_location(),
                    Span::new(range.start, range.end),
                );
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

lazy_static! {
    static ref FLOW_PRIMATIVES: HashSet<&'static str> = HashSet::from([
        "boolean", "string", "number", "null", "void", "symbol", "bigint",
    ]);
}
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
