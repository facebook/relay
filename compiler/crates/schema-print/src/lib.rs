/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use interner::StringKey;
use itertools::Itertools;
use schema::*;
use std::collections::BTreeMap;
use std::fmt::{Result, Write};

pub fn print(schema: &Schema) -> String {
    let mut builder: String = String::new();
    write!(
        builder,
        "{}{}{}",
        print_schema_definition(schema),
        print_directives(schema),
        print_type(schema)
    )
    .unwrap();
    builder
}

fn print_schema_definition(schema: &Schema) -> String {
    if is_schema_of_common_name(schema) {
        return String::new();
    }
    let mut result = String::new();
    write_schema_definition(schema, &mut result).unwrap();
    result
}

fn print_directives(schema: &Schema) -> String {
    let mut result = String::new();
    write_directives(schema, &mut result).unwrap();
    result
}

fn print_type(schema: &Schema) -> String {
    let mut result = String::new();
    write_type(schema, &mut result).unwrap();
    result
}

pub fn write_schema_definition(schema: &Schema, mut result: &mut impl Write) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_schema_definition()
}

pub fn write_directives(schema: &Schema, mut result: &mut impl Write) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_directives()
}

pub fn write_type(schema: &Schema, mut result: &mut impl Write) -> Result {
    let mut printer = Printer::new(&schema, &mut result);
    printer.print_type()
}

struct Printer<'schema, 'writer, W: Write> {
    schema: &'schema Schema,
    writer: &'writer mut W,
}

impl<'schema, 'writer, W: Write> Printer<'schema, 'writer, W> {
    fn new(schema: &'schema Schema, writer: &'writer mut W) -> Self {
        Self { schema, writer }
    }

    fn print_schema_definition(&mut self) -> Result {
        write!(self.writer, "schema {{")?;
        self.print_new_line()?;
        if let Some(type_) = self.schema.query_type() {
            writeln!(self.writer, "  query: {}", self.schema.get_type_name(type_))?;
        }
        if let Some(type_) = self.schema.mutation_type() {
            writeln!(
                self.writer,
                "  mutation: {}",
                self.schema.get_type_name(type_)
            )?;
        }
        if let Some(type_) = self.schema.subscription_type() {
            writeln!(
                self.writer,
                "  subscription: {}",
                self.schema.get_type_name(type_)
            )?;
        }
        write!(self.writer, "}}")?;
        self.print_definition_end()
    }

    fn print_directives(&mut self) -> Result {
        if self.schema.get_directives().count() == 0 {
            return Ok(());
        }
        let mut ordered_directives = self.schema.get_directives().collect::<Vec<_>>();
        ordered_directives.sort_by_key(|dir| dir.name);
        for directive in ordered_directives {
            write!(self.writer, "directive @{}", directive.name)?;
            self.print_args(&directive.arguments)?;
            write!(
                self.writer,
                " on {}",
                directive.locations.iter().join(" | ")
            )?;
            self.print_definition_end()?;
        }
        Ok(())
    }

    fn print_type(&mut self) -> Result {
        let ordered_type_map = self.schema.get_type_map().collect::<BTreeMap<_, _>>();
        for (_key, value) in ordered_type_map.iter() {
            match value {
                Type::Enum(id) => self.print_enum(*id)?,
                Type::InputObject(id) => self.print_input_object(*id)?,
                Type::Interface(id) => self.print_interface(*id)?,
                Type::Object(id) => self.print_object(*id)?,
                Type::Scalar(id) => self.print_scalar(*id)?,
                Type::Union(id) => self.print_union(*id)?,
            }
        }
        Ok(())
    }

    fn print_scalar(&mut self, id: ScalarID) -> Result {
        let scalar = self.schema.scalar(id);
        write!(self.writer, "scalar {}", scalar.name)?;
        self.print_definition_end()
    }

    fn print_object(&mut self, id: ObjectID) -> Result {
        let object = self.schema.object(id);
        write!(self.writer, "type {}", object.name)?;
        if !object.interfaces.is_empty() {
            write!(
                self.writer,
                " implements {}",
                object
                    .interfaces
                    .iter()
                    .map(|id| self.schema.interface(*id).name)
                    .join(" & "),
            )?;
        }
        self.print_directive_values(&object.directives)?;
        self.print_space()?;
        self.print_fields(&object.fields)?;
        self.print_definition_end()
    }

    fn print_interface(&mut self, id: InterfaceID) -> Result {
        let interface = self.schema.interface(id);
        write!(self.writer, "interface {}", interface.name)?;
        self.print_directive_values(&interface.directives)?;
        self.print_space()?;
        self.print_fields(&interface.fields)?;
        self.print_definition_end()
    }

