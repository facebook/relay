/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![warn(clippy::all)]

use std::fmt::Error;
use std::fmt::Write;
use std::path::PathBuf;

use common::NamedItem;
use common::SourceLocationKey;
use intern::Lookup;
use relay_codegen::printer::get_module_path;
use relay_transforms::get_fragment_filename;
use relay_transforms::get_resolver_fragment_dependency_name;
use relay_transforms::relay_resolvers::get_resolver_info;
use relay_transforms::relay_resolvers::ResolverInfo;
use relay_transforms::RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE;
use relay_typegen::TypegenLanguage;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use signedsource::sign_file;

use super::artifact_content::content::generate_docblock_section;
use super::artifact_content::content::write_export_generated_node;
use super::artifact_content::content_section::GenericSection;
use crate::config::Config;
use crate::config::ProjectConfig;
use crate::Artifact;
use crate::ArtifactContent;
use crate::ArtifactSourceKey;

pub fn generate_resolvers_schema_module(
    config: &Config,
    project_config: &ProjectConfig,
    schema: &SDLSchema,
    output_path: PathBuf,
) -> Result<Artifact, Error> {
    let content =
        generate_resolvers_schema_module_content(config, project_config, schema, &output_path)?;
    Ok(Artifact {
        artifact_source_keys: vec![ArtifactSourceKey::Schema()],
        path: output_path,
        content: ArtifactContent::Generic {
            content: sign_file(&content).into_bytes(),
        },
        source_file: SourceLocationKey::generated(),
    })
}

fn generate_resolvers_schema_module_content(
    config: &Config,
    project_config: &ProjectConfig,
    schema: &SDLSchema,
    artifact_path: &PathBuf,
) -> Result<String, Error> {
    let mut content = String::new();

    let docblock = generate_docblock_section(config, project_config, vec![])?;
    writeln!(content, "{}", docblock)?;

    let mut schema_resolvers_object = String::new();
    let mut schema_resolvers_type = String::new();
    let mut imports = String::new();

    writeln!(schema_resolvers_type, "type SchemaResolvers = {{")?;
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(
            schema_resolvers_object,
            "var schema_resolvers /*:: : SchemaResolvers*/ = {{"
        )?;
    } else {
        writeln!(
            schema_resolvers_object,
            "const schema_resolvers: SchemaResolvers = {{"
        )?;
    }
    writeln!(
        imports,
        "import type {{NormalizationSplitOperation}} from 'relay-runtime';"
    )?;

    for object in schema.get_objects() {
        let mut has_resolvers = false;

        for field in object.fields.iter().map(|field_id| schema.field(*field_id)) {
            if let Some(Ok(ResolverInfo {
                import_path,
                import_name: Some(import_name),
                ..
            })) = get_resolver_info(schema, field, field.name.location)
            {
                if field
                    .directives
                    .named(*RESOLVER_BELONGS_TO_BASE_SCHEMA_DIRECTIVE)
                    .is_some()
                {
                    continue;
                }

                if !has_resolvers {
                    has_resolvers = true;
                    writeln!(
                        schema_resolvers_type,
                        "\t{object_name}: {{",
                        object_name = object.name.item
                    )?;
                    writeln!(
                        schema_resolvers_object,
                        "\t{object_name}: {{",
                        object_name = object.name.item
                    )?;
                }

                let js_import_path = project_config.js_module_import_identifier(
                    artifact_path,
                    &PathBuf::from(import_path.lookup()),
                );
                let js_import_path_without_suffix =
                    get_module_path(project_config.js_module_format, js_import_path);

                let parent_type = match field.parent_type.unwrap() {
                    Type::Interface(interface_id) => schema.interface(interface_id).name.item.0,
                    Type::Object(object_id) => schema.object(object_id).name.item.0,
                    _ => panic!("Unexpected parent type for resolver."),
                };
                let type_name = format!("{}_{}", &parent_type, import_name);

                writeln!(
                    imports,
                    "import typeof {{ {import_name} as {type_name} }} from '{import_path}';",
                    import_path = js_import_path_without_suffix,
                    import_name = import_name,
                    type_name = type_name
                )?;

                writeln!(schema_resolvers_type, "\t\t{}: {{", import_name)?;
                writeln!(
                    schema_resolvers_type,
                    "\t\t\tresolverFunction: {},",
                    type_name
                )?;
                writeln!(
                    schema_resolvers_type,
                    "\t\t\trootFragment: ?NormalizationSplitOperation,"
                )?;
                writeln!(schema_resolvers_type, "\t\t}},",)?;

                writeln!(schema_resolvers_object, "\t\t{}: {{", import_name)?;
                writeln!(
                    schema_resolvers_object,
                    "\t\t\tresolverFunction: require('{import_path}').{import_name},",
                    import_path = js_import_path_without_suffix,
                    import_name = import_name
                )?;
                writeln!(
                    schema_resolvers_object,
                    "\t\t\trootFragment: {}",
                    match get_resolver_fragment_dependency_name(field) {
                        None => "null".to_string(),
                        Some(fragment_name) => {
                            format!(
                                "require('{import}')",
                                import = get_fragment_filename(fragment_name)
                            )
                        }
                    }
                )?;
                writeln!(schema_resolvers_object, "\t\t}},",)?;
            }
        }

        if has_resolvers {
            writeln!(schema_resolvers_type, "\t}},")?;
            writeln!(schema_resolvers_object, "\t}},")?;
        }
    }

    writeln!(schema_resolvers_type, "}};")?;
    writeln!(schema_resolvers_object, "}};")?;

    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "/*::")?;
    }
    writeln!(content, "{}\n", imports)?;
    writeln!(content, "{}\n", schema_resolvers_type)?;
    if project_config.typegen_config.language == TypegenLanguage::Flow {
        writeln!(content, "*/")?;
    }
    writeln!(content, "{}\n", schema_resolvers_object)?;

    let mut export = GenericSection::default();
    write_export_generated_node(
        &project_config.typegen_config,
        &mut export,
        "schema_resolvers",
        None,
    )?;
    writeln!(content, "{}", export)?;

    Ok(content)
}
