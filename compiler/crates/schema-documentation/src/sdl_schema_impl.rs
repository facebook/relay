/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use schema::Field;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::SchemaDocumentation;

impl SchemaDocumentation for SDLSchema {
    fn get_type_description(&self, type_name: &str) -> Option<&str> {
        self.get_type(type_name.intern())
            .and_then(|type_| get_description_from_type(type_, self))
            .map(|string_key| string_key.lookup())
    }

    fn get_field_description(&self, type_name: &str, field_name: &str) -> Option<&str> {
        let field_name_string_key = field_name.intern();
        self.get_type(type_name.intern())
            .and_then(|type_| get_field_from_type(type_, self, field_name_string_key))
            .and_then(|field| field.description)
            .map(|string_key| string_key.lookup())
    }

    fn get_field_argument_description(
        &self,
        type_name: &str,
        field_name: &str,
        argument_name: &str,
    ) -> Option<&str> {
        let field_name_string_key = field_name.intern();
        let argument_name_string_key = argument_name.intern();
        self.get_type(type_name.intern())
            .and_then(|type_| get_field_from_type(type_, self, field_name_string_key))
            .and_then(|field| {
                field
                    .arguments
                    .iter()
                    .find(|argument| argument.name.item.0 == argument_name_string_key)
            })
            .and_then(|argument| argument.description)
            .map(|string_key| string_key.lookup())
    }

    fn get_hack_source(&self, type_name: &str) -> Option<&str> {
        self.get_type(type_name.intern())
            .and_then(|type_| get_hack_source_from_type(type_, self))
            .map(|string_key| string_key.lookup())
    }

    fn get_field_hack_source(&self, type_name: &str, field_name: &str) -> Option<&str> {
        let field_name_string_key = field_name.intern();
        self.get_type(type_name.intern())
            .and_then(|type_| get_field_from_type(type_, self, field_name_string_key))
            .and_then(|field| field.hack_source)
            .map(|string_key| string_key.lookup())
    }
}

fn get_description_from_type(type_: Type, schema: &SDLSchema) -> Option<StringKey> {
    match type_ {
        Type::Enum(id) => schema.enum_(id).description,
        Type::InputObject(id) => schema.input_object(id).description,
        Type::Interface(id) => schema.interface(id).description,
        Type::Object(id) => schema.object(id).description,
        Type::Scalar(id) => schema.scalar(id).description,
        Type::Union(id) => schema.union(id).description,
    }
}

fn get_field_from_type(type_: Type, schema: &SDLSchema, field_name: StringKey) -> Option<&Field> {
    let fields = match type_ {
        Type::Enum(_id) => None,
        // Note: InputObjects have Arguments (akin to fields). These Arguments cannot have descriptions.
        Type::InputObject(_id) => None,
        Type::Interface(id) => Some(&schema.interface(id).fields),
        Type::Object(id) => Some(&schema.object(id).fields),
        Type::Scalar(_id) => None,
        Type::Union(_id) => None,
    }?;
    fields.iter().find_map(|field_id| {
        let field = schema.field(*field_id);
        if field.name.item == field_name {
            Some(field)
        } else {
            None
        }
    })
}

fn get_hack_source_from_type(type_: Type, schema: &SDLSchema) -> Option<StringKey> {
    match type_ {
        Type::Enum(id) => schema.enum_(id).hack_source,
        Type::InputObject(id) => schema.input_object(id).hack_source,
        Type::Interface(id) => schema.interface(id).hack_source,
        Type::Object(id) => schema.object(id).hack_source,
        Type::Scalar(id) => schema.scalar(id).hack_source,
        Type::Union(id) => schema.union(id).hack_source,
    }
}
