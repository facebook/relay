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
use hermes_estree::Visitor;
use hermes_estree::_Literal;
use hermes_parser::parse;
use hermes_parser::ParseResult;
use hermes_parser::ParserDialect;
use hermes_parser::ParserFlags;
use relay_docblock::StrongObjectIr;
use relay_docblock::TerseRelayResolverIr;
use rustc_hash::FxHashMap;
use schema_extractor::FieldData;
use schema_extractor::FlowType;
use schema_extractor::SchemaExtractor;

pub struct RelayResolverExtractor {
    /// Cross module states
    type_definitions: FxHashMap<ModuleResolutionKey, StrongObjectIr>,
    unresolved_field_definitions: Vec<(ModuleResolutionKey, UnresolvedFieldDefinition)>,

    // Needs to keep track of source location because hermes_parser currently
    // does not embed the information
    current_location: SourceLocationKey,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug, Hash)]
struct ModuleResolutionKey {
    module_name: StringKey,
    export_name: StringKey,
}

struct UnresolvedFieldDefinition {
    field_name: WithLocation<StringKey>,
    return_type: FlowType,
    source_hash: ResolverSourceHash,
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
            current_location: SourceLocationKey::generated(),
        }
    }

    /// First pass to extract all object definitions and field definitions
    pub fn parse_document(
        &mut self,
        text: &str,
        source_location: SourceLocationKey,
    ) -> DiagnosticsResult<()> {
        // Assume the caller knows the text contains at least one RelayResolver decorator
        // TODO: handle weak types

        self.current_location = source_location;
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
                            source_location,
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

        let mut imports_visitor = ImportsVisitor::new(source_location);
        imports_visitor.visit_program(&ast);
        let imports = imports_visitor.get_imports()?;

        let attached_comments = find_nodes_after_comments(&ast, &comments);
        for (comment, node) in attached_comments
            .into_iter()
            .filter(|(comment, _)| comment.contains("@RelayResolver"))
        {
            // TODO: Handle unwraps
            let docblock = parse_docblock(comment, source_location)?;
            let FieldData {
                field_name,
                return_type,
                entity_type,
            } = self.extract_graphql_types(&node)?;
            let resolver_value = docblock.find_field(intern!("RelayResolver")).unwrap();

            let name = resolver_value.field_value.unwrap_or(field_name);

            // Heuristic to treat lowercase name as field definition, otherwise object definition
            let is_field_definition = {
                let name_str = name.item.lookup();
                name_str.chars().next().unwrap().is_lowercase()
            };
            if is_field_definition {
                self.add_unresolved_field_definition(
                    &imports,
                    name,
                    entity_type,
                    return_type,
                    source_hash,
                )?;
            } else {
                self.add_type_definition(&imports, name, return_type, source_hash)?;
            }
        }
        Ok(())
    }

    /// Second pass to resolve all field definitions
    pub fn resolve(self) -> DiagnosticsResult<(Vec<StrongObjectIr>, Vec<TerseRelayResolverIr>)> {
        let mut errors = vec![];
        let mut fields = vec![];
        for (key, field) in self.unresolved_field_definitions {
            if let Some(object) = self.type_definitions.get(&key) {
                let field_definition = FieldDefinition {
                    name: string_key_to_identifier(field.field_name),
                    type_: return_type_to_type_annotation(field.return_type),
                    arguments: None,
                    directives: vec![],
                    description: None,
                    hack_source: None,
                    span: field.field_name.location.span(),
                };
                fields.push(TerseRelayResolverIr {
                    field: field_definition,
                    type_: object
                        .type_name
                        .name_with_location(SourceLocationKey::Generated),
                    root_fragment: None,
                    location: field.field_name.location,
                    deprecated: None,
                    live: None,
                    fragment_arguments: None,
                    source_hash: field.source_hash,
                    semantic_non_null: None,
                });
            } else {
                errors.push(Diagnostic::error(
                    SchemaGenerationError::ModuleNotFound {
                        export_name: key.export_name,
                        module_name: key.module_name,
                    },
                    field.field_name.location,
                ))
            }
        }
        if errors.is_empty() {
            Ok((self.type_definitions.into_values().collect(), fields))
        } else {
            Err(errors)
        }
    }

    fn add_unresolved_field_definition(
        &mut self,
        imports: &FxHashMap<StringKey, ModuleResolutionKey>,
        field_name: WithLocation<StringKey>,
        entity_type: FlowType,
        return_type: FlowType,
        source_hash: ResolverSourceHash,
    ) -> DiagnosticsResult<()> {
        let entity_name = match entity_type {
            FlowType::NamedType(named_type) => named_type.identifier,
            _ => {
                return Err(vec![Diagnostic::error(
                    SchemaGenerationError::GenericNotSupported,
                    entity_type.location(),
                )]);
            }
        };

        let key: &ModuleResolutionKey = imports.get(&entity_name.item).ok_or_else(|| {
            Diagnostic::error(
                SchemaGenerationError::ExpectedFlowImportForType {
                    name: entity_name.item,
                },
                entity_name.location,
            )
        })?;

        self.unresolved_field_definitions.push((
            key.clone(),
            UnresolvedFieldDefinition {
                field_name,
                return_type,
                source_hash,
            },
        ));

        Ok(())
    }

    fn add_type_definition(
        &mut self,
        imports: &FxHashMap<StringKey, ModuleResolutionKey>,
        name: WithLocation<StringKey>,
        return_type: FlowType,
        source_hash: ResolverSourceHash,
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
            live: None,
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
                let key = imports.get(&name).ok_or_else(|| {
                    Diagnostic::error(
                        SchemaGenerationError::ExpectedFlowImportForType { name },
                        type_.identifier.location,
                    )
                })?;
                self.type_definitions.insert(key.clone(), strong_object);
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
        }
    }

    fn extract_graphql_types(&self, node: &Node<'_>) -> DiagnosticsResult<FieldData> {
        if let Node::ExportNamedDeclaration(node) = node {
            if let Some(Declaration::FunctionDeclaration(ref node)) = node.declaration {
                return self.extract_function(&node.function);
            }
        }
        todo!("Error for other types");
    }
}

