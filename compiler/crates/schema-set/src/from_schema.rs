/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::VecDeque;

use common::NamedItem;
use graphql_syntax::ConstantValue;
use intern::string_key::StringKeyIndexMap;
use schema::DirectiveValue;
use schema::EnumID;
use schema::FieldID;
use schema::InputObjectID;
use schema::InterfaceID;
use schema::ObjectID;
use schema::SDLSchema;
use schema::ScalarID;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use schema::UnionID;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SEMANTIC_NON_NULL;
use crate::SEMANTIC_NON_NULL_LEVELS_ARG;
use crate::SetDirective;
use crate::SetDirectiveValue;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::FieldName;
use crate::schema_set::HasArguments;
use crate::schema_set::HasFields;
use crate::schema_set::HasInterfaces;
use crate::schema_set::SchemaDefinitionItem;
use crate::schema_set::SetArgument;
use crate::schema_set::SetEnum;
use crate::schema_set::SetField;
use crate::schema_set::SetInputObject;
use crate::schema_set::SetInterface;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetObject;
use crate::schema_set::SetScalar;
use crate::schema_set::SetUnion;

/// Utilities for building up a schema set based on parts of a schema.
/// Each of the utility add-methods should do the *smallest* thing.
pub trait SchemaDefault<TypeID> {
    fn schema_default(id: TypeID, schema: &SDLSchema) -> Self;
}

/// Given self, create clone of an empty representation of Self.
/// Basically keep the name and location, but remove any fields/arguments/directives/etc.
pub trait SetEmptyClone {
    fn empty_clone(&self) -> Self;
}

pub trait SchemaInsertField {
    fn field_definition_or_inserted(
        &mut self,
        field_id: FieldID,
        schema: &SDLSchema,
    ) -> &mut SetField;

    fn field_definition_or_empty_inserted<'a>(&'a mut self, field: &SetField) -> &'a mut SetField;
}

impl<T: HasFields> SchemaInsertField for T {
    fn field_definition_or_inserted(
        &mut self,
        field_id: FieldID,
        schema: &SDLSchema,
    ) -> &mut SetField {
        let field_name = schema.field(field_id).name.item;
        self.fields_mut()
            .entry(field_name)
            .or_insert_with(|| SetField::schema_default(field_id, schema))
    }

    fn field_definition_or_empty_inserted<'a>(&'a mut self, field: &SetField) -> &'a mut SetField {
        self.fields_mut()
            .entry(field.name.0)
            .or_insert_with(|| field.empty_clone())
    }
}

pub trait SchemaInsertInterface {
    fn interface_or_inserted(
        &mut self,
        interface_id: InterfaceID,
        schema: &SDLSchema,
    ) -> &mut SetMemberType;

    fn interface_or_empty_inserted<'a>(
        &'a mut self,
        interface: &SetMemberType,
    ) -> &'a mut SetMemberType;
}

impl<T: HasInterfaces> SchemaInsertInterface for T {
    fn interface_or_inserted(
        &mut self,
        interface_id: InterfaceID,
        schema: &SDLSchema,
    ) -> &mut SetMemberType {
        let schema_interface = schema.interface(interface_id);
        let interface_name = schema_interface.name.item.0;
        self.interfaces_mut()
            .entry(interface_name)
            .or_insert_with(|| SetMemberType {
                name: interface_name,
                is_extension: schema_interface.is_extension,
            })
    }

    fn interface_or_empty_inserted(&mut self, interface: &SetMemberType) -> &mut SetMemberType {
        self.interfaces_mut()
            .entry(interface.name)
            .or_insert_with(|| interface.clone())
    }
}

pub trait SchemaInsertArgument {
    fn argument_or_inserted(
        &mut self,
        argument: &schema::Argument,
        schema: &SDLSchema,
    ) -> &mut SetArgument;

    fn argument_or_empty_inserted<'a>(&'a mut self, argument: &SetArgument) -> &'a mut SetArgument;
}

