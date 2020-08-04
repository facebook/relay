/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::Deserialize;

#[derive(Debug, Default, Deserialize)]
pub struct FeatureFlags {
    pub enable_flight_transform: bool,
}
