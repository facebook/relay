/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use graphql_ir::OperationDefinition;
use interner::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    static ref PRELOADABLE_DIRECTIVE_NAME: StringKey = "preloadable".intern();
}

/// Check, if the operation is @preloadable.
pub fn is_operation_preloadable(operation: &OperationDefinition) -> bool {
    operation
        .directives
        .named(*PRELOADABLE_DIRECTIVE_NAME)
        .is_some()
}
