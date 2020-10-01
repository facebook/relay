/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::primitive::*;
use common::Span;
use std::fmt;

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub enum TypeAnnotation {
    Named(Identifier),
    List(Box<ListTypeAnnotation>),
    NonNull(Box<NonNullTypeAnnotation>),
}

impl fmt::Display for TypeAnnotation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TypeAnnotation::Named(named) => f.write_fmt(format_args!("{}", named)),
            TypeAnnotation::List(list) => f.write_fmt(format_args!("[{}]", list.type_)),
            TypeAnnotation::NonNull(non_null) => f.write_fmt(format_args!("{}!", non_null.type_)),
        }
    }
}

impl TypeAnnotation {
    pub fn inner(&self) -> &TypeAnnotation {
        match self {
            TypeAnnotation::Named(_) => self,
            TypeAnnotation::List(of) => (*of).type_.inner(),
            TypeAnnotation::NonNull(of) => (*of).type_.inner(),
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ListTypeAnnotation {
    pub span: Span,
    pub open: Token,
    pub type_: TypeAnnotation,
    pub close: Token,
}

#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct NonNullTypeAnnotation {
    pub span: Span,
    pub type_: TypeAnnotation,
    pub exclamation: Token,
}