impl<T: HasArguments> SchemaInsertArgument for T {
    fn argument_or_inserted(
        &mut self,
        argument: &schema::Argument,
        schema: &SDLSchema,
    ) -> &mut SetArgument {
        let argument_name = argument.name.item.0;
        self.arguments_mut()
            .entry(argument_name)
            .or_insert_with(|| SetArgument {
                definition: Some(SchemaDefinitionItem {
                    name: argument.name.item.0,
                    locations: vec![argument.name.location],
                    is_client_definition: false,
                    description: None,
                    hack_source: None,
                }),
                name: argument_name,
                type_: argument.type_.clone().map(|t| schema.get_type_name(t)),
                default_value: argument.default_value.clone(),
                directives: Vec::new(),
            })
    }

    fn argument_or_empty_inserted<'a>(&'a mut self, argument: &SetArgument) -> &'a mut SetArgument {
        self.arguments_mut()
            .entry(argument.name)
            .or_insert_with(|| argument.empty_clone())
    }
}

pub trait SchemaInsertDirectiveValue {
    fn directive_or_inserted(
        &mut self,
        directive: &DirectiveValue,
        is_client_definition: bool,
    ) -> &mut SetDirectiveValue;
}

impl<T: CanHaveDirectives> SchemaInsertDirectiveValue for T {
    fn directive_or_inserted(
        &mut self,
        directive: &DirectiveValue,
        is_client_definition: bool,
    ) -> &mut SetDirectiveValue {
        let existing_index = self
            .directives()
            .iter()
            .position(|d| d.name == directive.name);

        if let Some(index) = existing_index {
            &mut self.directives_mut()[index]
        } else {
            self.directives_mut()
                .push(SetDirectiveValue::from_schema_value(
                    directive,
                    is_client_definition,
                ));
            self.directives_mut()
                .last_mut()
                .expect("Just pushed directive")
        }
    }
}

impl SchemaDefault<ScalarID> for SetScalar {
    fn schema_default(id: ScalarID, schema: &SDLSchema) -> SetScalar {
        let from_schema = schema.scalar(id);
        SetScalar {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                is_client_definition: from_schema.is_extension,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            directives: Default::default(),
        }
    }
}

impl SetEmptyClone for SetScalar {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            ..self.clone()
        }
    }
}

impl SchemaDefault<EnumID> for SetEnum {
    fn schema_default(id: EnumID, schema: &SDLSchema) -> SetEnum {
        let from_schema = schema.enum_(id);
        SetEnum {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                is_client_definition: from_schema.is_extension,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            directives: Default::default(),
            values: Default::default(),
        }
    }
}

impl SetEmptyClone for SetEnum {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            values: Default::default(),
            ..self.clone()
        }
    }
}

impl SchemaDefault<ObjectID> for SetObject {
    fn schema_default(id: ObjectID, schema: &SDLSchema) -> SetObject {
        let from_schema = schema.object(id);
        SetObject {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                is_client_definition: from_schema.is_extension,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            interfaces: Default::default(),
            directives: Default::default(),
            fields: Default::default(),
        }
    }
}

impl SetEmptyClone for SetObject {
    fn empty_clone(&self) -> Self {
        Self {
            interfaces: Default::default(),
            directives: Default::default(),
            fields: Default::default(),
            ..self.clone()
        }
    }
}

impl SchemaDefault<InterfaceID> for SetInterface {
    fn schema_default(id: InterfaceID, schema: &SDLSchema) -> SetInterface {
        let from_schema = schema.interface(id);
        SetInterface {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                is_client_definition: from_schema.is_extension,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            interfaces: Default::default(),
            directives: Default::default(),
            fields: Default::default(),
        }
    }
}

impl SetEmptyClone for SetInterface {
    fn empty_clone(&self) -> Self {
        Self {
            interfaces: Default::default(),
            directives: Default::default(),
            fields: Default::default(),
            ..self.clone()
        }
    }
}

impl SchemaDefault<UnionID> for SetUnion {
    fn schema_default(id: UnionID, schema: &SDLSchema) -> SetUnion {
        let from_schema = schema.union(id);
        SetUnion {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                is_client_definition: from_schema.is_extension,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            directives: Default::default(),
            members: Default::default(),
        }
    }
}

