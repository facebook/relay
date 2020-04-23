/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lazy_static::lazy_static;
use std::env::var;

pub enum FeatureFlags {
    // TODO (T65915950): Remove this flag
    IgnoreInvalidConditionVariables,
    // TODO (T65951035): Remove this flag
    IgnoreConflictingModuleSelections,
}

lazy_static! {
    static ref IGNORE_INVALID_CONDITION_VARIABLE_VALUES: bool =
        var("DEPRECATED__IGNORE_INVALID_CONDITION_VARIABLE_VALUES").is_ok();
    static ref IGNORE_CONFLICTING_MODULE_SELECTIONS: bool =
        var("DEPRECATED__IGNORE_CONFLICTING_MODULE_SELECTIONS").is_ok();
}

pub fn is_feature_flag_enabled(flag: FeatureFlags) -> bool {
    match flag {
        FeatureFlags::IgnoreInvalidConditionVariables => *IGNORE_INVALID_CONDITION_VARIABLE_VALUES,
        FeatureFlags::IgnoreConflictingModuleSelections => *IGNORE_CONFLICTING_MODULE_SELECTIONS,
    }
}
