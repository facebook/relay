/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use common::SourceLocationKey;
use common::Span;
use errors::validate_map;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::FragmentSpread;
use graphql_ir::Program;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;

use crate::no_inline::NO_INLINE_DIRECTIVE_NAME;
use crate::no_inline::RAW_RESPONSE_TYPE_NAME;
use crate::no_inline::is_raw_response_type_enabled;

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
    validated: FragmentDefinitionNameSet,
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

impl Validator for NoInlineRawResponseTypeValidator<'_> {
    const NAME: &'static str = "NoInlineRawResponseTypeValidator";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_program(&mut self, program: &Program) -> DiagnosticsResult<()> {
        validate_map(program.operations(), |operation| {
            if operation
                .directives
                .named(DirectiveName(*RAW_RESPONSE_TYPE_NAME))
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
        if let Some(directive) = fragment.directives.named(*NO_INLINE_DIRECTIVE_NAME)
            && !is_raw_response_type_enabled(directive)
        {
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
