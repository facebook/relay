/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use fnv::FnvHashMap;
use intern::string_key::StringKey;
use itertools::Itertools;
use schema::*;
use std::fmt::{Result, Write};
use std::{
    collections::{hash_map::DefaultHasher, BTreeMap},
    hash::{Hash, Hasher},
};

const DEAULT_SHARD_COUNT: usize = 1;

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
    if is_schema_of_common_name(schema) {
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
/// For e.g you might want to shard Query type because its huge.
/// Sum of all the shard counts provided here must be less than shard_count param.
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

fn write_schema_definition(schema: &SDLSchema, result: &mut Vec<String>) -> Result {
    let mut printer = Printer::new(schema, result);
    printer.print_schema_definition()
}

fn write_directives(schema: &SDLSchema, result: &mut Vec<String>) -> Result {
    let mut printer = Printer::new(schema, result);
    printer.print_directives()
}

fn write_directive(schema: &SDLSchema, result: &mut Vec<String>, directive: &Directive) -> Result {
    let mut printer = Printer::new(schema, result);
    printer.print_directive(directive)
}

fn write_types(schema: &SDLSchema, result: &mut Vec<String>) -> Result {
    let mut printer = Printer::new(schema, result);
    printer.print_types()
}

fn write_types_as_shards<'a>(
    schema: &SDLSchema,
    shards: &'a mut Vec<String>,
    shard_count: usize,
    type_shards: &'a mut FnvHashMap<StringKey, Vec<String>>,
) -> Result {
    let mut printer = Printer::new_with_shards(schema, shards, shard_count, Some(type_shards));
    printer.print_types()
}

fn write_type(schema: &SDLSchema, result: &mut Vec<String>, type_: Type) -> Result {
    let mut printer = Printer::new(schema, result);
    printer.print_type(type_)
}

struct Printer<'schema, 'writer> {
    schema: &'schema SDLSchema,
    // Each writer here represents a shard
    writers: &'writer mut Vec<String>,
    // Index to specify which shard to write for a given type
    writers_index: usize,
    shard_count: usize,
    // Each writer here represents shards for individual types.
    // For e.g you may want to shard huge types like Query.
    type_writers: Option<&'writer mut FnvHashMap<StringKey, Vec<String>>>,
    // When sharding individual types, this represents index to
    // specify which shard to wite for a given type and field
    type_writers_index: Option<(StringKey, usize)>,
}

