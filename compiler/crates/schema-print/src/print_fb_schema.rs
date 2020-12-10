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
    objects: Vec<WIPOffset<FBObject<'fb>>>,
    interfaces: Vec<WIPOffset<FBInterface<'fb>>>,
    unions: Vec<WIPOffset<FBUnion<'fb>>>,
    fields: Vec<WIPOffset<FBField<'fb>>>,
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
            objects: Vec::new(),
            interfaces: Vec::new(),
            unions: Vec::new(),
            fields: Vec::new(),
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
            objects: Some(self.bldr.create_vector(&self.objects)),
            interfaces: Some(self.bldr.create_vector(&self.interfaces)),
            unions: Some(self.bldr.create_vector(&self.unions)),
            fields: Some(self.bldr.create_vector(&self.fields)),
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
            Type::Object(id) => self.serialize_object(id),
            Type::Interface(id) => self.serialize_interface(id),
            Type::Union(id) => self.serialize_union(id),
        }
    }

    fn get_type_args(&mut self, type_: Type) -> FBTypeArgs {
        let name = self.schema.get_type_name(type_).lookup();
        if !self.type_map.contains_key(name) {
            self.serialize_type(type_);
        }
        *self.type_map.get(name).unwrap()
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

    fn serialize_object(&mut self, id: ObjectID) {
        let object = self.schema.object(id);
        let name = object.name.lookup();
        let idx = self.objects.len();
        self.add_to_type_map(idx, FBTypeKind::Object, name);
        self.objects
            .push(FBObject::create(&mut self.bldr, &FBObjectArgs::default()));

        let directives = &self.serialize_directive_values(&object.directives);
        let fields = &object
            .fields
            .iter()
            .map(|field_id| self.serialize_field(*field_id).try_into().unwrap())
            .collect::<Vec<u32>>();
        let interfaces = &object
            .interfaces
            .iter()
            .map(|interface_id| {
                self.get_type_args(Type::Interface(*interface_id))
                    .interface_id
            })
            .collect::<Vec<_>>();
        let args = FBObjectArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: object.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            fields: Some(self.bldr.create_vector(fields)),
            interfaces: Some(self.bldr.create_vector(interfaces)),
        };
        self.objects[idx] = FBObject::create(&mut self.bldr, &args);
    }

    fn serialize_interface(&mut self, id: InterfaceID) {
        let interface = self.schema.interface(id);
        let name = interface.name.lookup();
        let idx = self.interfaces.len();
        self.add_to_type_map(idx, FBTypeKind::Interface, name);
        self.interfaces.push(FBInterface::create(
            &mut self.bldr,
            &FBInterfaceArgs::default(),
        ));

        let directives = &self.serialize_directive_values(&interface.directives);
        let fields = &interface
            .fields
            .iter()
            .map(|field_id| self.serialize_field(*field_id).try_into().unwrap())
            .collect::<Vec<u32>>();
        let interfaces = &interface
            .interfaces
            .iter()
            .map(|interface_id| {
                self.get_type_args(Type::Interface(*interface_id))
                    .interface_id
            })
            .collect::<Vec<_>>();
        let implementing_objects = &interface
            .implementing_objects
            .iter()
            .map(|object_id| self.get_type_args(Type::Object(*object_id)).object_id)
            .collect::<Vec<_>>();
        let args = FBInterfaceArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: interface.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            fields: Some(self.bldr.create_vector(fields)),
            interfaces: Some(self.bldr.create_vector(interfaces)),
            implementing_objects: Some(self.bldr.create_vector(implementing_objects)),
        };
        self.interfaces[idx] = FBInterface::create(&mut self.bldr, &args);
    }

    fn serialize_union(&mut self, id: UnionID) {
        let union = self.schema.union(id);
        let name = union.name.lookup();
        let idx = self.unions.len();
        self.add_to_type_map(idx, FBTypeKind::Union, name);
        self.unions
            .push(FBUnion::create(&mut self.bldr, &FBUnionArgs::default()));

        let directives = &self.serialize_directive_values(&union.directives);
        let members = &union
            .members
            .iter()
            .map(|object_id| self.get_type_args(Type::Object(*object_id)).object_id)
            .collect::<Vec<_>>();
        let args = FBUnionArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: union.is_extension,
            members: Some(self.bldr.create_vector(members)),
            directives: Some(self.bldr.create_vector(directives)),
        };
        self.unions[idx] = FBUnion::create(&mut self.bldr, &args);
    }

    fn serialize_field(&mut self, id: FieldID) -> usize {
        let field = self.schema.field(id);
        let name = field.name.lookup();
        let directives = &self.serialize_directive_values(&field.directives);
        let arguments = &self.serialize_arguments(&field.arguments);
        let args = FBFieldArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: field.is_extension,
            arguments: Some(self.bldr.create_vector(arguments)),
            type_: Some(self.serialize_type_reference(&field.type_)),
            directives: Some(self.bldr.create_vector(directives)),
            parent_type: match &field.parent_type {
                Some(type_) => {
                    let args = self.get_type_args(*type_);
                    Some(FBType::create(&mut self.bldr, &args))
                }
                _ => None,
            },
        };
        self.fields.push(FBField::create(&mut self.bldr, &args));
        self.fields.len() - 1
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
                let type_args = self.get_type_args(*type_);
                args.kind = FBTypeReferenceKind::Named;
                args.named = Some(FBType::create(&mut self.bldr, &type_args));
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
        let id = id.try_into().unwrap();
        let type_args = self.build_type_args(id, kind);
        let args = FBTypeMapArgs {
            name: Some(self.bldr.create_string(name)),
            value: Some(FBType::create(&mut self.bldr, &type_args)),
        };
        self.types
            .insert(name.to_string(), FBTypeMap::create(&mut self.bldr, &args));
        self.type_map.insert(name.to_string(), type_args);
    }

    fn build_type_args(&mut self, id: u32, kind: FBTypeKind) -> FBTypeArgs {
        let mut type_args = FBTypeArgs::default();
        type_args.kind = kind;
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
            FBTypeKind::Object => {
                type_args.object_id = id;
            }
            FBTypeKind::Interface => {
                type_args.interface_id = id;
            }
            FBTypeKind::Union => {
                type_args.union_id = id;
            }
        }
        type_args
    }
}
