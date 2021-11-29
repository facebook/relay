/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::string_key::{Intern, StringKey};

#[derive(Debug, Copy, Clone)]
pub struct ConnectionConstants {
    pub connection_directive_name: StringKey,
    pub stream_connection_directive_name: StringKey,

    pub direction_forward: StringKey,
    pub direction_backward: StringKey,
    pub direction_bidirectional: StringKey,

    pub after_arg_name: StringKey,
    pub before_arg_name: StringKey,
    pub first_arg_name: StringKey,
    pub last_arg_name: StringKey,
    pub find_arg_name: StringKey,
    pub surrounds_arg_name: StringKey,
}

impl ConnectionConstants {
    pub fn is_connection_argument(&self, arg: StringKey) -> bool {
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
            connection_directive_name: "connection".intern(),
            stream_connection_directive_name: "stream_connection".intern(),

            direction_forward: "forward".intern(),
            direction_backward: "backward".intern(),
            direction_bidirectional: "bidirectional".intern(),

            after_arg_name: "after".intern(),
            before_arg_name: "before".intern(),
            first_arg_name: "first".intern(),
            last_arg_name: "last".intern(),
            find_arg_name: "find".intern(),
            surrounds_arg_name: "surrounds".intern(),
        }
    }
}
