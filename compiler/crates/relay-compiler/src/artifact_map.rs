/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::WrittenArtifacts;
use interner::StringKey;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

/// Name of a fragment or operation.
pub type DefinitionName = StringKey;

/// Tuple with the path and hash of the artifact
type ArtifactTuple = (PathBuf, Sha1Hash);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sha1Hash(String);

/// A map from DefinitionName to output artifacts and their hashes
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactMap(HashMap<DefinitionName, Vec<ArtifactTuple>>);

impl ArtifactMap {
    pub fn new(written_artifacts: WrittenArtifacts) -> Self {
        let mut map: HashMap<DefinitionName, Vec<ArtifactTuple>> = Default::default();
        for (path, artifact) in written_artifacts {
            let current_artifacts = map.get(&artifact.name);
            let artifact_tuple = (path, Sha1Hash(artifact.hash));
            match current_artifacts {
                Some(current_artifacts_tuples) => {
                    let mut next_artifacts_tuples = current_artifacts_tuples.to_owned();
                    next_artifacts_tuples.push(artifact_tuple);
                    map.insert(artifact.name, next_artifacts_tuples);
                }
                None => {
                    map.insert(artifact.name, vec![artifact_tuple]);
                }
            }
        }
        Self(map)
    }
}
