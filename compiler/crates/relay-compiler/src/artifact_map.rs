/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{Artifact, ArtifactContent};
use dashmap::{mapref::entry::Entry, DashMap};
use intern::string_key::StringKey;
use relay_codegen::QueryID;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Name of a fragment or operation.
pub type DefinitionName = StringKey;

/// Record that contains path to the artifact, persisted_operation_id (when available)
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactRecord {
    pub path: PathBuf,
    pub persisted_operation_id: Option<String>,
}
/// A map from DefinitionName to output artifacts records
#[derive(Default, Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactMap(pub DashMap<DefinitionName, Vec<ArtifactRecord>>);

impl ArtifactMap {
    pub fn insert(&self, artifact: Artifact) {
        let artifact_tuple = ArtifactRecord {
            path: artifact.path,
            persisted_operation_id: match artifact.content {
                ArtifactContent::Operation {
                    id_and_text_hash, ..
                } => match id_and_text_hash {
                    Some(QueryID::Persisted { id, .. }) => Some(id),
                    _ => None,
                },
                _ => None,
            },
        };

        for source_definition_name in artifact.source_definition_names {
            match self.0.entry(source_definition_name) {
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
