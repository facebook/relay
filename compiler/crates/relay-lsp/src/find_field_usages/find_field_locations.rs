/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Location as IRLocation;
use graphql_ir::{Program, Visitor};
use intern::string_key::StringKey;
use schema::Schema;

use crate::find_field_usages::FieldUsageFinder;

pub(crate) fn find_field_locations(
    program: &Program,
    field_name: StringKey,
    type_name: StringKey,
) -> Option<Vec<IRLocation>> {
    let type_ = program.schema.get_type(type_name)?;
    let mut usage_finder = FieldUsageFinder::new(program.schema.clone(), type_, field_name);
    usage_finder.visit_program(program);

    Some(usage_finder.get_locations())
}
