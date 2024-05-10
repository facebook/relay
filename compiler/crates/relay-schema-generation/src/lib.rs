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

use std::fmt;
use std::path::Path;

use ::errors::try_all;
use ::intern::intern;
use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use ::intern::Lookup;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use common::WithLocation;
use docblock_shared::ResolverSourceHash;
use docblock_syntax::parse_docblock;
use errors::SchemaGenerationError;
use graphql_ir::FragmentDefinitionName;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::FieldDefinition;
use graphql_syntax::Identifier;
use graphql_syntax::ListTypeAnnotation;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use graphql_syntax::TypeAnnotation;
use hermes_comments::find_nodes_after_comments;
use hermes_estree::Declaration;
use hermes_estree::ImportDeclarationSpecifier;
use hermes_estree::Node;
use hermes_estree::Range;
use hermes_estree::SourceRange;
use hermes_estree::Visitor;
use hermes_estree::_Literal;
use hermes_parser::parse;
use hermes_parser::ParseResult;
use hermes_parser::ParserDialect;
use hermes_parser::ParserFlags;
use relay_docblock::DocblockIr;
use relay_docblock::StrongObjectIr;
use relay_docblock::TerseRelayResolverIr;
use relay_docblock::UnpopulatedIrField;
use relay_docblock::WeakObjectIr;
use rustc_hash::FxHashMap;
use schema_extractor::FieldData;
use schema_extractor::FlowType;
use schema_extractor::ObjectType;
use schema_extractor::ResolverFlowData;
use schema_extractor::SchemaExtractor;
use schema_extractor::WeakObjectData;

pub struct RelayResolverExtractor {
    /// Cross module states
    type_definitions: FxHashMap<ModuleResolutionKey, DocblockIr>,
    unresolved_field_definitions: Vec<(ModuleResolutionKey, UnresolvedFieldDefinition)>,
    resolved_field_definitions: Vec<TerseRelayResolverIr>,

    // Needs to keep track of source location because hermes_parser currently
    // does not embed the information
    current_location: SourceLocationKey,
}

#[derive(
    Clone,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Debug,
    Hash,
    Copy,
    serde::Serialize
)]
pub enum JSImportType {
    Default,
    Namespace,
    Named(StringKey),
}
impl fmt::Display for JSImportType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JSImportType::Default => write!(f, "default"),
            JSImportType::Namespace => write!(f, "namespace"),
            JSImportType::Named(_) => write!(f, "named"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug, Hash)]
struct ModuleResolutionKey {
    module_name: StringKey,
    import_type: JSImportType,
}

struct UnresolvedFieldDefinition {
    entity_name: WithLocation<StringKey>,
    field_name: WithLocation<StringKey>,
    return_type: FlowType,
    source_hash: ResolverSourceHash,
    is_live: Option<Location>,
}

impl Default for RelayResolverExtractor {
    fn default() -> Self {
        Self::new()
    }
}

impl RelayResolverExtractor {
    pub fn new() -> Self {
        Self {
            type_definitions: Default::default(),
            unresolved_field_definitions: Default::default(),
            resolved_field_definitions: vec![],
            current_location: SourceLocationKey::generated(),
        }
    }

