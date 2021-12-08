/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{ValidationMessage, MATCH_CONSTANTS, RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME};
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use fnv::FnvHashMap;
use graphql_ir::{Argument, ConstantValue, Directive, FragmentSpread, Program, Validator, Value};
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

lazy_static! {
    pub static ref NO_INLINE_DIRECTIVE_NAME: StringKey = "no_inline".intern();
    pub static ref PARENT_DOCUMENTS_ARG: StringKey = "__parentDocuments".intern();
    pub static ref RAW_RESPONSE_TYPE_NAME: StringKey = "raw_response_type".intern();
}

pub fn attach_no_inline_directives_to_fragments(
    no_inline_fragments: &mut FnvHashMap<StringKey, Vec<StringKey>>,
    program: &mut Program,
) {
    for (fragment_name, parent_sources) in no_inline_fragments.drain() {
        let fragment = Arc::make_mut(program.fragment_mut(fragment_name).unwrap());

        let no_inline_directive = fragment
            .directives
            .iter_mut()
            .find(|d| d.name.item == *NO_INLINE_DIRECTIVE_NAME);
        if let Some(no_inline_directive) = no_inline_directive {
            let parent_documents_arg = no_inline_directive
                .arguments
                .iter_mut()
                .find(|arg| arg.name.item == *PARENT_DOCUMENTS_ARG);
            if let Some(parent_documents_arg) = parent_documents_arg {
                if let Value::Constant(ConstantValue::List(parent_documents)) =
                    &mut parent_documents_arg.value.item
                {
                    parent_documents.extend(parent_sources.into_iter().map(ConstantValue::String));
                } else {
                    panic!("Expected parent arguments to be a constant list of String");
                }
            } else {
                no_inline_directive
                    .arguments
                    .push(create_parent_documents_arg(parent_sources));
            }
        } else {
            fragment.directives.push(Directive {
                name: WithLocation::new(fragment.name.location, *NO_INLINE_DIRECTIVE_NAME),
                arguments: vec![create_parent_documents_arg(parent_sources)],
                data: None,
            })
        }
    }
}

pub fn is_raw_response_type_enabled(directive: &Directive) -> bool {
    if let Some(Value::Constant(ConstantValue::Boolean(val))) = directive
        .arguments
        .named(*RAW_RESPONSE_TYPE_NAME)
        .map(|arg| &arg.value.item)
    {
        *val
    } else {
        false
    }
}

/// If `@no_inline` is added to a fragment by @module or @relay_client_component
/// transform, and the fragment is also used without these directives, manually
/// adding `@no_inline` is required. Because in watch mode, if the path with @module
/// or @relay_client_component isn't changed, `@no_inline` won't get added.
pub fn validate_required_no_inline_directive(
    no_inline_fragments: &FnvHashMap<StringKey, Vec<StringKey>>,
    program: &Program,
) -> DiagnosticsResult<()> {
    let mut validator = RequiredNoInlineValidator::new(no_inline_fragments, program);
    validator.validate_program(program)
}

fn create_parent_documents_arg(parent_sources: Vec<StringKey>) -> Argument {
    Argument {
        name: WithLocation::generated(*PARENT_DOCUMENTS_ARG),
        value: WithLocation::generated(Value::Constant(ConstantValue::List(
            parent_sources
                .into_iter()
                .map(ConstantValue::String)
                .collect(),
        ))),
    }
}

struct RequiredNoInlineValidator<'f, 'p> {
    no_inline_fragments: &'f FnvHashMap<StringKey, Vec<StringKey>>,
    program: &'p Program,
}

impl<'f, 'p> RequiredNoInlineValidator<'f, 'p> {
    fn new(
        no_inline_fragments: &'f FnvHashMap<StringKey, Vec<StringKey>>,
        program: &'p Program,
    ) -> Self {
        Self {
            no_inline_fragments,
            program,
        }
    }
}

impl<'f, 'p> Validator for RequiredNoInlineValidator<'f, 'p> {
    const NAME: &'static str = "RequiredNoInlineValidator";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment_spread(&mut self, spread: &FragmentSpread) -> DiagnosticsResult<()> {
        if !self.no_inline_fragments.contains_key(&spread.fragment.item) {
            return Ok(());
        }
        let fragment = self.program.fragment(spread.fragment.item).unwrap();
        let has_no_inline = fragment
            .directives
            .named(*NO_INLINE_DIRECTIVE_NAME)
            .is_some();
        if has_no_inline {
            return Ok(());
        }
        // If the fragment spread isn't used for @module or @relay_client_component
        // then explicit @no_inline is required.
        if spread.directives.is_empty()
            || !spread.directives.iter().any(|directive| {
                directive.name.item == MATCH_CONSTANTS.module_directive_name
                    || directive.name.item == *RELAY_CLIENT_COMPONENT_DIRECTIVE_NAME
            })
        {
            Err(vec![
                Diagnostic::error(
                    ValidationMessage::RequiredExplicitNoInlineDirective {
                        fragment_name: spread.fragment.item,
                    },
                    spread.fragment.location,
                )
                .annotate("fragment definition", fragment.name.location),
            ])
        } else {
            Ok(())
        }
    }
}
