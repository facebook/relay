/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod error;
mod loader;

pub use error::{ConfigError, ErrorCode};
use loader::{JsLoader, JsonLoader, Loader, PackageJsonLoader, YamlLoader};
use serde::Deserialize;
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub struct Config<T> {
    pub path: PathBuf,
    pub value: T,
}

pub fn search<T>(name: &str, dir: &Path) -> Result<Option<Config<T>>, ConfigError>
where
    T: for<'de> Deserialize<'de> + 'static,
{
    let loaders: Vec<(String, Box<dyn Loader<T>>)> = vec![
        (
            String::from("package.json"),
            Box::new(PackageJsonLoader { key: name }),
        ),
        (format!(".{}rc", name), Box::new(JsonLoader)),
        (format!(".{}rc.json", name), Box::new(JsonLoader)),
        (format!(".{}rc.yaml", name), Box::new(YamlLoader)),
        (format!(".{}rc.yml", name), Box::new(YamlLoader)),
        (format!(".{}rc.js", name), Box::new(JsLoader)),
        (format!(".{}rc.cjs", name), Box::new(JsLoader)),
        (format!("{}.config.js", name), Box::new(JsLoader)),
        (format!("{}.config.cjs", name), Box::new(JsLoader)),
    ];

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
