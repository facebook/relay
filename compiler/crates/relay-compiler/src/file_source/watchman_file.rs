/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use serde::Deserialize;
use watchman_client::prelude::*;

query_result_type! {
    pub struct WatchmanFile {
        pub name: NameField,
        pub exists: ExistsField,
    }
}
