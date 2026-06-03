/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use futures::future::BoxFuture;
use rustc_hash::FxHashMap;
use tokio::task::JoinHandle;

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

pub(crate) type ArtifactHashMapHandle = JoinHandle<Option<FxHashMap<String, Option<String>>>>;

/// Spawn Eden hash map prefetch as a background tokio task.
pub(crate) fn spawn_artifact_hash_map_prefetch(
    get_artifacts_file_hash_map: Option<&GetArtifactsFileHashMapFn>,
    artifacts: &[Artifact],
) -> Option<ArtifactHashMapHandle> {
    if artifacts.is_empty() {
        return None;
    }
    get_artifacts_file_hash_map.map(|get_fn| tokio::spawn(get_fn(artifacts)))
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;
    use std::sync::Arc;
    use std::sync::atomic::AtomicBool;
    use std::sync::atomic::Ordering;

    use common::SourceLocationKey;

    use super::*;
    use crate::artifact_content::ArtifactContent;

    fn make_test_artifact(path: &str) -> Artifact {
        Artifact {
            artifact_source_keys: vec![],
            path: PathBuf::from(path),
            content: ArtifactContent::Generic { content: vec![] },
            source_file: SourceLocationKey::generated(),
        }
    }

    #[tokio::test]
    async fn test_spawn_prefetch_empty_artifacts_returns_none() {
        let get_fn: Option<GetArtifactsFileHashMapFn> =
            Some(Box::new(|_| Box::pin(async { Some(FxHashMap::default()) })));
        let result = spawn_artifact_hash_map_prefetch(get_fn.as_ref(), &[]);
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_spawn_prefetch_no_function_returns_none() {
        let artifact = make_test_artifact("test.js");
        let result = spawn_artifact_hash_map_prefetch(None, &[artifact]);
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn test_spawn_prefetch_returns_handle_with_correct_result() {
        let mut expected: FxHashMap<String, Option<String>> = FxHashMap::default();
        expected.insert("foo.js".to_string(), Some("abc123".to_string()));
        expected.insert("bar.js".to_string(), None);
        let expected_clone = expected.clone();

        let get_fn: Option<GetArtifactsFileHashMapFn> = Some(Box::new(move |_| {
            let map = expected_clone.clone();
            Box::pin(async move { Some(map) })
        }));

        let artifacts = vec![make_test_artifact("foo.js"), make_test_artifact("bar.js")];
        let handle = spawn_artifact_hash_map_prefetch(get_fn.as_ref(), &artifacts);
        assert!(handle.is_some());

        let result = handle.unwrap().await.unwrap();
        assert!(result.is_some());
        let map = result.unwrap();
        assert_eq!(map.get("foo.js"), expected.get("foo.js"));
        assert_eq!(map.get("bar.js"), expected.get("bar.js"));
    }

    #[tokio::test]
    async fn test_spawn_prefetch_closure_receives_artifacts() {
        let was_called = Arc::new(AtomicBool::new(false));
        let was_called_clone = was_called.clone();

        let get_fn: Option<GetArtifactsFileHashMapFn> = Some(Box::new(move |artifacts| {
            assert_eq!(artifacts.len(), 2);
            was_called_clone.store(true, Ordering::SeqCst);
            Box::pin(async { None })
        }));

        let artifacts = vec![make_test_artifact("a.js"), make_test_artifact("b.js")];
        let handle = spawn_artifact_hash_map_prefetch(get_fn.as_ref(), &artifacts);
        handle.unwrap().await.unwrap();
        assert!(was_called.load(Ordering::SeqCst));
    }
}
