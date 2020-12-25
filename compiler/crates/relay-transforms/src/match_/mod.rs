/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod constants;
mod match_transform;
mod split_module_import;
mod split_operation_metadata;
mod utils;

pub use constants::MATCH_CONSTANTS;
pub use match_transform::transform_match;
pub use split_module_import::split_module_import;
pub use split_operation_metadata::{SplitOperationMetadata, DIRECTIVE_SPLIT_OPERATION};
pub use utils::get_normalization_operation_name;
