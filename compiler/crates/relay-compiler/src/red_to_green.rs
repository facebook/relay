/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{PerfLogEvent, PerfLogger};
use std::time::Instant;

/// A struct to keep track of the state of how many build,
///  and how long it takes for errors to be resolved
pub struct RedToGreen {
    timer: Option<Instant>,
    error_count: usize,
}

impl RedToGreen {
    pub fn new() -> Self {
        Self {
            timer: None,
            error_count: 0,
        }
    }

    pub fn log_error(&mut self) {
        self.error_count += 1;
        if self.timer.is_none() {
            self.timer = Some(Instant::now());
        }
    }

    pub fn clear_error_and_log(&mut self, logger: &impl PerfLogger) {
        if let Some(timer) = self.timer {
            let event = logger.create_event("red_to_green");
            event.number("time_to_resolve", timer.elapsed().as_millis() as usize);
            event.number("try_count", self.error_count);
            event.complete();
            self.error_count = 0;
            self.timer = None;
        }
    }
}
