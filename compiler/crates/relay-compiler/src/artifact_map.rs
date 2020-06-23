/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::Artifact;
use interner::StringKey;
use serde::{Deserialize, Serialize};
use sha1::{Digest, Sha1};
use std::collections::{hash_map::Entry, HashMap};
use std::path::PathBuf;

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
pub struct ArtifactMap(HashMap<DefinitionName, Vec<ArtifactTuple>>);

impl ArtifactMap {
    pub fn insert(&mut self, artifact: Artifact) {
        let artifact_tuple = (
            artifact.path,
            Sha1Hash::hash(
                "TODO", // &artifact.content
            ),
        );
        match self.0.entry(artifact.name) {
            Entry::Occupied(mut entry) => {
                entry.get_mut().push(artifact_tuple);
            }
            Entry::Vacant(entry) => {
                entry.insert(vec![artifact_tuple]);
            }
        }
    }
}
