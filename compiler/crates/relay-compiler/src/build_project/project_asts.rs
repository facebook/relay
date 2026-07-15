/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use dependency_analyzer::ExecutableDefinitionNameSet;
use dependency_analyzer::ReachableAst;
use dependency_analyzer::get_reachable_ast;
use fnv::FnvHashMap;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentDefinitionNameSet;
use graphql_ir::OperationDefinitionName;
use graphql_syntax::ExecutableDefinition;
use relay_config::ProjectConfig;
use relay_config::ProjectName;
use relay_transforms::get_resolver_fragment_dependency_name;
use schema::SDLSchema;
use schema::Schema;

use crate::GraphQLAsts;
use crate::artifact_map::ArtifactSourceKey;
use crate::build_project::shadow_return_conversion::convert_shadow_return_fragment_spreads;
use crate::build_project::shadow_return_conversion::reject_user_authored_shadow_return_directive;
use crate::errors::BuildProjectError;

pub struct ProjectAsts {
    pub changed_names: ExecutableDefinitionNameSet,
    pub base_definition_names: ExecutableDefinitionNameSet,
    pub definitions: Vec<ExecutableDefinition>,
}

pub struct ProjectAstData {
    pub project_asts: ProjectAsts,
    pub base_fragment_names: FragmentDefinitionNameSet,
}

pub fn get_project_asts(
    schema: &SDLSchema,
    graphql_asts: &FnvHashMap<ProjectName, GraphQLAsts>,
    project_config: &ProjectConfig,
) -> Result<ProjectAstData, BuildProjectError> {
    let empty: &[ExecutableDefinition] = &[];
    let project_asts = graphql_asts
        .get(&project_config.name)
        .map(|asts| asts.get_all_executable_definitions())
        .unwrap_or(empty);
    let (base_project_asts, base_definition_names) = match project_config.base {
        Some(base_project_name) => {
            let base_project_asts = graphql_asts
                .get(&base_project_name)
                .map(|asts| asts.get_all_executable_definitions())
                .unwrap_or(empty);
            let base_definition_names = base_project_asts
                .iter()
                // TODO(T64459085): Figure out what to do about unnamed (anonymous) operations
                .filter_map(|definition| {
                    definition.name().map(|name| match definition {
                        ExecutableDefinition::Operation(_) => OperationDefinitionName(name).into(),
                        ExecutableDefinition::Fragment(_) => FragmentDefinitionName(name).into(),
                    })
                })
                .collect::<ExecutableDefinitionNameSet>();
            (base_project_asts, base_definition_names)
        }
        None => (empty, Default::default()),
    };
    find_duplicates(project_asts, base_project_asts).map_err(|errors| {
        BuildProjectError::ValidationErrors {
            errors,
            project_name: project_config.name,
        }
    })?;

    let mut base_resolver_fragment_asts =
        find_base_resolver_fragment_asts(schema, &base_definition_names, base_project_asts);

    let ReachableAst {
        mut definitions,
        mut base_fragment_names,
    } = get_reachable_ast(project_asts, base_project_asts);

    base_fragment_names.extend(
        base_resolver_fragment_asts
            .iter()
            .filter_map(|ast| ast.name().map(FragmentDefinitionName)),
    );
    definitions.append(&mut base_resolver_fragment_asts);

    // `@__relay_shadow_return` is internal to the compiler: the only legitimate
    // source of it is the conversion below (implemented in
    // `shadow_return_conversion`). Reject any user-authored occurrence before we
    // inject our own, so a product author cannot hand-write the trusted marker
    // and bypass the `...ReturnFragment` authoring form. This runs unconditionally
    // (independent of whether the schema defines any shadow resolvers).
    reject_user_authored_shadow_return_directive(&definitions).map_err(|errors| {
        BuildProjectError::ValidationErrors {
            errors,
            project_name: project_config.name,
        }
    })?;

    // Convert shadow-resolver `@returnFragment` placeholder spreads into the
    // schema-known internal `@__relay_shadow_return` directive on the enclosing
    // shadowed field. This must run while the documents are still raw
    // `graphql_syntax` ASTs (before `build_ir`), so that the placeholder spread —
    // which references a fragment that is never defined — does not reach
    // `build_ir` and trip its undefined-fragment validation. Covers both project
    // definitions and the appended base resolver fragments.
    //
    // Gated on the feature flag: the conversion scans every field in the schema
    // (O(100k+) on a server schema) to find shadow resolvers, and a valid shadow
    // resolver can only exist when `enable_shadow_resolvers` is fully enabled
    // (otherwise `@returnFragment` is rejected with
    // `ReturnFragmentRequiresFeatureFlag`). Skipping it for the ~all projects that
    // don't enable the feature avoids a full schema scan + allocations on every
    // build. This mirrors the gate in `shadow_resolvers_transform`, so the
    // conversion runs iff that transform will consume the marker.
    if project_config
        .feature_flags
        .enable_shadow_resolvers
        .is_fully_enabled()
    {
        convert_shadow_return_fragment_spreads(
            schema,
            &mut definitions,
            project_config.schema_config.node_interface_id_field,
        )
        .map_err(|errors| BuildProjectError::ValidationErrors {
            errors,
            project_name: project_config.name,
        })?;
    }

    Ok(ProjectAstData {
        project_asts: ProjectAsts {
            definitions,
            base_definition_names,
            changed_names: find_changed_names(graphql_asts, project_config),
        },
        base_fragment_names,
    })
}

