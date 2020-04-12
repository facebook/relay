/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Location, WithLocation};
use errors::{validate, validate_map};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    Directive, FragmentDefinition, FragmentSpread, LinkedField, Program, ScalarField,
    ValidationError, ValidationMessage, ValidationResult, Validator,
};
use interner::{Intern, StringKey};
use std::iter::FromIterator;

pub fn validate_server_only_directives<'s>(program: &Program<'s>) -> ValidationResult<()> {
    let mut validator = ServerOnlyDirectivesValidation::new(program);
    validator.validate_program(program)
}

#[derive(Default, Clone)]
struct FragmentState {
    client_invalid_directives: Vec<WithLocation<StringKey>>,
    is_client_only: bool,
}

struct ServerOnlyDirectivesValidation<'s> {
    program: &'s Program<'s>,
    current_root_client_selection: Option<Location>,
    current_client_invalid_directives: Vec<WithLocation<StringKey>>,
    // For keeping track of if the current fragment only contains client selections,
    // if so, a server directive is invalid on it
    is_current_fragment_client_only: bool,
    // For storing the above data
    fragment_cache: FnvHashMap<StringKey, FragmentState>,
    client_invalid_directive_names: FnvHashSet<StringKey>,
}

// Validate that @defer, @stream, @stream_connection are not used inside client fields
impl<'s> ServerOnlyDirectivesValidation<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            program,
            current_root_client_selection: None,
            is_current_fragment_client_only: true,
            fragment_cache: Default::default(),
            current_client_invalid_directives: Default::default(),
            client_invalid_directive_names: FnvHashSet::from_iter(vec![
                "stream".intern(),
                "stream_connection".intern(),
                "defer".intern(),
            ]),
        }
    }

    fn validate_visited_fragment(&self, state: &FragmentState) -> ValidationResult<()> {
        if let Some(location) = self.current_root_client_selection {
            return Err(state
                .client_invalid_directives
                .iter()
                .map(|name| {
                    ValidationError::new(
                        ValidationMessage::InvalidServerOnlyDirectiveInClientFields(name.item),
                        vec![name.location, location],
                    )
                })
                .collect());
        }
        Ok(())
    }

    // Traverse into a fragment from the program or a fragment spread
    #[allow(clippy::map_entry)]
    fn validate_fragment_impl(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Result<&FragmentState, Vec<ValidationError>> {
        if self.fragment_cache.contains_key(&fragment.name.item) {
            // The fragment is already visited, check if we are in a client selection
            // and the fragment contains server selections.
            let state = self.fragment_cache.get(&fragment.name.item).unwrap();
            self.validate_visited_fragment(state)?;
            Ok(state)
        } else {
            // Avoid cycle
            self.fragment_cache
                .insert(fragment.name.item, Default::default());
            let parent_root_client_selection = self.current_root_client_selection;
            let parent_client_invalid_directives: Vec<WithLocation<StringKey>> =
                self.current_client_invalid_directives.clone();
            let parent_is_current_fragment_client_only = self.is_current_fragment_client_only;
            // Keep traversing the fragment with the current client selection root or the current client fragment root
            if self.current_root_client_selection.is_none()
                && self
                    .program
                    .schema()
                    .is_extension_type(fragment.type_condition)
            {
                self.current_root_client_selection = Some(fragment.name.location)
            }
            self.current_client_invalid_directives = Default::default();
            self.is_current_fragment_client_only = true;

            // Traverse and cache the result
            self.default_validate_fragment(fragment)?;
            self.fragment_cache.insert(
                fragment.name.item,
                FragmentState {
                    client_invalid_directives: self.current_client_invalid_directives.clone(),
                    is_client_only: self.is_current_fragment_client_only,
                },
            );
            self.current_root_client_selection = parent_root_client_selection;
            self.current_client_invalid_directives = parent_client_invalid_directives;
            self.is_current_fragment_client_only = parent_is_current_fragment_client_only;
            Ok(self.fragment_cache.get(&fragment.name.item).unwrap())
        }
    }
}

impl<'s> Validator for ServerOnlyDirectivesValidation<'s> {
    const NAME: &'static str = "ServerOnlyDirectivesValidation";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_program<'ss>(&mut self, program: &Program<'ss>) -> ValidationResult<()> {
        validate!(
            validate_map(program.operations(), |operation| {
                self.current_client_invalid_directives = vec![];
                self.current_root_client_selection = None;
                self.is_current_fragment_client_only = true;
                self.validate_operation(operation)
            }),
            validate_map(program.fragments(), |fragment| {
                self.current_client_invalid_directives = vec![];
                self.current_root_client_selection = None;
                self.is_current_fragment_client_only = true;
                self.validate_fragment(fragment)
            })
        )
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> ValidationResult<()> {
        self.validate_fragment_impl(fragment)?;
        Ok(())
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> ValidationResult<()> {
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        let state = self.validate_fragment_impl(fragment)?.clone();
        let FragmentState {
            is_client_only,
            client_invalid_directives,
        } = state;

        self.is_current_fragment_client_only =
            self.is_current_fragment_client_only && is_client_only;
        self.current_client_invalid_directives
            .extend(client_invalid_directives.into_iter());
        if is_client_only {
            let current_root_client_selection = self.current_root_client_selection;
            self.current_root_client_selection = Some(fragment.name.location);
            self.default_validate_fragment_spread(spread)?;
            self.current_root_client_selection = current_root_client_selection;
        }
        Ok(())
    }

    fn validate_linked_field(&mut self, field: &LinkedField) -> ValidationResult<()> {
        if self.current_root_client_selection.is_none()
            && self
                .program
                .schema()
                .field(field.definition.item)
                .is_extension
        {
            self.current_root_client_selection = Some(field.definition.location)
        }
        if self.is_current_fragment_client_only
            && !self
                .program
                .schema()
                .field(field.definition.item)
                .is_extension
        {
            self.is_current_fragment_client_only = false;
        }
        self.default_validate_linked_field(field)
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> ValidationResult<()> {
        if self.is_current_fragment_client_only
            && !self
                .program
                .schema()
                .field(field.definition.item)
                .is_extension
        {
            self.is_current_fragment_client_only = false;
        }
        self.default_validate_scalar_field(field)
    }

    fn validate_directive(&mut self, directive: &Directive) -> ValidationResult<()> {
        if self
            .client_invalid_directive_names
            .contains(&directive.name.item)
        {
            self.current_client_invalid_directives.push(directive.name);
            if let Some(location) = self.current_root_client_selection {
                Err(vec![ValidationError::new(
                    ValidationMessage::InvalidServerOnlyDirectiveInClientFields(
                        directive.name.item,
                    ),
                    vec![directive.name.location, location],
                )])
            } else {
                Ok(())
            }
        } else {
            Ok(())
        }
    }
}
