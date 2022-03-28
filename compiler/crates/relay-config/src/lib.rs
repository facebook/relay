/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

mod connection_interface;
mod js_module_format;
mod project_config;
mod typegen_config;

pub use connection_interface::ConnectionInterface;
pub use js_module_format::JsModuleFormat;
pub use project_config::{
    LocalPersistConfig, PersistConfig, ProjectConfig, ProjectName, RemotePersistConfig,
    SchemaConfig, SchemaLocation,
};
pub use typegen_config::{FlowTypegenConfig, TypegenConfig, TypegenLanguage};
