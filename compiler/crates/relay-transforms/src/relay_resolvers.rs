/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ClientEdgeMetadata;
use crate::DependencyMap;
use crate::FragmentAliasMetadata;
use crate::RequiredMetadataDirective;
use crate::CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME;
use crate::REQUIRED_DIRECTIVE_NAME;

use super::ValidationMessage;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::associated_data_impl;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::Field as IrField;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::Visitor;
use graphql_syntax::BooleanNode;
use graphql_syntax::ConstantValue;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;
use schema::ArgumentValue;
use schema::Field;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use std::mem;
use std::sync::Arc;

pub fn relay_resolvers(program: &Program, enabled: bool) -> DiagnosticsResult<Program> {
    let transformed_fields_program = relay_resolvers_fields_transform(program, enabled)?;
    relay_resolvers_spread_transform(&transformed_fields_program)
}

lazy_static! {
    pub static ref RELAY_RESOLVER_DIRECTIVE_NAME: StringKey = "relay_resolver".intern();
    pub static ref RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME: StringKey = "fragment_name".intern();
    pub static ref RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME: StringKey = "import_path".intern();
    pub static ref RELAY_RESOLVER_LIVE_ARGUMENT_NAME: StringKey = "live".intern();
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct RelayResolverFieldMetadata {
    field_parent_type: StringKey,
    import_path: StringKey,
    fragment_name: Option<StringKey>,
    field_path: StringKey,
    live: bool,
}
associated_data_impl!(RelayResolverFieldMetadata);

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayResolverMetadata {
    pub field_parent_type: StringKey,
    pub import_path: StringKey,
    pub field_name: StringKey,
    pub field_alias: Option<StringKey>,
    pub field_path: StringKey,
    pub field_arguments: Vec<Argument>,
    pub live: bool,
}
associated_data_impl!(RelayResolverMetadata);

/// Convert fields with Relay Resolver metadata attached to them into fragment spreads.
fn relay_resolvers_spread_transform(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverSpreadTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverSpreadTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> RelayResolverSpreadTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }

    fn transformed_field(&self, field: &impl IrField) -> Option<Selection> {
        RelayResolverFieldMetadata::find(field.directives()).map(|field_metadata| {
            let fragment_definition = field_metadata.fragment_name.map(|fragment_name| {
                self.program
                    .fragment(fragment_name)
                    .expect("Previous validation passes ensured this exists.")
            });

            let (fragment_arguments, field_arguments) = field
                .arguments()
                .iter()
                .map(|arg| arg.clone())
                .partition(|arg| {
                    if let Some(fragment_definition) = fragment_definition {
                        fragment_definition
                            .variable_definitions
                            .named(arg.name.item)
                            .is_some()
                    } else {
                        false
                    }
                });

            let resolver_metadata = RelayResolverMetadata {
                field_parent_type: field_metadata.field_parent_type,
                import_path: field_metadata.import_path,
                field_name: self.program.schema.field(field.definition().item).name.item,
                field_alias: field.alias().map(|alias| alias.item),
                field_path: field_metadata.field_path,
                field_arguments,
                live: field_metadata.live,
            };

            let mut new_directives: Vec<Directive> = vec![resolver_metadata.into()];

            for directive in field.directives() {
                if directive.name.item != RelayResolverFieldMetadata::directive_name() {
                    new_directives.push(directive.clone())
                }
            }
            if let Some(fragment_definition) = fragment_definition {
                Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: fragment_definition.name,
                    arguments: fragment_arguments,
                    directives: new_directives,
                }))
            } else {
                Selection::ScalarField(Arc::new(ScalarField {
                    alias: None,
                    definition: WithLocation::generated(self.program.schema.clientid_field()),
                    arguments: vec![],
                    directives: new_directives,
                }))
            }
        })
    }
}

