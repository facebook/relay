/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{FeatureFlags, Rollout, SourceLocationKey};
use fmt::Debug;
use fnv::FnvBuildHasher;
use indexmap::IndexMap;
use intern::string_key::{Intern, StringKey};
use regex::Regex;
use serde::{de::Error, Deserialize, Deserializer, Serialize};
use serde_json::Value;
use std::{fmt, path::PathBuf, sync::Arc, usize};

use crate::{connection_interface::ConnectionInterface, JsModuleFormat, TypegenConfig};

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

pub type ProjectName = StringKey;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RemotePersistConfig {
    /// URL to send a POST request to to persist.
    pub url: String,
    /// The document will be in a POST parameter `text`. This map can contain
    /// additional parameters to send.
    #[serde(default)]
    pub params: FnvIndexMap<String, String>,

    #[serde(
        default,
        rename = "concurrency",
        deserialize_with = "deserialize_semaphore_permits"
    )]
    pub semaphore_permits: Option<usize>,
}

fn deserialize_semaphore_permits<'de, D>(d: D) -> Result<Option<usize>, D::Error>
where
    D: Deserializer<'de>,
{
    let permits: usize = Deserialize::deserialize(d)?;
    if permits == 0 {
        return Err(Error::custom(
            "Invalid `persistConfig.concurrency` value. Please, increase the number of concurrent request for query persisting. 0 is not going to work.",
        ));
    }
    Ok(Some(permits))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LocalPersistAlgorithm {
    MD5,
    SHA1,
    SHA256,
}

impl Default for LocalPersistAlgorithm {
    // For backwards compatibility
    fn default() -> Self {
        Self::MD5
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LocalPersistConfig {
    pub file: PathBuf,

    #[serde(default)]
    pub algorithm: LocalPersistAlgorithm,
}

#[derive(Debug, Serialize, Clone)]
#[serde(untagged)]
pub enum PersistConfig {
    Remote(RemotePersistConfig),
    Local(LocalPersistConfig),
}

impl<'de> Deserialize<'de> for PersistConfig {
    fn deserialize<D: Deserializer<'de>>(deserializer: D) -> std::result::Result<Self, D::Error> {
        let value = Value::deserialize(deserializer)?;
        match RemotePersistConfig::deserialize(value.clone()) {
            Ok(remote_config) => Ok(PersistConfig::Remote(remote_config)),
            Err(remote_error) => match LocalPersistConfig::deserialize(value) {
                Ok(local_config) => {
                    if !local_config.file.exists() {
                        Err(Error::custom(format!(
                            "The file `{}` for the local query persisting does not exist. Please, make sure the file path is correct.",
                            local_config.file.display()
                        )))
                    } else {
                        Ok(PersistConfig::Local(local_config))
                    }
                }
                Err(local_error) => {
                    let error_message = format!(
                        r#"Persist configuration cannot be parsed as a remote configuration due to:
- {:?}.

It also cannot be a local persist configuration due to:
- {:?}."#,
                        remote_error, local_error
                    );

                    Err(Error::custom(error_message))
                }
            },
        }
    }
}

#[derive(Clone, Debug)]
pub enum SchemaLocation {
    File(PathBuf),
    Directory(PathBuf),
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaConfig {
    #[serde(default)]
    pub connection_interface: ConnectionInterface,

    /// The name of the `id` field that exists on the `Node` interface.
    #[serde(default = "default_node_interface_id_field")]
    pub node_interface_id_field: StringKey,
}

fn default_node_interface_id_field() -> StringKey {
    "id".intern()
}

impl Default for SchemaConfig {
    fn default() -> Self {
        Self {
            connection_interface: ConnectionInterface::default(),
            node_interface_id_field: default_node_interface_id_field(),
        }
    }
}

pub struct ProjectConfig {
    pub name: ProjectName,
    pub base: Option<ProjectName>,
    pub output: Option<PathBuf>,
    pub extra_artifacts_output: Option<PathBuf>,
    pub shard_output: bool,
    pub shard_strip_regex: Option<Regex>,
    pub schema_extensions: Vec<PathBuf>,
    pub enabled: bool,
    pub schema_location: SchemaLocation,
    pub schema_config: SchemaConfig,
    pub typegen_config: TypegenConfig,
    pub persist: Option<PersistConfig>,
    pub variable_names_comment: bool,
    pub extra: serde_json::Value,
    pub feature_flags: Arc<FeatureFlags>,
    pub test_path_regex: Option<Regex>,
    pub filename_for_artifact:
        Option<Box<dyn (Fn(SourceLocationKey, StringKey) -> String) + Send + Sync>>,
    pub skip_types_for_artifact: Option<Box<dyn (Fn(SourceLocationKey) -> bool) + Send + Sync>>,
    pub rollout: Rollout,
    pub js_module_format: JsModuleFormat,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: "default".intern(),
            feature_flags: Default::default(),
            base: None,
            output: None,
            extra_artifacts_output: None,
            shard_output: false,
            shard_strip_regex: None,
            schema_extensions: vec![],
            enabled: true,
            schema_location: SchemaLocation::File(PathBuf::default()),
            schema_config: Default::default(),
            typegen_config: Default::default(),
            persist: None,
            variable_names_comment: false,
            extra: Default::default(),
            test_path_regex: None,
            filename_for_artifact: None,
            skip_types_for_artifact: None,
            rollout: Default::default(),
            js_module_format: Default::default(),
        }
    }
}

impl Debug for ProjectConfig {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let ProjectConfig {
            name,
            base,
            output,
            extra_artifacts_output,
            shard_output,
            shard_strip_regex,
            schema_extensions,
            enabled,
            schema_location,
            schema_config,
            typegen_config,
            persist,
            variable_names_comment,
            extra,
            feature_flags,
            test_path_regex,
            filename_for_artifact,
            skip_types_for_artifact,
            rollout,
            js_module_format,
        } = self;
        f.debug_struct("ProjectConfig")
            .field("name", name)
            .field("base", base)
            .field("output", output)
            .field("extra_artifacts_output", extra_artifacts_output)
            .field("shard_output", shard_output)
            .field("shard_strip_regex", shard_strip_regex)
            .field("schema_extensions", schema_extensions)
            .field("enabled", enabled)
            .field("schema_location", schema_location)
            .field("schema_config", schema_config)
            .field("typegen_config", typegen_config)
            .field("persist", persist)
            .field("variable_names_comment", variable_names_comment)
            .field("extra", extra)
            .field("feature_flags", feature_flags)
            .field("test_path_regex", test_path_regex)
            .field(
                "filename_for_artifact",
                &if filename_for_artifact.is_some() {
                    "Some<Fn>"
                } else {
                    "None"
                },
            )
            .field(
                "skip_types_for_artifact",
                &if skip_types_for_artifact.is_some() {
                    "Some<Fn>"
                } else {
                    "None"
                },
            )
            .field("rollout", rollout)
            .field("js_module_format", js_module_format)
            .finish()
    }
}