impl SetEmptyClone for SetUnion {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            members: Default::default(),
            ..self.clone()
        }
    }
}

impl SchemaDefault<InputObjectID> for SetInputObject {
    fn schema_default(id: InputObjectID, schema: &SDLSchema) -> SetInputObject {
        let from_schema = schema.input_object(id);
        SetInputObject {
            definition: Some(SchemaDefinitionItem {
                name: from_schema.name.item.0,
                locations: vec![from_schema.name.location],
                // Schema does not allow input objects as extensions yet
                is_client_definition: false,
                description: None,
                hack_source: None,
            }),
            name: from_schema.name.item,
            directives: Default::default(),
            fields: Default::default(),
            fully_recursively_visited: false,
        }
    }
}

impl SetEmptyClone for SetInputObject {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            fields: Default::default(),
            fully_recursively_visited: false,
            ..self.clone()
        }
    }
}

impl SchemaDefault<FieldID> for SetField {
    fn schema_default(id: FieldID, schema: &SDLSchema) -> Self {
        let schema_field = schema.field(id);
        let field_name = schema_field.name.item;
        Self {
            definition: Some(SchemaDefinitionItem {
                name: schema_field.name.item,
                locations: vec![schema_field.name.location],
                is_client_definition: schema_field.is_extension,
                description: None,
                hack_source: None,
            }),
            name: FieldName(field_name),
            arguments: StringKeyIndexMap::default(),
            type_: convert_schema_output_type_reference(
                schema,
                &schema_field.type_,
                &schema_field.directives,
            ),
            directives: Vec::new(),
        }
    }
}

impl SetEmptyClone for SetField {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            arguments: Default::default(),
            ..self.clone()
        }
    }
}

impl SetEmptyClone for SetArgument {
    fn empty_clone(&self) -> Self {
        Self {
            directives: Default::default(),
            ..self.clone()
        }
    }
}

impl SetEmptyClone for SetDirective {
    fn empty_clone(&self) -> Self {
        Self {
            arguments: Default::default(),
            locations: Default::default(),
            ..self.clone()
        }
    }
}

/// Helper function to convert a schema TypeReference<Type> to OutputTypeReference<StringKey>
/// with support for @semanticNonNull directives
pub fn convert_schema_output_type_reference(
    schema: &SDLSchema,
    type_ref: &TypeReference<Type>,
    directives: &[DirectiveValue],
) -> OutputTypeReference<intern::string_key::StringKey> {
    // Following logic for how @semanticNonNull(levels: [Int] = [0]) is defined here:
    // https://relay.dev/docs/guides/semantic-nullability/#proposed-solution
    let mut semantic_non_null_levels: VecDeque<i64> = directives
        .named(*SEMANTIC_NON_NULL)
        .map_or_else(Default::default, |semantic_non_null_directive| {
            semantic_non_null_directive
                .arguments
                .iter()
                .find_map(|arg| {
                    if arg.name == *SEMANTIC_NON_NULL_LEVELS_ARG {
                        Some(match &arg.value {
                            ConstantValue::List(_) => arg.expect_int_list().into_iter().collect(),
                            single => [single.unwrap_int()].into_iter().collect(),
                        })
                    } else {
                        None
                    }
                })
                .unwrap_or_else(|| [0].into_iter().collect())
        });
    convert_output_type_reference_with_semantic_nonnull(
        schema,
        type_ref,
        &mut semantic_non_null_levels,
    )
}