    /// First pass to extract all object definitions and field definitions
    pub fn parse_document(
        &mut self,
        text: &str,
        source_module_path: &str,
        fragment_definitions: &Option<&Vec<ExecutableDefinition>>,
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

        let mut imports_visitor = ImportsVisitor::new(self.current_location);
        imports_visitor.visit_program(&ast);
        let imports = imports_visitor.get_imports()?;

        let attached_comments = find_nodes_after_comments(&ast, &comments);

        try_all(
            attached_comments
                .into_iter()
                .filter(|(comment, _, _)| comment.contains("@RelayResolver"))
                .map(|(comment, node, range)| {
                    // TODO: Handle unwraps
                    let docblock = parse_docblock(comment, self.current_location)?;
                    let resolver_value = docblock.find_field(intern!("RelayResolver")).unwrap();

                    match self.extract_graphql_types(&node, range)? {
                        ResolverFlowData::Strong(FieldData {
                            field_name,
                            return_type,
                            entity_type,
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
                                    FlowType::NamedType(named_type) => named_type.identifier,
                                    _ => {
                                        return Err(vec![Diagnostic::error(
                                            SchemaGenerationError::GenericNotSupported,
                                            entity_type.location(),
                                        )]);
                                    }
                                };
                                self.add_field_definition(
                                    &imports,
                                    fragment_definitions,
                                    UnresolvedFieldDefinition {
                                        entity_name,
                                        field_name: name,
                                        return_type,
                                        source_hash,
                                        is_live,
                                    },
                                )?
                            } else {
                                self.add_type_definition(
                                    &imports,
                                    name,
                                    return_type,
                                    source_hash,
                                    is_live,
                                )?
                            }
                        }
                        ResolverFlowData::Weak(WeakObjectData {
                            field_name,
                            type_alias,
                        }) => {
                            let name = resolver_value.field_value.unwrap_or(field_name);
                            self.add_weak_type_definition(
                                name,
                                type_alias,
                                source_hash,
                                source_module_path,
                            )?
                        }
                    }
                    Ok(())
                }),
        )?;
        Ok(())
    }

    /// Second pass to resolve all field definitions
    pub fn resolve(mut self) -> DiagnosticsResult<(Vec<DocblockIr>, Vec<TerseRelayResolverIr>)> {
        try_all(
            self.unresolved_field_definitions
                .into_iter()
                .map(|(key, field)| {
                    if let Some(DocblockIr::StrongObjectResolver(object)) =
                        self.type_definitions.get(&key)
                    {
                        let field_definition = FieldDefinition {
                            name: string_key_to_identifier(field.field_name),
                            type_: return_type_to_type_annotation(field.return_type)?,
                            arguments: None,
                            directives: vec![],
                            description: None,
                            hack_source: None,
                            span: field.field_name.location.span(),
                        };
                        let live = field
                            .is_live
                            .map(|loc| UnpopulatedIrField { key_location: loc });
                        self.resolved_field_definitions.push(TerseRelayResolverIr {
                            field: field_definition,
                            type_: object
                                .type_name
                                .name_with_location(SourceLocationKey::Generated),
                            root_fragment: None,
                            location: field.field_name.location,
                            deprecated: None,
                            live,
                            fragment_arguments: None,
                            source_hash: field.source_hash,
                            semantic_non_null: None,
                        });
                        Ok(())
                    } else {
                        Err(vec![Diagnostic::error(
                            SchemaGenerationError::ModuleNotFound {
                                entity_name: field.entity_name.item,
                                export_type: key.import_type,
                                module_name: key.module_name,
                            },
                            field.entity_name.location,
                        )])
                    }
                }),
        )?;
        Ok((
            self.type_definitions.into_values().collect(),
            self.resolved_field_definitions,
        ))
    }

    fn add_field_definition(
        &mut self,
        imports: &FxHashMap<StringKey, (ModuleResolutionKey, Location)>,
        fragment_definitions: &Option<&Vec<ExecutableDefinition>>,
        field_definition: UnresolvedFieldDefinition,
    ) -> DiagnosticsResult<()> {
        let (key, _): &(ModuleResolutionKey, Location) = imports
            .get(&field_definition.entity_name.item)
            .ok_or_else(|| {
                Diagnostic::error(
                    SchemaGenerationError::ExpectedFlowImportForType {
                        name: field_definition.entity_name.item,
                    },
                    field_definition.entity_name.location,
                )
            })?;

        if key.module_name.lookup().ends_with(".graphql")
            && field_definition.entity_name.item.lookup().ends_with("$key")
        {
            self.add_fragment_field_definition(fragment_definitions, field_definition)
        } else {
            self.unresolved_field_definitions
                .push((key.clone(), field_definition));
        }
        Ok(())
    }

    fn add_fragment_field_definition(
        &mut self,
        _fragment_definitions: &Option<&Vec<ExecutableDefinition>>,
        _field_definition: UnresolvedFieldDefinition,
    ) {
        // TODO
    }

    fn add_type_definition(
        &mut self,
        imports: &FxHashMap<StringKey, (ModuleResolutionKey, Location)>,
        name: WithLocation<StringKey>,
        return_type: FlowType,
        source_hash: ResolverSourceHash,
        is_live: Option<Location>,
    ) -> DiagnosticsResult<()> {
        let strong_object = StrongObjectIr {
            type_name: string_key_to_identifier(name),
            rhs_location: name.location,
            root_fragment: WithLocation::new(
                name.location,
                FragmentDefinitionName(format!("{}__id", name.item).intern()),
            ),
            description: None,
            deprecated: None,
            live: is_live.map(|loc| UnpopulatedIrField { key_location: loc }),
            location: name.location,
            implements_interfaces: vec![],
            source_hash,
            semantic_non_null: None,
        };
        // For now, we assume the flow type for the strong object is always imported
        // from a separate file
        match return_type {
            FlowType::NamedType(type_) => {
                let name = type_.identifier.item;
                let (key, import_location) = imports.get(&name).ok_or_else(|| {
                    Diagnostic::error(
                        SchemaGenerationError::ExpectedFlowImportForType { name },
                        type_.identifier.location,
                    )
                })?;
                if let JSImportType::Namespace = key.import_type {
                    return Err(vec![
                        Diagnostic::error(
                            SchemaGenerationError::UseNamedOrDefaultImport,
                            type_.identifier.location,
                        )
                        .annotate(format!("{} is imported from", name), *import_location),
                    ]);
                };
                self.type_definitions
                    .insert(key.clone(), DocblockIr::StrongObjectResolver(strong_object));
                Ok(())
            }
            FlowType::GenericType(node) => Err(vec![Diagnostic::error(
                SchemaGenerationError::GenericNotSupported,
                node.identifier.location,
            )]),
            FlowType::PluralType(node) => Err(vec![Diagnostic::error(
                SchemaGenerationError::PluralNotSupported,
                node.location,
            )]),
            FlowType::ObjectType(node) => Err(vec![Diagnostic::error(
                SchemaGenerationError::ObjectNotSupported,
                node.location,
            )]),
        }
    }

    fn add_weak_type_definition(
        &mut self,
        name: WithLocation<StringKey>,
        type_alias: FlowType,
        source_hash: ResolverSourceHash,
        source_module_path: &str,
    ) -> DiagnosticsResult<()> {
        let weak_object = WeakObjectIr {
            type_name: string_key_to_identifier(name),
            rhs_location: name.location,
            description: None,
            hack_source: None,
            deprecated: None,
            location: name.location,
            implements_interfaces: vec![],
            source_hash,
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
        // Add fields
        if let FlowType::ObjectType(ObjectType {
            field_map,
            location,
        }) = type_alias
        {
            if !field_map.is_empty() {
                try_all(field_map.into_iter().map(|(field_name, field_type)| {
                    let field_definition = FieldDefinition {
                        name: string_key_to_identifier(field_name),
                        type_: return_type_to_type_annotation(field_type)?,
                        arguments: None,
                        directives: vec![],
                        description: None,
                        hack_source: None,
                        span: field_name.location.span(),
                    };

                    self.resolved_field_definitions.push(TerseRelayResolverIr {
                        field: field_definition,
                        type_: weak_object
                            .type_name
                            .name_with_location(SourceLocationKey::Generated),
                        root_fragment: None,
                        location: field_name.location,
                        deprecated: None,
                        live: None,
                        fragment_arguments: None,
                        source_hash,
                        semantic_non_null: None,
                    });
                    Ok(())
                }))?;

                self.type_definitions
                    .insert(key.clone(), DocblockIr::WeakObjectType(weak_object));
                Ok(())
            } else {
                Err(vec![Diagnostic::error(
                    SchemaGenerationError::ExpectedWeakObjectToHaveFields,
                    location,
                )])
            }
        } else {
            Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedTypeAliasToBeObject,
                type_alias.location(),
            )])
        }
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
                    Location::new(
                        self.current_location,
                        Span::new(range.start, range.end.into()),
                    ),
                )]),
            }
        } else {
            Err(vec![Diagnostic::error(
                SchemaGenerationError::ExpectedNamedExport,
                Location::new(
                    self.current_location,
                    Span::new(range.start, range.end.into()),
                ),
            )])
        }
    }
}

