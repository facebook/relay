/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use intern::string_key::Intern;
use intern::string_key::StringKey;

#[derive(Debug, Copy, Clone)]
pub struct ConnectionConstants {
    pub connection_directive_name: DirectiveName,
    pub stream_connection_directive_name: DirectiveName,

    pub direction_forward: StringKey,
    pub direction_backward: StringKey,
    pub direction_bidirectional: StringKey,

    pub after_arg_name: ArgumentName,
    pub before_arg_name: ArgumentName,
    pub first_arg_name: ArgumentName,
    pub last_arg_name: ArgumentName,
    pub find_arg_name: ArgumentName,
    pub surrounds_arg_name: ArgumentName,
}

impl ConnectionConstants {
    pub fn is_connection_argument(&self, arg: ArgumentName) -> bool {
        arg == self.after_arg_name
            || arg == self.before_arg_name
            || arg == self.first_arg_name
            || arg == self.last_arg_name
            || arg == self.find_arg_name
            || arg == self.surrounds_arg_name
    }
}

impl Default for ConnectionConstants {
    fn default() -> Self {
        Self {
            connection_directive_name: DirectiveName("connection".intern()),
            stream_connection_directive_name: DirectiveName("stream_connection".intern()),

            direction_forward: "forward".intern(),
            direction_backward: "backward".intern(),
            direction_bidirectional: "bidirectional".intern(),

            after_arg_name: ArgumentName("after".intern()),
            before_arg_name: ArgumentName("before".intern()),
            first_arg_name: ArgumentName("first".intern()),
            last_arg_name: ArgumentName("last".intern()),
            find_arg_name: ArgumentName("find".intern()),
            surrounds_arg_name: ArgumentName("surrounds".intern()),
        }
    }
}
