/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use futures::future::BoxFuture;
use rustc_hash::FxHashMap;

use super::Artifact;

/// Function that fetches existing file hashes for artifacts from a fast source
/// (e.g. Eden's Thrift API) to avoid unnecessary writes.
///
/// The returned future must be `'static` (not borrow the input slice) so it can
/// be spawned as a background task and overlapped with other commit work.
/// Implementations should extract any needed data (e.g. file paths) from the
/// artifact slice synchronously before returning the async future.
pub type GetArtifactsFileHashMapFn = Box<
    dyn Send
        + Sync
        + Fn(&[Artifact]) -> BoxFuture<'static, Option<FxHashMap<String, Option<String>>>>,
>;
