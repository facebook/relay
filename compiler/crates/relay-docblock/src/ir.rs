/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::WithLocation;
use intern::string_key::StringKey;

#[derive(Debug, PartialEq)]
pub enum DocblockIr {
    RelayResolver(RelayResolverIr),
}

#[derive(Debug, PartialEq)]
pub struct RelayResolverIr {
    pub field_name: WithLocation<StringKey>,
    pub on_type: WithLocation<StringKey>,
    pub root_fragment: WithLocation<StringKey>,
    pub edge_to: Option<WithLocation<StringKey>>,
    pub description: Option<WithLocation<StringKey>>,
}