/// Helper function to recursively convert a schema TypeReference<Type> with semantic non-null levels
fn convert_output_type_reference_with_semantic_nonnull(
    schema: &SDLSchema,
    schema_type: &TypeReference<Type>,
    semantic_non_null_levels: &mut VecDeque<i64>,
) -> OutputTypeReference<intern::string_key::StringKey> {
    if let Some(next_semantic_non_null_level) = semantic_non_null_levels.pop_front() {
        if next_semantic_non_null_level == 0 {
            // This level is @semanticNonNull, but it might ALSO be strictly NonNull, in which case just take the strictly NonNull.
            return if let TypeReference::NonNull(_) = schema_type {
                convert_output_type_reference_with_semantic_nonnull(
                    schema,
                    schema_type,
                    semantic_non_null_levels,
                )
            } else {
                OutputTypeReference::NonNull(OutputNonNull::Semantic(Box::new(
                    convert_output_type_reference_with_semantic_nonnull(
                        schema,
                        schema_type,
                        semantic_non_null_levels,
                    ),
                )))
            };
        } else {
            // Put the value back: it is not 0, so we still need it.
            semantic_non_null_levels.push_front(next_semantic_non_null_level);
            // If we're stepping into a list, then reduce all levels by 1.
            if let TypeReference::List(_) = schema_type {
                for level in semantic_non_null_levels.iter_mut() {
                    *level -= 1;
                }
            }
        }
    }
    match schema_type {
        TypeReference::Named(type_) => OutputTypeReference::Named(schema.get_type_name(*type_)),
        TypeReference::NonNull(inner) => OutputTypeReference::NonNull(OutputNonNull::KillsParent(
            Box::new(convert_output_type_reference_with_semantic_nonnull(
                schema,
                inner,
                semantic_non_null_levels,
            )),
        )),
        TypeReference::List(inner) => OutputTypeReference::List(Box::new(
            convert_output_type_reference_with_semantic_nonnull(
                schema,
                inner,
                semantic_non_null_levels,
            ),
        )),
    }
}

#[cfg(test)]
mod tests {
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use indoc::indoc;
    use intern::string_key::Intern;

    use super::*;
    use crate::SchemaSet;

