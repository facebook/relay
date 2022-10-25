/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Named;
use common::Span;
use intern::string_key::StringKey;

use super::primitive::*;
use super::value::Argument;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Directive {
    pub span: Span,
    pub at: Token,
    pub name: Identifier,
    pub arguments: Option<List<Argument>>,
}

impl Named for Directive {
    type Name = StringKey;
    fn name(&self) -> StringKey {
        self.name.value
    }
}
