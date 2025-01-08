/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod error;
mod loader;

use std::fmt::Display;
use std::path::Path;
use std::path::PathBuf;

pub use error::ConfigError;
pub use error::ErrorCode;
use loader::JsLoader;
use loader::JsonLoader;
use loader::Loader;
use loader::PackageJsonLoader;
use loader::YamlLoader;
use serde::Deserialize;

#[derive(Debug)]
pub struct Config<T> {
    pub path: PathBuf,
    pub value: T,
}

pub enum LoaderSource {
    PackageJson(String),
    Json(String),
    Js(String),
    Yaml(String),
}

impl Display for LoaderSource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            match self {
                Self::PackageJson(name) => format!("`package.json` (\"{}\" key)", name),
                Self::Js(name) | Self::Json(name) | Self::Yaml(name) => format!("`{}`", name),
            }
        )
    }
}

pub fn load<T>(dir: &Path, sources: &[LoaderSource]) -> Result<Option<Config<T>>, ConfigError>
where
    T: for<'de> Deserialize<'de> + 'static,
{
    let mut loaders: Vec<(String, Box<dyn Loader<T>>)> = Vec::with_capacity(sources.len());
    for source in sources {
        match source {
            LoaderSource::PackageJson(name) => {
                loaders.push((
                    String::from("package.json"),
                    Box::new(PackageJsonLoader { key: name }),
                ));
            }
            LoaderSource::Js(name) => {
                loaders.push((name.clone(), Box::new(JsLoader)));
            }
            LoaderSource::Json(name) => {
                loaders.push((name.clone(), Box::new(JsonLoader)));
            }
            LoaderSource::Yaml(name) => {
                loaders.push((name.clone(), Box::new(YamlLoader)));
            }
        }
    }

    for search_dir in dir.ancestors() {
        for (file_name, loader) in &loaders {
            let file_path = search_dir.join(file_name);
            if file_path.exists() {
                match loader.load(&file_path) {
                    Ok(None) => {}
                    Ok(Some(value)) => {
                        return Ok(Some(Config {
                            path: file_path,
                            value,
                        }));
                    }
                    Err(code) => {
                        return Err(ConfigError {
                            path: file_path,
                            code,
                        });
                    }
                };
            }
        }
    }

    Ok(None)
}

pub fn search<T>(name: &str, dir: &Path) -> Result<Option<Config<T>>, ConfigError>
where
    T: for<'de> Deserialize<'de> + 'static,
{
    load(
        dir,
        &[
            LoaderSource::PackageJson(name.to_string()),
            LoaderSource::Json(format!(".{}rc", name)),
            LoaderSource::Json(format!("{}.config.json", name)),
            LoaderSource::Yaml(format!(".{}rc.yaml", name)),
            LoaderSource::Yaml(format!(".{}rc.yml", name)),
            LoaderSource::Js(format!(".{}.rc.js", name)),
            LoaderSource::Js(format!(".{}.rc.cjs", name)),
            LoaderSource::Js(format!("{}.config.js", name)),
            LoaderSource::Js(format!("{}.config.cjs", name)),
            LoaderSource::Js(format!("{}.config.mjs", name)),
        ],
    )
}
