/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::Location as IRLocation;
use graphql_ir::Program;
use graphql_ir::Visitor;
use intern::string_key::StringKey;
use schema::SDLSchema;
use schema::Schema;

use crate::find_field_usages::FieldUsageFinder;

pub(crate) fn find_field_locations(
    program: &Program,
    schema: &Arc<SDLSchema>,
    field_name: StringKey,
    type_name: StringKey,
) -> Option<Vec<IRLocation>> {
    let type_ = schema.get_type(type_name)?;
    let mut usage_finder = FieldUsageFinder::new(&schema, type_, field_name);
    usage_finder.visit_program(program);

    Some(usage_finder.get_locations())
}