    fn print_union(&mut self, id: UnionID) -> Result {
        let union_ = self.schema.union(id);
        write!(self.writer, "union {}", union_.name)?;
        if !union_.members.is_empty() {
            write!(
                self.writer,
                " = {}",
                union_
                    .members
                    .iter()
                    .map(|id| self.schema.object(*id).name)
                    .collect::<Vec<_>>()
                    .iter()
                    .join(" | ")
            )?;
        }
        self.print_definition_end()
    }

    fn print_enum(&mut self, id: EnumID) -> Result {
        let enum_ = self.schema.enum_(id);
        write!(self.writer, "enum {}", enum_.name)?;
        self.print_directive_values(&enum_.directives)?;
        self.print_space()?;
        self.print_enum_values(&enum_.values)?;
        self.print_definition_end()
    }

    fn print_input_object(&mut self, id: InputObjectID) -> Result {
        let input_object = self.schema.input_object(id);
        write!(self.writer, "input {}", input_object.name)?;
        self.print_space()?;
        self.print_input_object_fields(&input_object.fields)?;
        self.print_definition_end()
    }

    fn print_fields(&mut self, fields: &[FieldID]) -> Result {
        if fields.is_empty() {
            return Ok(());
        }
        write!(self.writer, "{{")?;
        self.print_new_line()?;
        for field_id in fields {
            let field = &self.schema.field(*field_id);
            self.print_space()?;
            self.print_space()?;
            write!(self.writer, "{}", field.name)?;
            self.print_args(&field.arguments)?;
            write!(
                self.writer,
                ": {}",
                self.schema.get_type_string(&field.type_)
            )?;
            self.print_directive_values(&field.directives)?;
            self.print_new_line()?;
        }
        write!(self.writer, "}}")
    }

    fn print_args(&mut self, args: &ArgumentDefinitions) -> Result {
        if args.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer, "(")?;
        for arg in args.iter() {
            if first {
                first = false;
            } else {
                write!(self.writer, ", ")?;
            }
            write!(
                self.writer,
                "{}: {}",
                arg.name,
                self.schema.get_type_string(&arg.type_),
            )?;
        }
        write!(self.writer, ")")
    }

    fn print_enum_values(&mut self, values: &[StringKey]) -> Result {
        if values.is_empty() {
            return Ok(());
        }
        write!(self.writer, "{{")?;
        self.print_new_line()?;
        for value in values {
            write!(self.writer, "  {}", value,)?;
            self.print_new_line()?;
        }
        write!(self.writer, "}}")
    }

    fn print_input_object_fields(&mut self, args: &ArgumentDefinitions) -> Result {
        if args.is_empty() {
            return Ok(());
        }
        write!(self.writer, "{{")?;
        self.print_new_line()?;
        for arg in args.iter() {
            write!(
                self.writer,
                "  {}: {}",
                arg.name,
                self.schema.get_type_string(&arg.type_),
            )?;
            self.print_new_line()?;
        }
        write!(self.writer, "}}")
    }

    fn print_directive_values(&mut self, directives: &[DirectiveValue]) -> Result {
        if directives.is_empty() {
            return Ok(());
        }
        for directive in directives {
            write!(self.writer, " @{}", directive.name)?;
            self.print_directive_argument_values(&directive.arguments)?;
        }
        Ok(())
    }

    fn print_directive_argument_values(&mut self, values: &[ArgumentValue]) -> Result {
        if values.is_empty() {
            return Ok(());
        }
        let mut first = true;
        write!(self.writer, "(")?;
        for value in values.iter() {
            if first {
                first = false;
            } else {
                write!(self.writer, ", ")?;
            }
            write!(self.writer, "{}: {}", value.name, value.value)?;
        }
        write!(self.writer, ")")
    }

    fn print_definition_end(&mut self) -> Result {
        self.print_new_line()?;
        self.print_new_line()
    }

    fn print_new_line(&mut self) -> Result {
        writeln!(self.writer)
    }

    fn print_space(&mut self) -> Result {
        write!(self.writer, " ")
    }
}

fn is_schema_of_common_name(schema: &Schema) -> bool {
    match schema.query_type() {
        Some(_) => (),
        None => return false,
    };
    match schema.mutation_type() {
        Some(_) => (),
        None => return false,
    };
    match schema.subscription_type() {
        Some(_) => (),
        None => return false,
    };
    true
}
