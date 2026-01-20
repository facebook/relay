/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! Utilities for providing the rename feature

use std::collections::HashMap;
use std::path::Path;

use common::DirectiveName;
use common::Location as IRLocation;
use common::NamedItem;
use common::Span;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Visitor;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::OperationDefinition;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use lsp_types::PrepareRenameResponse;
use lsp_types::TextEdit;
use lsp_types::Url;
use lsp_types::WorkspaceEdit;
use lsp_types::request::PrepareRenameRequest;
use lsp_types::request::Rename;
use lsp_types::request::Request;
use rayon::prelude::IntoParallelRefIterator;
use rayon::prelude::ParallelIterator;
use resolution_path::ArgumentParent;
use resolution_path::ArgumentPath;
use resolution_path::DirectiveParent;
use resolution_path::DirectivePath;
use resolution_path::FragmentDefinitionPath;
use resolution_path::FragmentSpreadPath;
use resolution_path::IdentParent;
use resolution_path::IdentPath;
use resolution_path::OperationDefinitionPath;
use resolution_path::ResolutionPath;
use resolution_path::ResolvePosition;
use resolution_path::VariableDefinitionListParent;
use resolution_path::VariableDefinitionListPath;
use resolution_path::VariableDefinitionPath;
use resolution_path::VariableIdentifierParent;
use resolution_path::VariableIdentifierPath;

use crate::Feature;
use crate::GlobalState;
use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;
use crate::location::transform_relay_location_on_disk_to_lsp_location;

lazy_static! {
    static ref ARGUMENTS_DIRECTIVE: StringKey = "arguments".intern();
    static ref ARGUMENTDEFINITIONS_DIRECTIVE: StringKey = "argumentDefinitions".intern();
}

/// Resolve a [`Rename`] request to workspace edits
pub fn on_rename(
    state: &impl GlobalState,
    params: <Rename as Request>::Params,
) -> LSPRuntimeResult<<Rename as Request>::Result> {
    let uri = &params.text_document_position.text_document.uri;
    let (feature, location) = state.extract_feature_from_text(&params.text_document_position, 1)?;

    let program = &state.get_program(&state.extract_project_name_from_url(uri)?)?;
    let root_dir = &state.root_dir();

    let rename_request = create_rename_request(feature, location)?;
    let locations_to_rename = get_locations_for_rename(rename_request, program)?;
    let changes = map_locations_to_text_edits(locations_to_rename, params.new_name, root_dir);

    Ok(Some(WorkspaceEdit {
        changes: Some(changes),
        ..Default::default()
    }))
}

/// Resolve a [`PrepareRenameRequest`] to a [`PrepareRenameResponse`]
pub fn on_prepare_rename(
    state: &impl GlobalState,
    params: <PrepareRenameRequest as Request>::Params,
) -> LSPRuntimeResult<<PrepareRenameRequest as Request>::Result> {
    let root_dir = &state.root_dir();
    let (feature, location) = state.extract_feature_from_text(&params, 1)?;

    let rename_request = create_rename_request(feature, location)?;
    let lsp_location =
        transform_relay_location_on_disk_to_lsp_location(root_dir, rename_request.location)?;

    Ok(Some(PrepareRenameResponse::Range(lsp_location.range)))
}

#[derive(Debug, Clone)]
enum RenameKind {
    OperationDefinition,
    FragmentDefinitionOrSpread {
        fragment_name: StringKey,
    },
    OperationVariable {
        variable_name: StringKey,
        operation_name: StringKey,
    },
    FragmentArgument {
        fragment_name: StringKey,
        argument_name: StringKey,
    },
}

#[derive(Debug)]
pub struct RenameRequest {
    /// The type of rename request
    kind: RenameKind,
    /// The location the rename request was made at
    location: IRLocation,
}

impl RenameRequest {
    fn new(kind: RenameKind, location: IRLocation) -> Self {
        Self { kind, location }
    }
}

