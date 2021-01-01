use crate::ErrorCode;
use serde::Deserialize;
use serde_json::Value;
use std::fs::File;
use std::io::BufReader;
use std::path::Path;
use std::process::Command;

pub trait Loader<T> {
    fn load(&self, path: &Path) -> Result<Option<T>, ErrorCode>;
}

pub struct PackageJsonLoader<'a> {
    pub key: &'a str,
}
impl<'a, T: for<'de> Deserialize<'de>> Loader<T> for PackageJsonLoader<'a> {
    fn load(&self, path: &Path) -> Result<Option<T>, ErrorCode> {
        let file = File::open(&path).unwrap();
        let reader = BufReader::new(file);
        let mut package_json: Value = serde_json::from_reader(reader)
            .map_err(|error| ErrorCode::PackageJsonParseError { error })?;
        if let Some(config_value) = package_json.get_mut(self.key).take() {
            match serde_json::from_value::<T>(config_value.clone()) {
                Ok(config) => {
                    return Ok(Some(config));
                }
                Err(error) => {
                    return Err(ErrorCode::PackageJsonInvalidValue {
                        key: self.key.into(),
                        error,
                    });
                }
            }
        } else {
            Ok(None)
        }
    }
}

pub struct YamlLoader;
impl<T> Loader<T> for YamlLoader {
    fn load(&self, _path: &Path) -> Result<Option<T>, ErrorCode> {
        Err(ErrorCode::YamlFileUnsupported)
    }
}

pub struct JsonLoader;
impl<T: for<'de> Deserialize<'de> + 'static> Loader<T> for JsonLoader {
    fn load(&self, path: &Path) -> Result<Option<T>, ErrorCode> {
        let file = File::open(&path).unwrap();
        let reader = BufReader::new(file);
        let config = serde_json::from_reader(reader)?;
        Ok(Some(config))
    }
}

pub struct JsLoader;
impl<T: for<'de> Deserialize<'de> + 'static> Loader<T> for JsLoader {
    fn load(&self, path: &Path) -> Result<Option<T>, ErrorCode> {
        let output = Command::new("node")
            .arg("-e")
            .arg(r#"process.stdout.write(JSON.stringify(require(process.argv[1])))"#)
            .arg(&path)
            .output()
            .expect("failed to execute process");

        if output.status.success() {
            let value = serde_json::from_slice::<T>(&output.stdout);
            Ok(Some(value.unwrap()))
        } else {
            Err(ErrorCode::NodeExecuteError { output })
        }
    }
}
