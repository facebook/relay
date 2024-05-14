/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use common::Span;
use hermes_estree::ImportDeclarationSpecifier;
use hermes_estree::Range;
use hermes_estree::Visitor;
use hermes_estree::_Literal;
use rustc_hash::FxHashMap;

use crate::JSImportType;
use crate::ModuleResolutionKey;
use crate::SchemaGenerationError;

pub struct ImportsVisitor {
    imports: FxHashMap<StringKey, (ModuleResolutionKey, Location)>,
    errors: Vec<Diagnostic>,
    location: SourceLocationKey,
}

impl ImportsVisitor {
    pub fn new(location: SourceLocationKey) -> Self {
        Self {
            location,
            imports: Default::default(),
            errors: vec![],
        }
    }

    /// Returns a map of name => module key
    pub fn get_imports(
        mut self,
        ast: &'_ hermes_estree::Program,
    ) -> DiagnosticsResult<FxHashMap<StringKey, (ModuleResolutionKey, Location)>> {
        self.visit_program(ast);
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(self.imports)
        }
    }

    fn to_location<T: Range>(&self, node: &T) -> Location {
        let range = node.range();
        Location::new(self.location, Span::new(range.start, range.end.into()))
    }
}

impl Visitor<'_> for ImportsVisitor {
    fn visit_import_declaration(&mut self, ast: &'_ hermes_estree::ImportDeclaration) {
        let location = self.to_location(&ast.source);
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
        for specifier in ast.specifiers.iter() {
            match specifier {
                ImportDeclarationSpecifier::ImportDefaultSpecifier(node) => {
                    self.imports.insert(
                        (&node.local.name).intern(),
                        (
                            ModuleResolutionKey {
                                module_name: source,
                                import_type: JSImportType::Default,
                            },
                            self.to_location(&node.local),
                        ),
                    );
                }
                ImportDeclarationSpecifier::ImportSpecifier(node) => {
                    self.imports.insert(
                        (&node.local.name).intern(),
                        (
                            ModuleResolutionKey {
                                module_name: source,
                                import_type: JSImportType::Named((&node.imported.name).intern()),
                            },
                            self.to_location(&node.local),
                        ),
                    );
                }
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(node) => {
                    self.imports.insert(
                        (&node.local.name).intern(),
                        (
                            ModuleResolutionKey {
                                module_name: source,
                                import_type: JSImportType::Namespace,
                            },
                            self.to_location(&node.local),
                        ),
                    );
                }
            }
        }
    }
}
