/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use std::fmt;
use std::path::Path;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::SourceLocationKey;
use hermes_estree::_Literal;
use hermes_estree::Declaration;
use hermes_estree::ImportDeclarationSpecifier;
use hermes_estree::Visitor;
use rustc_hash::FxHashMap;
use serde::Serialize;

use crate::SchemaGenerationError;
use crate::to_location;
pub type JSModules = FxHashMap<StringKey, ModuleResolutionKey>;
pub struct ImportExportVisitor {
    imports: JSModules,
    exports: JSModules,
    errors: Vec<Diagnostic>,
    location: SourceLocationKey,
    current_module_name: StringKey,
}
pub struct ModuleResolution {
    imports: JSModules,
    exports: JSModules,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug, Hash, Copy, Serialize)]
pub enum JSImportType {
    Default,
    Named(StringKey),
    // Note that namespace imports cannot be used for resolver types. Anything namespace
    // imported should be a "Named" import instead
    Namespace(Location),
}

impl fmt::Display for JSImportType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            JSImportType::Default => write!(f, "default"),
            JSImportType::Namespace(_) => write!(f, "namespace"),
            JSImportType::Named(key) => write!(f, "{key}"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug, Hash)]
pub struct ModuleResolutionKey {
    pub module_name: StringKey,
    pub import_type: JSImportType,
}

impl ImportExportVisitor {
    pub fn new(source_module_path: &str) -> Self {
        Self {
            location: SourceLocationKey::standalone(source_module_path),
            imports: Default::default(),
            exports: Default::default(),
            errors: vec![],
            current_module_name: Path::new(source_module_path)
                .file_stem()
                .unwrap()
                .to_string_lossy()
                .intern(),
        }
    }

    /// Returns a ModuleResolution that can be used to lookup module imports/exports
    pub fn get_module_resolution(
        mut self,
        ast: &'_ hermes_estree::Program,
    ) -> DiagnosticsResult<ModuleResolution> {
        self.visit_program(ast);
        if !self.errors.is_empty() {
            Err(self.errors)
        } else {
            Ok(ModuleResolution {
                imports: self.imports,
                exports: self.exports,
            })
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
                    ModuleResolutionKey {
                        module_name: source,
                        import_type: JSImportType::Default,
                    },
                ),
                ImportDeclarationSpecifier::ImportSpecifier(node) => (
                    (&node.local.name).intern(),
                    ModuleResolutionKey {
                        module_name: source,
                        import_type: JSImportType::Named((&node.imported.name).intern()),
                    },
                ),
                ImportDeclarationSpecifier::ImportNamespaceSpecifier(node) => (
                    (&node.local.name).intern(),
                    ModuleResolutionKey {
                        module_name: source,
                        import_type: JSImportType::Namespace(to_location(
                            self.location,
                            &node.local,
                        )),
                    },
                ),
            }));
    }

    fn visit_export_named_declaration(&mut self, ast: &'_ hermes_estree::ExportNamedDeclaration) {
        let maybe_name = ast.declaration.as_ref().and_then(|decl| match decl {
            Declaration::TypeAlias(node) => Some((&node.id.name).intern()),
            Declaration::OpaqueType(node) => Some((&node.id.name).intern()),
            _ => None,
        });
        if let Some(name) = maybe_name {
            self.exports.insert(
                name,
                ModuleResolutionKey {
                    module_name: self.current_module_name,
                    import_type: JSImportType::Named(name),
                },
            );
        }
    }
}

impl ModuleResolution {
    pub fn get(&self, name: StringKey) -> Option<&ModuleResolutionKey> {
        self.imports.get(&name).or_else(|| self.exports.get(&name))
    }
}
