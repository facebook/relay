/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use schema::*;

/// A printer for truncated type definitions, useful for hover tooltips.
/// Shows only the first `max_items` fields/members.
pub struct TruncatedPrinter<'schema> {
    schema: &'schema SDLSchema,
    max_items: usize,
}

impl<'schema> TruncatedPrinter<'schema> {
    pub fn new(schema: &'schema SDLSchema, max_items: usize) -> Self {
        Self { schema, max_items }
    }

    pub fn print_type(&self, type_: Type) -> String {
        match type_ {
            Type::Enum(id) => self.print_enum(id),
            Type::InputObject(id) => self.print_input_object(id),
            Type::Interface(id) => self.print_interface(id),
            Type::Object(id) => self.print_object(id),
            Type::Scalar(id) => self.print_scalar(id),
            Type::Union(id) => self.print_union(id),
        }
    }

    /// Prints a single field definition in SDL format.
    /// Example output: `name(arg: String!): ID!`
    pub fn print_field(&self, field: &Field) -> String {
        let mut result = field.name.item.to_string();
        self.append_args(&mut result, &field.arguments);
        let type_string = self.schema.get_type_string(&field.type_);
        result.push_str(&format!(": {type_string}"));
        result
    }

    fn print_scalar(&self, id: ScalarID) -> String {
        let scalar = self.schema.scalar(id);
        let mut result = format!("scalar {}", scalar.name.item);
        self.append_directive_values(&mut result, &scalar.directives);
        result
    }

    fn print_object(&self, id: ObjectID) -> String {
        let object = self.schema.object(id);
        let mut result = format!("type {}", object.name.item);
        self.append_implementing_interfaces(&mut result, &object.interfaces);
        self.append_directive_values(&mut result, &object.directives);
        result.push_str(" {\n");
        self.append_fields(&mut result, &object.fields);
        if object.fields.len() > self.max_items {
            result.push_str("  ...\n");
        }
        result.push('}');
        result
    }

    fn print_interface(&self, id: InterfaceID) -> String {
        let interface = self.schema.interface(id);
        let mut result = format!("interface {}", interface.name.item);
        self.append_implementing_interfaces(&mut result, &interface.interfaces);
        self.append_directive_values(&mut result, &interface.directives);
        result.push_str(" {\n");
        self.append_fields(&mut result, &interface.fields);
        if interface.fields.len() > self.max_items {
            result.push_str("  ...\n");
        }
        result.push('}');
        result
    }

    fn print_union(&self, id: UnionID) -> String {
        let union_ = self.schema.union(id);
        let mut result = format!("union {}", union_.name.item.0);
        self.append_directive_values(&mut result, &union_.directives);
        if !union_.members.is_empty() {
            let members: Vec<_> = union_
                .members
                .iter()
                .take(self.max_items)
                .map(|id| self.schema.object(*id).name.item.to_string())
                .collect();
            result.push_str(" = ");
            result.push_str(&members.join(" | "));
            if union_.members.len() > self.max_items {
                result.push_str(" | ...");
            }
        }
        result
    }

    fn print_enum(&self, id: EnumID) -> String {
        let enum_ = self.schema.enum_(id);
        let mut result = format!("enum {}", enum_.name.item);
        self.append_directive_values(&mut result, &enum_.directives);
        if !enum_.values.is_empty() {
            result.push_str(" {\n");
            for value in enum_.values.iter().take(self.max_items) {
                result.push_str("  ");
                result.push_str(&value.value.to_string());
                self.append_directive_values(&mut result, &value.directives);
                result.push('\n');
            }
            if enum_.values.len() > self.max_items {
                result.push_str("  ...\n");
            }
            result.push('}');
        }
        result
    }

    fn print_input_object(&self, id: InputObjectID) -> String {
        let input_object = self.schema.input_object(id);
        let mut result = format!("input {}", input_object.name.item);
        self.append_directive_values(&mut result, &input_object.directives);
        if !input_object.fields.is_empty() {
            result.push_str(" {\n");
            for arg in input_object.fields.iter().take(self.max_items) {
                let type_string = self.schema.get_type_string(&arg.type_);
                result.push_str(&format!("  {}: {}", arg.name.item, type_string));
                if let Some(default) = &arg.default_value {
                    result.push_str(&format!(" = {default}"));
                }
                self.append_directive_values(&mut result, &arg.directives);
                result.push('\n');
            }
            if input_object.fields.iter().count() > self.max_items {
                result.push_str("  ...\n");
            }
            result.push('}');
        }
        result
    }

    fn append_fields(&self, result: &mut String, fields: &[FieldID]) {
        for field_id in fields.iter().take(self.max_items) {
            let field = &self.schema.field(*field_id);
            result.push_str("  ");
            result.push_str(&field.name.item.to_string());
            self.append_args(result, &field.arguments);
            let type_string = self.schema.get_type_string(&field.type_);
            result.push_str(&format!(": {type_string}"));
            self.append_directive_values(result, &field.directives);
            result.push('\n');
        }
    }

    fn append_args(&self, result: &mut String, args: &ArgumentDefinitions) {
        if args.is_empty() {
            return;
        }
        result.push('(');
        let mut first = true;
        for arg in args.iter() {
            if first {
                first = false;
            } else {
                result.push_str(", ");
            }
            let type_string = self.schema.get_type_string(&arg.type_);
            result.push_str(&format!("{}: {}", arg.name.item, type_string));
            if let Some(default) = &arg.default_value {
                result.push_str(&format!(" = {default}"));
            }
            self.append_directive_values(result, &arg.directives);
        }
        result.push(')');
    }

    fn append_directive_values(&self, result: &mut String, directives: &[DirectiveValue]) {
        for directive in directives {
            result.push_str(&format!(" @{}", directive.name));
            if !directive.arguments.is_empty() {
                result.push('(');
                let mut first = true;
                for value in directive.arguments.iter() {
                    if first {
                        first = false;
                    } else {
                        result.push_str(", ");
                    }
                    result.push_str(&format!("{}: {}", value.name, value.value));
                }
                result.push(')');
            }
        }
    }

    fn append_implementing_interfaces(&self, result: &mut String, interfaces: &[InterfaceID]) {
        if !interfaces.is_empty() {
            let interface_names: Vec<_> = interfaces
                .iter()
                .map(|id| self.schema.interface(*id).name.item.to_string())
                .collect();
            result.push_str(" implements ");
            result.push_str(&interface_names.join(" & "));
        }
    }
}
