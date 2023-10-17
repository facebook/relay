/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schema::SDLSchema;

use super::Artifact;
use super::Config;
use super::Programs;
use super::ProjectConfig;

pub type GenerateExtraArtifactsFn = Box<
    dyn Fn(&Config, &ProjectConfig, &SDLSchema, &Programs, &[Artifact]) -> Vec<Artifact>
        + Send
        + Sync,
>;
