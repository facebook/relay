/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod get_no_inline_with_raw_response_types;
pub use get_no_inline_with_raw_response_types::get_no_inline_fragments_with_raw_response_type;

use common::WithLocation;
use fnv::FnvHashMap;
use graphql_ir::{Argument, ConstantValue, Directive, Program, Value};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use std::sync::Arc;

lazy_static! {
    pub static ref NO_INLINE_DIRECTIVE_NAME: StringKey = "no_inline".intern();
    pub static ref PARENT_DOCUMENTS_ARG: StringKey = "__parentDocuments".intern();
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
            })
        }
    }
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
