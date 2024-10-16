/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::path::Path;
use std::path::PathBuf;
use std::path::MAIN_SEPARATOR;
use std::sync::Arc;

use common::DirectiveName;
use common::FeatureFlags;
use common::Rollout;
use common::SourceLocationKey;
use common::WithLocation;
use fmt::Debug;
use fnv::FnvBuildHasher;
use globset::GlobSet;
use indexmap::IndexMap;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use regex::Regex;
use schemars::JsonSchema;
use serde::de::Error;
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde_json::Value;

use crate::connection_interface::ConnectionInterface;
use crate::defer_stream_interface::DeferStreamInterface;
use crate::diagnostic_report_config::DiagnosticReportConfig;
use crate::module_import_config::ModuleImportConfig;
use crate::non_node_id_fields_config::NonNodeIdFieldsConfig;
use crate::resolvers_schema_module_config::ResolversSchemaModuleConfig;
use crate::JsModuleFormat;
use crate::ProjectName;
use crate::TypegenConfig;
use crate::TypegenLanguage;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct RemotePersistConfig {
    /// URL to send a POST request to to persist.
    pub url: String,
    /// The document will be in a POST parameter `text`. This map can contain
    /// additional parameters to send.
    #[serde(default)]
    pub params: FnvIndexMap<String, String>,

    /// Additional headers to send
    #[serde(default)]
    pub headers: FnvIndexMap<String, String>,

    #[serde(
        default,
        rename = "concurrency",
        deserialize_with = "deserialize_semaphore_permits"
    )]
    pub semaphore_permits: Option<usize>,

    #[serde(default)]
    pub include_query_text: bool,
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
#[derive(JsonSchema)]
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

#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields)]
pub struct LocalPersistConfig {
    pub file: PathBuf,

    #[serde(default)]
    pub algorithm: LocalPersistAlgorithm,

    #[serde(default)]
    pub include_query_text: bool,
}

#[derive(Debug, Serialize, Clone, JsonSchema)]
#[serde(untagged)]
pub enum PersistConfig {
    Remote(RemotePersistConfig),
    Local(LocalPersistConfig),
}

impl PersistConfig {
    pub fn include_query_text(&self) -> bool {
        match self {
            PersistConfig::Remote(remote_config) => remote_config.include_query_text,
            PersistConfig::Local(local_config) => local_config.include_query_text,
        }
    }
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

#[derive(Clone, Debug, JsonSchema)]
pub enum SchemaLocation {
    File(PathBuf),
    Directory(PathBuf),
}

pub struct ExtraArtifactsConfig {
    pub filename_for_artifact: Box<dyn (Fn(SourceLocationKey, StringKey) -> String) + Send + Sync>,
    pub skip_types_for_artifact: Box<dyn (Fn(SourceLocationKey) -> bool) + Send + Sync>,
}

impl Debug for ExtraArtifactsConfig {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("ExtraArtifactsConfig")
            .field("filename_for_artifact", &"Fn")
            .field("skip_types_for_artifact", &"Fn")
            .finish()
    }
}

#[derive(Debug, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct SchemaConfig {
    #[serde(default)]
    pub connection_interface: ConnectionInterface,

    /// The name of the `id` field that exists on the `Node` interface.
    #[serde(default = "default_node_interface_id_field")]
    pub node_interface_id_field: StringKey,

    #[serde(default)]
    pub defer_stream_interface: DeferStreamInterface,

    /// The name of the variable expected by the `node` query.
    #[serde(default = "default_node_interface_id_variable_name")]
    pub node_interface_id_variable_name: StringKey,

    #[serde(default)]
    pub non_node_id_fields: Option<NonNodeIdFieldsConfig>,

    /// The name of the directive indicating fields that cannot be selected
    #[serde(default = "default_unselectable_directive_name")]
    pub unselectable_directive_name: DirectiveName,
}

fn default_node_interface_id_field() -> StringKey {
    "id".intern()
}

fn default_node_interface_id_variable_name() -> StringKey {
    "id".intern()
}

fn default_unselectable_directive_name() -> DirectiveName {
    DirectiveName("unselectable".intern())
}

impl Default for SchemaConfig {
    fn default() -> Self {
        Self {
            connection_interface: ConnectionInterface::default(),
            defer_stream_interface: DeferStreamInterface::default(),
            node_interface_id_field: default_node_interface_id_field(),
            node_interface_id_variable_name: default_node_interface_id_variable_name(),
            non_node_id_fields: None,
            unselectable_directive_name: default_unselectable_directive_name(),
        }
    }
}

type CustomArtifactFilePath = Box<dyn Fn(&PathBuf) -> PathBuf + Send + Sync>;

pub struct ProjectConfig {
    pub name: ProjectName,
    pub base: Option<ProjectName>,
    pub extra_artifacts_output: Option<PathBuf>,
    pub extra_artifacts_config: Option<ExtraArtifactsConfig>,
    pub excludes_extensions: Option<GlobSet>,
    pub output: Option<PathBuf>,
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
    pub rollout: Rollout,
    pub js_module_format: JsModuleFormat,
    pub module_import_config: ModuleImportConfig,
    pub diagnostic_report_config: DiagnosticReportConfig,
    pub resolvers_schema_module: Option<ResolversSchemaModuleConfig>,
    pub codegen_command: Option<String>,
    pub get_custom_path_for_artifact: Option<CustomArtifactFilePath>,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: ProjectName::default(),
            feature_flags: Default::default(),
            base: None,
            extra_artifacts_output: None,
            extra_artifacts_config: None,
            excludes_extensions: None,
            output: None,
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
            rollout: Default::default(),
            js_module_format: Default::default(),
            module_import_config: Default::default(),
            diagnostic_report_config: Default::default(),
            resolvers_schema_module: Default::default(),
            codegen_command: Default::default(),
            get_custom_path_for_artifact: None,
        }
    }
}

