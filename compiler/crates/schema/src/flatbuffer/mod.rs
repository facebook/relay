/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod serialize;
mod wrapper;

use crate::definitions::{Argument, Directive, *};
use common::{Span, WithLocation};
use flatbuffers::{ForwardsUOffset, Vector};
use graphql_syntax::{
    BooleanNode, ConstantArgument, ConstantValue, DirectiveLocation, EnumNode, FloatNode,
    FloatValue, Identifier, IntNode, List, StringNode, Token, TokenKind,
};
use intern::string_key::{Intern, StringKey};
pub use serialize::serialize_as_flatbuffer;
use std::cmp::Ordering;
pub use wrapper::SchemaWrapper;

#[derive(Debug)]
pub struct FlatBufferSchema<'fb> {
    query_type: Type,
    mutation_type: Option<Type>,
    subscription_type: Option<Type>,
    directives: Vector<'fb, ForwardsUOffset<schema_flatbuffer::DirectiveMapEntry<'fb>>>,
    enums: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Enum<'fb>>>,
    fields: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Field<'fb>>>,
    input_objects: Vector<'fb, ForwardsUOffset<schema_flatbuffer::InputObject<'fb>>>,
    interfaces: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Interface<'fb>>>,
    objects: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Object<'fb>>>,
    scalars: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Scalar<'fb>>>,
    types: Vector<'fb, ForwardsUOffset<schema_flatbuffer::TypeMapEntry<'fb>>>,
    unions: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Union<'fb>>>,
}

impl<'fb> FlatBufferSchema<'fb> {
    pub fn build(bytes: &'fb [u8]) -> Self {
        #![allow(deprecated)]
        let fb_schema: schema_flatbuffer::Schema<'fb> =
            schema_flatbuffer::get_root_as_schema(bytes);

        let query_type = Type::Object(ObjectID(fb_schema.query_type()));
        let mutation_type = fb_schema
            .has_mutation_type()
            .then(|| Type::Object(ObjectID(fb_schema.mutation_type())));
        let subscription_type = fb_schema
            .has_subscription_type()
            .then(|| Type::Object(ObjectID(fb_schema.subscription_type())));

        Self {
            query_type,
            mutation_type,
            subscription_type,
            directives: fb_schema.directives(),
            enums: fb_schema.enums(),
            fields: fb_schema.fields(),
            input_objects: fb_schema.input_objects(),
            interfaces: fb_schema.interfaces(),
            objects: fb_schema.objects(),
            scalars: fb_schema.scalars(),
            types: fb_schema.types(),
            unions: fb_schema.unions(),
        }
    }

    pub fn query_type(&self) -> Type {
        self.query_type
    }

    pub fn mutation_type(&self) -> Option<Type> {
        self.mutation_type
    }

    pub fn subscription_type(&self) -> Option<Type> {
        self.subscription_type
    }

    pub fn get_type(&self, type_name: StringKey) -> Option<Type> {
        self.read_type(type_name)
    }

    pub fn has_type(&self, type_name: StringKey) -> bool {
        self.get_type(type_name).is_some()
    }

    pub fn get_directive(&self, directive_name: StringKey) -> Option<Directive> {
        self.read_directive(directive_name)
    }

    pub fn input_object(&self, id: InputObjectID) -> InputObject {
        self.parse_input_object(id).unwrap()
    }

    pub fn enum_(&self, id: EnumID) -> Enum {
        self.parse_enum(id).unwrap()
    }

    pub fn scalar(&self, id: ScalarID) -> Scalar {
        self.parse_scalar(id).unwrap()
    }

    pub fn field(&self, id: FieldID) -> Field {
        self.parse_field(id).unwrap()
    }

    pub fn object(&self, id: ObjectID) -> Object {
        self.parse_object(id).unwrap()
    }

    pub fn union(&self, id: UnionID) -> Union {
        self.parse_union(id).unwrap()
    }

    pub fn interface(&self, id: InterfaceID) -> Interface {
        self.parse_interface(id).unwrap()
    }

    fn read_directive(&self, name: StringKey) -> Option<Directive> {
        let mut start = 0;
        let mut end = self.directives.len();
        let name = name.lookup();
        while start <= end {
            let mid = (start + end) / 2;
            match self.directives.get(mid).key_compare_with_value(name) {
                Ordering::Less => {
                    start = mid + 1;
                }
                Ordering::Equal => {
                    let directive = self.directives.get(mid).value()?;
                    return self.parse_directive(directive);
                }
                Ordering::Greater => {
                    end = mid - 1;
                }
            }
        }
        None
    }

