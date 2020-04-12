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
pub struct Timer {
    instant: Instant,
    name: String,
}
impl Timer {
    /// Measure a time of calling a callback.
    pub fn time<T, F>(name: impl Into<String>, f: F) -> T
    where
        F: FnOnce() -> T,
    {
        let timer = Timer::start(name);
        let res = f();
        timer.stop();
        res
    }

    /// Create a new timer with the given name used when printing.
    pub fn start(name: impl Into<String>) -> Timer {
        Self {
            instant: Instant::now(),
            name: name.into(),
        }
    }

    /// Stops the timer and prints the time since construction.
    pub fn stop(self) {
        let elapsed_ms = self.instant.elapsed().as_millis();
        let elapsed_str = format!("{:4}ms", elapsed_ms);
        let elapsed_color = if elapsed_ms < 10 {
            elapsed_str.dimmed()
        } else if elapsed_ms < 100 {
            elapsed_str.blue()
        } else if elapsed_ms < 1000 {
            elapsed_str.bold()
        } else {
            elapsed_str.red()
        };
        println!("{} {}", elapsed_color, self.name.dimmed());
    }
}