pub fn create_rename_request(
    feature: Feature,
    location: IRLocation,
) -> LSPRuntimeResult<RenameRequest> {
    match feature {
        Feature::ExecutableDocument(document) => {
            let mut doc_definition: Option<&ExecutableDefinition> = None;

            for definition in &document.definitions {
                if definition.contains(location.span()) {
                    doc_definition = Some(definition);
                    break;
                }
            }

            let node_path = document.resolve((), location.span());

            match node_path {
                ResolutionPath::VariableIdentifier(VariableIdentifierPath {
                    inner: variable,
                    parent,
                    ..
                }) => {
                    let span_without_dollar = Span::new(variable.span.start + 1, variable.span.end);
                    let location = IRLocation::new(location.source_location(), span_without_dollar);

                    match parent {
                        VariableIdentifierParent::VariableDefinition(VariableDefinitionPath {
                            inner: _,
                            parent:
                                VariableDefinitionListPath {
                                    inner: _,
                                    parent: variable_list_parent,
                                },
                        }) => match variable_list_parent {
                            VariableDefinitionListParent::FragmentDefinition(
                                FragmentDefinitionPath {
                                    inner: fragment_definition,
                                    parent: _,
                                },
                            ) => Ok(RenameRequest::new(
                                RenameKind::FragmentArgument {
                                    fragment_name: fragment_definition.name.value,
                                    argument_name: variable.name,
                                },
                                location,
                            )),
                            VariableDefinitionListParent::OperationDefinition(
                                OperationDefinitionPath {
                                    inner:
                                        OperationDefinition {
                                            name: Some(operation_name),
                                            ..
                                        },
                                    parent: _,
                                },
                            ) => Ok(RenameRequest::new(
                                RenameKind::OperationVariable {
                                    variable_name: variable.name,
                                    operation_name: operation_name.value,
                                },
                                location,
                            )),
                            _ => Err(LSPRuntimeError::ExpectedError),
                        },
                        VariableIdentifierParent::Value(_) => {
                            let executable_definition =
                                doc_definition.ok_or(LSPRuntimeError::ExpectedError)?;

                            get_rename_kind_for_variable_identifier(
                                variable.name,
                                executable_definition,
                            )
                            .map(|kind| RenameRequest::new(kind, location))
                        }
                    }
                }
                ResolutionPath::Ident(IdentPath {
                    inner: argument_name,
                    parent:
                        IdentParent::ArgumentName(ArgumentPath {
                            parent:
                                ArgumentParent::FragmentSpread(FragmentSpreadPath {
                                    inner: fragment_spread,
                                    ..
                                }),
                            ..
                        }),
                }) => {
                    let location = IRLocation::new(location.source_location(), argument_name.span);
                    let kind = RenameKind::FragmentArgument {
                        fragment_name: fragment_spread.name.value,
                        argument_name: argument_name.value,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: argument_name,
                    parent:
                        IdentParent::ArgumentName(ArgumentPath {
                            parent:
                                ArgumentParent::Directive(DirectivePath {
                                    inner: directive,
                                    parent,
                                    ..
                                }),
                            ..
                        }),
                }) => {
                    let fragment_name = match parent {
                        DirectiveParent::FragmentDefinition(fragment) => {
                            if directive.name.value != *ARGUMENTDEFINITIONS_DIRECTIVE {
                                return Err(LSPRuntimeError::ExpectedError);
                            }

                            Some(fragment.inner.name.value)
                        }
                        DirectiveParent::FragmentSpread(fragment_spread) => {
                            if directive.name.value != *ARGUMENTS_DIRECTIVE {
                                return Err(LSPRuntimeError::ExpectedError);
                            }

                            Some(fragment_spread.inner.name.value)
                        }
                        _ => None,
                    }
                    .ok_or(LSPRuntimeError::ExpectedError)?;

                    let location = IRLocation::new(location.source_location(), argument_name.span);
                    let kind = RenameKind::FragmentArgument {
                        fragment_name,
                        argument_name: argument_name.value,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: fragment_name,
                    parent:
                        IdentParent::FragmentSpreadName(_) | IdentParent::FragmentDefinitionName(_),
                }) => {
                    let location = IRLocation::new(location.source_location(), fragment_name.span);
                    let kind = RenameKind::FragmentDefinitionOrSpread {
                        fragment_name: fragment_name.value,
                    };

                    Ok(RenameRequest::new(kind, location))
                }
                ResolutionPath::Ident(IdentPath {
                    inner: operation_name,
                    parent: IdentParent::OperationDefinitionName(_),
                }) => {
                    let location = IRLocation::new(location.source_location(), operation_name.span);

                    Ok(RenameRequest::new(
                        RenameKind::OperationDefinition,
                        location,
                    ))
                }
                _ => Err(LSPRuntimeError::ExpectedError),
            }
        }
        Feature::DocblockIr(_) => Err(LSPRuntimeError::ExpectedError),
        Feature::SchemaDocument(_) => Err(LSPRuntimeError::ExpectedError),
    }
}

