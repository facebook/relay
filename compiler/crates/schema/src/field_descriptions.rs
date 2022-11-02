/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref CLIENT_ID_DESCRIPTION: StringKey = "Relay's cache key for this object.".intern();
    pub static ref TYPENAME_DESCRIPTION: StringKey =
        "This object's GraphQL type. Provided by GraphQL type name introspection.".intern();
}
