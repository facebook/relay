/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;

/// Name of a fragment or operation.
pub struct DefinitionName(StringKey);

/// Name of a compiler project.
#[derive(Eq, PartialEq, Hash, Debug, Deserialize, Clone, Copy)]
pub struct ProjectName(StringKey);

#[derive(Eq, PartialEq, Hash, Debug, Deserialize, Clone, Copy)]
pub struct SourceSetName(pub StringKey);

pub struct SourceSet(pub HashMap<PathBuf, Vec<String>>);

/// A map from DefinitionName to output artifacts and their hashes
pub struct ArtifactMap(HashMap<DefinitionName, Vec<(PathBuf, Sha1Hash)>>);

pub struct Sha1Hash(String);

pub struct CompilerState {
    pub source_sets: HashMap<SourceSetName, SourceSet>,
    pub schemas: HashMap<ProjectName, String>,
    pub extensions: HashMap<ProjectName, Vec<String>>,
    pub artifacts: HashMap<ProjectName, ArtifactMap>,
}
