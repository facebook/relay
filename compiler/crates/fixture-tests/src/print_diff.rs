/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::Colorize;
use diff::Result::*;

/// Prints a diff between the expected and actual strings to stdout.
pub(crate) fn print_diff(expected: &str, actual: &str) {
    let changes = diff::lines(expected, actual);
    for (line_index, change) in changes.iter().enumerate() {
        let formatted_line = match change {
            Both(context, _context) => {
                // Print 1 line of context
                let prev_is_change = line_index > 0 && is_change(&changes[line_index - 1]);
                let next_is_change = changes.get(line_index + 1).map_or(false, is_change);
                if prev_is_change || next_is_change {
                    format!("| {}", context).dimmed()
                } else {
                    continue;
                }
            }
            Left(removed) => format!("- {}", removed).red(),
            Right(added) => format!("+ {}", added).green(),
        };
        println!("{:4} {}", line_index + 1, formatted_line);
    }
}

fn is_change<T>(result: &diff::Result<T>) -> bool {
    matches!(result, Left(_) | Right(_))
}
