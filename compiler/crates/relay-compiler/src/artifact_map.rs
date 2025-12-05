/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::PathBuf;

use dashmap::DashMap;
use dashmap::mapref::entry::Entry;
use docblock_shared::ResolverSourceHash;
use graphql_ir::ExecutableDefinitionName;
use relay_codegen::QueryID;
use relay_transforms::ArtifactSourceKeyData;
use serde::Deserialize;
use serde::Serialize;

use crate::build_project::Artifact;
use crate::build_project::ArtifactContent;

/// Record that contains path to the artifact, persisted_operation_id (when available)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactRecord {
    pub path: PathBuf,
    pub persisted_operation_id: Option<String>,
}
/// A map from DefinitionName to output artifacts records
#[derive(Default, Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactMap(pub DashMap<ArtifactSourceKey, Vec<ArtifactRecord>>);

/// An enum used to identify the source type a relay compiler artifact is generated from.
///
/// Artifacts can be derived from source types such as executable definitions, resolvers, or schemas.
#[derive(
    Serialize,
    Deserialize,
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    PartialOrd,
    Ord
)]
pub enum ArtifactSourceKey {
    /// Derived from a GraphQL Executable Definition, such as a Query, Mutation, or Fragment.
    ExecutableDefinition(ExecutableDefinitionName),
    /// Derived from a RelayResolver docblock.
    ResolverHash(ResolverSourceHash),
    /// Derived from GraphQL Schema.
    Schema(),
}

impl From<ArtifactSourceKeyData> for ArtifactSourceKey {
    fn from(directive: ArtifactSourceKeyData) -> Self {
        ArtifactSourceKey::ResolverHash(directive.0)
    }
}

impl ArtifactMap {
    pub fn insert(&self, artifact: Artifact) {
        let artifact_tuple = ArtifactRecord {
            path: artifact.path,
            persisted_operation_id: match artifact.content {
                ArtifactContent::Operation {
                    id_and_text_hash: Some(QueryID::Persisted { id, .. }),
                    ..
                } => Some(id),
                _ => None,
            },
        };

        for source_key in artifact.artifact_source_keys {
            match self.0.entry(source_key) {
                Entry::Occupied(mut entry) => {
                    entry.get_mut().push(artifact_tuple.clone());
                }
                Entry::Vacant(entry) => {
                    entry.insert(vec![artifact_tuple.clone()]);
                }
            }
        }
    }
}

impl From<Vec<Artifact>> for ArtifactMap {
    fn from(artifacts: Vec<Artifact>) -> Self {
        let map = ArtifactMap(DashMap::with_capacity(artifacts.len()));
        for artifact in artifacts {
            map.insert(artifact);
        }
        map
    }
}
