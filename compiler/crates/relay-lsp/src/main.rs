/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![warn(clippy::all)]

use env_logger::Env;
use relay_compiler::config::Config;
use relay_language_server::error::Result;
use relay_language_server::start_language_server;
use std::path::PathBuf;

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::from_env(Env::default().default_filter_or("info, warn, error, debug")).init();
    start_language_server(load_config()).await
}

fn load_config() -> Config {
    // TODO(brandondail) don't hardcode the test project config here
    let home = std::env::var("HOME").unwrap();
    let config_path = PathBuf::from(format!(
        "{}/fbsource/fbcode/relay/config/config.example.json",
        home
    ));
    let config = Config::load(config_path).unwrap();
    config
}
