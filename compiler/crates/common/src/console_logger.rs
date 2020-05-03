/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::perf_logger::{PerfLogEvent, PerfLogger};
use super::print_time;
use log::info;
use std::time::Instant;

pub struct ConsoleLogEvent;

pub struct ConsoleLogger;

impl PerfLogEvent for ConsoleLogEvent {
    type Timer = (String, Instant);
    fn number(&self, name: impl Copy + Into<String>, number: usize) {
        info!("{}: {}", name.into(), number);
    }
    fn string(&self, name: impl Copy + Into<String>, value: String) {
        info!("{}: {}", name.into(), value);
    }
    fn start(&self, name: impl Copy + Into<String>) -> Self::Timer {
        (name.into(), Instant::now())
    }
    fn stop(&self, timer: Self::Timer) {
        let (name, time) = timer;
        print_time(&name, &time);
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
