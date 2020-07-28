/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::build_project::{artifact_writer::ArtifactWriter, Artifact};
use crate::errors::BuildProjectError;
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
pub struct ArtifactMap(FnvHashMap<DefinitionName, Vec<ArtifactTuple>>);

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

    pub fn remove(&mut self, name: &StringKey) -> Option<Vec<ArtifactTuple>> {
        self.0.remove(name)
    }

    pub fn update_and_remove(
        &mut self,
        update: ArtifactMap,
        artifact_writer: &mut Box<dyn ArtifactWriter>,
    ) -> Result<(), BuildProjectError> {
        for (definition_name, artifact_tuples) in update.0 {
            match self.0.entry(definition_name) {
                Entry::Occupied(mut entry) => {
                    let prev_tuples = entry.get_mut();
                    for (prev_path, _) in prev_tuples.drain(..) {
                        if !artifact_tuples.iter().any(|t| t.0 == prev_path) {
                            artifact_writer.remove(prev_path.clone())?;
                        }
                    }
                    prev_tuples.extend(artifact_tuples.into_iter());
                }
                Entry::Vacant(entry) => {
                    entry.insert(artifact_tuples);
                }
            }
        }
        Ok(())
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
