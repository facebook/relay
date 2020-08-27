/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::perf_logger::{PerfLogEvent, PerfLogger};
use colored::*;
use log::debug;
use std::time::Instant;

pub struct ConsoleLogEvent;

pub struct ConsoleLogger;

impl PerfLogEvent for ConsoleLogEvent {
    type Timer = (String, Instant);
    fn number(&self, name: impl Copy + Into<String>, number: usize) {
        debug!("{}: {}", name.into(), number);
    }
    fn string(&self, name: impl Copy + Into<String>, value: String) {
        debug!("{}: {}", name.into(), value);
    }
    fn start(&self, name: impl Copy + Into<String>) -> Self::Timer {
        (name.into(), Instant::now())
    }
    fn stop(&self, timer: Self::Timer) {
        let (name, time) = timer;
        print_time(&name, time);
    }
}

impl PerfLogger for ConsoleLogger {
    type PerfLogEvent = ConsoleLogEvent;
    fn create_event(&self, _name: impl Copy + Into<String>) -> Self::PerfLogEvent {
        ConsoleLogEvent
    }
    fn complete_event(&self, _event: Self::PerfLogEvent) {}
    fn flush(&self) {}
}

pub fn print_time(name: &str, time: Instant) {
    let elapsed_ms = time.elapsed().as_millis();
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
    debug!("{} {}", elapsed_color, name.dimmed());
}
