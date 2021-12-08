/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::no_inline::{
    is_raw_response_type_enabled, NO_INLINE_DIRECTIVE_NAME, RAW_RESPONSE_TYPE_NAME,
};
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, SourceLocationKey, Span};
use errors::validate_map;
use fnv::FnvHashSet;
use graphql_ir::{FragmentDefinition, FragmentSpread, Program, ValidationMessage, Validator};
use intern::string_key::StringKey;

/// To generate full raw response types, we need to also generate raw response types for
/// @no_inline fragment normalization files. So raw_response_type argument is required
/// on these @no_inline directive.
pub fn validate_no_inline_fragments_with_raw_response_type(
    program: &Program,
) -> DiagnosticsResult<()> {
    let mut validator = NoInlineRawResponseTypeValidator::new(program);
    validator.validate_program(program)
}

struct NoInlineRawResponseTypeValidator<'a> {
    validated: FnvHashSet<StringKey>,
    program: &'a Program,
    current_query_location: Location,
}

impl<'a> NoInlineRawResponseTypeValidator<'a> {
    fn new(program: &'a Program) -> Self {
        Self {
            validated: Default::default(),
            current_query_location: Location::new(SourceLocationKey::generated(), Span::empty()),
            program,
        }
    }
}

impl<'a> Validator for NoInlineRawResponseTypeValidator<'a> {
    const NAME: &'static str = "NoInlineRawResponseTypeValidator";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_program(&mut self, program: &Program) -> DiagnosticsResult<()> {
        validate_map(program.operations(), |operation| {
            if operation
                .directives
                .named(*RAW_RESPONSE_TYPE_NAME)
                .is_some()
            {
                self.current_query_location = operation.name.location;
                self.default_validate_operation(operation)
            } else {
                Ok(())
            }
        })
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if let Some(directive) = fragment.directives.named(*NO_INLINE_DIRECTIVE_NAME) {
            if !is_raw_response_type_enabled(directive) {
                return Err(vec![
                    Diagnostic::error(
                        ValidationMessage::RequiredRawResponseTypeOnNoInline {
                            fragment_name: fragment.name.item,
                        },
                        fragment.name.location,
                    )
                    .annotate(
                        "The query with @raw_response_type",
                        self.current_query_location,
                    ),
                ]);
            }
        }
        self.default_validate_fragment(fragment)
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        if self.validated.contains(&spread.fragment.item) {
            return Ok(());
        }
        self.validated.insert(spread.fragment.item);
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        self.validate_fragment(fragment)
    }
}
