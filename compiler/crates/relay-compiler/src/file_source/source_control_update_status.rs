/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::{
    atomic::{AtomicI8, Ordering},
    Arc,
};

#[derive(Clone, Default, Debug)]
/// This structure is representing the state of the current source control update.
/// Watchman subscription will trigger updates here
pub struct SourceControlUpdateStatus {
    // default - no updates
    // 1 - update started
    // 2 - update completed
    value: Arc<AtomicI8>,
}

impl SourceControlUpdateStatus {
    pub fn mark_as_started(&self) {
        self.value.store(1, Ordering::Relaxed);
    }
    pub fn is_started(&self) -> bool {
        self.value.load(Ordering::Relaxed) == 1
    }
    pub fn mark_as_completed(&self) {
        self.value.store(2, Ordering::Relaxed);
    }
    pub fn is_completed(&self) -> bool {
        self.value.load(Ordering::Relaxed) == 2
    }
    pub fn set_to_default(&self) {
        self.value.store(Default::default(), Ordering::Relaxed);
    }
}
