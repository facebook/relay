/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use flatbuffers::{FlatBufferBuilder, WIPOffset};
use fnv::FnvHashMap;
use graphql_syntax::{ConstantArgument, ConstantValue, List};
use schema::*;
use std::collections::BTreeMap;
use std::convert::TryInto;

pub fn serialize_as_fb(schema: &Schema) -> Vec<u8> {
    let mut serializer = Serializer::new(&schema);
    serializer.serialize_schema()
}

struct Serializer<'fb, 'schema> {
    schema: &'schema Schema,
    bldr: FlatBufferBuilder<'fb>,
    scalars: Vec<WIPOffset<FBScalar<'fb>>>,
    types: FnvHashMap<String, WIPOffset<FBTypeMap<'fb>>>,
    type_map: FnvHashMap<String, u32>,
}

impl<'fb, 'schema> Serializer<'fb, 'schema> {
    fn new(schema: &'schema Schema) -> Self {
        Self {
            schema,
            bldr: FlatBufferBuilder::new(),
            scalars: Vec::new(),
            types: FnvHashMap::default(),
            type_map: FnvHashMap::default(),
        }
    }

    fn serialize_schema(&mut self) -> Vec<u8> {
        self.serialize_types();
        let mut ordered_types = Vec::new();
        for (_key, value) in self.types.iter().collect::<BTreeMap<_, _>>() {
            ordered_types.push(*value);
        }
        let schema_args = FBSchemaArgs {
            types: Some(self.bldr.create_vector(&ordered_types)),
            scalars: Some(self.bldr.create_vector(&self.scalars)),
        };
        let schema_offset = FBSchema::create(&mut self.bldr, &schema_args);
        finish_fbschema_buffer(&mut self.bldr, schema_offset);
        self.bldr.finished_data().to_owned()
    }

    fn serialize_types(&mut self) {
        let ordered_type_map = self.schema.get_type_map().collect::<BTreeMap<_, _>>();
        for (_key, value) in ordered_type_map.iter() {
            self.serialize_type(**value);
        }
    }

    fn serialize_type(&mut self, type_: Type) {
        let name = self.schema.get_type_name(type_).lookup();
        if self.type_map.contains_key(name) {
            return;
        }
        match type_ {
            Type::Scalar(id) => self.serialize_scalar(id),
            _ => {} // Coming up in next diffs
        }
    }

    fn serialize_scalar(&mut self, id: ScalarID) {
        let scalar = self.schema.scalar(id);
        let name = scalar.name.lookup();
        let directives = &self.serialize_directive_values(&scalar.directives);
        let args = FBScalarArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: scalar.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
        };
        self.add_to_type_map(self.scalars.len(), FBTypeKind::Scalar, name);
        self.scalars.push(FBScalar::create(&mut self.bldr, &args));
    }

    fn serialize_directive_values(
        &mut self,
        directives: &[DirectiveValue],
    ) -> Vec<WIPOffset<FBDirectiveValue<'fb>>> {
        directives
            .iter()
            .map(|directive| self.serialize_directive_value(directive))
            .collect::<Vec<_>>()
    }

    fn serialize_directive_value(
        &mut self,
        directive: &DirectiveValue,
    ) -> WIPOffset<FBDirectiveValue<'fb>> {
        let argument_values = &self.serialize_argument_values(&directive.arguments);
        let args = FBDirectiveValueArgs {
            name: Some(self.bldr.create_string(directive.name.lookup())),
            arguments: Some(self.bldr.create_vector(argument_values)),
        };
        FBDirectiveValue::create(&mut self.bldr, &args)
    }

    fn serialize_argument_values(
        &mut self,
        argument_values: &[ArgumentValue],
    ) -> Vec<WIPOffset<FBArgumentValue<'fb>>> {
        argument_values
            .iter()
            .map(|argument_value| self.serialize_argument_value(argument_value))
            .collect::<Vec<_>>()
    }

    fn serialize_argument_value(
        &mut self,
        argument_value: &ArgumentValue,
    ) -> WIPOffset<FBArgumentValue<'fb>> {
        let args = FBArgumentValueArgs {
            name: Some(self.bldr.create_string(&argument_value.name.lookup())),
            value: Some(self.serialize_const_value(&argument_value.value)),
        };
        FBArgumentValue::create(&mut self.bldr, &args)
    }

    fn serialize_const_value(&mut self, value: &ConstantValue) -> WIPOffset<FBConstValue<'fb>> {
        let mut args = FBConstValueArgs::default();
        match value {
            ConstantValue::String(value) => {
                args.kind = FBConstValueKind::String;
                args.string_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Int(value) => {
                args.kind = FBConstValueKind::Int;
                args.int_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Float(value) => {
                args.kind = FBConstValueKind::Float;
                args.float_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Boolean(value) => {
                args.kind = FBConstValueKind::Bool;
                args.bool_value = value.value;
            }
            ConstantValue::Enum(value) => {
                args.kind = FBConstValueKind::Enum;
                args.enum_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::List(value) => {
                args.kind = FBConstValueKind::List;
                args.list_value = Some(self.serialize_list_value(value));
            }
            ConstantValue::Object(value) => {
                args.kind = FBConstValueKind::Object;
                args.object_value = Some(self.serialize_object_value(value));
            }
            ConstantValue::Null(_) => {
                args.kind = FBConstValueKind::Null;
            }
        };
        FBConstValue::create(&mut self.bldr, &args)
    }

    fn serialize_list_value(&mut self, list: &List<ConstantValue>) -> WIPOffset<FBListValue<'fb>> {
        let items = &list
            .items
            .iter()
            .map(|value| self.serialize_const_value(value))
            .collect::<Vec<_>>();
        let args = FBListValueArgs {
            values: Some(self.bldr.create_vector(items)),
        };
        FBListValue::create(&mut self.bldr, &args)
    }

    fn serialize_object_value(
        &mut self,
        object: &List<ConstantArgument>,
    ) -> WIPOffset<FBObjectValue<'fb>> {
        let items = &object
            .items
            .iter()
            .map(|value| self.serialize_object_field(value))
            .collect::<Vec<_>>();
        let args = FBObjectValueArgs {
            fields: Some(self.bldr.create_vector(items)),
        };
        FBObjectValue::create(&mut self.bldr, &args)
    }

    fn serialize_object_field(
        &mut self,
        value: &ConstantArgument,
    ) -> WIPOffset<FBObjectField<'fb>> {
        let args = FBObjectFieldArgs {
            name: Some(self.bldr.create_string(&format!("{}", value.name))),
            value: Some(self.serialize_const_value(&value.value)),
        };
        FBObjectField::create(&mut self.bldr, &args)
    }

    fn add_to_type_map(&mut self, id: usize, kind: FBTypeKind, name: &str) {
        let mut type_args = FBTypeArgs::default();
        type_args.kind = kind;
        let id = id.try_into().unwrap();
        match kind {
            FBTypeKind::Scalar => {
                type_args.scalar_id = id;
            }
        }
        let args = FBTypeMapArgs {
            name: Some(self.bldr.create_string(name)),
            value: Some(FBType::create(&mut self.bldr, &type_args)),
        };
        self.types
            .insert(name.to_string(), FBTypeMap::create(&mut self.bldr, &args));
        self.type_map.insert(name.to_string(), id);
    }
}
