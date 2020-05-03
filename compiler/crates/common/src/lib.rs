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
mod location;
mod murmurhash;
mod perf_logger;
mod span;
mod timer;

pub use console_logger::{ConsoleLogEvent, ConsoleLogger};
pub use location::{FileKey, Location, WithLocation};
pub use murmurhash::murmurhash;
pub use perf_logger::{PerfLogEvent, PerfLogger};
pub use span::{Span, Spanned};
pub use timer::{print_time, Timer};
