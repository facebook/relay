/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

pub trait PerfLogger: Send + Sync {
    type PerfLogEvent: PerfLogEvent + Send;
    /// Create log event
    fn create_event(&self, name: impl Copy + Into<String>) -> Self::PerfLogEvent;

    /// Push event to the logger queue
    fn complete_event(&self, event: Self::PerfLogEvent);

    /// Flush all log events
    fn flush(&self);
}

pub trait PerfLogEvent {
    type Timer;

    /// Log number
    fn number(&self, name: impl Copy + Into<String>, number: usize);

    /// Provides a possibility to log additional fields describing current run (like, project name)
    fn string(&self, name: impl Copy + Into<String>, value: String);

    /// Start new execution timer with the name
    fn start(&self, name: impl Copy + Into<String>) -> Self::Timer;

    /// Stop timer and log execution time
    fn stop(&self, timer: Self::Timer);

    /// Measure a time of calling a callback.
    fn time<T, F>(&self, name: impl Copy + Into<String>, f: F) -> T
    where
        F: FnOnce() -> T,
    {
        let timer = self.start(name);
        let res = f();
        self.stop(timer);
        res
    }
}
