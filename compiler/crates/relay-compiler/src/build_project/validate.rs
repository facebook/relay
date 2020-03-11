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
    disallow_id_as_alias, validate_connections, validate_server_only_directives,
    FBConnectionInterface,
};

pub fn validate(program: &Program<'_>) -> ValidationResult<()> {
    try_all(vec![
        disallow_id_as_alias(program),
        validate_server_only_directives(program),
        // TODO(T63482263): Pass connection interface from configuration
        validate_connections(program, &FBConnectionInterface::default()),
    ])?;

    Ok(())
}
