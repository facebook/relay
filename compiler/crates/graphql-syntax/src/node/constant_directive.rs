/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::constant_value::ConstantArgument;
use super::primitive::*;
use common::Span;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantDirective {
    pub span: Span,
    pub at: Token,
    pub name: Identifier,
    pub arguments: Option<List<ConstantArgument>>,
}
