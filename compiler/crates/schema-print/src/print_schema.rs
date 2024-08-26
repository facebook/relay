/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use fnv::FnvHashMap;
use intern::string_key::StringKey;
use intern::Lookup;
use itertools::Itertools;
use schema::*;

use crate::has_schema_definition_types;
use crate::is_schema_of_common_name;
use crate::Printer;
use crate::DEAULT_SHARD_COUNT;

pub fn print(schema: &SDLSchema) -> String {
    let mut builder: String = String::new();
    write!(
        builder,
        "{}{}{}",
        print_schema_definition(schema),
        print_directives(schema),
        print_types(schema)
    )
    .unwrap();
    builder
}

pub fn print_schema_definition(schema: &SDLSchema) -> String {
    if is_schema_of_common_name(schema) || !has_schema_definition_types(schema) {
        return String::new();
    }
    let mut result = vec![String::new(); DEAULT_SHARD_COUNT];
    write_schema_definition(schema, &mut result).unwrap();
    result.into_iter().next().unwrap()
}

pub fn print_directives(schema: &SDLSchema) -> String {
    let mut result = vec![String::new(); DEAULT_SHARD_COUNT];
    write_directives(schema, &mut result).unwrap();
    result.into_iter().next().unwrap()
}

pub fn print_directive(schema: &SDLSchema, directive: &Directive) -> String {
    let mut result = vec![String::new(); DEAULT_SHARD_COUNT];
    write_directive(schema, &mut result, directive).unwrap();
    result.into_iter().next().unwrap()
}

pub fn print_types(schema: &SDLSchema) -> String {
    let mut result = vec![String::new(); DEAULT_SHARD_COUNT];
    write_types(schema, &mut result).unwrap();
    result.into_iter().next().unwrap()
}

/// Returns a sharded GraphQL SDLSchema
///
/// # Arguments
///
/// * `schema` - GraphQL SDLSchema
///
/// * `shard_count` - Total shard count. Returned vec will have this size.
///
/// * `type_shard_count` - To further shard a single type, provide this.
///   For e.g you might want to shard Query type because its huge.
///   Sum of all the shard counts provided here must be less than shard_count param.
pub fn print_types_directives_as_shards(
    schema: &SDLSchema,
    shard_count: usize,
    type_shard_count: FnvHashMap<StringKey, usize>,
) -> Vec<String> {
    let typeshard_count: usize = type_shard_count.values().sum();
    if typeshard_count >= shard_count {
        panic!(
            "Total shard count:{} must be greater than sum of all shard counts:{} for inidividual types",
            shard_count, typeshard_count
        );
    }
    let mut shards: Vec<String> = vec![String::new(); shard_count - typeshard_count];

    // Print directives to first shard
    shards
        .first_mut()
        .unwrap()
        .push_str(&print_directives(schema));

    let mut type_shards: FnvHashMap<StringKey, Vec<String>> = type_shard_count
        .iter()
        .map(|(type_name, count)| (*type_name, vec![String::new(); *count]))
        .collect();
    write_types_as_shards(
        schema,
        &mut shards,
        shard_count - typeshard_count,
        &mut type_shards,
    )
    .unwrap();
    type_shards
        .iter_mut()
        .sorted_by_key(|(type_name, _shards)| type_name.lookup())
        .for_each(|(_type_name, type_shards)| shards.append(type_shards));
    shards
}

pub fn print_type(schema: &SDLSchema, type_: Type) -> String {
    let mut result = vec![String::new(); DEAULT_SHARD_COUNT];
    write_type(schema, &mut result, type_).unwrap();
    result.into_iter().next().unwrap()
}

fn write_schema_definition(schema: &SDLSchema, result: &mut Vec<String>) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_schema_definition()
}

fn write_directives(schema: &SDLSchema, result: &mut Vec<String>) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_directives()
}

fn write_directive(
    schema: &SDLSchema,
    result: &mut Vec<String>,
    directive: &Directive,
) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_directive(directive)
}

fn write_types(schema: &SDLSchema, result: &mut Vec<String>) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_types()
}

fn write_types_as_shards<'a>(
    schema: &SDLSchema,
    shards: &'a mut Vec<String>,
    shard_count: usize,
    type_shards: &'a mut FnvHashMap<StringKey, Vec<String>>,
) -> FmtResult {
    let mut printer = Printer::new_with_shards(schema, shards, shard_count, Some(type_shards));
    printer.print_types()
}

fn write_type(schema: &SDLSchema, result: &mut Vec<String>, type_: Type) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_type(type_)
}
