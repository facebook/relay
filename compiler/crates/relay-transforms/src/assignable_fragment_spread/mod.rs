/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod errors;
mod transform_assignable_fragment_spreads_in_regular_queries;
mod validate_assignable_directive;
mod validate_updatable_directive;

use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;

lazy_static! {
    pub static ref ASSIGNABLE_DIRECTIVE: StringKey = "assignable".intern();
    pub static ref UPDATABLE_DIRECTIVE: StringKey = "updatable".intern();
}

use self::errors::ValidationMessage;
pub use transform_assignable_fragment_spreads_in_regular_queries::*;
pub use validate_assignable_directive::*;
pub use validate_updatable_directive::*;
