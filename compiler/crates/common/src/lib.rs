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
mod diagnostic_check;
mod feature_flags;
mod location;
mod named_item;
mod perf_logger;
mod pointer_address;
mod rollout;
mod span;
pub mod sync;
mod text_source;

pub use console_logger::print_time;
pub use console_logger::ConsoleLogEvent;
pub use console_logger::ConsoleLogger;
pub use diagnostic::diagnostics_result;
pub use diagnostic::get_diagnostics_data;
pub use diagnostic::Diagnostic;
pub use diagnostic::DiagnosticDisplay;
pub use diagnostic::DiagnosticRelatedInformation;
pub(crate) use diagnostic::Diagnostics;
pub use diagnostic::DiagnosticsResult;
pub use diagnostic::WithDiagnosticData;
pub use diagnostic::WithDiagnostics;
pub use diagnostic_check::escalate_and_check;
pub use diagnostic_check::CriticalDiagnostics;
pub use diagnostic_check::DiagnosticCheck;
pub use diagnostic_check::StableDiagnostics;
pub use feature_flags::FeatureFlag;
pub use feature_flags::FeatureFlags;
pub use location::Location;
pub use location::SourceLocationKey;
pub use location::WithLocation;
pub use lsp_types::DiagnosticSeverity;
pub use lsp_types::DiagnosticTag;
pub use named_item::ArgumentName;
pub use named_item::DirectiveName;
pub use named_item::EnumName;
pub use named_item::InputObjectName;
pub use named_item::InterfaceName;
pub use named_item::Named;
pub use named_item::NamedItem;
pub use named_item::ObjectName;
pub use named_item::ScalarName;
pub use named_item::UnionName;
pub use perf_logger::NoopPerfLogger;
pub use perf_logger::NoopPerfLoggerEvent;
pub use perf_logger::PerfLogEvent;
pub use perf_logger::PerfLogger;
pub use pointer_address::PointerAddress;
pub use rollout::Rollout;
pub use span::Span;
pub use text_source::TextSource;
