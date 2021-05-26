/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod console_logger;
mod diagnostic;
mod location;
mod named_item;
mod perf_logger;
mod span;
pub mod sync;

pub use console_logger::{print_time, ConsoleLogEvent, ConsoleLogger};
pub use diagnostic::{
    combined_result, diagnostics_result, Diagnostic, DiagnosticsResult, WithDiagnostics,
};
pub use location::{Location, SourceLocationKey, WithLocation};
pub use named_item::{Named, NamedItem};
pub use perf_logger::{NoopPerfLogger, NoopPerfLoggerEvent, PerfLogEvent, PerfLogger};
pub use span::Span;
