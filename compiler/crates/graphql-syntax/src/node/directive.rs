/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::primitive::*;
use super::value::Argument;
use common::{Named, Span};
use intern::string_key::StringKey;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct Directive {
    pub span: Span,
    pub at: Token,
    pub name: Identifier,
    pub arguments: Option<List<Argument>>,
}

impl Named for Directive {
    fn name(&self) -> StringKey {
        self.name.value
    }
}