impl SchemaExtractor for RelayResolverExtractor {
    fn to_location<T: Range>(&self, node: &T) -> Location {
        to_location(self.current_location, node)
    }
}

struct ImportsVisitor {
    imports: FxHashMap<StringKey, (ModuleResolutionKey, Location)>,
    errors: Vec<Diagnostic>,
    location: SourceLocationKey,
}

impl ImportsVisitor {
    fn new(location: SourceLocationKey) -> Self {
        Self {
            location,
            imports: Default::default(),
            errors: vec![],
        }
    }

    /// Returns a map of local name => module key
    fn get_imports(
        self,
    ) -> DiagnosticsResult<FxHashMap<StringKey, (ModuleResolutionKey, Location)>> {
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(self.imports)
        }
    }
}

impl Visitor<'_> for ImportsVisitor {
    fn visit_import_declaration(&mut self, ast: &'_ hermes_estree::ImportDeclaration) {
        let location = to_location(self.location, &ast.source);
        let source = match &ast.source {
            _Literal::StringLiteral(node) => (&node.value).intern(),
            _ => {
                self.errors.push(Diagnostic::error(
                    SchemaGenerationError::ExpectedStringLiteralSource,
                    location,
                ));
                return;
            }
        };

        self.imports
            .extend(ast.specifiers.iter().map(|specifier| match specifier {
                ImportDeclarationSpecifier::ImportDefaultSpecifier(node) => (
                    (&node.local.name).intern(),
                    (
                        ModuleResolutionKey {
                            module_name: source,
                            import_type: JSImportType::Default,
                        },
                        to_location(self.location, &node.local),
                    ),
                ),
                ImportDeclarationSpecifier::ImportSpecifier(node) => (
                    (&node.local.name).intern(),
                    (
                        ModuleResolutionKey {
                            module_name: source,
                            import_type: JSImportType::Named((&node.imported.name).intern()),
                        },
                        to_location(self.location, &node.local),
                    ),
                ),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(node) => (
                    (&node.local.name).intern(),
                    (
                        ModuleResolutionKey {
                            module_name: source,
                            import_type: JSImportType::Namespace,
                        },
                        to_location(self.location, &node.local),
                    ),
                ),
            }));
    }
}

