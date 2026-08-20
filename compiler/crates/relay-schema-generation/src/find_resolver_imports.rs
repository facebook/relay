/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use std::convert::Infallible;
use std::fmt;
use std::path::Path;

use ::intern::string_key::Intern;
use ::intern::string_key::StringKey;
use common::Location;
use flow_parser::ast;
use flow_parser::ast::statement::StatementInner;
use flow_parser::ast::statement::import_declaration::Specifier;
use flow_parser::ast_visitor::AstVisitor;
use flow_parser::loc::Loc;
use rustc_hash::FxHashMap;
use schema_extractor::LocationResolver;
use serde::Serialize;

pub type JSModules = FxHashMap<StringKey, ModuleResolutionKey>;
pub struct ImportExportVisitor {
    imports: JSModules,
    exports: JSModules,
    locations: LocationResolver,
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
    pub fn new(locations: LocationResolver, source_module_path: &str) -> Self {
        Self {
            locations,
            imports: Default::default(),
            exports: Default::default(),
            current_module_name: Path::new(source_module_path)
                .file_stem()
                .unwrap()
                .to_string_lossy()
                .intern(),
        }
    }

    /// Returns a ModuleResolution that can be used to lookup module imports/exports
    pub fn get_module_resolution(mut self, ast: &'_ ast::Program<Loc, Loc>) -> ModuleResolution {
        self.program(ast).unwrap_or_else(|never| match never {});
        ModuleResolution {
            imports: self.imports,
            exports: self.exports,
        }
    }
}

impl<'a> AstVisitor<'a, Loc, Loc, &'a Loc, Infallible> for ImportExportVisitor {
    fn normalize_loc(loc: &'a Loc) -> &'a Loc {
        loc
    }

    fn normalize_type(type_: &'a Loc) -> &'a Loc {
        type_
    }

    fn import_declaration(
        &mut self,
        _loc: &'a Loc,
        ast: &'a ast::statement::ImportDeclaration<Loc, Loc>,
    ) -> Result<(), Infallible> {
        let source = ast.source.1.value.as_str().intern();

        if let Some(default) = &ast.default {
            self.imports.insert(
                default.identifier.name.as_str().intern(),
                ModuleResolutionKey {
                    module_name: source,
                    import_type: JSImportType::Default,
                },
            );
        }

        match &ast.specifiers {
            Some(Specifier::ImportNamedSpecifiers(specifiers)) => {
                self.imports.extend(specifiers.iter().map(|specifier| {
                    let local = specifier.local.as_ref().unwrap_or(&specifier.remote);
                    (
                        local.name.as_str().intern(),
                        ModuleResolutionKey {
                            module_name: source,
                            import_type: JSImportType::Named(
                                specifier.remote.name.as_str().intern(),
                            ),
                        },
                    )
                }));
            }
            Some(Specifier::ImportNamespaceSpecifier((_, local))) => {
                self.imports.insert(
                    local.name.as_str().intern(),
                    ModuleResolutionKey {
                        module_name: source,
                        import_type: JSImportType::Namespace(
                            self.locations.to_location(&local.loc),
                        ),
                    },
                );
            }
            None => {}
        }

        Ok(())
    }

    fn export_named_declaration(
        &mut self,
        _loc: &'a Loc,
        ast: &'a ast::statement::ExportNamedDeclaration<Loc, Loc>,
    ) -> Result<(), Infallible> {
        let maybe_name = ast.declaration.as_ref().and_then(|decl| match &**decl {
            StatementInner::TypeAlias { inner, .. } => Some(inner.id.name.as_str().intern()),
            StatementInner::OpaqueType { inner, .. } => Some(inner.id.name.as_str().intern()),
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
        Ok(())
    }
}

impl ModuleResolution {
    pub fn get(&self, name: StringKey) -> Option<&ModuleResolutionKey> {
        self.imports.get(&name).or_else(|| self.exports.get(&name))
    }
}
