/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use fnv::FnvHashMap;
use intern::Lookup;
use intern::string_key::StringKey;
use itertools::Itertools;
use rayon::iter::IntoParallelIterator;
use rayon::iter::ParallelIterator;
use schema::*;

use crate::DEAULT_SHARD_COUNT;
use crate::Printer;
use crate::ShardPrinter;
use crate::TypedShardPrinter;
use crate::generate_shard_map;
use crate::generate_typed_shard_map;
use crate::has_schema_definition_types;
use crate::is_schema_of_common_name;

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
/// Prints shards in sequence. No parallelism is used.
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
            "Total shard count:{shard_count} must be greater than sum of all shard counts:{typeshard_count} for inidividual types",
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

/**
 * Prints a sharded GraphQL SDLSchema in parallel
 */
pub fn print_types_directives_as_shards_in_parallel(
    schema: &SDLSchema,
    shard_count: usize,
    type_shard_count_map: FnvHashMap<StringKey, usize>,
) -> FnvHashMap<usize, String> {
    let typeshard_count: usize = type_shard_count_map.values().sum();
    let base_shard_count = shard_count - typeshard_count;
    let shard_map = generate_shard_map(
        schema,
        base_shard_count,
        type_shard_count_map.keys().copied().collect(),
    );
    let typed_shard_map = generate_typed_shard_map(schema, type_shard_count_map);

    // Base shards
    let mut shards = shard_map
        .into_par_iter()
        .map(|(shard_key, mut shard)| {
            shard.sort_by_key(|(type_name, _type)| type_name.lookup());
            let printer = ShardPrinter::new(schema, shard);
            // Print directives
            let content = if shard_key == 0 {
                printer.print_shard_with_directives()
            } else {
                printer.print_shard()
            };
            (shard_key, content)
        })
        .collect::<FnvHashMap<usize, String>>();

    // Typed shards (e.g. Query, Mutation, etc)
    let mut typed_shards = typed_shard_map
        .into_par_iter()
        .map(|(type_name, shard_map)| {
            let type_shard_count = shard_map.len();
            let typed_shard = shard_map
                .into_par_iter()
                .map(|(shard_key, fields)| {
                    let printer = TypedShardPrinter::new(
                        schema,
                        type_name,
                        fields,
                        shard_key == 0,
                        shard_key == type_shard_count - 1,
                    );
                    (shard_key, printer.print_shard())
                })
                .collect();
            (type_name, typed_shard)
        })
        .collect::<FnvHashMap<StringKey, FnvHashMap<usize, String>>>();

    // Drain typed_shards into shards
    typed_shards
        .iter_mut()
        .sorted_by_key(|(k, _)| k.lookup())
        .for_each(|(_type_name, type_shards)| {
            let curr_shard_count = shards.len();
            type_shards.drain().for_each(|(shard_key, type_shard)| {
                shards.insert(curr_shard_count + shard_key, type_shard);
            });
        });
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
    printer.print_all_types()
}

fn write_types_as_shards<'a>(
    schema: &SDLSchema,
    shards: &'a mut Vec<String>,
    shard_count: usize,
    type_shards: &'a mut FnvHashMap<StringKey, Vec<String>>,
) -> FmtResult {
    let mut printer = Printer::new_with_shards(schema, shards, shard_count, Some(type_shards));
    printer.print_all_types()
}

fn write_type(schema: &SDLSchema, result: &mut Vec<String>, type_: Type) -> FmtResult {
    let mut printer = Printer::new(schema, result);
    printer.print_type(type_)
}
