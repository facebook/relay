/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::Artifact;
use super::Programs;
use super::ProjectConfig;
use schema::SDLSchema;

pub type GenerateExtraArtifactsFn =
    Box<dyn Fn(&ProjectConfig, &SDLSchema, &Programs, &[Artifact]) -> Vec<Artifact> + Send + Sync>;
