/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::LazyLock;

use common::DirectiveName;
use intern::string_key::Intern;

pub static ARGUMENT_DEFINITION: LazyLock<DirectiveName> =
    LazyLock::new(|| DirectiveName("argumentDefinitions".intern()));
