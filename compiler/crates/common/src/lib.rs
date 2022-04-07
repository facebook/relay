/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod console_logger;
mod diagnostic;
mod feature_flags;
mod location;
mod named_item;
mod perf_logger;
mod pointer_address;
mod rollout;
mod span;
pub mod sync;
mod text_source;

pub use console_logger::{print_time, ConsoleLogEvent, ConsoleLogger};
pub use diagnostic::{
    diagnostics_result, Diagnostic, DiagnosticDisplay, DiagnosticsResult, WithDiagnosticData,
    WithDiagnostics,
};
pub use feature_flags::{FeatureFlag, FeatureFlags};
pub use location::{Location, SourceLocationKey, WithLocation};
pub use lsp_types::{DiagnosticSeverity, DiagnosticTag};
pub use named_item::{Named, NamedItem};
pub use perf_logger::{NoopPerfLogger, NoopPerfLoggerEvent, PerfLogEvent, PerfLogger};
pub use pointer_address::PointerAddress;
pub use rollout::Rollout;
pub use span::Span;
pub use text_source::TextSource;
