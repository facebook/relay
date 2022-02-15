/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use thiserror::Error;

#[derive(Clone, Copy, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum ParseError {
    #[error("This feature is not implemented yet.")]
    Unimplemented,
}