impl<'program> Transformer for RelayResolverSpreadTransform<'program> {
    const NAME: &'static str = "RelayResolversSpreadTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => Transformed::Keep,
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        match self.transformed_field(field) {
            Some(selection) => Transformed::Replace(selection),
            None => self.default_transform_linked_field(field),
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(&client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let selections_field = match client_edge_metadata.selections {
                    Selection::LinkedField(linked_field) => self
                        .default_transform_linked_field(linked_field)
                        .unwrap_or_else(|| {
                            Selection::LinkedField(
                                #[allow(clippy::clone_on_ref_ptr)]
                                linked_field.clone(),
                            )
                        }),
                    _ => panic!(
                        "Expected the Client Edges transform to always make the second selection the linked field."
                    ),
                };

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}

/// Attach metadata directives to Relay Resolver fields.
fn relay_resolvers_fields_transform(
    program: &Program,
    enabled: bool,
) -> DiagnosticsResult<Program> {
    let mut transform = RelayResolverFieldTransform::new(program, enabled);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct RelayResolverFieldTransform<'program> {
    enabled: bool,
    program: &'program Program,
    errors: Vec<Diagnostic>,
    path: Vec<&'program str>,
}

impl<'program> RelayResolverFieldTransform<'program> {
    fn new(program: &'program Program, enabled: bool) -> Self {
        Self {
            program,
            enabled,
            errors: Default::default(),
            path: Vec::new(),
        }
    }

    fn extract_resolver_field_directives(
        &mut self,
        field: &impl IrField,
    ) -> Option<Vec<Directive>> {
        let field_type = self.program.schema.field(field.definition().item);

        get_resolver_info(field_type, field.definition().location).and_then(|info| {
            if !self.enabled {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::RelayResolversDisabled {},
                    field.alias_or_name_location(),
                ));
                return None;
            }
            match info {
                Ok(ResolverInfo {
                    fragment_name,
                    import_path,
                    live,
                }) => {
                    let mut non_required_directives =
                        field.directives().iter().filter(|directive| {
                            // For now, only @required and @waterfall are allowed on Resolver fields.
                            directive.name.item != RequiredMetadataDirective::directive_name()
                                && directive.name.item != *REQUIRED_DIRECTIVE_NAME
                                && directive.name.item != *CLIENT_EDGE_WATERFALL_DIRECTIVE_NAME
                        });
                    if let Some(directive) = non_required_directives.next() {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::RelayResolverUnexpectedDirective {},
                            directive.name.location,
                        ));
                    }
                    if let Some(fragment_name) = fragment_name {
                        if self.program.fragment(fragment_name).is_none() {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::InvalidRelayResolverFragmentName {
                                    fragment_name,
                                },
                                // We don't have locations for directives in schema files.
                                // So we send them to the field name, rather than the directive value.
                                field_type.name.location,
                            ));
                            return None;
                        }
                    }
                    let parent_type = field_type.parent_type.unwrap();

                    let resolver_field_metadata = RelayResolverFieldMetadata {
                        import_path,
                        field_parent_type: self.program.schema.get_type_name(parent_type),
                        fragment_name,
                        field_path: self.path.join(".").intern(),
                        live,
                    };

                    let mut directives: Vec<Directive> = field.directives().to_vec();

                    directives.push(resolver_field_metadata.into());
                    Some(directives)
                }
                Err(diagnostics) => {
                    for diagnostic in diagnostics {
                        self.errors.push(diagnostic);
                    }
                    None
                }
            }
        })
    }
}

impl Transformer for RelayResolverFieldTransform<'_> {
    const NAME: &'static str = "RelayResolversFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let transformed =
            self.extract_resolver_field_directives(field)
                .map_or(Transformed::Keep, |directives| {
                    Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                        directives,
                        ..field.clone()
                    })))
                });

        self.path.pop();
        transformed
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let transformed = self.extract_resolver_field_directives(field).map_or_else(
            || self.default_transform_linked_field(field),
            |directives| {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    directives,
                    ..field.clone()
                })))
            },
        );
        self.path.pop();
        transformed
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &graphql_ir::InlineFragment,
    ) -> Transformed<Selection> {
        let maybe_alias =
            FragmentAliasMetadata::find(&fragment.directives).map(|metadata| metadata.alias.item);

        if let Some(alias) = maybe_alias {
            self.path.push(alias.lookup())
        }

        let transformed = match ClientEdgeMetadata::find(fragment) {
            Some(client_edge_metadata) => {
                let backing_id_field = self
                    .transform_selection(&client_edge_metadata.backing_field)
                    .unwrap_or_else(|| client_edge_metadata.backing_field.clone());

                let selections_field = match client_edge_metadata.selections {
                    Selection::LinkedField(linked_field) => self
                        .default_transform_linked_field(linked_field)
                        .unwrap_or_else(|| {
                            Selection::LinkedField(
                                #[allow(clippy::clone_on_ref_ptr)]
                                linked_field.clone(),
                            )
                        }),
                    _ => panic!(
                        "Expected the Client Edges transform to always make the second selection the linked field."
                    ),
                };

                let selections = vec![backing_id_field, selections_field];

                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    selections,
                    ..fragment.clone()
                })))
            }
            None => self.default_transform_inline_fragment(fragment),
        };

        if maybe_alias.is_some() {
            self.path.pop();
        }

        transformed
    }
}

struct ResolverInfo {
    fragment_name: Option<StringKey>,
    import_path: StringKey,
    live: bool,
}

