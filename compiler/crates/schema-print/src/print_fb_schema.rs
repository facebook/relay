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
use schema::{Argument, *};
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
    input_objects: Vec<WIPOffset<FBInputObject<'fb>>>,
    enums: Vec<WIPOffset<FBEnum<'fb>>>,
    types: FnvHashMap<String, WIPOffset<FBTypeMap<'fb>>>,
    type_map: FnvHashMap<String, FBTypeArgs>,
}

impl<'fb, 'schema> Serializer<'fb, 'schema> {
    fn new(schema: &'schema Schema) -> Self {
        Self {
            schema,
            bldr: FlatBufferBuilder::new(),
            scalars: Vec::new(),
            input_objects: Vec::new(),
            enums: Vec::new(),
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
            input_objects: Some(self.bldr.create_vector(&self.input_objects)),
            enums: Some(self.bldr.create_vector(&self.enums)),
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
            Type::InputObject(id) => self.serialize_input_object(id),
            Type::Enum(id) => self.serialize_enum(id),
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

    fn serialize_input_object(&mut self, id: InputObjectID) {
        let input_object = self.schema.input_object(id);
        let name = input_object.name.lookup();
        // Reserve idx and add to typemap. Else we could endup in a cycle
        let idx = self.input_objects.len();
        self.add_to_type_map(idx, FBTypeKind::InputObject, name);
        self.input_objects.push(FBInputObject::create(
            &mut self.bldr,
            &FBInputObjectArgs::default(),
        ));
        let items = &self.serialize_directive_values(&input_object.directives);
        let fields = &self.serialize_arguments(&input_object.fields);
        let args = FBInputObjectArgs {
            name: Some(self.bldr.create_string(name)),
            directives: Some(self.bldr.create_vector(items)),
            fields: Some(self.bldr.create_vector(fields)),
        };
        self.input_objects[idx] = FBInputObject::create(&mut self.bldr, &args);
    }

    fn serialize_enum(&mut self, id: EnumID) {
        let enum_ = self.schema.enum_(id);
        let name = enum_.name.lookup();
        let directives = &self.serialize_directive_values(&enum_.directives);
        let values = &self.serialize_enum_values(&enum_.values);
        let args = FBEnumArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: enum_.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            values: Some(self.bldr.create_vector(values)),
        };
        self.add_to_type_map(self.enums.len(), FBTypeKind::Enum, name);
        self.enums.push(FBEnum::create(&mut self.bldr, &args));
    }

    fn serialize_enum_values(&mut self, values: &[EnumValue]) -> Vec<WIPOffset<FBEnumValue<'fb>>> {
        values
            .iter()
            .map(|value| self.serialize_enum_value(value))
            .collect::<Vec<_>>()
    }

    fn serialize_enum_value(&mut self, value: &EnumValue) -> WIPOffset<FBEnumValue<'fb>> {
        let directives = &self.serialize_directive_values(&value.directives);
        let args = FBEnumValueArgs {
            value: Some(self.bldr.create_string(value.value.lookup())),
            directives: Some(self.bldr.create_vector(directives)),
        };
        FBEnumValue::create(&mut self.bldr, &args)
    }

    fn serialize_arguments(
        &mut self,
        arguments: &ArgumentDefinitions,
    ) -> Vec<WIPOffset<FBArgument<'fb>>> {
        arguments
            .iter()
            .map(|argument| self.serialize_argument(argument))
            .collect::<Vec<_>>()
    }

    fn serialize_argument(&mut self, value: &Argument) -> WIPOffset<FBArgument<'fb>> {
        let args = FBArgumentArgs {
            name: Some(self.bldr.create_string(&value.name.lookup())),
            value: match &value.default_value {
                Some(default_value) => Some(self.serialize_const_value(default_value)),
                _ => None,
            },
            type_: Some(self.serialize_type_reference(&value.type_)),
        };
        FBArgument::create(&mut self.bldr, &args)
    }

    fn serialize_type_reference(
        &mut self,
        type_: &TypeReference,
    ) -> WIPOffset<FBTypeReference<'fb>> {
        let mut args = FBTypeReferenceArgs::default();
        match type_ {
            TypeReference::Named(type_) => {
                let type_name = self.schema.get_type_name(*type_).lookup();
                if !self.types.contains_key(type_name) {
                    self.serialize_type(*type_);
                }
                args.kind = FBTypeReferenceKind::Named;
                args.named = Some(FBType::create(
                    &mut self.bldr,
                    &self.type_map.get(type_name).unwrap(),
                ));
            }
            TypeReference::List(of) => {
                args.kind = FBTypeReferenceKind::List;
                args.list = Some(self.serialize_type_reference(of));
            }
            TypeReference::NonNull(of) => {
                args.kind = FBTypeReferenceKind::NonNull;
                args.null = Some(self.serialize_type_reference(of));
            }
        }
        FBTypeReference::create(&mut self.bldr, &args)
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
            FBTypeKind::InputObject => {
                type_args.input_object_id = id;
            }
            FBTypeKind::Enum => {
                type_args.enum_id = id;
            }
        }
        let args = FBTypeMapArgs {
            name: Some(self.bldr.create_string(name)),
            value: Some(FBType::create(&mut self.bldr, &type_args)),
        };
        self.types
            .insert(name.to_string(), FBTypeMap::create(&mut self.bldr, &args));
        self.type_map.insert(name.to_string(), type_args);
    }
}
