/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DirectiveName;
use common::Location;
use common::WithLocation;
use graphql_ir::Argument;
use graphql_ir::ConstantValue;
use graphql_ir::Directive;
use graphql_ir::Value;
use intern::string_key::Intern;
use lazy_static::lazy_static;

lazy_static! {
    pub static ref INTERNAL_METADATA_DIRECTIVE: DirectiveName =
        DirectiveName("__metadata".intern());
}

/// Creates a directive that is used during codegen to generate a "metadata"
/// key in the generated AST.
/// This "metadata" can be used for various purposes to transfer additional
/// information from a compile time transform to be available at runtime.
pub fn create_metadata_directive(key: ArgumentName, value: ConstantValue) -> Directive {
    Directive {
        name: WithLocation::generated(*INTERNAL_METADATA_DIRECTIVE),
        arguments: vec![Argument {
            name: WithLocation::generated(key),
            value: WithLocation::generated(Value::Constant(value)),
        }],
        data: None,
        location: Location::generated(),
    }
}
