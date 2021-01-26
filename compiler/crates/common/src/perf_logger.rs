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

pub trait PerfLogEvent: Send + Sync {
    type Timer: Send + Sync;

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

pub struct NoopPerfLogger;
impl PerfLogger for NoopPerfLogger {
    type PerfLogEvent = NoopPerfLoggerEvent;
    fn create_event(&self, _name: impl Copy + Into<String>) -> Self::PerfLogEvent {
        NoopPerfLoggerEvent
    }
    fn complete_event(&self, _event: Self::PerfLogEvent) {}
    fn flush(&self) {}
}

pub struct NoopPerfLoggerEvent;
impl PerfLogEvent for NoopPerfLoggerEvent {
    type Timer = ();
    fn number(&self, _name: impl Copy + Into<String>, _number: usize) {}
    fn string(&self, _name: impl Copy + Into<String>, _value: String) {}
    fn start(&self, _name: impl Copy + Into<String>) -> Self::Timer {}
    fn stop(&self, _timer: Self::Timer) {}
}
