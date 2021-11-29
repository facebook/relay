/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(clippy::all)]

use crate::{
    in_memory::InMemorySchema, Argument, ArgumentDefinitions, ArgumentValue, Directive,
    DirectiveValue, EnumID, EnumValue, FieldID, InputObjectID, InterfaceID, ObjectID, ScalarID,
    Schema, Type, TypeReference, UnionID,
};
use flatbuffers::{FlatBufferBuilder, WIPOffset};
use fnv::FnvHashMap;
use graphql_syntax::{ConstantArgument, ConstantValue, DirectiveLocation, List};
use intern::string_key::StringKey;
use std::collections::BTreeMap;

pub fn serialize_as_flatbuffer(schema: &InMemorySchema) -> Vec<u8> {
    let mut serializer = Serializer::new(schema);
    serializer.serialize_schema()
}

struct Serializer<'fb, 'schema> {
    schema: &'schema InMemorySchema,
    bldr: FlatBufferBuilder<'fb>,
    scalars: Vec<WIPOffset<schema_flatbuffer::Scalar<'fb>>>,
    input_objects: Vec<WIPOffset<schema_flatbuffer::InputObject<'fb>>>,
    enums: Vec<WIPOffset<schema_flatbuffer::Enum<'fb>>>,
    objects: Vec<WIPOffset<schema_flatbuffer::Object<'fb>>>,
    interfaces: Vec<WIPOffset<schema_flatbuffer::Interface<'fb>>>,
    unions: Vec<WIPOffset<schema_flatbuffer::Union<'fb>>>,
    fields: Vec<WIPOffset<schema_flatbuffer::Field<'fb>>>,
    types: FnvHashMap<String, WIPOffset<schema_flatbuffer::TypeMapEntry<'fb>>>,
    type_map: FnvHashMap<StringKey, schema_flatbuffer::TypeArgs>,
    directives: FnvHashMap<String, WIPOffset<schema_flatbuffer::DirectiveMapEntry<'fb>>>,
}