fn get_resolver_info(
    field_type: &Field,
    error_location: Location,
) -> Option<DiagnosticsResult<ResolverInfo>> {
    if !field_type.is_extension {
        return None;
    }
    field_type
        .directives
        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
        .map(|directive| {
            let arguments = &directive.arguments;
            let fragment_name = get_argument_value(
                arguments,
                *RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME,
                error_location,
            )
            .ok();
            let import_path = get_argument_value(
                arguments,
                *RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME,
                error_location,
            )?;
            let live = get_bool_argument_is_true(arguments, *RELAY_RESOLVER_LIVE_ARGUMENT_NAME);

            Ok(ResolverInfo {
                fragment_name,
                import_path,
                live,
            })
        })
}

pub(crate) fn get_argument_value(
    arguments: &[ArgumentValue],
    argument_name: StringKey,
    error_location: Location,
) -> DiagnosticsResult<StringKey> {
    match arguments.named(argument_name) {
        Some(argument) => {
            match argument.value.get_string_literal() {
                Some(import_path) => Ok(import_path),
                None => {
                    // This is a validation error, but ideally it would be done when we validate the client schema.
                    Err(vec![Diagnostic::error(
                        ValidationMessage::InvalidRelayResolverKeyArg { key: argument_name },
                        error_location,
                    )])
                }
            }
        }
        None => {
            // Should we expect schema validation to catch this for required fields?
            Err(vec![Diagnostic::error(
                ValidationMessage::MissingRelayResolverKeyArg { key: argument_name },
                error_location,
            )])
        }
    }
}

fn get_bool_argument_is_true(arguments: &[ArgumentValue], argument_name: StringKey) -> bool {
    match arguments.named(argument_name) {
        Some(ArgumentValue {
            value: ConstantValue::Boolean(BooleanNode { value, .. }),
            ..
        }) => *value,
        None => false,
        // These schema extensions are generated by our compiler. If they are malformed, it indicates a bug in
        // relay-docblock.
        _ => panic!(
            "Expected the `live` argument in a @relay_resolver schema directive to be either omitted or a static boolean."
        ),
    }
}

pub fn find_resolver_dependencies(dependencies: &mut DependencyMap, program: &Program) {
    let mut finder = ResolverFieldFinder::new(dependencies, &program.schema);
    finder.visit_program(program);
}

pub struct ResolverFieldFinder<'a> {
    dependencies: &'a mut DependencyMap,
    schema: &'a SDLSchema,
    seen_resolver_fragments: StringKeySet,
}

impl<'a> ResolverFieldFinder<'a> {
    pub fn new(dependencies: &'a mut DependencyMap, schema: &'a SDLSchema) -> Self {
        Self {
            dependencies,
            schema,
            seen_resolver_fragments: Default::default(),
        }
    }

    fn record_definition_dependencies(&mut self, name: StringKey) {
        if self.seen_resolver_fragments.is_empty() {
            self.dependencies.remove(&name);
        } else {
            self.dependencies
                .insert(name, mem::take(&mut self.seen_resolver_fragments));
        }
    }

    fn check_for_resolver_dependencies(&mut self, field_id: FieldID) {
        let field_type = self.schema.field(field_id);

        // Find the backing resolver fragment, if any. Ignore any malformed resolver field definitions.
        let maybe_fragment_name = field_type
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .and_then(|resolver_directive| {
                resolver_directive
                    .arguments
                    .named(*RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME)
            })
            .and_then(|arg| arg.value.get_string_literal());

        if let Some(fragment_name) = maybe_fragment_name {
            self.seen_resolver_fragments.insert(fragment_name);
        }
    }
}

impl<'a> Visitor for ResolverFieldFinder<'a> {
    const NAME: &'static str = "ResolverFieldFinder";

    const VISIT_ARGUMENTS: bool = false;

    const VISIT_DIRECTIVES: bool = false;

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        assert!(
            self.seen_resolver_fragments.is_empty(),
            "should have been cleared by record_definition_dependencies"
        );
        self.default_visit_fragment(fragment);
        self.record_definition_dependencies(fragment.name.item);
    }

    fn visit_operation(&mut self, operation: &OperationDefinition) {
        assert!(
            self.seen_resolver_fragments.is_empty(),
            "should have been cleared by record_definition_dependencies"
        );
        self.default_visit_operation(operation);
        self.record_definition_dependencies(operation.name.item);
    }

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        self.check_for_resolver_dependencies(field.definition.item)
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        self.check_for_resolver_dependencies(field.definition.item);
        self.default_visit_linked_field(field)
    }
}