    fn set_from_sdl(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    fn build_sdl_schema(sdl: &str) -> std::sync::Arc<SDLSchema> {
        schema::build_schema(sdl).unwrap().into()
    }

    // --- SetEmptyClone ---

    #[test]
    fn test_empty_clone_scalar() {
        let set = set_from_sdl("scalar URL @deprecated");
        if let crate::SetType::Scalar(s) = set.types.values().next().unwrap() {
            let cloned = s.empty_clone();
            assert_eq!(cloned.name, s.name);
            assert!(cloned.directives.is_empty());
        } else {
            panic!("Expected Scalar");
        }
    }

    #[test]
    fn test_empty_clone_enum() {
        let set = set_from_sdl("enum Color { RED GREEN }");
        if let crate::SetType::Enum(e) = set.types.values().next().unwrap() {
            let cloned = e.empty_clone();
            assert_eq!(cloned.name, e.name);
            assert!(cloned.values.is_empty());
            assert!(cloned.directives.is_empty());
        } else {
            panic!("Expected Enum");
        }
    }

    #[test]
    fn test_empty_clone_object() {
        let set = set_from_sdl(indoc! {r#"
            interface Node { id: ID! }
            type User implements Node { id: ID! name: String }
        "#});
        if let crate::SetType::Object(obj) = set.types.get(&"User".intern()).unwrap() {
            let cloned = obj.empty_clone();
            assert_eq!(cloned.name, obj.name);
            assert!(cloned.fields.is_empty());
            assert!(cloned.interfaces.is_empty());
            assert!(cloned.directives.is_empty());
        } else {
            panic!("Expected Object");
        }
    }

    #[test]
    fn test_empty_clone_interface() {
        let set = set_from_sdl("interface Node { id: ID! }");
        if let crate::SetType::Interface(iface) = set.types.values().next().unwrap() {
            let cloned = iface.empty_clone();
            assert_eq!(cloned.name, iface.name);
            assert!(cloned.fields.is_empty());
        } else {
            panic!("Expected Interface");
        }
    }

    #[test]
    fn test_empty_clone_union() {
        let set = set_from_sdl(indoc! {r#"
            type A { id: ID! }
            type B { id: ID! }
            union AB = A | B
        "#});
        if let crate::SetType::Union(u) = set.types.get(&"AB".intern()).unwrap() {
            let cloned = u.empty_clone();
            assert_eq!(cloned.name, u.name);
            assert!(cloned.members.is_empty());
        } else {
            panic!("Expected Union");
        }
    }

    #[test]
    fn test_empty_clone_input_object() {
        let set = set_from_sdl("input Foo { name: String! }");
        if let crate::SetType::InputObject(input) = set.types.values().next().unwrap() {
            let cloned = input.empty_clone();
            assert_eq!(cloned.name, input.name);
            assert!(cloned.fields.is_empty());
        } else {
            panic!("Expected InputObject");
        }
    }

    #[test]
    fn test_empty_clone_field() {
        let set = set_from_sdl("type Q { foo(a: Int): String @deprecated }");
        if let crate::SetType::Object(obj) = set.types.values().next().unwrap() {
            let field = obj.fields.values().next().unwrap();
            let cloned = field.empty_clone();
            assert_eq!(cloned.name, field.name);
            assert!(cloned.arguments.is_empty());
            assert!(cloned.directives.is_empty());
        } else {
            panic!("Expected Object");
        }
    }

    // --- SchemaDefault ---

    #[test]
    fn test_schema_default_scalar() {
        let sdl_schema = build_sdl_schema("type Query { id: ID } scalar URL");
        let scalar_type = sdl_schema.get_type("URL".intern()).unwrap();
        if let Type::Scalar(id) = scalar_type {
            let set_scalar = SetScalar::schema_default(id, &sdl_schema);
            assert_eq!(set_scalar.name.0, "URL".intern());
        } else {
            panic!("Expected Scalar type");
        }
    }

    #[test]
    fn test_schema_default_enum() {
        let sdl_schema = build_sdl_schema("type Query { id: ID } enum Color { RED }");
        let enum_type = sdl_schema.get_type("Color".intern()).unwrap();
        if let Type::Enum(id) = enum_type {
            let set_enum = SetEnum::schema_default(id, &sdl_schema);
            assert_eq!(set_enum.name.0, "Color".intern());
            // schema_default creates empty values
            assert!(set_enum.values.is_empty());
        } else {
            panic!("Expected Enum type");
        }
    }

    #[test]
    fn test_schema_default_object() {
        let sdl_schema = build_sdl_schema("type Query { id: ID } type User { name: String }");
        let obj_type = sdl_schema.get_type("User".intern()).unwrap();
        if let Type::Object(id) = obj_type {
            let set_obj = SetObject::schema_default(id, &sdl_schema);
            assert_eq!(set_obj.name.0, "User".intern());
            assert!(set_obj.fields.is_empty());
        } else {
            panic!("Expected Object type");
        }
    }

    // --- convert_schema_output_type_reference ---

    #[test]
    fn test_convert_output_type_reference_named() {
        let sdl_schema = build_sdl_schema("type Query { name: String }");
        let string_type = sdl_schema.get_type("String".intern()).unwrap();
        let type_ref = TypeReference::Named(string_type);
        let result = convert_schema_output_type_reference(&sdl_schema, &type_ref, &[]);
        assert!(matches!(result, OutputTypeReference::Named(name) if name == "String".intern()));
    }

    #[test]
    fn test_convert_output_type_reference_non_null() {
        let sdl_schema = build_sdl_schema("type Query { name: String }");
        let string_type = sdl_schema.get_type("String".intern()).unwrap();
        let type_ref = TypeReference::NonNull(Box::new(TypeReference::Named(string_type)));
        let result = convert_schema_output_type_reference(&sdl_schema, &type_ref, &[]);
        assert!(matches!(
            result,
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(_))
        ));
    }

    #[test]
    fn test_convert_output_type_reference_list() {
        let sdl_schema = build_sdl_schema("type Query { name: String }");
        let string_type = sdl_schema.get_type("String".intern()).unwrap();
        let type_ref = TypeReference::List(Box::new(TypeReference::Named(string_type)));
        let result = convert_schema_output_type_reference(&sdl_schema, &type_ref, &[]);
        assert!(matches!(result, OutputTypeReference::List(_)));
    }
}