pub fn get_locations_for_rename(
    rename_request: RenameRequest,
    program: &Program,
) -> LSPRuntimeResult<Vec<IRLocation>> {
    match rename_request.kind {
        RenameKind::OperationVariable {
            variable_name,
            operation_name,
        } => VariableUsageFinder::get_variable_locations(program, operation_name, variable_name),
        RenameKind::FragmentArgument {
            fragment_name,
            argument_name,
        } => Ok(FragmentArgumentFinder::get_argument_locations(
            program,
            fragment_name,
            argument_name,
        )),
        RenameKind::OperationDefinition => Ok(vec![rename_request.location]),
        RenameKind::FragmentDefinitionOrSpread { fragment_name } => {
            Ok(FragmentFinder::get_fragment_usages(program, fragment_name))
        }
    }
}

fn is_variable_defined_in_variable_definitions(
    fragment_definition: &graphql_syntax::FragmentDefinition,
    variable_name: StringKey,
) -> bool {
    fragment_definition
        .variable_definitions
        .as_ref()
        .is_some_and(|variables| variables.items.iter().any(|v| v.name.name == variable_name))
}

fn is_argument_defined_in_argument_definitions(
    fragment_definition: &graphql_syntax::FragmentDefinition,
    variable_name: StringKey,
) -> bool {
    fragment_definition
        .directives
        .named(*ARGUMENTDEFINITIONS_DIRECTIVE)
        .as_ref()
        .is_some_and(|directive| {
            directive
                .arguments
                .as_ref()
                .is_some_and(|args| args.items.iter().any(|v| v.name.value == variable_name))
        })
}

fn get_rename_kind_for_variable_identifier(
    variable_name: StringKey,
    definition: &ExecutableDefinition,
) -> LSPRuntimeResult<RenameKind> {
    match definition {
        ExecutableDefinition::Fragment(fragment_definition) => {
            if is_variable_defined_in_variable_definitions(fragment_definition, variable_name)
                || is_argument_defined_in_argument_definitions(fragment_definition, variable_name)
            {
                Ok(RenameKind::FragmentArgument {
                    fragment_name: fragment_definition.name.value,
                    argument_name: variable_name,
                })
            } else {
                // The variable not being defined in the fragment definition
                // doesn't mean it's not defined at all. There's also the
                // possibility of it being a global operation variable.
                // For now we just rename the identifier without modifying
                // any other parts.
                Err(LSPRuntimeError::ExpectedError)
            }
        }
        ExecutableDefinition::Operation(operation_definition) => {
            if !operation_definition
                .variable_definitions
                .as_ref()
                .is_some_and(|defs| defs.items.iter().any(|v| v.name.name == variable_name))
            {
                return Err(LSPRuntimeError::UnexpectedError(
                    "Couldn't find variable definition for variable".into(),
                ));
            }

            let operation_name = operation_definition
                .name
                .ok_or(LSPRuntimeError::ExpectedError)?
                .value;

            Ok(RenameKind::OperationVariable {
                variable_name,
                operation_name,
            })
        }
    }
}

fn map_locations_to_text_edits(
    locations: Vec<IRLocation>,
    new_text: String,
    root_dir: &Path,
) -> HashMap<Url, Vec<TextEdit>> {
    let vec_res: Vec<(Url, TextEdit)> = locations
        .par_iter()
        .flat_map(|location| {
            let transformed = transform_relay_location_on_disk_to_lsp_location(root_dir, *location);
            transformed.ok().map(|lsp_location| {
                let text_edit = TextEdit {
                    range: lsp_location.range,
                    new_text: new_text.to_owned(),
                };
                (lsp_location.uri, text_edit)
            })
        })
        .collect();

    let mut changes: HashMap<Url, Vec<TextEdit>> = HashMap::new();
    for (uri, text_edit) in vec_res {
        changes.entry(uri).or_default().push(text_edit);
    }

    changes
}

#[derive(Debug, Clone)]
struct FragmentFinder {
    fragment_locations: Vec<IRLocation>,
    fragment_name: StringKey,
}

impl FragmentFinder {
    pub fn get_fragment_usages(program: &Program, name: StringKey) -> Vec<IRLocation> {
        let mut finder = FragmentFinder {
            fragment_locations: vec![],
            fragment_name: name,
        };
        finder.visit_program(program);
        finder.fragment_locations
    }
}

impl Visitor for FragmentFinder {
    const NAME: &'static str = "FragmentFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if spread.fragment.item.0 == self.fragment_name {
            self.fragment_locations.push(spread.fragment.location);
        }
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        if fragment.name.item.0 == self.fragment_name {
            self.fragment_locations.push(fragment.name.location)
        }

        self.default_visit_fragment(fragment)
    }
}

struct FragmentArgumentFinderScope {
    fragment_name: Option<StringKey>,
}

struct FragmentArgumentFinder {
    argument_locations: Vec<IRLocation>,
    fragment_name: StringKey,
    argument_name: StringKey,
    current_scope: FragmentArgumentFinderScope,
}

