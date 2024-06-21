/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]
#![deny(clippy::clone_on_ref_ptr)]
#![allow(clippy::comparison_chain)]

mod validate_fragment_alias_conflict;
mod validate_selection_conflict;

pub use validate_fragment_alias_conflict::validate_fragment_alias_conflict;
pub use validate_selection_conflict::validate_selection_conflict;
