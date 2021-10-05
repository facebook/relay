/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::{Artifact, Programs, ProjectConfig};
use fnv::FnvHashSet;
use interner::StringKey;
use schema::SDLSchema;
use std::sync::Arc;

pub type GenerateExtraArtifactsFn = Box<
    dyn Fn(
            &ProjectConfig,
            &SDLSchema,
            &Programs,
            &[Artifact],
            Arc<FnvHashSet<StringKey>>,
        ) -> Vec<Artifact>
        + Send
        + Sync,
>;
