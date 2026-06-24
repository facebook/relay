/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::LazyLock;

use intern::string_key::Intern;
use intern::string_key::StringKey;

pub static CLIENT_ID_DESCRIPTION: LazyLock<StringKey> =
    LazyLock::new(|| "Relay's cache key for this object.".intern());
pub static TYPENAME_DESCRIPTION: LazyLock<StringKey> = LazyLock::new(|| {
    "This object's GraphQL type. Provided by GraphQL type name introspection.".intern()
});
