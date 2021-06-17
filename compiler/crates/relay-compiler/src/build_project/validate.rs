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
    disallow_circular_no_inline_fragments, disallow_reserved_aliases, disallow_typename_on_root,
    validate_connections, validate_module_names,
    validate_no_inline_fragments_with_raw_response_type, validate_relay_directives,
    validate_unused_fragment_variables, validate_unused_variables, ConnectionInterface,
};

pub type AdditionalValidations = Box<dyn Fn(&Program) -> DiagnosticsResult<()> + Sync + Send>;

pub fn validate(
    program: &Program,
    connection_interface: &ConnectionInterface,
    additional_validations: &Option<AdditionalValidations>,
) -> DiagnosticsResult<()> {
    try_all(vec![
        disallow_reserved_aliases(program),
        validate_unused_variables(program),
        validate_unused_fragment_variables(program),
        validate_connections(program, connection_interface),
        validate_relay_directives(program),
        validate_module_names(program),
        validate_no_inline_fragments_with_raw_response_type(program),
        disallow_typename_on_root(program),
        if let Some(ref validate) = additional_validations {
            validate(program)
        } else {
            Ok(())
        },
        disallow_circular_no_inline_fragments(program),
    ])?;

    Ok(())
}
