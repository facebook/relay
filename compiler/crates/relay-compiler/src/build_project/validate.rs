/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use errors::try_all;
use graphql_ir::Program;
use graphql_ir::ValidationResult;
use graphql_transforms::{
    disallow_id_as_alias, validate_connections, validate_relay_directives,
    validate_server_only_directives, ConnectionInterface,
};

pub fn validate<TConnectionInterface: ConnectionInterface>(
    program: &Program<'_>,
    connection_interface: &TConnectionInterface,
) -> ValidationResult<()> {
    try_all(vec![
        disallow_id_as_alias(program),
        validate_server_only_directives(program),
        validate_connections(program, connection_interface),
        validate_relay_directives(program),
    ])?;

    Ok(())
}
