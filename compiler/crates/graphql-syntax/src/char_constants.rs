/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// wrap in a module and re-export everything to disable unused code
// warnings for many constants at once
#[allow(dead_code)]
mod chars {
    pub const AMPERSAND: char = '&';
    pub const ASTERISK: char = '*';
    pub const AT: char = '@'; // @
    pub const BACKSLASH: char = '\\';
    pub const BACKSPACE: char = '\x08'; // \b
    pub const BACKTICK: char = '`';
    pub const BYTE_ORDER_MARK: char = '\u{FEFF}';
    pub const CARET: char = '^';
    pub const CARRIAGE_RETURN: char = '\x0D';
    pub const CLOSE_BRACE: char = '}';
    pub const CLOSE_BRACKET: char = ']';
    pub const CLOSE_PAREN: char = ')';
    pub const COLON: char = ':';
    pub const COMMA: char = ',';
    pub const DIGIT_0: char = '0';
    pub const DIGIT_1: char = '1';
    pub const DIGIT_2: char = '2';
    pub const DIGIT_3: char = '3';
    pub const DIGIT_4: char = '4';
    pub const DIGIT_5: char = '5';
    pub const DIGIT_6: char = '6';
    pub const DIGIT_7: char = '7';
    pub const DIGIT_8: char = '8';
    pub const DIGIT_9: char = '9';
    pub const PERIOD: char = '.';
    pub const DOUBLE_QUOTE: char = '"';
    pub const EQUALS: char = '=';
    pub const EXCLAMATION: char = '!';
    pub const FORM_FEED: char = '\x0C'; // \f
    pub const GREATER_THAN: char = '>'; // >
    pub const HASH: char = '#'; // #
    pub const LESS_THAN: char = '<'; // <
    pub const LINE_FEED: char = '\x0A';
    pub const LINE_SEPARATOR: char = '\u{2028}';
    pub const MINUS: char = '-'; // -
    pub const NULL: char = '\x00';
    pub const OPEN_BRACE: char = '{';
    pub const OPEN_BRACKET: char = '[';
    pub const OPEN_PAREN: char = '(';
    pub const PARAGRAPH_SEPARATOR: char = '\u{2029}';
    pub const PERCENT: char = '%';
    pub const PIPE: char = '|';
    pub const PLUS: char = '+';
    pub const QUESTION: char = '?';
    pub const SEMICOLON: char = ';';
    pub const SINGLE_QUOTE: char = '\'';
    pub const SLASH: char = '/';
    pub const SPACE: char = ' ';
    pub const TAB: char = '\t';
    pub const TILDE: char = '~';
    pub const VERTICAL_TAB: char = '\x0B'; // \v
    pub const CHAR_A: char = 'A';
    pub const CHAR_B: char = 'B';
    pub const CHAR_E: char = 'E';
    pub const CHAR_F: char = 'F';
    pub const CHAR_O: char = 'O';
    pub const CHAR_X: char = 'X';
    pub const CHAR_Z: char = 'Z';
    pub const CHAR_LOWER_A: char = 'a';
    pub const CHAR_LOWER_E: char = 'e';
    pub const CHAR_LOWER_Z: char = 'z';
    pub const DOLLAR: char = '$';
    pub const UNDERSCORE: char = '_';
    pub const MAX_ASCII_CHAR: char = '\x7F';
}
pub use chars::*;
