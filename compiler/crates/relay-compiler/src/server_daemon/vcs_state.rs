/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! VCS state detection for rebase/merge operations.
//!
//! During a rebase or merge, the working copy may be in a transient state
//! where the daemon's cached artifacts are invalid. This module detects
//! these states so the client can fall back to a direct build.

use std::path::Path;

/// Sentinel files under `.hg` / `.sl` that indicate an in-progress
/// rebase, merge, or histedit.
const HG_SL_SENTINELS: &[&str] = &[
    "rebasestate",
    "merge/state",
    "merge/state2",
    "histedit-state",
];

/// Sentinel files / directories under `.git` that indicate an in-progress
/// merge, rebase, or cherry-pick.
const GIT_SENTINELS: &[&str] = &[
    "MERGE_HEAD",
    "rebase-merge",
    "rebase-apply",
    "CHERRY_PICK_HEAD",
];

/// Returns `true` if the repository rooted at `root_dir` is currently in
/// a rebase, merge, or histedit state.
///
/// Checks `.hg` and `.sl` (Mercurial / Sapling) sentinels as well as
/// common `.git` sentinels so the daemon can detect transient states
/// across the supported VCS backends.
pub fn is_in_rebase_or_merge_state(root_dir: &Path) -> bool {
    let hg_dirs = [root_dir.join(".hg"), root_dir.join(".sl")];
    for vcs_dir in &hg_dirs {
        for sentinel in HG_SL_SENTINELS {
            if vcs_dir.join(sentinel).exists() {
                return true;
            }
        }
    }
    let git_dir = root_dir.join(".git");
    for sentinel in GIT_SENTINELS {
        if git_dir.join(sentinel).exists() {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_vcs_dir() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_clean_hg_repo() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir(dir.path().join(".hg")).unwrap();
        assert!(!is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_hg_rebasestate() {
        let dir = tempfile::tempdir().unwrap();
        let hg_dir = dir.path().join(".hg");
        std::fs::create_dir(&hg_dir).unwrap();
        std::fs::write(hg_dir.join("rebasestate"), b"").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_hg_merge_state() {
        let dir = tempfile::tempdir().unwrap();
        let hg_dir = dir.path().join(".hg");
        std::fs::create_dir_all(hg_dir.join("merge")).unwrap();
        std::fs::write(hg_dir.join("merge/state"), b"").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_hg_merge_state2() {
        let dir = tempfile::tempdir().unwrap();
        let hg_dir = dir.path().join(".hg");
        std::fs::create_dir_all(hg_dir.join("merge")).unwrap();
        std::fs::write(hg_dir.join("merge/state2"), b"").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_hg_histeditstate() {
        let dir = tempfile::tempdir().unwrap();
        let hg_dir = dir.path().join(".hg");
        std::fs::create_dir(&hg_dir).unwrap();
        std::fs::write(hg_dir.join("histedit-state"), b"").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_sl_rebasestate() {
        let dir = tempfile::tempdir().unwrap();
        let sl_dir = dir.path().join(".sl");
        std::fs::create_dir(&sl_dir).unwrap();
        std::fs::write(sl_dir.join("rebasestate"), b"").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_clean_sl_repo() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir(dir.path().join(".sl")).unwrap();
        assert!(!is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_clean_git_repo() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::create_dir(dir.path().join(".git")).unwrap();
        assert!(!is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_git_merge_head() {
        let dir = tempfile::tempdir().unwrap();
        let git_dir = dir.path().join(".git");
        std::fs::create_dir(&git_dir).unwrap();
        std::fs::write(git_dir.join("MERGE_HEAD"), b"abc").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_git_rebase_merge() {
        let dir = tempfile::tempdir().unwrap();
        let git_dir = dir.path().join(".git");
        std::fs::create_dir_all(git_dir.join("rebase-merge")).unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }

    #[test]
    fn test_git_cherry_pick_head() {
        let dir = tempfile::tempdir().unwrap();
        let git_dir = dir.path().join(".git");
        std::fs::create_dir(&git_dir).unwrap();
        std::fs::write(git_dir.join("CHERRY_PICK_HEAD"), b"abc").unwrap();
        assert!(is_in_rebase_or_merge_state(dir.path()));
    }
}
