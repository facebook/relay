/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::DependencyMap;

use super::ValidationMessage;
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use fnv::FnvHashSet;
use graphql_ir::{
    associated_data_impl, FragmentDefinition, FragmentSpread, OperationDefinition, Program,
    ScalarField, Selection, Transformed, Transformer, Visitor,
};
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use schema::{ArgumentValue, Field, SDLSchema, Schema};
use std::{mem, sync::Arc};

pub fn relay_resolvers(program: &Program, enabled: bool) -> DiagnosticsResult<Program> {
    let transformed_fields_program = relay_resolvers_fields_transform(program, enabled)?;
    relay_resolvers_spread_transform(&transformed_fields_program)
}

lazy_static! {
    pub static ref RELAY_RESOLVER_DIRECTIVE_NAME: StringKey = "relay_resolver".intern();
    pub static ref RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME: StringKey = "fragment_name".intern();
    pub static ref RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME: StringKey = "import_path".intern();
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
struct RelayResolverFieldMetadata {
    field_parent_type: StringKey,
    import_path: StringKey,
    fragment_name: StringKey,
}
associated_data_impl!(RelayResolverFieldMetadata);

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayResolverSpreadMetadata {
    pub field_parent_type: StringKey,
    pub import_path: StringKey,
    pub field_name: StringKey,
    pub field_alias: Option<StringKey>,
}
associated_data_impl!(RelayResolverSpreadMetadata);

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
}

impl<'program> Transformer for RelayResolverSpreadTransform<'program> {
    const NAME: &'static str = "RelayResolversSpreadTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        if let Some(field_metadata) = RelayResolverFieldMetadata::find(&field.directives) {
            let spread_metadata = RelayResolverSpreadMetadata {
                field_parent_type: field_metadata.field_parent_type,
                import_path: field_metadata.import_path,
                field_name: self.program.schema.field(field.definition.item).name,
                field_alias: field.alias.map(|alias| alias.item),
            };
            Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                fragment: WithLocation::generated(field_metadata.fragment_name),
                directives: vec![spread_metadata.into()],
                arguments: vec![],
            })))
        } else {
            Transformed::Keep
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
}

impl<'program> RelayResolverFieldTransform<'program> {
    fn new(program: &'program Program, enabled: bool) -> Self {
        Self {
            program,
            enabled,
            errors: Default::default(),
        }
    }
}

impl Transformer for RelayResolverFieldTransform<'_> {
    const NAME: &'static str = "RelayResolversFieldTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let field_type = self.program.schema.field(field.definition.item);
        match get_resolver_info(field_type, field.definition.location) {
            Some(info) => {
                if !self.enabled {
                    self.errors.push(Diagnostic::error(
                        ValidationMessage::RelayResolversDisabled {},
                        field.alias_or_name_location(),
                    ));
                    return Transformed::Keep;
                }
                match info {
                    Ok((fragment_name, import_path)) => {
                        if let Some(directive) = field.directives.first() {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::RelayResolverUnexpectedDirective {},
                                directive.name.location,
                            ));
                        }
                        if self.program.fragment(fragment_name).is_none() {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::InvalidRelayResolverFragmentName {
                                    fragment_name,
                                },
                                // We don't have locations for schema files.
                                field.definition.location,
                            ));
                            return Transformed::Keep;
                        }
                        let parent_type = field_type.parent_type.unwrap();
                        let resolver_field_metadata = RelayResolverFieldMetadata {
                            import_path,
                            field_parent_type: self.program.schema.get_type_name(parent_type),
                            fragment_name,
                        };
                        Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                            // Note that we've checked above that the field had no pre-existing directives.
                            directives: vec![resolver_field_metadata.into()],
                            ..field.clone()
                        })))
                    }
                    Err(diagnostics) => {
                        for diagnostic in diagnostics {
                            self.errors.push(diagnostic);
                        }
                        Transformed::Keep
                    }
                }
            }
            None => Transformed::Keep,
        }
    }
}

fn get_resolver_info(
    field_type: &Field,
    error_location: Location,
) -> Option<DiagnosticsResult<(StringKey, StringKey)>> {
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
            )?;
            let import_path = get_argument_value(
                arguments,
                *RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME,
                error_location,
            )?;

            Ok((fragment_name, import_path))
        })
}

fn get_argument_value(
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

pub fn find_resolver_dependencies(dependencies: &mut DependencyMap, program: &Program) {
    let mut finder = ResolverFieldFinder::new(dependencies, &program.schema);
    finder.visit_program(program);
}

pub struct ResolverFieldFinder<'a> {
    dependencies: &'a mut DependencyMap,
    schema: &'a SDLSchema,
    seen_resolver_fragments: FnvHashSet<StringKey>,
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

    // For now, all Resolver fields are scalar.
    fn visit_scalar_field(&mut self, field: &ScalarField) {
        let field_type = self.schema.field(field.definition.item);

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