impl SchemaExtractor for RelayResolverExtractor {
    fn to_location<T: Range>(&self, node: &T) -> Location {
        to_location(self.current_location, node)
    }
}

struct ImportsVisitor {
    imports: FxHashMap<StringKey, ModuleResolutionKey>,
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
    fn get_imports(self) -> DiagnosticsResult<FxHashMap<StringKey, ModuleResolutionKey>> {
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(self.imports)
        }
    }
}

impl Visitor<'_> for ImportsVisitor {
    fn visit_import_declaration(&mut self, ast: &'_ hermes_estree::ImportDeclaration) {
        let source = match &ast.source {
            _Literal::StringLiteral(node) => (&node.value).intern(),
            _ => {
                self.errors.push(Diagnostic::error(
                    SchemaGenerationError::ExpectedStringLiteralSource,
                    to_location(self.location, &ast.source),
                ));
                return;
            }
        };

        self.imports
            .extend(ast.specifiers.iter().map(|specifier| match specifier {
                ImportDeclarationSpecifier::ImportDefaultSpecifier(node) => (
                    (&node.local.name).intern(),
                    ModuleResolutionKey {
                        export_name: source,
                        module_name: intern!("default"),
                    },
                ),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(node) => (
                    (&node.local.name).intern(),
                    ModuleResolutionKey {
                        export_name: source,
                        module_name: intern!("*"),
                    },
                ),
                ImportDeclarationSpecifier::ImportSpecifier(node) => (
                    (&node.local.name).intern(),
                    ModuleResolutionKey {
                        export_name: source,
                        module_name: (&node.imported.name).intern(),
                    },
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

fn return_type_to_type_annotation(return_type: FlowType) -> TypeAnnotation {
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
            result
        }
        FlowType::PluralType(type_) => {
            let mut result = TypeAnnotation::List(Box::new(ListTypeAnnotation {
                span: type_.location.span(),
                open: generated_token(),
                type_: return_type_to_type_annotation(*type_.inner),
                close: generated_token(),
            }));
            if !type_.optional {
                result = TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                    span: type_.location.span(),
                    type_: result,
                    exclamation: generated_token(),
                }));
            }
            result
        }
        FlowType::GenericType(_) => todo!(),
    }
}

fn generated_token() -> Token {
    Token {
        span: Span::empty(),
        kind: TokenKind::Empty,
    }
}
