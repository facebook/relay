/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use errors::try_all;
use graphql_ir::{Program, ValidationResult};
use graphql_transforms::{
    disallow_id_as_alias, validate_connections, validate_relay_directives,
    validate_unused_variables, ConnectionInterface,
};

pub fn validate(
    program: &Program,
    connection_interface: &ConnectionInterface,
) -> ValidationResult<()> {
    try_all(vec![
        disallow_id_as_alias(program),
        validate_unused_variables(&program),
        validate_connections(program, connection_interface),
        validate_relay_directives(program),
    ])?;

    Ok(())
}