impl FragmentArgumentFinder {
    pub fn get_argument_locations(
        program: &Program,
        fragment_name: StringKey,
        argument_name: StringKey,
    ) -> Vec<IRLocation> {
        let mut finder = FragmentArgumentFinder {
            argument_locations: vec![],
            fragment_name,
            argument_name,
            current_scope: FragmentArgumentFinderScope {
                fragment_name: None,
            },
        };

        finder.visit_program(program);
        finder.argument_locations
    }

    fn add_argument_location(&mut self, name_location: common::Location) {
        let location_without_dollar = name_location.with_span(Span {
            start: name_location.span().start + 1,
            end: name_location.span().end,
        });

        self.argument_locations.push(location_without_dollar);
    }
}

impl Visitor for FragmentArgumentFinder {
    const NAME: &'static str = "FragmentArgumentFinder";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        if spread.fragment.item.0 == self.fragment_name {
            spread
                .arguments
                .iter()
                .filter(|a| a.name.item.0 == self.argument_name)
                .for_each(|a| {
                    self.argument_locations.push(a.name.location);
                });
        }

        self.default_visit_fragment_spread(spread);
    }

    fn visit_argument(&mut self, argument: &graphql_ir::Argument) {
        if let Some(fragment_name) = self.current_scope.fragment_name
            && fragment_name == self.fragment_name
            && let graphql_ir::Value::Variable(variable) = &argument.value.item
            && variable.name.item.0 == self.argument_name
        {
            self.add_argument_location(variable.name.location);
        }
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        assert!(self.current_scope.fragment_name.is_none());
        self.current_scope.fragment_name = Some(fragment.name.item.0);

        if fragment.name.item.0 == self.fragment_name {
            let argument_name = self.argument_name;
            let has_argument_definitions_directive = fragment
                .directives
                .named(DirectiveName(*ARGUMENTDEFINITIONS_DIRECTIVE))
                .is_some();

            fragment
                .variable_definitions
                .iter()
                .filter(|v| v.name.item.0 == argument_name)
                .for_each(|v| {
                    if has_argument_definitions_directive {
                        // If the argument was defined in @argumentDefinitions it doesn't start
                        // with a dollar sign, so we add the full name without transformations.
                        self.argument_locations.push(v.name.location);
                    } else {
                        self.add_argument_location(v.name.location)
                    }
                });
        }

        self.default_visit_fragment(fragment);

        self.current_scope.fragment_name = None;
    }

    // This is necessary to visit variable usages within conditionals like @skip.
    fn visit_variable(&mut self, value: &graphql_ir::Variable) {
        if let Some(fragment_name) = self.current_scope.fragment_name
            && fragment_name == self.fragment_name
            && value.name.item.0 == self.argument_name
        {
            self.add_argument_location(value.name.location);
        }
    }
}

struct VariableUsageFinder {
    variable_locations: Vec<IRLocation>,
    variable_name: StringKey,
}

impl VariableUsageFinder {
    pub fn get_variable_locations(
        program: &Program,
        operation_name: StringKey,
        variable_name: StringKey,
    ) -> LSPRuntimeResult<Vec<IRLocation>> {
        let mut finder = VariableUsageFinder {
            variable_locations: vec![],
            variable_name,
        };
        let operation = program
            .operation(OperationDefinitionName(operation_name))
            .ok_or(LSPRuntimeError::ExpectedError)?;

        finder.visit_operation(operation);
        Ok(finder.variable_locations)
    }

    fn add_variable_location(&mut self, name_location: common::Location) {
        let location_without_dollar = name_location.with_span(Span {
            start: name_location.span().start + 1,
            end: name_location.span().end,
        });

        self.variable_locations.push(location_without_dollar);
    }
}

impl Visitor for VariableUsageFinder {
    const NAME: &'static str = "VariableUsageFinder";
    const VISIT_ARGUMENTS: bool = true;
    const VISIT_DIRECTIVES: bool = true;

    fn visit_variable_definition(&mut self, variable_definition: &graphql_ir::VariableDefinition) {
        if variable_definition.name.item.0 == self.variable_name {
            self.add_variable_location(variable_definition.name.location);
        }
    }

    fn visit_variable(&mut self, value: &graphql_ir::Variable) {
        if value.name.item.0 == self.variable_name {
            self.add_variable_location(value.name.location);
        }
    }

    fn visit_fragment_spread(&mut self, spread: &FragmentSpread) {
        self.visit_directives(&spread.directives);
        self.visit_arguments(&spread.arguments);

        // We do not yet visit the fragment spreads,
        // as we're only interested in variable usages
        // within the operation definition at this point.
    }
}
