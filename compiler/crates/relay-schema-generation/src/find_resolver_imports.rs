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
use hermes_estree::ImportDeclarationSpecifier;
use hermes_estree::Visitor;
use hermes_estree::_Literal;
use rustc_hash::FxHashMap;
use rustc_hash::FxHashSet;

use crate::to_location;
use crate::JSImportType;
use crate::ModuleResolutionKey;
use crate::SchemaGenerationError;
pub type Imports = FxHashMap<StringKey, (ModuleResolutionKey, Location)>;
pub struct ImportExportVisitor {
    imports: Imports,
    exports: FxHashSet<StringKey>,
    errors: Vec<Diagnostic>,
    location: SourceLocationKey,
}

impl ImportExportVisitor {
    pub fn new(location: SourceLocationKey) -> Self {
        Self {
            location,
            imports: Default::default(),
            exports: Default::default(),
            errors: vec![],
        }
    }

    /// Returns imports: a map of local name => module key, and exports: names
    pub fn get_all(
        mut self,
        ast: &'_ hermes_estree::Program,
    ) -> DiagnosticsResult<(Imports, FxHashSet<StringKey>)> {
        self.visit_program(&ast);
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok((self.imports, self.exports))
        }
    }
}

impl Visitor<'_> for ImportExportVisitor {
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

    fn visit_export_named_declaration(&mut self, ast: &'_ hermes_estree::ExportNamedDeclaration) {
        if let Some(hermes_estree::Declaration::TypeAlias(node)) = &ast.declaration {
            let name = (&node.id.name).intern();
            self.exports.insert(name);
        }
    }
}
