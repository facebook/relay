/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

pub mod errors;
mod extract_graphql;
mod file_group;
mod file_source;
mod watchman_file;

pub use self::extract_graphql::extract_graphql_strings_from_file;
pub use file_group::{categorize_files, FileGroup};
pub use file_source::{FileSource, FileSourceResult, QueryParams};
pub use watchman_client::prelude::Clock;
pub use watchman_file::{read_to_string, WatchmanFile};