impl<'schema, 'writer, 'curent_writer> Printer<'schema, 'writer> {
    fn new(schema: &'schema SDLSchema, writers: &'writer mut Vec<String>) -> Self {
        Self {
            schema,
            writers_index: 0,
            writers,
            shard_count: DEAULT_SHARD_COUNT,
            type_writers: None,
            type_writers_index: None,
        }
    }

    fn new_with_shards(
        schema: &'schema SDLSchema,
        writers: &'writer mut Vec<String>,
        shard_count: usize,
        type_writers: Option<&'writer mut FnvHashMap<StringKey, Vec<String>>>,
    ) -> Self {
        Self {
            schema,
            writers_index: 0,
            writers,
            shard_count,
            type_writers,
            type_writers_index: None,
        }
    }

    fn print_schema_definition(&mut self) -> Result {
        let query_type_name = self
            .schema
            .query_type()
            .map(|type_| self.schema.get_type_name(type_));

        let mutation_type_name = self
            .schema
            .mutation_type()
            .map(|type_| self.schema.get_type_name(type_));

        let subscription_type_name = self
            .schema
            .subscription_type()
            .map(|type_| self.schema.get_type_name(type_));

        write!(self.writer(), "schema {{")?;
        self.print_new_line()?;
        if let Some(type_name) = query_type_name {
            writeln!(self.writer(), "  query: {}", type_name)?;
        }
        if let Some(type_name) = mutation_type_name {
            writeln!(self.writer(), "  mutation: {}", type_name)?;
        }
        if let Some(type_name) = subscription_type_name {
            writeln!(self.writer(), "  subscription: {}", type_name)?;
        }
        write!(self.writer(), "}}")?;
        self.print_definition_end()
    }

    fn print_directives(&mut self) -> Result {
        if self.schema.get_directives().count() == 0 {
            return Ok(());
        }
        let mut ordered_directives = self.schema.get_directives().collect::<Vec<_>>();
        ordered_directives.sort_by_key(|dir| dir.name);
        for directive in ordered_directives {
            self.print_directive(directive)?;
        }
        Ok(())
    }

    fn print_directive(&mut self, directive: &Directive) -> Result {
        write!(self.writer(), "directive @{}", directive.name)?;
        self.print_args(&directive.arguments)?;
        write!(
            self.writer(),
            " on {}",
            directive.locations.iter().join(" | ")
        )?;
        self.print_definition_end()
    }

    fn print_types(&mut self) -> Result {
        let ordered_type_map = self.schema.get_type_map().collect::<BTreeMap<_, _>>();
        for (_key, value) in ordered_type_map.iter() {
            self.print_type(**value)?;
        }
        Ok(())
    }

    fn print_type(&mut self, type_: Type) -> Result {
        self.update_writer_index_for_type_start(&type_);
        match type_ {
            Type::Enum(id) => self.print_enum(id)?,
            Type::InputObject(id) => self.print_input_object(id)?,
            Type::Interface(id) => self.print_interface(id)?,
            Type::Object(id) => self.print_object(id)?,
            Type::Scalar(id) => self.print_scalar(id)?,
            Type::Union(id) => self.print_union(id)?,
        }
        self.update_writer_index_for_type_end();
        Ok(())
    }

    fn print_scalar(&mut self, id: ScalarID) -> Result {
        let scalar = self.schema.scalar(id);
        write!(self.writer(), "scalar {}", scalar.name)?;
        self.print_directive_values(&scalar.directives)?;
        self.print_definition_end()
    }

    fn print_object(&mut self, id: ObjectID) -> Result {
        let object = self.schema.object(id);
        write!(self.writer(), "type {}", object.name.item)?;
        self.print_implementing_interfaces(&object.interfaces)?;
        self.print_directive_values(&object.directives)?;
        self.print_space()?;
        self.print_fields(&object.fields, object.name.item)?;
        self.print_definition_end()
    }

    fn print_interface(&mut self, id: InterfaceID) -> Result {
        let interface = self.schema.interface(id);
        write!(self.writer(), "interface {}", interface.name)?;
        self.print_implementing_interfaces(&interface.interfaces)?;
        self.print_directive_values(&interface.directives)?;
        self.print_space()?;
        self.print_fields(&interface.fields, interface.name)?;
        self.print_definition_end()
    }

    fn print_union(&mut self, id: UnionID) -> Result {
        let union_ = self.schema.union(id);
        write!(self.writer(), "union {}", union_.name)?;
        self.print_directive_values(&union_.directives)?;
        if !union_.members.is_empty() {
            let union_members = union_
                .members
                .iter()
                .map(|id| self.schema.object(*id).name.item)
                .collect::<Vec<_>>()
                .iter()
                .join(" | ");
            write!(self.writer(), " = {}", union_members)?;
        }
        self.print_definition_end()
    }

    fn print_enum(&mut self, id: EnumID) -> Result {
        let enum_ = self.schema.enum_(id);
        write!(self.writer(), "enum {}", enum_.name)?;
        self.print_directive_values(&enum_.directives)?;
        self.print_space()?;
        self.print_enum_values(&enum_.values)?;
        self.print_definition_end()
    }

    fn print_input_object(&mut self, id: InputObjectID) -> Result {
        let input_object = self.schema.input_object(id);
        write!(self.writer(), "input {}", input_object.name)?;
        self.print_directive_values(&input_object.directives)?;
        self.print_space()?;
        self.print_input_object_fields(&input_object.fields)?;
        self.print_definition_end()
    }

    fn print_fields(&mut self, fields: &[FieldID], type_name: StringKey) -> Result {
        if fields.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        for field_id in fields {
            let field = &self.schema.field(*field_id);
            self.update_writer_index_for_field_start(field.name.item, type_name);
            self.print_space()?;
            self.print_space()?;
            write!(self.writer(), "{}", field.name.item)?;
            self.print_args(&field.arguments)?;
            let type_string = self.schema.get_type_string(&field.type_);
            write!(self.writer(), ": {}", type_string)?;
            self.print_directive_values(&field.directives)?;
            self.print_new_line()?;
        }
        self.update_writer_index_for_all_field_end(type_name);
        write!(self.writer(), "}}")
    }

    fn print_args(&mut self, args: &ArgumentDefinitions) -> Result {
        if args.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer(), "(")?;
        for arg in args.iter() {
            if first {
                first = false;
            } else {
                write!(self.writer(), ", ")?;
            }
            let type_string = self.schema.get_type_string(&arg.type_);
            write!(self.writer(), "{}: {}", arg.name, type_string,)?;
            if let Some(default) = &arg.default_value {
                write!(self.writer(), " = {}", default,)?;
            }
        }
        write!(self.writer(), ")")
    }

    fn print_enum_values(&mut self, values: &[EnumValue]) -> Result {
        if values.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        for value in values {
            write!(self.writer(), "  {}", value.value,)?;
            self.print_directive_values(&value.directives)?;
            self.print_new_line()?;
        }
        write!(self.writer(), "}}")
    }

    fn print_input_object_fields(&mut self, args: &ArgumentDefinitions) -> Result {
        if args.is_empty() {
            return Ok(());
        }
        write!(self.writer(), "{{")?;
        self.print_new_line()?;
        for arg in args.iter() {
            let type_string = self.schema.get_type_string(&arg.type_);
            write!(self.writer(), "  {}: {}", arg.name, type_string,)?;
            if let Some(default) = &arg.default_value {
                write!(self.writer(), " = {}", default,)?;
            }
            self.print_new_line()?;
        }
        write!(self.writer(), "}}")
    }

    fn print_directive_values(&mut self, directives: &[DirectiveValue]) -> Result {
        if directives.is_empty() {
            return Ok(());
        }
        for directive in directives {
            write!(self.writer(), " @{}", directive.name)?;
            self.print_directive_argument_values(&directive.arguments)?;
        }
        Ok(())
    }

    fn print_directive_argument_values(&mut self, values: &[ArgumentValue]) -> Result {
        if values.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer(), "(")?;
        for value in values.iter() {
            if first {
                first = false;
            } else {
                write!(self.writer(), ", ")?;
            }
            write!(self.writer(), "{}: {}", value.name, value.value)?;
        }
        write!(self.writer(), ")")
    }

    fn print_implementing_interfaces(&mut self, interfaces: &[InterfaceID]) -> Result {
        if !interfaces.is_empty() {
            let interface_names = interfaces
                .iter()
                .map(|id| self.schema.interface(*id).name)
                .join(" & ");
            write!(self.writer(), " implements {}", interface_names,)?;
        }
        Ok(())
    }

    fn print_definition_end(&mut self) -> Result {
        self.print_new_line()?;
        self.print_new_line()
    }

    fn print_new_line(&mut self) -> Result {
        writeln!(self.writer())
    }

    fn print_space(&mut self) -> Result {
        write!(self.writer(), " ")
    }

    fn writer(&mut self) -> &mut String {
        if let Some(type_writers) = &mut self.type_writers {
            if let Some((type_name, index)) = self.type_writers_index {
                if let Some(writers) = type_writers.get_mut(&type_name) {
                    return writers.get_mut(index).unwrap();
                }
            }
        }
        self.writers.get_mut(self.writers_index).unwrap()
    }

    fn update_writer_index_for_type_start(&mut self, type_: &Type) {
        if self.shard_count > 1 {
            let type_name = self.schema.get_type_name(*type_);
            let type_hash = calculate_hash(&type_name.lookup()) as usize;
            self.writers_index = type_hash % self.shard_count;
            if let Some(type_writers) = &self.type_writers {
                if type_writers.contains_key(&type_name) {
                    self.type_writers_index = Some((type_name, 0));
                }
            }
        }
    }

    fn update_writer_index_for_type_end(&mut self) {
        self.type_writers_index = None;
    }

    fn update_writer_index_for_field_start(&mut self, field_name: StringKey, type_name: StringKey) {
        if let Some(type_writers) = &mut self.type_writers {
            if let Some(writers) = type_writers.get_mut(&type_name) {
                let index = (calculate_hash(&field_name.lookup()) as usize) % writers.len();
                self.type_writers_index = Some((type_name, index));
            }
        }
    }

    fn update_writer_index_for_all_field_end(&mut self, type_name: StringKey) {
        if let Some(type_writers) = &self.type_writers {
            if let Some(writers) = type_writers.get(&type_name) {
                self.type_writers_index = Some((type_name, writers.len() - 1));
            }
        }
    }
}

fn is_schema_of_common_name(schema: &SDLSchema) -> bool {
    schema.query_type().is_some()
        && schema.mutation_type().is_some()
        && schema.subscription_type().is_some()
}

fn calculate_hash<T: Hash>(t: &T) -> u64 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish()
}
