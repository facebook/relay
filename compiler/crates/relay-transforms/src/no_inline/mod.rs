/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use common::WithLocation;
use fnv::FnvHashMap;
use graphql_ir::{Argument, ConstantValue, Directive, Program, Value};
use interner::{Intern, StringKey};
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
