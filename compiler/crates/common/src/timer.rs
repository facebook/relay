/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use colored::*;
use std::time::Instant;

/// A simple utility to log wall time spent in a section of code.
/// A Timer is started with `new` and runs until it is `stop()`ed.
/// When it is stopped, it prints the time to stdout.
pub struct Timer<'a> {
    name: &'a str,
    instant: Instant,
}

impl<'a> Timer<'a> {
    /// Create a new timer with the given name used when printing.
    pub fn new(name: &'a str) -> Timer<'a> {
        Self {
            name,
            instant: Instant::now(),
        }
    }

    /// Stops the timer and prints the time since construction.
    pub fn stop(self) {
        println!(
            "{} took {}",
            self.name,
            format!("{:.2?}", self.instant.elapsed()).bold()
        );
    }
}
