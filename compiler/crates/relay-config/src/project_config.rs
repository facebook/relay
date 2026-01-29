/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;
use std::path::MAIN_SEPARATOR;
use std::path::Path;
use std::path::PathBuf;
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
use serde::Deserialize;
use serde::Deserializer;
use serde::Serialize;
use serde::de::Error;
use serde_json::Value;

use crate::JsModuleFormat;
use crate::ProjectName;
use crate::TypegenConfig;
use crate::TypegenLanguage;
use crate::connection_interface::ConnectionInterface;
use crate::defer_stream_interface::DeferStreamInterface;
use crate::diagnostic_report_config::DiagnosticReportConfig;
use crate::module_import_config::ModuleImportConfig;
use crate::non_node_id_fields_config::NonNodeIdFieldsConfig;
use crate::resolvers_schema_module_config::ResolversSchemaModuleConfig;

type FnvIndexMap<K, V> = IndexMap<K, V, FnvBuildHasher>;

/// Configuration for remote persistence of GraphQL documents.
#[derive(Clone, Debug, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields, rename_all = "camelCase")]
pub struct RemotePersistConfig {
    /// URL that the document should be persisted to via a POST request.
    pub url: String,
    /// Additional parameters to include in the POST request.
    ///
    /// The main document will be in a POST parameter `text`. This map can contain
    /// additional parameters to send.
    #[serde(default)]
    pub params: FnvIndexMap<String, String>,

    /// Additional headers to include in the POST request.
    #[serde(default)]
    pub headers: FnvIndexMap<String, String>,

    /// Number of concurrent requests that can be made to the server.
    #[serde(
        default,
        rename = "concurrency",
        deserialize_with = "deserialize_semaphore_permits"
    )]
    pub semaphore_permits: Option<usize>,

    /// Whether to include the query text in the persisted document.
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

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[derive(JsonSchema)]
pub enum LocalPersistAlgorithm {
    #[default]
    MD5,
    SHA1,
    SHA256,
}

/// Configuration for local persistence of GraphQL documents.
///
/// This struct contains settings that control how GraphQL documents are persisted locally.
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(deny_unknown_fields)]
pub struct LocalPersistConfig {
    /// The file path where the persisted documents will be written.
    pub file: PathBuf,

    /// The algorithm to use for hashing the operation text.
    #[serde(default)]
    pub algorithm: LocalPersistAlgorithm,

    /// Whether to include the query text in the persisted document.
    #[serde(default)]
    pub include_query_text: bool,
}

/// Configuration for how the Relay Compiler should persist GraphQL queries.
#[derive(Debug, Serialize, Clone, JsonSchema)]
#[serde(untagged)]
pub enum PersistConfig {
    /// This variant represents a remote persistence configuration, where GraphQL queries are sent to a remote endpoint for persistence.
    Remote(RemotePersistConfig),
    /// This variant represents a local persistence configuration, where GraphQL queries are persisted to a local JSON file.
    ///
    /// When this variant is used, the compiler will attempt to read the local file as a hash map,
    /// add new queries to the map, and then serialize and write the resulting map to the configured path.
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
- {remote_error:?}.

It also cannot be a local persist configuration due to:
- {local_error:?}."#
                    );

                    Err(Error::custom(error_message))
                }
            },
        }
    }
}

/// Specifies the type of location of a GraphQL schema, and the path to the schema location.
#[derive(Clone, Debug, JsonSchema)]
pub enum SchemaLocation {
    /// A single file containing the schema.
    File(PathBuf),
    /// A directory containing multiple schema files.
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
    /// Configuration for connection field names in the schema.
    ///
    /// **Important**: When you configure this option in the compiler, you must also configure
    /// the Relay runtime to match by calling `ConnectionInterface.inject()` with the same values.
    /// See: <https://relay.dev/docs/api-reference/runtime-config/#connectioninterface>
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

    /// If we should select __token field on fetchable types
    #[serde(default = "default_enable_token_field")]
    pub enable_token_field: bool,
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

fn default_enable_token_field() -> bool {
    false
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
            enable_token_field: default_enable_token_field(),
        }
    }
}

type CustomArtifactFilePath = Box<dyn Fn(&PathBuf) -> PathBuf + Send + Sync>;