fn to_location<T: Range>(source_location: SourceLocationKey, node: &T) -> Location {
    let range = node.range();
    Location::new(source_location, Span::new(range.start, range.end.into()))
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

fn return_type_to_type_annotation(return_type: FlowType) -> DiagnosticsResult<TypeAnnotation> {
    match return_type {
        FlowType::NamedType(type_) => {
            let mut result = TypeAnnotation::Named(NamedTypeAnnotation {
                name: string_key_to_identifier(type_.identifier),
            });
            if !type_.optional {
                result = TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span: type_.identifier.location.span(),
                    type_: result,
                    exclamation: generated_token(),
                }));
            }
            Ok(result)
        }
        FlowType::PluralType(type_) => {
            let mut result = TypeAnnotation::List(Box::new(ListTypeAnnotation {
                span: type_.location.span(),
                open: generated_token(),
                type_: return_type_to_type_annotation(*type_.inner)?,
                close: generated_token(),
            }));
            if !type_.optional {
                result = TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span: type_.location.span(),
                    type_: result,
                    exclamation: generated_token(),
                }));
            }
            Ok(result)
        }
        FlowType::GenericType(_) => Err(vec![Diagnostic::error(
            SchemaGenerationError::TODO,
            return_type.location(),
        )]),

        FlowType::ObjectType(_) => Err(vec![Diagnostic::error(
            SchemaGenerationError::TODO,
            return_type.location(),
        )]), // Do we want to allow this?
    }
}

fn generated_token() -> Token {
    Token {
        span: Span::empty(),
        kind: TokenKind::Empty,
    }
}
