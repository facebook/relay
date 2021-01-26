/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::DEFER_STREAM_CONSTANTS;
use graphql_ir::{Argument, Directive};

/// Utility to access the arguments of the @defer directive.
pub struct DeferDirective<'a> {
    pub if_arg: Option<&'a Argument>,
    pub label_arg: Option<&'a Argument>,
}

impl<'a> DeferDirective<'a> {
    /// Extracts the arguments from the given directive assumed to be a @defer
    /// directive.
    /// Panics on any unexpected arguments.
    pub fn from(directive: &'a Directive) -> Self {
        let mut if_arg = None;
        let mut label_arg = None;
        for arg in &directive.arguments {
            if arg.name.item == DEFER_STREAM_CONSTANTS.if_arg {
                if_arg = Some(arg);
            } else if arg.name.item == DEFER_STREAM_CONSTANTS.label_arg {
                label_arg = Some(arg);
            } else {
                panic!("Unexpected argument to @defer: {}", arg.name.item);
            }
        }
        Self { if_arg, label_arg }
    }
}

/// Utility to access the arguments of the @stream directive.
pub struct StreamDirective<'a> {
    pub if_arg: Option<&'a Argument>,
    pub label_arg: Option<&'a Argument>,
    pub initial_count_arg: Option<&'a Argument>,
    pub use_customized_batch_arg: Option<&'a Argument>,
}

impl<'a> StreamDirective<'a> {
    /// Extracts the arguments from the given directive assumed to be a @stream
    /// directive.
    /// Panics on any unexpected arguments.
    pub fn from(directive: &'a Directive) -> Self {
        let mut if_arg = None;
        let mut label_arg = None;
        let mut initial_count_arg = None;
        let mut use_customized_batch_arg = None;
        for arg in &directive.arguments {
            if arg.name.item == DEFER_STREAM_CONSTANTS.if_arg {
                if_arg = Some(arg);
            } else if arg.name.item == DEFER_STREAM_CONSTANTS.label_arg {
                label_arg = Some(arg);
            } else if arg.name.item == DEFER_STREAM_CONSTANTS.initial_count_arg {
                initial_count_arg = Some(arg);
            } else if arg.name.item == DEFER_STREAM_CONSTANTS.use_customized_batch_arg {
                use_customized_batch_arg = Some(arg);
            } else {
                panic!("Unexpected argument to @stream: {}", arg.name.item);
            }
        }
        Self {
            if_arg,
            label_arg,
            initial_count_arg,
            use_customized_batch_arg,
        }
    }
}