/// Configuration for a Relay project.
///
/// This struct contains various settings and options that control how Relay compiles and generates code for a project.
pub struct ProjectConfig {
    /// The name of the project.
    pub name: ProjectName,
    /// The base project configuration to inherit from.
    pub base: Option<ProjectName>,
    /// The output directory for extra artifacts.
    pub extra_artifacts_output: Option<PathBuf>,
    /// The configuration for extra artifacts.
    pub extra_artifacts_config: Option<ExtraArtifactsConfig>,
    /// A list of glob patterns specifying file extensions to exclude from compilation.
    pub excludes_extensions: Option<GlobSet>,
    /// The output directory for compiled artifacts.
    pub output: Option<PathBuf>,
    /// Whether to shard output into separate files.
    pub shard_output: bool,
    /// A regular expression to strip from file paths when sharding output.
    pub shard_strip_regex: Option<Regex>,
    /// A list of schema extensions to include in the project.
    pub schema_extensions: Vec<PathBuf>,
    /// Whether the project is enabled.
    pub enabled: bool,
    /// The name of the schema to use for this project.
    pub schema_name: Option<StringKey>,
    /// The location of the schema for this project.
    pub schema_location: SchemaLocation,
    /// The schema configuration for this project.
    pub schema_config: SchemaConfig,
    /// The typegen configuration for this project.
    pub typegen_config: TypegenConfig,
    /// The persist configuration for this project.
    pub persist: Option<PersistConfig>,
    /// Whether to include variable names in comments.
    pub variable_names_comment: bool,
    /// Additional metadata for the project.
    pub extra: serde_json::Value,
    /// Feature flags for the project.
    pub feature_flags: Arc<FeatureFlags>,
    /// Regular expression to match test files.
    pub test_path_regex: Option<Regex>,
    /// Rollout configuration for the project.
    pub rollout: Rollout,
    /// Format for JavaScript modules.
    pub js_module_format: JsModuleFormat,
    /// Configuration for module imports.
    pub module_import_config: ModuleImportConfig,
    /// Configuration for diagnostic reports.
    pub diagnostic_report_config: DiagnosticReportConfig,
    /// Configuration for resolvers schema module.
    pub resolvers_schema_module: Option<ResolversSchemaModuleConfig>,
    /// Command to run after code generation.
    pub codegen_command: Option<String>,
    /// Custom function to get the path for an artifact.
    pub get_custom_path_for_artifact: Option<CustomArtifactFilePath>,
    /// Treats JS module paths as relative to './' when true, and leaves JS
    /// module paths unmodified when false.
    pub relativize_js_module_paths: bool,
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
            schema_name: None,
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
            relativize_js_module_paths: true,
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
            schema_name,
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
            relativize_js_module_paths,
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
            .field("schema_name", schema_name)
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
            .field("relativize_js_module_paths", relativize_js_module_paths)
            .finish()
    }
}

impl ProjectConfig {
    /// Gets the correct path for a generated artifact based on its originating source file's
    /// location, and the project's configuration.
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

    /// Generates a path for an artifact file based on a definition name and its location.
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
                format!("{artifact_name}.graphql"),
            )
        };
        if let Some(get_custom_path_for_artifact) = &self.get_custom_path_for_artifact {
            get_custom_path_for_artifact(&path)
        } else {
            path
        }
    }

    /// Generates a path for an artifact file that is specific to the programming language being used.
    pub fn path_for_language_specific_artifact(
        &self,
        source_file: SourceLocationKey,
        artifact_file_name: String,
    ) -> PathBuf {
        let filename = match &self.typegen_config.language {
            TypegenLanguage::Flow | TypegenLanguage::JavaScript => {
                format!("{artifact_file_name}.js")
            }
            TypegenLanguage::TypeScript => format!("{artifact_file_name}.ts"),
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
                        "expected importing_artifact_path: {importing_artifact_path:?} to have a parent path, maybe it's not a file?"
                    );
                });
                let target_module_directory = target_module_path.parent().unwrap_or_else(||{
                    panic!(
                        "expected target_module_path: {target_module_path:?} to have a parent path, maybe it's not a file?"
                    );
                });
                let target_module_file_name = target_module_path.file_name().unwrap_or_else(|| {
                    panic!(
                        "expected target_module_path: {target_module_path:?} to have a file name"
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
