/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use fnv::FnvHashSet;
use intern::Lookup;
use intern::string_key::StringKey;
use rayon::iter::IntoParallelIterator;
use rayon::iter::ParallelIterator;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::Printer;
use crate::calculate_hash;

pub struct ShardPrinter<'schema> {
    schema: &'schema SDLSchema,
    types: Vec<(StringKey, Type)>,
}

pub struct TypedShardPrinter<'schema> {
    schema: &'schema SDLSchema,
    type_name: StringKey, // We do not use Type because the type might not exist in the schema
    fields: Vec<FieldID>,
    is_start: bool,
    is_end: bool,
}

impl<'schema> ShardPrinter<'schema> {
    pub fn new(schema: &'schema SDLSchema, types: Vec<(StringKey, Type)>) -> Self {
        Self { schema, types }
    }

    pub fn print_shard(&self) -> String {
        let mut result = vec![String::new(); 1];
        let mut printer = Printer::new(self.schema, &mut result);
        printer.print_types(&self.types).unwrap();
        result.into_iter().next().unwrap()
    }

    pub fn print_shard_with_directives(&self) -> String {
        let mut result = vec![String::new(); 1];
        let mut printer = Printer::new(self.schema, &mut result);
        printer.print_directives().unwrap();
        printer.print_types(&self.types).unwrap();
        result.into_iter().next().unwrap()
    }
}

impl<'schema> TypedShardPrinter<'schema> {
    pub fn new(
        schema: &'schema SDLSchema,
        type_name: StringKey,
        fields: Vec<FieldID>,
        is_start: bool,
        is_end: bool,
    ) -> Self {
        Self {
            schema,
            type_name,
            fields,
            is_start,
            is_end,
        }
    }

    pub fn print_shard(&self) -> String {
        let shard = String::new();
        let mut result = vec![shard; 1];
        let type_ = self.schema.get_type(self.type_name);
        if let Some(t) = type_ {
            let object_id = t
                .get_object_id()
                .unwrap_or_else(|| panic!("Expected object type, got {t:?}"));
            let object = self.schema.object(object_id);
            let mut printer = Printer::new(self.schema, &mut result);
            if self.is_start {
                printer.print_type_declaration(object.name.item.0).unwrap();
            }
            printer.print_fields_without_brackets(&self.fields).unwrap();
            if self.is_end {
                printer.print_definition_closure().unwrap();
                printer.print_definition_end().unwrap();
            }
        }
        result.into_iter().next().unwrap()
    }
}

pub fn generate_shard_map(
    schema: &SDLSchema,
    shard_count: usize,
    types_to_print: FnvHashSet<StringKey>,
) -> FnvHashMap<usize, Vec<(StringKey, Type)>> {
    schema
        .get_type_map()
        .map(|(type_name, type_)| {
            (
                calculate_hash(&type_name.lookup()) as usize % shard_count,
                (*type_name, *type_),
            )
        })
        .fold(
            FnvHashMap::default(),
            |mut acc: FnvHashMap<usize, Vec<(StringKey, Type)>>, (key, (type_name, type_))| {
                if !types_to_print.contains(&type_name) {
                    acc.entry(key).or_default().push((type_name, type_));
                }
                acc
            },
        )
}

pub fn generate_typed_shard_map(
    schema: &SDLSchema,
    typed_shard_count: FnvHashMap<StringKey, usize>,
) -> FnvHashMap<StringKey, FnvHashMap<usize, Vec<FieldID>>> {
    typed_shard_count
        .into_par_iter()
        .map(|(type_name, shard_count)| {
            let type_ = schema.get_type(type_name);
            if let Some(Type::Object(object_id)) = type_ {
                let object = schema.object(object_id);
                let fields = &object.fields;
                let type_shards = fields
                    .iter()
                    .map(|field_id| {
                        let field_name = schema.field(*field_id).name.item;
                        (
                            (calculate_hash(&field_name.lookup()) as usize) % shard_count,
                            field_id,
                        )
                    })
                    .fold(
                        create_empty_shard_map::<FieldID>(shard_count),
                        |mut acc: FnvHashMap<usize, Vec<FieldID>>, (shard, field_id)| {
                            acc.entry(shard).or_default().push(*field_id);
                            acc
                        },
                    );
                (type_name, type_shards)
            } else {
                (type_name, create_empty_shard_map::<FieldID>(shard_count))
            }
        })
        .collect()
}

// Initializes all the keys in the shard map to empty vectors
fn create_empty_shard_map<T>(shard_count: usize) -> FnvHashMap<usize, Vec<T>> {
    (0..shard_count)
        .map(|shard_key| (shard_key, Vec::new()))
        .collect()
}
