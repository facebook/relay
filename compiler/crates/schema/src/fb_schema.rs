/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::definitions::*;
use crate::graphqlschema_generated::graphqlschema::*;
use common::Span;
use flatbuffers::*;
use graphql_syntax::{
    BooleanNode, ConstantArgument, ConstantValue, EnumNode, FloatNode, FloatValue, Identifier,
    IntNode, List, StringNode, Token, TokenKind,
};
use interner::{Intern, StringKey};
use std::convert::TryInto;

#[derive(Debug)]
pub struct FlatBufferSchema<'fb> {
    fb_schema: FBSchema<'fb>,
    types: Vector<'fb, ForwardsUOffset<FBTypeMap<'fb>>>,
    schema: Schema,
}

impl<'fb> FlatBufferSchema<'fb> {
    pub fn build(bytes: &'fb [u8], schema: Schema) -> Self {
        let fb_schema: FBSchema<'fb> = get_root_as_fbschema(bytes);
        let types = fb_schema.types().unwrap();
        Self {
            fb_schema,
            types,
            schema,
        }
    }

    pub fn get_type(&mut self, type_name: StringKey) -> Option<Type> {
        if !self.schema.has_type(type_name) {
            return self.read_type(type_name);
        }
        self.schema.get_type(type_name)
    }

    pub fn has_type(&mut self, type_name: StringKey) -> bool {
        self.get_type(type_name).is_some()
    }

    pub fn snapshot_print(self) -> String {
        self.schema.snapshot_print()
    }

    fn read_type(&mut self, type_name: StringKey) -> Option<Type> {
        let mut start = 0;
        let mut end = self.types.len();
        while start <= end {
            let mid = (start + end) / 2;
            let cmp = self
                .types
                .get(mid)
                .key_compare_with_value(type_name.lookup());
            if cmp == ::std::cmp::Ordering::Equal {
                let type_ = self.types.get(mid).value()?;
                return Some(self.parse_type(type_)?);
            } else if cmp == ::std::cmp::Ordering::Less {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }
        None
    }

    fn parse_type(&mut self, type_: FBType<'_>) -> Option<Type> {
        Some(match type_.kind() {
            FBTypeKind::Scalar => self.parse_scalar(type_.scalar_id())?,
        })
    }

    fn parse_scalar(&mut self, id: u32) -> Option<Type> {
        let scalar = self.fb_schema.scalars()?.get(id.try_into().unwrap());
        let parsed_scalar = Scalar {
            name: scalar.name()?.to_string().intern(),
            is_extension: scalar.is_extension(),
            directives: self.parse_directive_values(scalar.directives()?)?,
        };
        Some(Type::Scalar(self.schema.add_scalar(parsed_scalar).unwrap()))
    }

    fn parse_directive_values(
        &self,
        directives: Vector<'_, ForwardsUOffset<FBDirectiveValue<'_>>>,
    ) -> Option<Vec<DirectiveValue>> {
        directives
            .iter()
            .map(|directive| self.parse_directive_value(directive))
            .collect::<Option<Vec<_>>>()
    }

    fn parse_directive_value(&self, directive: FBDirectiveValue<'fb>) -> Option<DirectiveValue> {
        let arguments = self.parse_argument_values(directive.arguments()?)?;
        Some(DirectiveValue {
            name: directive.name()?.intern(),
            arguments,
        })
    }

    fn parse_argument_values(
        &self,
        arguments: Vector<'_, ForwardsUOffset<FBArgumentValue<'_>>>,
    ) -> Option<Vec<ArgumentValue>> {
        arguments
            .iter()
            .map(|argument| self.parse_argument_value(argument))
            .collect::<Option<Vec<_>>>()
    }

    fn parse_argument_value(&self, argument: FBArgumentValue<'fb>) -> Option<ArgumentValue> {
        Some(ArgumentValue {
            name: argument.name()?.intern(),
            value: self.parse_const_value(argument.value()?)?,
        })
    }

    fn parse_const_value(&self, value: FBConstValue<'fb>) -> Option<ConstantValue> {
        Some(match value.kind() {
            FBConstValueKind::Null => ConstantValue::Null(get_empty_token()),
            FBConstValueKind::String => {
                ConstantValue::String(get_string_node(value.string_value()?.to_string()))
            }
            FBConstValueKind::Bool => ConstantValue::Boolean(get_boolean_node(value.bool_value())),
            FBConstValueKind::Int => {
                ConstantValue::Int(get_int_node(value.int_value()?.to_string()))
            }
            FBConstValueKind::Float => {
                ConstantValue::Float(get_float_node(value.float_value()?.to_string()))
            }
            FBConstValueKind::Enum => {
                ConstantValue::Enum(get_enum_node(value.enum_value()?.to_string()))
            }
            FBConstValueKind::List => {
                ConstantValue::List(self.parse_list_value(value.list_value()?)?)
            }
            FBConstValueKind::Object => {
                ConstantValue::Object(self.parse_object_value(value.object_value()?)?)
            }
        })
    }

    fn parse_list_value(&self, list_value: FBListValue<'fb>) -> Option<List<ConstantValue>> {
        let items = list_value
            .values()?
            .iter()
            .map(|value| self.parse_const_value(value))
            .collect::<Option<Vec<_>>>();
        Some(List {
            span: get_empty_span(),
            start: get_empty_token(),
            items: items?,
            end: get_empty_token(),
        })
    }

    fn parse_object_value(
        &self,
        object_value: FBObjectValue<'fb>,
    ) -> Option<List<ConstantArgument>> {
        let items = object_value
            .fields()?
            .iter()
            .map(|field| {
                Some(ConstantArgument {
                    span: get_empty_span(),
                    name: get_identifier(field.name()?.to_string()),
                    colon: get_empty_token(),
                    value: self.parse_const_value(field.value()?)?,
                })
            })
            .collect::<Option<Vec<_>>>();
        Some(List {
            span: get_empty_span(),
            start: get_empty_token(),
            items: items?,
            end: get_empty_token(),
        })
    }
}

fn get_identifier(value: String) -> Identifier {
    Identifier {
        span: get_empty_span(),
        token: get_empty_token(),
        value: value.intern(),
    }
}

fn get_enum_node(value: String) -> EnumNode {
    EnumNode {
        token: get_empty_token(),
        value: value.intern(),
    }
}

fn get_float_node(value: String) -> FloatNode {
    FloatNode {
        token: get_empty_token(),
        value: FloatValue::new(value.parse::<f64>().unwrap()),
        source_value: value.intern(),
    }
}

fn get_int_node(value: String) -> IntNode {
    IntNode {
        token: get_empty_token(),
        value: value.parse().unwrap(),
    }
}

fn get_boolean_node(value: bool) -> BooleanNode {
    BooleanNode {
        token: get_empty_token(),
        value,
    }
}

fn get_string_node(value: String) -> StringNode {
    StringNode {
        token: get_empty_token(),
        value: value.intern(),
    }
}

fn get_empty_token() -> Token {
    Token {
        span: get_empty_span(),
        kind: TokenKind::EndOfFile,
    }
}

fn get_empty_span() -> Span {
    Span { start: 0, end: 0 }
}
