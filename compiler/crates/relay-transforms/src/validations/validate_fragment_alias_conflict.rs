/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::collections::hash_map::Entry;
use std::mem;
use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::WithLocation;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Validator;
use intern::string_key::StringKey;
use schema::SDLSchema;
use thiserror::Error;

pub fn validate_fragment_alias_conflict(program: &Program) -> DiagnosticsResult<()> {
    ValidateFragmentAliasConflict::new(&program.schema).validate_program(program)
}

struct ValidateFragmentAliasConflict<'s> {
    schema: &'s Arc<SDLSchema>,
    selection_context: SelectionContext,
}

#[derive(Default)]
struct SelectionContext {
    seen_fields: HashMap<StringKey, Location>,
    seen_fragment_aliases: HashMap<StringKey, Location>,
}

impl<'s> ValidateFragmentAliasConflict<'s> {
    fn new(schema: &'s Arc<SDLSchema>) -> Self {
        Self {
            schema,
            selection_context: Default::default(),
        }
    }

    fn record_fragment_alias(&mut self, alias: WithLocation<StringKey>) -> DiagnosticsResult<()> {
        match self
            .selection_context
            .seen_fragment_aliases
            .entry(alias.item)
        {
            Entry::Occupied(occupied_entry) => {
                let other_location = occupied_entry.get();
                Err(vec![
                    Diagnostic::error(
                        ValidationMessage::FragmentAliasConflictsWithOtherAlias {
                            response_key: alias.item,
                        },
                        alias.location,
                    )
                    .annotate("the conflicting alias", *other_location),
                ])
            }
            Entry::Vacant(vacant_entry) => {
                vacant_entry.insert(alias.location);
                Ok(())
            }
        }
    }

    fn record_field_name(&mut self, name: StringKey, location: Location) {
        self.selection_context
            .seen_fields
            .entry(name)
            .or_insert(location);
    }

    /// 1. Saves the current selection context
    /// 2. Resets the selection context
    /// 3. Exectues a block of code (expressed as a lambda `f`)
    /// 4. Validates the selction context checking for name collisions
    /// 5. Resets the context afterwards.
    ///
    /// This ensures that we only check for collisions among siblings selections.
    fn with_selection_context<F, T>(&mut self, f: F) -> DiagnosticsResult<T>
    where
        for<'b> F: FnOnce(&'b mut Self) -> DiagnosticsResult<T>,
    {
        let parent_context = mem::take(&mut self.selection_context);
        let result = f(self)?;
        for (name, location) in self.selection_context.seen_fragment_aliases.iter() {
            if let Some(field_location) = self.selection_context.seen_fields.get(name) {
                return Err(vec![
                    Diagnostic::error(
                        ValidationMessage::FragmentAliasConflictsWithField {
                            response_key: *name,
                        },
                        *location,
                    )
                    .annotate("the conflicting field", *field_location),
                ]);
            }
        }
        self.selection_context = parent_context;
        Ok(result)
    }
}

impl Validator for ValidateFragmentAliasConflict<'_> {
    const NAME: &'static str = "ValidateFragmentAliasConflict";

    const VALIDATE_ARGUMENTS: bool = false;

    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        self.with_selection_context(|s| s.default_validate_fragment(fragment))
    }
    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        self.with_selection_context(|s| s.default_validate_operation(operation))
    }
    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        self.record_field_name(
            field.alias_or_name(self.schema),
            field.alias_or_name_location(),
        );
        self.with_selection_context(|s| s.default_validate_linked_field(field))
    }
    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        self.record_field_name(
            field.alias_or_name(self.schema),
            field.alias_or_name_location(),
        );
        Ok(())
    }
    fn validate_inline_fragment(&mut self, fragment: &InlineFragment) -> DiagnosticsResult<()> {
        if let Some(alias) = fragment.alias(self.schema)? {
            self.record_fragment_alias(alias)?;
            self.with_selection_context(|s| s.default_validate_inline_fragment(fragment))
        } else {
            self.default_validate_inline_fragment(fragment)
        }
    }
    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        if let Some(alias) = spread.alias()? {
            self.record_fragment_alias(alias)?;
        }
        Ok(())
    }
}

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
enum ValidationMessage {
    #[error(
        "Fragment alias '{response_key}' is ambiguous. It conflicts with a field with the same name."
    )]
    FragmentAliasConflictsWithField { response_key: StringKey },

    #[error(
        "Fragment alias '{response_key}' is ambiguous. It conflicts with another fragment alias with the same name."
    )]
    FragmentAliasConflictsWithOtherAlias { response_key: StringKey },
}
