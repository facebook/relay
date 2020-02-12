/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#[derive(Copy, Clone, Debug, PartialEq)]
pub enum TokenKind<'a> {
    SOF,
    EOF,
    Error,
    Bang,
    Dollar,
    Amp,
    ParenL,
    ParenR,
    Colon,
    Equals,
    At,
    BracketL,
    BracketR,
    BraceL,
    Pipe,
    BraceR,
    Name(&'a str),
    Int(&'a str),
    Float(&'a str),
    Str(&'a str),
    BlockString(&'a str),
}
use std::fmt;
impl<'a> fmt::Display for TokenKind<'a> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        use TokenKind::*;
        let printed = match self {
            SOF => "<SOF>",
            EOF => "<EOF>",
            Error => "<ERR>",
            Bang => "!",
            Dollar => "$",
            Amp => "&",
            ParenL => "(",
            ParenR => ")",
            Colon => ":",
            Equals => "=",
            At => "@",
            BracketL => "[",
            BracketR => "]",
            BraceL => "{",
            Pipe => "|",
            BraceR => "}",
            Name(value) => return write!(f, "Name({})", value),
            Int(value) => return write!(f, "Int({})", value),
            Float(value) => return write!(f, "Float({})", value),
            Str(value) => {
                return write!(
                    f,
                    "String({})",
                    value
                        .chars()
                        .skip(1)
                        .take(value.len() - 2)
                        .filter(|c| *c != '\\')
                        .collect::<String>()
                )
            }
            BlockString(value) => return write!(f, "BlockString({})", value),
        };
        write!(f, "{}", printed)
    }
}
