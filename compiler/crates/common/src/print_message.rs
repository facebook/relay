/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::*;

pub fn print_info(message: String) {
    println!("{} {}", "[info]".blue().bold(), message);
}

pub fn print_warning(message: String) {
    println!("{} {}", "[warning]".yellow().bold(), message);
}

pub fn print_error(message: String) {
    println!("{} {}", "[error]".red().bold(), message);
}
