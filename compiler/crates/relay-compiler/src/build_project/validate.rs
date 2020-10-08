/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DiagnosticsResult;
use errors::try_all;
use graphql_ir::Program;
use relay_transforms::{
    disallow_id_as_alias, disallow_typename_on_root, validate_connections, validate_module_names,
    validate_relay_directives, validate_unused_variables, ConnectionInterface,
};

pub fn validate(
    program: &Program,
    connection_interface: &ConnectionInterface,
) -> DiagnosticsResult<()> {
    try_all(vec![
        disallow_id_as_alias(program),
        validate_unused_variables(&program),
        validate_connections(program, connection_interface),
        validate_relay_directives(program),
        validate_module_names(program),
        disallow_typename_on_root(program),
    ])?;

    Ok(())
}
