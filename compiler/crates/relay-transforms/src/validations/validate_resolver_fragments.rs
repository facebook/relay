/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::relay_resolvers::get_argument_value;
use crate::{RELAY_RESOLVER_DIRECTIVE_NAME, RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME};
use common::{Diagnostic, DiagnosticsResult, NamedItem};
use graphql_ir::{FragmentDefinition, FragmentSpread, OperationDefinition, Program, Validator};
use intern::string_key::StringKeySet;
use schema::{SDLSchema, Schema};

pub fn validate_resolver_fragments(program: &Program) -> DiagnosticsResult<()> {
    ValidateResolverFragments::new(&program.schema)?.validate_program(program)
}

struct ValidateResolverFragments {
    resolver_fragments: StringKeySet,
}

impl ValidateResolverFragments {
    fn new(schema: &SDLSchema) -> DiagnosticsResult<Self> {
        let mut errors = vec![];
        let validator = Self {
            resolver_fragments: schema
                .fields()
                .filter_map(|field| {
                    if !field.is_extension {
                        return None;
                    }

                    field
                        .directives
                        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
                        .and_then(|directive| {
                            let arguments = &directive.arguments;
                            get_argument_value(
                                arguments,
                                *RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME,
                                field.name.location,
                            )
                            .map_err(|err| {
                                errors.extend(err);
                            })
                            .ok()
                        })
                })
                .collect::<StringKeySet>(),
        };

        if errors.is_empty() {
            Ok(validator)
        } else {
            Err(errors)
        }
    }
}

impl Validator for ValidateResolverFragments {
    const NAME: &'static str = "ValidateResolverFragments";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_operation(&mut self, _operation: &OperationDefinition) -> DiagnosticsResult<()> {
        Ok(())
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        if self.resolver_fragments.contains(&fragment.name.item) {
            self.default_validate_fragment(fragment)
        } else {
            Ok(())
        }
    }

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        Err(vec![Diagnostic::error(
            format!(
                "Using fragment spread `...{}` is not supported in the Relay resolvers fragments. The runtime API for reading the data of these fragments is not implemented, yet.",
                spread.fragment.item
            ),
            spread.fragment.location,
        )])
    }
}
