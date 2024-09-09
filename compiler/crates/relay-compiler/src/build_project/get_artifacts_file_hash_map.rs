/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use futures::future::BoxFuture;
use rustc_hash::FxHashMap;

use super::Artifact;

pub type GetArtifactsFileHashMapFn = Box<
    dyn Send
        + Sync
        + for<'a> Fn(&'a [Artifact]) -> BoxFuture<'a, Option<FxHashMap<String, Option<String>>>>,
>;
