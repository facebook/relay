/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::time::Instant;

use colored::*;
use log::debug;

use super::perf_logger::PerfLogEvent;
use super::perf_logger::PerfLogger;

pub struct ConsoleLogEvent;

pub struct ConsoleLogger;

impl PerfLogEvent for ConsoleLogEvent {
    type Timer = (&'static str, Instant);
    fn number(&self, name: &'static str, number: usize) {
        debug!("{name}: {number}");
    }
    fn bool(&self, name: &'static str, value: bool) {
        debug!("{name}: {value}");
    }
    fn string(&self, name: &'static str, value: String) {
        debug!("{name}: {value}");
    }
    fn start(&self, name: &'static str) -> Self::Timer {
        (name, Instant::now())
    }
    fn stop(&self, timer: Self::Timer) {
        let (name, time) = timer;
        print_time(name, time);
    }
    fn complete(self) {}
}

impl PerfLogger for ConsoleLogger {
    type PerfLogEvent = ConsoleLogEvent;
    fn create_event(&self, _name: &'static str) -> Self::PerfLogEvent {
        ConsoleLogEvent
    }
}

pub fn print_time(name: &str, time: Instant) {
    let elapsed_ms = time.elapsed().as_millis();
    let elapsed_str = format!("{elapsed_ms:4}ms");
    let elapsed_color = if elapsed_ms < 10 {
        elapsed_str.dimmed()
    } else if elapsed_ms < 100 {
        elapsed_str.blue()
    } else if elapsed_ms < 1000 {
        elapsed_str.bold()
    } else {
        elapsed_str.red()
    };
    debug!("{} {}", elapsed_color, name.dimmed());
}
