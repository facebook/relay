/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::Artifact;
use fnv::{FnvBuildHasher, FnvHashMap};
use interner::StringKey;
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};
use std::{collections::hash_map::Entry, path::PathBuf};

/// Name of a fragment or operation.
pub type DefinitionName = StringKey;

/// Tuple with the path and hash of the artifact
type ArtifactTuple = (PathBuf, Sha1Hash);

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Sha1Hash(String);

impl Sha1Hash {
    fn hash(data: &str) -> Self {
        let mut hash = Sha1::new();
        hash.input(data);
        Sha1Hash(hex::encode(hash.result()))
    }
}

/// A map from DefinitionName to output artifacts and their hashes
#[derive(Default, Serialize, Deserialize, Debug, Clone)]
pub struct ArtifactMap(pub FnvHashMap<DefinitionName, Vec<ArtifactTuple>>);

impl ArtifactMap {
    pub fn insert(&mut self, artifact: Artifact) {
        let artifact_tuple = (
            artifact.path,
            Sha1Hash::hash(
                "TODO", // &artifact.content
            ),
        );
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
        let mut map = ArtifactMap(FnvHashMap::with_capacity_and_hasher(
            artifacts.len(),
            FnvBuildHasher::default(),
        ));
        for artifact in artifacts {
            map.insert(artifact);
        }
        map
    }
}