fn find_changed_names(
    graphql_asts: &FnvHashMap<ProjectName, GraphQLAsts>,
    project_config: &ProjectConfig,
) -> ExecutableDefinitionNameSet {
    let mut changed_names = graphql_asts
        .get(&project_config.name)
        .map(|asts| asts.pending_definition_names.clone())
        .unwrap_or_default();

    // Also include removed definition names so that the incremental build
    // can find and recompile definitions that were affected by the deletion.
    if let Some(asts) = graphql_asts.get(&project_config.name) {
        for removed in &asts.removed_definition_names {
            if let ArtifactSourceKey::ExecutableDefinition(name) = removed {
                changed_names.insert(*name);
            }
        }
    }

    if let Some(base_project_name) = project_config.base {
        changed_names.extend(
            graphql_asts
                .get(&base_project_name)
                .map(|asts| asts.pending_definition_names.clone())
                .unwrap_or_default(),
        );
        if let Some(asts) = graphql_asts.get(&base_project_name) {
            for removed in &asts.removed_definition_names {
                if let ArtifactSourceKey::ExecutableDefinition(name) = removed {
                    changed_names.insert(*name);
                }
            }
        }
    }
    changed_names
}

pub fn find_duplicates(
    asts: &[ExecutableDefinition],
    base_asts: &[ExecutableDefinition],
) -> Result<(), Vec<Diagnostic>> {
    let mut definitions = FnvHashMap::default();

    let mut errors = Vec::new();
    for def in asts.iter().chain(base_asts) {
        if let Some(name) = def.name_identifier()
            && let Some(prev_def) = definitions.insert(name.value, def)
        {
            errors.push(
                Diagnostic::error(
                    graphql_ir::ValidationMessage::DuplicateDefinition(name.value),
                    def.location().with_span(name.span),
                )
                .annotate(
                    "previously defined here",
                    prev_def
                        .name_location()
                        .unwrap_or_else(|| prev_def.location()),
                ),
            );
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}

/// For all resolver fields defined on the schema
/// this method will return a list of documents from the base projects
fn find_base_resolver_fragment_asts(
    schema: &SDLSchema,
    base_definition_asts: &ExecutableDefinitionNameSet,
    base_project_asts: &[ExecutableDefinition],
) -> Vec<ExecutableDefinition> {
    let mut base_resolver_fragments = ExecutableDefinitionNameSet::default();
    for field in schema.fields() {
        if let Some(fragment_name) = get_resolver_fragment_dependency_name(field)
            && base_definition_asts.contains(&fragment_name.into())
        {
            base_resolver_fragments.insert(fragment_name.into());
        }
    }

    base_project_asts
        .iter()
        .filter(|definition| match definition {
            ExecutableDefinition::Fragment(fragment) => {
                let name = FragmentDefinitionName(fragment.name.value).into();
                base_resolver_fragments.contains(&name)
            }
            ExecutableDefinition::Operation(_) => false,
        })
        .cloned()
        .collect::<Vec<_>>()
}