impl Debug for ProjectConfig {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let ProjectConfig {
            name,
            base,
            extra_artifacts_output,
            extra_artifacts_config,
            excludes_extensions,
            output,
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
            rollout,
            js_module_format,
            module_import_config,
            diagnostic_report_config,
            resolvers_schema_module,
            codegen_command,
            get_custom_path_for_artifact: _,
        } = self;
        f.debug_struct("ProjectConfig")
            .field("name", name)
            .field("base", base)
            .field("output", output)
            .field("extra_artifacts_config", extra_artifacts_config)
            .field("extra_artifacts_output", extra_artifacts_output)
            .field("excludes_extensions", excludes_extensions)
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
            .field("rollout", rollout)
            .field("js_module_format", js_module_format)
            .field("module_import_config", module_import_config)
            .field("diagnostic_report_config", diagnostic_report_config)
            .field("resolvers_schema_module", resolvers_schema_module)
            .field("codegen_command", codegen_command)
            .finish()
    }
}

impl ProjectConfig {
    /// This function will create a correct path for an artifact based on the project configuration
    pub fn create_path_for_artifact(
        &self,
        source_file: SourceLocationKey,
        artifact_file_name: String,
    ) -> PathBuf {
        if let Some(output) = &self.output {
            // If an output directory is specified, output into that directory.
            if self.shard_output {
                if let Some(ref regex) = self.shard_strip_regex {
                    let full_source_path = regex.replace_all(source_file.path(), "");
                    let mut output = output.join(full_source_path.to_string());
                    output.pop();
                    output
                } else {
                    output.join(source_file.get_dir())
                }
                .join(artifact_file_name)
            } else {
                output.join(artifact_file_name)
            }
        } else {
            // Otherwise, output into a file relative to the source.
            source_file
                .get_dir()
                .join("__generated__")
                .join(artifact_file_name)
        }
    }

    pub fn artifact_path_for_definition(
        &self,
        definition_name: WithLocation<impl Into<StringKey>>,
    ) -> PathBuf {
        let source_location = definition_name.location.source_location();
        let artifact_name = definition_name.item.into();
        let path = if let Some(extra_artifacts_config) = &self.extra_artifacts_config {
            let filename =
                (extra_artifacts_config.filename_for_artifact)(source_location, artifact_name);

            self.create_path_for_artifact(source_location, filename)
        } else {
            self.path_for_language_specific_artifact(
                source_location,
                format!("{}.graphql", artifact_name),
            )
        };
        if let Some(get_custom_path_for_artifact) = &self.get_custom_path_for_artifact {
            get_custom_path_for_artifact(&path)
        } else {
            path
        }
    }

    pub fn path_for_language_specific_artifact(
        &self,
        source_file: SourceLocationKey,
        artifact_file_name: String,
    ) -> PathBuf {
        let filename = match &self.typegen_config.language {
            TypegenLanguage::Flow | TypegenLanguage::JavaScript => {
                format!("{}.js", artifact_file_name)
            }
            TypegenLanguage::TypeScript => format!("{}.ts", artifact_file_name),
        };

        self.create_path_for_artifact(source_file, filename)
    }

    /// Generates identifier for importing module at `target_module_path` from module at `importing_artifact_path`.
    /// Import Identifier is a relative path in CommonJS projects and a module name in Haste projects.
    pub fn js_module_import_identifier(
        &self,
        importing_artifact_path: &PathBuf,
        target_module_path: &PathBuf,
    ) -> StringKey {
        match self.js_module_format {
            JsModuleFormat::CommonJS => {
                let importing_artifact_directory = importing_artifact_path.parent().unwrap_or_else(||{
                    panic!(
                        "expected importing_artifact_path: {:?} to have a parent path, maybe it's not a file?",
                        importing_artifact_path
                    );
                });
                let target_module_directory = target_module_path.parent().unwrap_or_else(||{
                    panic!(
                        "expected target_module_path: {:?} to have a parent path, maybe it's not a file?",
                        target_module_path
                    );
                });
                let target_module_file_name = target_module_path.file_name().unwrap_or_else(|| {
                    panic!(
                        "expected target_module_path: {:?} to have a file name",
                        target_module_path
                    )
                });
                let relative_path =
                    pathdiff::diff_paths(target_module_directory, importing_artifact_directory)
                        .unwrap();

                format_normalized_path(&relative_path.join(target_module_file_name)).intern()
            }
            JsModuleFormat::Haste => target_module_path
                .file_stem()
                .unwrap()
                .to_string_lossy()
                .intern(),
        }
    }
}

// Stringify a path such that it is stable across operating systems.
fn format_normalized_path(path: &Path) -> String {
    path.to_string_lossy()
        .to_string()
        .replace(MAIN_SEPARATOR, "/")
}