    fn parse_directive(&self, directive: schema_flatbuffer::Directive<'fb>) -> Option<Directive> {
        let locations = directive
            .locations()?
            .iter()
            .map(get_mapped_location)
            .collect::<Vec<_>>();
        let parsed_directive = Directive {
            name: directive.name()?.intern(),
            is_extension: directive.is_extension(),
            arguments: self.parse_arguments(directive.arguments()?)?,
            locations,
            repeatable: directive.repeatable(),
            description: None,
        };
        Some(parsed_directive)
    }

    fn read_type(&self, type_name: StringKey) -> Option<Type> {
        let mut start = 0;
        let mut end = self.types.len();
        let type_name = type_name.lookup();
        while start <= end {
            let mid = (start + end) / 2;
            match self.types.get(mid).key_compare_with_value(type_name) {
                Ordering::Less => {
                    start = mid + 1;
                }
                Ordering::Equal => {
                    let type_ = self.types.get(mid).value()?;
                    return Some(self.parse_type(type_));
                }
                Ordering::Greater => {
                    end = mid - 1;
                }
            }
        }
        None
    }

    fn parse_type(&self, type_: schema_flatbuffer::Type<'_>) -> Type {
        match type_.kind() {
            schema_flatbuffer::TypeKind::Scalar => Type::Scalar(ScalarID(type_.scalar_id())),
            schema_flatbuffer::TypeKind::InputObject => {
                Type::InputObject(InputObjectID(type_.input_object_id()))
            }
            schema_flatbuffer::TypeKind::Enum => Type::Enum(EnumID(type_.enum_id())),
            schema_flatbuffer::TypeKind::Object => Type::Object(ObjectID(type_.object_id())),
            schema_flatbuffer::TypeKind::Interface => {
                Type::Interface(InterfaceID(type_.interface_id()))
            }
            schema_flatbuffer::TypeKind::Union => Type::Union(UnionID(type_.union_id())),
            unknown => panic!("unknown TypeKind value: {:?}", unknown),
        }
    }

    fn parse_scalar(&self, id: ScalarID) -> Option<Scalar> {
        let scalar = self.scalars.get(id.0.try_into().unwrap());
        let parsed_scalar = Scalar {
            name: scalar.name()?.to_string().intern(),
            is_extension: scalar.is_extension(),
            directives: self.parse_directive_values(scalar.directives()?)?,
            description: None,
        };
        Some(parsed_scalar)
    }

    fn parse_input_object(&self, id: InputObjectID) -> Option<InputObject> {
        let input_object = self.input_objects.get(id.0.try_into().unwrap());
        let parsed_input_object = InputObject {
            name: input_object.name()?.to_string().intern(),
            fields: self.parse_arguments(input_object.fields()?)?,
            directives: self.parse_directive_values(input_object.directives()?)?,
            description: None,
        };
        Some(parsed_input_object)
    }

    fn parse_enum(&self, id: EnumID) -> Option<Enum> {
        let enum_ = self.enums.get(id.0.try_into().unwrap());
        let parsed_enum = Enum {
            name: enum_.name()?.to_string().intern(),
            is_extension: enum_.is_extension(),
            values: self.parse_enum_values(enum_.values()?)?,
            directives: self.parse_directive_values(enum_.directives()?)?,
            description: None,
        };
        Some(parsed_enum)
    }

    fn parse_object(&self, id: ObjectID) -> Option<Object> {
        let object = self.objects.get(id.0.try_into().unwrap());
        let name = object.name()?.intern();
        let parsed_object = Object {
            name: WithLocation::generated(name),
            is_extension: object.is_extension(),
            fields: object.fields()?.iter().map(FieldID).collect(),
            interfaces: object.interfaces()?.iter().map(InterfaceID).collect(),
            directives: self.parse_directive_values(object.directives()?)?,
            description: None,
        };
        Some(parsed_object)
    }

    fn parse_interface(&self, id: InterfaceID) -> Option<Interface> {
        let interface = self.interfaces.get(id.0.try_into().unwrap());
        let name = interface.name()?.intern();

        let parsed_interface = Interface {
            name,
            is_extension: interface.is_extension(),
            implementing_objects: wrap_ids(interface.implementing_objects(), ObjectID),
            fields: wrap_ids(interface.fields(), FieldID),
            directives: self.parse_directive_values(interface.directives()?)?,
            interfaces: wrap_ids(interface.interfaces(), InterfaceID),
            description: None,
        };
        Some(parsed_interface)
    }