impl<'fb, 'schema> Serializer<'fb, 'schema> {
    fn new(schema: &'schema InMemorySchema) -> Self {
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
            directives: FnvHashMap::default(),
        }
    }

    fn serialize_schema(&mut self) -> Vec<u8> {
        self.serialize_types();
        self.serialize_directives();
        let mut ordered_types = Vec::new();
        for (_key, value) in self.types.iter().collect::<BTreeMap<_, _>>() {
            ordered_types.push(*value);
        }
        let mut ordered_directives = Vec::new();
        for (_key, value) in self.directives.iter().collect::<BTreeMap<_, _>>() {
            ordered_directives.push(*value);
        }

        let (has_query_type, query_type) = self.get_object_id(self.schema.query_type());
        assert!(has_query_type);
        let (has_mutation_type, mutation_type) = self.get_object_id(self.schema.mutation_type());
        let (has_subscription_type, subscription_type) =
            self.get_object_id(self.schema.subscription_type());

        let schema_args = schema_flatbuffer::SchemaArgs {
            query_type,
            has_mutation_type,
            mutation_type,
            has_subscription_type,
            subscription_type,
            types: Some(self.bldr.create_vector(&ordered_types)),
            scalars: Some(self.bldr.create_vector(&self.scalars)),
            input_objects: Some(self.bldr.create_vector(&self.input_objects)),
            enums: Some(self.bldr.create_vector(&self.enums)),
            objects: Some(self.bldr.create_vector(&self.objects)),
            interfaces: Some(self.bldr.create_vector(&self.interfaces)),
            unions: Some(self.bldr.create_vector(&self.unions)),
            fields: Some(self.bldr.create_vector(&self.fields)),
            directives: Some(self.bldr.create_vector(&ordered_directives)),
        };
        let schema_offset = schema_flatbuffer::Schema::create(&mut self.bldr, &schema_args);
        schema_flatbuffer::finish_schema_buffer(&mut self.bldr, schema_offset);
        self.bldr.finished_data().to_owned()
    }

    /// Returns true and an object id when passed Some(Type) or false and 0 for None
    /// This is used to serialize the query/mutation/subscription types.
    fn get_object_id(&mut self, type_: Option<Type>) -> (bool, u32) {
        if let Some(type_) = type_ {
            let type_args = self.get_type_args(type_);
            assert!(type_args.kind == schema_flatbuffer::TypeKind::Object);
            (true, type_args.object_id)
        } else {
            (false, 0)
        }
    }

    fn serialize_types(&mut self) {
        let ordered_type_map = self.schema.get_type_map().collect::<BTreeMap<_, _>>();
        for (_key, value) in ordered_type_map.iter() {
            self.serialize_type(**value);
        }
    }

    fn serialize_directives(&mut self) {
        for directive in self.schema.get_directives() {
            self.serialize_directive(directive)
        }
    }

    fn serialize_directive(&mut self, directive: &Directive) {
        let name = directive.name.lookup();
        if self.directives.contains_key(name) {
            return;
        }
        let arguments = &self.serialize_arguments(&directive.arguments);
        let locations = &directive
            .locations
            .iter()
            .map(|location| get_mapped_location(*location))
            .collect::<Vec<_>>();
        let args = schema_flatbuffer::DirectiveArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: directive.is_extension,
            arguments: Some(self.bldr.create_vector(arguments)),
            locations: Some(self.bldr.create_vector(locations)),
            repeatable: directive.repeatable,
        };
        let fb_directive = schema_flatbuffer::Directive::create(&mut self.bldr, &args);

        let directive_map_args = schema_flatbuffer::DirectiveMapEntryArgs {
            name: Some(self.bldr.create_string(name)),
            value: Some(fb_directive),
        };
        self.directives.insert(
            name.to_string(),
            schema_flatbuffer::DirectiveMapEntry::create(&mut self.bldr, &directive_map_args),
        );
    }

    fn serialize_type(&mut self, type_: Type) {
        let name = self.schema.get_type_name(type_);
        if self.type_map.contains_key(&name) {
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

    fn get_type_args(&mut self, type_: Type) -> schema_flatbuffer::TypeArgs {
        let name = self.schema.get_type_name(type_);
        if !self.type_map.contains_key(&name) {
            self.serialize_type(type_);
        }
        self.type_map[&name]
    }

    fn serialize_scalar(&mut self, id: ScalarID) {
        let scalar = self.schema.scalar(id);
        let name = scalar.name;
        let directives = &self.serialize_directive_values(&scalar.directives);
        let args = schema_flatbuffer::ScalarArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            is_extension: scalar.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
        };
        self.add_to_type_map(
            self.scalars.len(),
            schema_flatbuffer::TypeKind::Scalar,
            name,
        );
        self.scalars
            .push(schema_flatbuffer::Scalar::create(&mut self.bldr, &args));
    }

    fn serialize_input_object(&mut self, id: InputObjectID) {
        let input_object = self.schema.input_object(id);
        let name = input_object.name;
        // Reserve idx and add to typemap. Else we could endup in a cycle
        let idx = self.input_objects.len();
        self.add_to_type_map(idx, schema_flatbuffer::TypeKind::InputObject, name);
        self.input_objects
            .push(schema_flatbuffer::InputObject::create(
                &mut self.bldr,
                &schema_flatbuffer::InputObjectArgs::default(),
            ));
        let items = &self.serialize_directive_values(&input_object.directives);
        let fields = &self.serialize_arguments(&input_object.fields);
        let args = schema_flatbuffer::InputObjectArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            directives: Some(self.bldr.create_vector(items)),
            fields: Some(self.bldr.create_vector(fields)),
        };
        self.input_objects[idx] = schema_flatbuffer::InputObject::create(&mut self.bldr, &args);
    }

    fn serialize_enum(&mut self, id: EnumID) {
        let enum_ = self.schema.enum_(id);
        let name = enum_.name;
        let directives = &self.serialize_directive_values(&enum_.directives);
        let values = &self.serialize_enum_values(&enum_.values);
        let args = schema_flatbuffer::EnumArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            is_extension: enum_.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            values: Some(self.bldr.create_vector(values)),
        };
        self.add_to_type_map(self.enums.len(), schema_flatbuffer::TypeKind::Enum, name);
        self.enums
            .push(schema_flatbuffer::Enum::create(&mut self.bldr, &args));
    }

    fn serialize_object(&mut self, id: ObjectID) {
        let object = self.schema.object(id);
        let name = object.name;
        let idx = self.objects.len();
        self.add_to_type_map(idx, schema_flatbuffer::TypeKind::Object, name.item);
        self.objects.push(schema_flatbuffer::Object::create(
            &mut self.bldr,
            &schema_flatbuffer::ObjectArgs::default(),
        ));

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
        let args = schema_flatbuffer::ObjectArgs {
            name: Some(self.bldr.create_string(name.item.lookup())),
            is_extension: object.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            fields: Some(self.bldr.create_vector(fields)),
            interfaces: Some(self.bldr.create_vector(interfaces)),
        };
        self.objects[idx] = schema_flatbuffer::Object::create(&mut self.bldr, &args);
    }

    fn serialize_interface(&mut self, id: InterfaceID) {
        let interface = self.schema.interface(id);
        let name = interface.name;
        let idx = self.interfaces.len();
        self.add_to_type_map(idx, schema_flatbuffer::TypeKind::Interface, name);
        self.interfaces.push(schema_flatbuffer::Interface::create(
            &mut self.bldr,
            &schema_flatbuffer::InterfaceArgs::default(),
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
        let args = schema_flatbuffer::InterfaceArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            is_extension: interface.is_extension,
            directives: Some(self.bldr.create_vector(directives)),
            fields: Some(self.bldr.create_vector(fields)),
            interfaces: Some(self.bldr.create_vector(interfaces)),
            implementing_objects: Some(self.bldr.create_vector(implementing_objects)),
        };
        self.interfaces[idx] = schema_flatbuffer::Interface::create(&mut self.bldr, &args);
    }

    fn serialize_union(&mut self, id: UnionID) {
        let union = self.schema.union(id);
        let name = union.name;
        let idx = self.unions.len();
        self.add_to_type_map(idx, schema_flatbuffer::TypeKind::Union, name);
        self.unions.push(schema_flatbuffer::Union::create(
            &mut self.bldr,
            &schema_flatbuffer::UnionArgs::default(),
        ));

        let directives = &self.serialize_directive_values(&union.directives);
        let members = &union
            .members
            .iter()
            .map(|object_id| self.get_type_args(Type::Object(*object_id)).object_id)
            .collect::<Vec<_>>();
        let args = schema_flatbuffer::UnionArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            is_extension: union.is_extension,
            members: Some(self.bldr.create_vector(members)),
            directives: Some(self.bldr.create_vector(directives)),
        };
        self.unions[idx] = schema_flatbuffer::Union::create(&mut self.bldr, &args);
    }

    fn serialize_field(&mut self, id: FieldID) -> usize {
        let field = self.schema.field(id);
        let name = field.name.item.lookup();
        let directives = &self.serialize_directive_values(&field.directives);
        let arguments = &self.serialize_arguments(&field.arguments);
        let args = schema_flatbuffer::FieldArgs {
            name: Some(self.bldr.create_string(name)),
            is_extension: field.is_extension,
            arguments: Some(self.bldr.create_vector(arguments)),
            type_: Some(self.serialize_type_reference(&field.type_)),
            directives: Some(self.bldr.create_vector(directives)),
            parent_type: match &field.parent_type {
                Some(type_) => {
                    let args = self.get_type_args(*type_);
                    Some(schema_flatbuffer::Type::create(&mut self.bldr, &args))
                }
                _ => None,
            },
        };
        self.fields
            .push(schema_flatbuffer::Field::create(&mut self.bldr, &args));
        self.fields.len() - 1
    }

    fn serialize_enum_values(
        &mut self,
        values: &[EnumValue],
    ) -> Vec<WIPOffset<schema_flatbuffer::EnumValue<'fb>>> {
        values
            .iter()
            .map(|value| self.serialize_enum_value(value))
            .collect::<Vec<_>>()
    }

    fn serialize_enum_value(
        &mut self,
        value: &EnumValue,
    ) -> WIPOffset<schema_flatbuffer::EnumValue<'fb>> {
        let directives = &self.serialize_directive_values(&value.directives);
        let args = schema_flatbuffer::EnumValueArgs {
            value: Some(self.bldr.create_string(value.value.lookup())),
            directives: Some(self.bldr.create_vector(directives)),
        };
        schema_flatbuffer::EnumValue::create(&mut self.bldr, &args)
    }

    fn serialize_arguments(
        &mut self,
        arguments: &ArgumentDefinitions,
    ) -> Vec<WIPOffset<schema_flatbuffer::Argument<'fb>>> {
        arguments
            .iter()
            .map(|argument| self.serialize_argument(argument))
            .collect::<Vec<_>>()
    }

    fn serialize_argument(
        &mut self,
        value: &Argument,
    ) -> WIPOffset<schema_flatbuffer::Argument<'fb>> {
        let args = schema_flatbuffer::ArgumentArgs {
            name: Some(self.bldr.create_string(value.name.lookup())),
            value: value
                .default_value
                .as_ref()
                .map(|default_value| self.serialize_const_value(default_value)),
            type_: Some(self.serialize_type_reference(&value.type_)),
        };
        schema_flatbuffer::Argument::create(&mut self.bldr, &args)
    }

    fn serialize_type_reference(
        &mut self,
        type_: &TypeReference,
    ) -> WIPOffset<schema_flatbuffer::TypeReference<'fb>> {
        let mut args = schema_flatbuffer::TypeReferenceArgs::default();
        match type_ {
            TypeReference::Named(type_) => {
                let type_args = self.get_type_args(*type_);
                args.kind = schema_flatbuffer::TypeReferenceKind::Named;
                args.named = Some(schema_flatbuffer::Type::create(&mut self.bldr, &type_args));
            }
            TypeReference::List(of) => {
                args.kind = schema_flatbuffer::TypeReferenceKind::List;
                args.list = Some(self.serialize_type_reference(of));
            }
            TypeReference::NonNull(of) => {
                args.kind = schema_flatbuffer::TypeReferenceKind::NonNull;
                args.null = Some(self.serialize_type_reference(of));
            }
        }
        schema_flatbuffer::TypeReference::create(&mut self.bldr, &args)
    }

    fn serialize_directive_values(
        &mut self,
        directives: &[DirectiveValue],
    ) -> Vec<WIPOffset<schema_flatbuffer::DirectiveValue<'fb>>> {
        directives
            .iter()
            .map(|directive| self.serialize_directive_value(directive))
            .collect::<Vec<_>>()
    }

    fn serialize_directive_value(
        &mut self,
        directive: &DirectiveValue,
    ) -> WIPOffset<schema_flatbuffer::DirectiveValue<'fb>> {
        let argument_values = &self.serialize_argument_values(&directive.arguments);
        let args = schema_flatbuffer::DirectiveValueArgs {
            name: Some(self.bldr.create_string(directive.name.lookup())),
            arguments: Some(self.bldr.create_vector(argument_values)),
        };
        schema_flatbuffer::DirectiveValue::create(&mut self.bldr, &args)
    }

    fn serialize_argument_values(
        &mut self,
        argument_values: &[ArgumentValue],
    ) -> Vec<WIPOffset<schema_flatbuffer::ArgumentValue<'fb>>> {
        argument_values
            .iter()
            .map(|argument_value| self.serialize_argument_value(argument_value))
            .collect::<Vec<_>>()
    }

    fn serialize_argument_value(
        &mut self,
        argument_value: &ArgumentValue,
    ) -> WIPOffset<schema_flatbuffer::ArgumentValue<'fb>> {
        let args = schema_flatbuffer::ArgumentValueArgs {
            name: Some(self.bldr.create_string(argument_value.name.lookup())),
            value: Some(self.serialize_const_value(&argument_value.value)),
        };
        schema_flatbuffer::ArgumentValue::create(&mut self.bldr, &args)
    }

    fn serialize_const_value(
        &mut self,
        value: &ConstantValue,
    ) -> WIPOffset<schema_flatbuffer::ConstValue<'fb>> {
        let mut args = schema_flatbuffer::ConstValueArgs::default();
        match value {
            ConstantValue::String(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::String;
                args.string_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Int(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::Int;
                args.int_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Float(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::Float;
                args.float_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::Boolean(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::Bool;
                args.bool_value = value.value;
            }
            ConstantValue::Enum(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::Enum;
                args.enum_value = Some(self.bldr.create_string(&format!("{}", value)));
            }
            ConstantValue::List(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::List;
                args.list_value = Some(self.serialize_list_value(value));
            }
            ConstantValue::Object(value) => {
                args.kind = schema_flatbuffer::ConstValueKind::Object;
                args.object_value = Some(self.serialize_object_value(value));
            }
            ConstantValue::Null(_) => {
                args.kind = schema_flatbuffer::ConstValueKind::Null;
            }
        };
        schema_flatbuffer::ConstValue::create(&mut self.bldr, &args)
    }

    fn serialize_list_value(
        &mut self,
        list: &List<ConstantValue>,
    ) -> WIPOffset<schema_flatbuffer::ListValue<'fb>> {
        let items = &list
            .items
            .iter()
            .map(|value| self.serialize_const_value(value))
            .collect::<Vec<_>>();
        let args = schema_flatbuffer::ListValueArgs {
            values: Some(self.bldr.create_vector(items)),
        };
        schema_flatbuffer::ListValue::create(&mut self.bldr, &args)
    }

    fn serialize_object_value(
        &mut self,
        object: &List<ConstantArgument>,
    ) -> WIPOffset<schema_flatbuffer::ObjectValue<'fb>> {
        let items = &object
            .items
            .iter()
            .map(|value| self.serialize_object_field(value))
            .collect::<Vec<_>>();
        let args = schema_flatbuffer::ObjectValueArgs {
            fields: Some(self.bldr.create_vector(items)),
        };
        schema_flatbuffer::ObjectValue::create(&mut self.bldr, &args)
    }

    fn serialize_object_field(
        &mut self,
        value: &ConstantArgument,
    ) -> WIPOffset<schema_flatbuffer::ObjectField<'fb>> {
        let args = schema_flatbuffer::ObjectFieldArgs {
            name: Some(self.bldr.create_string(&format!("{}", value.name))),
            value: Some(self.serialize_const_value(&value.value)),
        };
        schema_flatbuffer::ObjectField::create(&mut self.bldr, &args)
    }

    fn add_to_type_map(&mut self, id: usize, kind: schema_flatbuffer::TypeKind, name: StringKey) {
        let id = id.try_into().unwrap();
        let type_args = self.build_type_args(id, kind);
        let args = schema_flatbuffer::TypeMapEntryArgs {
            name: Some(self.bldr.create_string(name.lookup())),
            value: Some(schema_flatbuffer::Type::create(&mut self.bldr, &type_args)),
        };
        self.types.insert(
            name.to_string(),
            schema_flatbuffer::TypeMapEntry::create(&mut self.bldr, &args),
        );
        self.type_map.insert(name, type_args);
    }

    #[allow(clippy::field_reassign_with_default)]
    fn build_type_args(
        &mut self,
        id: u32,
        kind: schema_flatbuffer::TypeKind,
    ) -> schema_flatbuffer::TypeArgs {
        let mut type_args = schema_flatbuffer::TypeArgs::default();
        type_args.kind = kind;
        match kind {
            schema_flatbuffer::TypeKind::Scalar => {
                type_args.scalar_id = id;
            }
            schema_flatbuffer::TypeKind::InputObject => {
                type_args.input_object_id = id;
            }
            schema_flatbuffer::TypeKind::Enum => {
                type_args.enum_id = id;
            }
            schema_flatbuffer::TypeKind::Object => {
                type_args.object_id = id;
            }
            schema_flatbuffer::TypeKind::Interface => {
                type_args.interface_id = id;
            }
            schema_flatbuffer::TypeKind::Union => {
                type_args.union_id = id;
            }
            unknown => panic!("unknown TypeKind value: {:?}", unknown),
        }
        type_args
    }
}

fn get_mapped_location(location: DirectiveLocation) -> schema_flatbuffer::DirectiveLocation {
    use schema_flatbuffer::DirectiveLocation as FDL;
    use DirectiveLocation as DL;
    match location {
        DL::Query => FDL::Query,
        DL::Mutation => FDL::Mutation,
        DL::Subscription => FDL::Subscription,
        DL::Field => FDL::Field,
        DL::FragmentDefinition => FDL::FragmentDefinition,
        DL::FragmentSpread => FDL::FragmentSpread,
        DL::InlineFragment => FDL::InlineFragment,
        DL::Schema => FDL::Schema,
        DL::Scalar => FDL::Scalar,
        DL::Object => FDL::Object,
        DL::FieldDefinition => FDL::FieldDefinition,
        DL::ArgumentDefinition => FDL::ArgumentDefinition,
        DL::Interface => FDL::Interface,
        DL::Union => FDL::Union,
        DL::Enum => FDL::Enum,
        DL::EnumValue => FDL::EnumValue,
        DL::InputObject => FDL::InputObject,
        DL::InputFieldDefinition => FDL::InputFieldDefinition,
        DL::VariableDefinition => FDL::VariableDefinition,
    }
}
