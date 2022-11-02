/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::*;

pub type Style = fn(String) -> ColoredString;

macro_rules! create_style {
    ($name:ident) => {
        pub fn $name(s: String) -> ColoredString {
            s.$name()
        }
    };
}

/// Free function wrappers over colored::Colorized methods
pub struct Styles;
impl Styles {
    create_style!(red);
    create_style!(yellow);
    create_style!(blue);
    create_style!(bold);
    create_style!(dimmed);
    create_style!(underline);
    create_style!(strikethrough);
}