    fn parse_union(&self, id: UnionID) -> Option<Union> {
        let union = self.unions.get(id.0.try_into().unwrap());
        let parsed_union = Union {
            name: union.name()?.intern(),
            is_extension: union.is_extension(),
            members: wrap_ids(union.members(), ObjectID),
            directives: self.parse_directive_values(union.directives()?)?,
            description: None,
        };
        Some(parsed_union)
    }

    fn parse_field(&self, id: FieldID) -> Option<Field> {
        let field = self.fields.get(id.0.try_into().unwrap());
        let parsed_field = Field {
            name: WithLocation::generated(field.name()?.intern()),
            is_extension: field.is_extension(),
            arguments: self.parse_arguments(field.arguments()?)?,
            type_: self.parse_type_reference(field.type_()?)?,
            directives: self.parse_directive_values(field.directives()?)?,
            parent_type: self.get_type(self.get_fbtype_name(&field.parent_type()?)),
            description: None,
        };
        Some(parsed_field)
    }

    fn parse_enum_values(
        &self,
        values: Vector<'_, ForwardsUOffset<schema_flatbuffer::EnumValue<'_>>>,
    ) -> Option<Vec<EnumValue>> {
        values
            .iter()
            .map(|value| self.parse_enum_value(value))
            .collect::<Option<Vec<_>>>()
    }

    fn parse_enum_value(&self, value: schema_flatbuffer::EnumValue<'fb>) -> Option<EnumValue> {
        let directives = self.parse_directive_values(value.directives()?)?;
        Some(EnumValue {
            value: value.value()?.intern(),
            directives,
        })
    }

    fn parse_arguments(
        &self,
        arguments: Vector<'fb, ForwardsUOffset<schema_flatbuffer::Argument<'_>>>,
    ) -> Option<ArgumentDefinitions> {
        let items = arguments
            .iter()
            .map(|argument| self.parse_argument(argument))
            .collect::<Option<Vec<_>>>();
        Some(ArgumentDefinitions::new(items?))
    }

    fn parse_argument(&self, argument: schema_flatbuffer::Argument<'fb>) -> Option<Argument> {
        Some(Argument {
            name: argument.name().unwrap().intern(),
            default_value: match argument.value() {
                Some(value) => Some(self.parse_const_value(value)?),
                _ => None,
            },
            type_: self.parse_type_reference(argument.type_()?)?,
            description: None,
        })
    }

    fn parse_type_reference(
        &self,
        type_reference: schema_flatbuffer::TypeReference<'fb>,
    ) -> Option<TypeReference> {
        Some(match type_reference.kind() {
            schema_flatbuffer::TypeReferenceKind::Named => {
                let type_name = self.get_fbtype_name(&type_reference.named()?);
                TypeReference::Named(self.get_type(type_name).unwrap())
            }
            schema_flatbuffer::TypeReferenceKind::NonNull => {
                TypeReference::NonNull(Box::new(self.parse_type_reference(type_reference.null()?)?))
            }
            schema_flatbuffer::TypeReferenceKind::List => {
                TypeReference::List(Box::new(self.parse_type_reference(type_reference.list()?)?))
            }
            unknown => panic!("unknown TypeReferenceKind value: {:?}", unknown),
        })
    }

    fn parse_directive_values(
        &self,
        directives: Vector<'_, ForwardsUOffset<schema_flatbuffer::DirectiveValue<'_>>>,
    ) -> Option<Vec<DirectiveValue>> {
        directives
            .iter()
            .map(|directive| self.parse_directive_value(directive))
            .collect::<Option<Vec<_>>>()
    }

    fn parse_directive_value(
        &self,
        directive: schema_flatbuffer::DirectiveValue<'fb>,
    ) -> Option<DirectiveValue> {
        let arguments = self.parse_argument_values(directive.arguments()?)?;
        Some(DirectiveValue {
            name: directive.name()?.intern(),
            arguments,
        })
    }

    fn parse_argument_values(
        &self,
        arguments: Vector<'_, ForwardsUOffset<schema_flatbuffer::ArgumentValue<'_>>>,
    ) -> Option<Vec<ArgumentValue>> {
        arguments
            .iter()
            .map(|argument| self.parse_argument_value(argument))
            .collect::<Option<Vec<_>>>()
    }

