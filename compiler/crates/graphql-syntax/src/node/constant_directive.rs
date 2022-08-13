/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Named;
use common::Span;
use intern::string_key::StringKey;

use super::constant_value::ConstantArgument;
use super::primitive::*;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ConstantDirective {
    pub span: Span,
    pub at: Token,
    pub name: Identifier,
    pub arguments: Option<List<ConstantArgument>>,
}

impl Named for ConstantDirective {
    fn name(&self) -> StringKey {
        self.name.value
    }
}