    fn parse_argument_value(
        &self,
        argument: schema_flatbuffer::ArgumentValue<'fb>,
    ) -> Option<ArgumentValue> {
        Some(ArgumentValue {
            name: argument.name()?.intern(),
            value: self.parse_const_value(argument.value()?)?,
        })
    }

    fn parse_const_value(
        &self,
        value: schema_flatbuffer::ConstValue<'fb>,
    ) -> Option<ConstantValue> {
        use schema_flatbuffer::ConstValueKind as FB;
        Some(match value.kind() {
            FB::Null => ConstantValue::Null(get_empty_token()),
            FB::String => ConstantValue::String(get_string_node(value.string_value()?.to_string())),
            FB::Bool => ConstantValue::Boolean(get_boolean_node(value.bool_value())),
            FB::Int => ConstantValue::Int(get_int_node(value.int_value()?.to_string())),
            FB::Float => ConstantValue::Float(get_float_node(value.float_value()?.to_string())),
            FB::Enum => ConstantValue::Enum(get_enum_node(value.enum_value()?.to_string())),
            FB::List => ConstantValue::List(self.parse_list_value(value.list_value()?)?),
            FB::Object => ConstantValue::Object(self.parse_object_value(value.object_value()?)?),
            unknown => panic!("unknown ConstValueKind value: {:?}", unknown),
        })
    }

    fn parse_list_value(
        &self,
        list_value: schema_flatbuffer::ListValue<'fb>,
    ) -> Option<List<ConstantValue>> {
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
        object_value: schema_flatbuffer::ObjectValue<'fb>,
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

    fn get_fbtype_name(&self, type_: &schema_flatbuffer::Type<'_>) -> StringKey {
        match type_.kind() {
            schema_flatbuffer::TypeKind::Scalar => self
                .scalars
                .get(type_.scalar_id().try_into().unwrap())
                .name(),
            schema_flatbuffer::TypeKind::InputObject => self
                .input_objects
                .get(type_.input_object_id().try_into().unwrap())
                .name(),
            schema_flatbuffer::TypeKind::Enum => {
                self.enums.get(type_.enum_id().try_into().unwrap()).name()
            }
            schema_flatbuffer::TypeKind::Object => self
                .objects
                .get(type_.object_id().try_into().unwrap())
                .name(),
            schema_flatbuffer::TypeKind::Interface => self
                .interfaces
                .get(type_.interface_id().try_into().unwrap())
                .name(),
            schema_flatbuffer::TypeKind::Union => {
                self.unions.get(type_.union_id().try_into().unwrap()).name()
            }
            unknown => panic!("unknown TypeKind value: {:?}", unknown),
        }
        .unwrap()
        .intern()
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

fn wrap_ids<T>(ids: Option<Vector<'_, u32>>, f: impl Fn(u32) -> T) -> Vec<T> {
    ids.map_or_else(Vec::new, |ids| ids.into_iter().map(f).collect())
}

fn get_mapped_location(location: schema_flatbuffer::DirectiveLocation) -> DirectiveLocation {
    use schema_flatbuffer::DirectiveLocation as FDL;
    use DirectiveLocation as DL;
    match location {
        FDL::Query => DL::Query,
        FDL::Mutation => DL::Mutation,
        FDL::Subscription => DL::Subscription,
        FDL::Field => DL::Field,
        FDL::FragmentDefinition => DL::FragmentDefinition,
        FDL::FragmentSpread => DL::FragmentSpread,
        FDL::InlineFragment => DL::InlineFragment,
        FDL::Schema => DL::Schema,
        FDL::Scalar => DL::Scalar,
        FDL::Object => DL::Object,
        FDL::FieldDefinition => DL::FieldDefinition,
        FDL::ArgumentDefinition => DL::ArgumentDefinition,
        FDL::Interface => DL::Interface,
        FDL::Union => DL::Union,
        FDL::Enum => DL::Enum,
        FDL::EnumValue => DL::EnumValue,
        FDL::InputObject => DL::InputObject,
        FDL::InputFieldDefinition => DL::InputFieldDefinition,
        FDL::VariableDefinition => DL::VariableDefinition,
        unknown => panic!("unknown DirectiveLocation value: {:?}", unknown),
    }
}
