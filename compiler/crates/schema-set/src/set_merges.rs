/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::DirectiveValue;
use schema::TypeReference;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SchemaSet;
use crate::SetType;
use crate::schema_set::CanBeClientDefinition;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::HasArguments;
use crate::schema_set::HasFields;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirective;
use crate::schema_set::SetEnum;
use crate::schema_set::SetField;
use crate::schema_set::SetInputObject;
use crate::schema_set::SetInterface;
use crate::schema_set::SetMemberType;
use crate::schema_set::SetObject;
use crate::schema_set::SetRootSchema;
use crate::schema_set::SetScalar;
use crate::schema_set::SetUnion;

/// Methods to make it easy to union/merge together two schema sets
pub trait Merges {
    fn merge(&mut self, other: Self);
}

impl Merges for SchemaSet {
    fn merge(&mut self, other: Self) {
        // Merge schema roots
        self.root_schema.merge(other.root_schema);

        for (name, other_directive) in other.directives {
            if let Some(existing_directive) = self.directives.get_mut(&name) {
                existing_directive.merge(other_directive);
            } else {
                self.directives.insert(name, other_directive);
            }
        }

        for (name, other_type) in other.types {
            if let Some(existing_type) = self.types.get_mut(&name) {
                existing_type.merge(other_type);
            } else {
                self.types.insert(name, other_type);
            }
        }
    }
}

// Sometimes we need to merge a parent type's definition in with the child definition.
// Use this trait to indicate definitions that may have this property.
pub trait MergesFromAbstractDefinition<TAbstract> {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: TAbstract,
        original_definition: Option<&Self>,
    );
}

impl Merges for SetRootSchema {
    fn merge(&mut self, other: Self) {
        merge_directive_values(self, other.directives);
        if let Some(other_query) = other.query_type {
            if let Some(existing_query) = self.query_type
                && existing_query != other_query
            {
                panic!(
                    "Cannot merge two different schema query types, {} and {}",
                    existing_query, other_query
                )
            }
            self.query_type = Some(other_query);
        }
        if let Some(other_mutation) = other.mutation_type {
            if let Some(existing_mutation) = self.mutation_type
                && existing_mutation != other_mutation
            {
                panic!(
                    "Cannot merge two different schema mutation types, {} and {}",
                    existing_mutation, other_mutation
                )
            }
            self.mutation_type = Some(other_mutation);
        }
        if let Some(other_subscription) = other.subscription_type {
            if let Some(existing_subscription) = self.subscription_type
                && existing_subscription != other_subscription
            {
                panic!(
                    "Cannot merge two different schema subscription types, {} and {}",
                    existing_subscription, other_subscription
                )
            }
            self.subscription_type = Some(other_subscription);
        }
    }
}

impl Merges for SetType {
    fn merge(&mut self, other: Self) {
        match (self, other) {
            (SetType::Scalar(s), SetType::Scalar(other)) => s.merge(other),
            (SetType::Enum(s), SetType::Enum(other)) => s.merge(other),
            (SetType::Object(s), SetType::Object(other)) => s.merge(other),
            (SetType::Interface(s), SetType::Interface(other)) => s.merge(other),
            (SetType::Union(s), SetType::Union(other)) => s.merge(other),
            (SetType::InputObject(s), SetType::InputObject(other)) => s.merge(other),
            (a, b) => panic!(
                "Cannot merge different types SetType {:?} with SetType {:?}",
                a, b
            ),
        }
    }
}

impl Merges for SetEnum {
    fn merge(&mut self, other: Self) {
        let is_other_client_definition = other.is_client_definition();
        for (value_name, other_value) in other.values {
            self.values.entry(value_name).or_insert(other_value);
        }
        merge_is_client_definition(self, is_other_client_definition);
        merge_directive_values(self, other.directives);
    }
}

impl Merges for SetInterface {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        merge_directive_values(self, other.directives);

        merge_members(&mut self.interfaces, other.interfaces);
        merge_fields(self, other.fields);
    }
}
// Special merge for merging from an interface's field definition
impl MergesFromAbstractDefinition<SetInterface> for SetInterface {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: SetInterface,
        original_definition: Option<&SetInterface>,
    ) {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        // Also do not merge directives: any that we needed should have already
        // been defined on the object itself.

        merge_members_from_abstract_parent(&mut self.interfaces, abstract_definition.interfaces);
        merge_fields_from_abstract_parent(
            self,
            abstract_definition.fields,
            original_definition.map(|def| &def.fields),
        );
    }
}

impl Merges for SetObject {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        merge_directive_values(self, other.directives);

        merge_members(&mut self.interfaces, other.interfaces);
        merge_fields(self, other.fields);
    }
}

impl MergesFromAbstractDefinition<SetInterface> for SetObject {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: SetInterface,
        original_definition: Option<&SetObject>,
    ) {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        // Also do not merge directives: any that we needed should have already
        // been defined on the object itself.
        merge_members_from_abstract_parent(&mut self.interfaces, abstract_definition.interfaces);
        merge_fields_from_abstract_parent(
            self,
            abstract_definition.fields,
            original_definition.map(|def| &def.fields),
        );
    }
}

impl Merges for SetUnion {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        merge_directive_values(self, other.directives);
        merge_members(&mut self.members, other.members);
    }
}

impl Merges for SetInputObject {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        // This merges the Input Object's fields
        merge_arguments(self, other.fields);
        merge_directive_values(self, other.directives);
    }
}

impl Merges for SetScalar {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        merge_directive_values(self, other.directives);
    }
}

impl Merges for SetDirective {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());
        merge_arguments(self, other.arguments);

        // We CANNOT just use extend, as locations is a Vec<DirectiveLocation>
        for other_locaiton in other.locations {
            if !self.locations.contains(&other_locaiton) {
                self.locations.push(other_locaiton);
            }
        }
    }
}

impl Merges for SetField {
    fn merge(&mut self, other: Self) {
        merge_is_client_definition(self, other.is_client_definition());

        if self.type_ != other.type_ {
            self.type_ = merge_output_field_type(&self.type_, &other.type_);
        }

        merge_directive_values(self, other.directives);
        merge_arguments(self, other.arguments);
    }
}

// Special merge for merging from an interface's field definition
impl MergesFromAbstractDefinition<Self> for SetField {
    fn merge_from_abstract_definition(&mut self, abstract_field: Self, original: Option<&Self>) {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        if let Some(original) = original {
            merge_directive_values(self, original.directives.clone());
            merge_arguments(self, abstract_field.arguments);
        } else {
            merge_directive_values(self, abstract_field.directives);
            merge_arguments(self, abstract_field.arguments);
        }
    }
}

impl Merges for SetMemberType {
    fn merge(&mut self, other: Self) {
        self.is_extension = other.is_extension && self.is_extension;
    }
}

impl Merges for SetArgument {
    fn merge(&mut self, other: Self) {
        if self.definition.is_none() {
            self.definition = other.definition;
        }

        if self.type_ != other.type_ {
            self.type_ = merge_input_argument_type(&self.type_, &other.type_);
        }

        if self.default_value.is_none() {
            self.default_value = other.default_value;
        }

        merge_directive_values(self, other.directives);
    }
}

// If we ever start merging arguments between directive usages, then we will need to split this
// into a standard merge and a fn merge_directive_values_from_abstract_parent(...).
fn merge_directive_values<T: CanHaveDirectives>(existing: &mut T, other: Vec<DirectiveValue>) {
    let existing_directives: &mut Vec<DirectiveValue> = existing.directives_mut();
    // Move from other into existing directives.
    for value in other {
        if existing_directives.named(value.name).is_none() {
            existing_directives.push(value);
        }
    }
}

fn merge_output_field_type(
    existing: &OutputTypeReference<StringKey>,
    other: &OutputTypeReference<StringKey>,
) -> OutputTypeReference<StringKey> {
    match (existing, other) {
        (OutputTypeReference::List(e_inner), OutputTypeReference::List(o_inner)) => {
            OutputTypeReference::List(Box::new(merge_output_field_type(e_inner, o_inner)))
        }
        (OutputTypeReference::Named(e_name), OutputTypeReference::Named(o_name)) => {
            if e_name != o_name {
                panic!("Merging mismatched field types: {} and {}", e_name, o_name)
            } else {
                OutputTypeReference::Named(*e_name)
            }
        }
        (OutputTypeReference::NonNull(e_nonnull), OutputTypeReference::NonNull(o_nonnull)) => {
            OutputTypeReference::NonNull(merge_output_nonnull(e_nonnull, o_nonnull))
        }
        // The lowest-common-denominator of a nullable and nonnull output is a nullable output, as the consumer must be robust to nulls.
        (OutputTypeReference::NonNull(nonnull), anything)
        | (anything, OutputTypeReference::NonNull(nonnull)) => {
            merge_output_field_type(nonnull.of(), anything)
        }
        (existing, other) => panic!(
            "Merging mismatched field types: {:?} and {:?}",
            existing, other
        ),
    }
}

fn merge_output_nonnull(
    existing: &OutputNonNull<StringKey>,
    other: &OutputNonNull<StringKey>,
) -> OutputNonNull<StringKey> {
    match (existing, other) {
        (OutputNonNull::KillsParent(e_inner), OutputNonNull::KillsParent(o_inner)) => {
            OutputNonNull::KillsParent(Box::new(merge_output_field_type(e_inner, o_inner)))
        }
        (OutputNonNull::Semantic(e_inner), OutputNonNull::Semantic(o_inner)) => {
            OutputNonNull::Semantic(Box::new(merge_output_field_type(e_inner, o_inner)))
        }
        // Semantic NonNull is a subset of and more loose than KillsParent NonNull
        (OutputNonNull::KillsParent(e_inner), OutputNonNull::Semantic(o_inner))
        | (OutputNonNull::Semantic(e_inner), OutputNonNull::KillsParent(o_inner)) => {
            OutputNonNull::Semantic(Box::new(merge_output_field_type(e_inner, o_inner)))
        }
    }
}

fn merge_input_argument_type(
    existing: &TypeReference<StringKey>,
    other: &TypeReference<StringKey>,
) -> TypeReference<StringKey> {
    match (existing, other) {
        (TypeReference::Named(e_name), TypeReference::Named(o_name)) if e_name == o_name => {
            TypeReference::Named(*e_name)
        }
        (TypeReference::List(e_inner), TypeReference::List(o_inner)) => {
            TypeReference::List(Box::new(merge_input_argument_type(e_inner, o_inner)))
        }
        (TypeReference::NonNull(e_inner), TypeReference::NonNull(o_inner)) => {
            TypeReference::NonNull(Box::new(merge_input_argument_type(e_inner, o_inner)))
        }

        // The lowest common denominator of a singular and list input is a singular input, as a singular value can be coerced to a list, but not vice-versa.
        // Also learned about match-guards with multiple patterns today: https://doc.rust-lang.org/book/ch19-03-pattern-syntax.html#listing-19-28
        (TypeReference::List(inner), singular) | (singular, TypeReference::List(inner))
            if !singular.is_list() =>
        {
            merge_input_argument_type(inner, singular)
        }

        // The lowest common denominator of a nullable and nonnull input is nonnull, as you must not pass null to a nonnull input.
        (TypeReference::NonNull(inner), anything) | (anything, TypeReference::NonNull(inner)) => {
            TypeReference::NonNull(Box::new(merge_input_argument_type(inner, anything)))
        }
        (existing, other) => panic!(
            "Merging mismatched input types: {:?} and {:?}",
            existing, other
        ),
    }
}

fn merge_is_client_definition<T: CanBeClientDefinition>(
    existing: &mut T,
    other_is_client_definition: bool,
) {
    // If a server-defined type comes along, then we *need* to have a base-schema type definition for it.
    existing
        .set_is_client_definition(existing.is_client_definition() && other_is_client_definition);
}

fn merge_members(
    existing: &mut StringKeyIndexMap<SetMemberType>,
    other: StringKeyIndexMap<SetMemberType>,
) {
    for (name, member_type) in other {
        if let Some(existing_member) = existing.get_mut(&name) {
            existing_member.merge(member_type);
        } else {
            existing.insert(name, member_type);
        }
    }
}

pub(crate) fn merge_members_from_abstract_parent(
    existing: &mut StringKeyIndexMap<SetMemberType>,
    abstract_parent_members: StringKeyIndexMap<SetMemberType>,
) {
    for (name, member_type) in abstract_parent_members {
        // Fall back to inserting the abstract-defined member: if an interface
        // has the "implements" member as being server-defined as a member, then it must also
        // be server-defined as am "implements" member of the child type.
        // OTOH if the abstract type adds it as an extension member, and the child
        // doesn't explicitly define it, then it ought to be safe to add as an extension member to the child.
        existing.entry(name).or_insert(member_type);
    }
}

pub(crate) fn merge_fields<T: HasFields>(existing: &mut T, other_fields: StringKeyMap<SetField>) {
    let existing_fields = existing.fields_mut();
    for (field_name, other_field) in other_fields.into_iter() {
        if let Some(existing_field) = existing_fields.get_mut(&field_name) {
            existing_field.merge(other_field);
        } else {
            existing_fields.insert(field_name, other_field);
        }
    }
}

pub(crate) fn merge_fields_from_abstract_parent<T: HasFields>(
    existing: &mut T,
    abstract_parent_fields: StringKeyMap<SetField>,
    original_definition_fields: Option<&StringKeyMap<SetField>>,
) {
    let existing_fields = existing.fields_mut();
    for (field_name, other_field) in abstract_parent_fields.into_iter() {
        let original_field = original_definition_fields.and_then(|fields| fields.get(&field_name));
        let to_merge = existing_fields.entry(field_name).or_insert(SetField {
            definition: original_field.map_or_else(
                || other_field.definition.clone(),
                |original| original.definition.clone(),
            ),
            name: other_field.name,
            arguments: Default::default(),
            type_: original_field.map_or_else(
                || other_field.type_.clone(),
                |original| original.type_.clone(),
            ),
            directives: Default::default(),
        });
        to_merge.merge_from_abstract_definition(other_field, original_field);
    }
}

// We don't need a separate same-type vs abstract-parent-type merging function:
// we always need to merge the *strictest* form of the argument back in.
fn merge_arguments<T: HasArguments>(
    existing: &mut T,
    other_arguments: StringKeyIndexMap<SetArgument>,
) {
    let existing_arguments = existing.arguments_mut();
    for (arg_name, other_argument) in other_arguments {
        if let Some(existing_arg) = existing_arguments.get_mut(&arg_name) {
            existing_arg.merge(other_argument);
        } else {
            existing_arguments.insert(arg_name, other_argument);
        }
    }
}

#[cfg(test)]
pub mod tests {

    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;
    use crate::ToSDLDefinition;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
    }

    // Note: keeping all args the same length to make reading in VSCode easier.
    // Also using macros so stack traces show the right line as panicking
    macro_rules! assert_base_merge_expected {
        ($base:expr, $to_add:expr, $expected:expr $(,)?) => {
            let mut merged = set_from_str($base);
            merged.merge(set_from_str($to_add));
            let expected_doc = format!("{}", set_from_str($expected).to_sdl_definition());
            let merged_doc = format!("{}", merged.to_sdl_definition());
            assert_eq!(
                merged_doc, expected_doc,
                "Actual (left) and expected (right) SDLs don't match"
            );
        };
    }

    #[test]
    fn test_merge_multi_example() {
        let base = r#"
            type A implements Y {
              id: ID!
            }

            type B {
              id: ID!
            }

            interface Y {
              id: ID!
            }
        "#;
        let to_add = r#"
            type A {
              name: String
              deprecated_field: B @deprecated
            }

            type B implements Y @strong(field: "id")
        "#;

        let expected = r#"
            type A implements Y {
              id: ID!
              name: String
              deprecated_field: B @deprecated
            }

            type B implements Y @strong(field: "id") {
              id: ID!
            }

            interface Y {
              id: ID!
            }
        "#;

        assert_base_merge_expected!(base, to_add, expected);
    }

    #[test]
    fn test_merge_no_change() {
        assert_base_merge_expected!(
            "type Topt { afield: String! } type Query { myQ: Topt }",
            "",
            "type Topt { afield: String! } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_merge_directive_definition() {
        assert_base_merge_expected!(
            "directive @x on QUERY",
            "directive @x on QUERY | MUTATION",
            "directive @x on QUERY | MUTATION",
        );
    }

    #[test]
    fn test_merge_output_type_change() {
        assert_base_merge_expected!(
            "type Topt { afield: String }",
            "type Topt { afield: String! }",
            "type Topt { afield: String }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: String! }",
            "type Topt { afield: String }",
            "type Topt { afield: String }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: [String!] }",
            "type Topt { afield: [String!]! }",
            "type Topt { afield: [String!] }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: [String!] }",
            "type Topt { afield: [String]! }",
            "type Topt { afield: [String] }",
        );
    }

    #[test]
    fn test_merge_output_smantic_non_null_change() {
        assert_base_merge_expected!(
            "type Topt { afield: String }",
            "type Topt { afield: String @semanticNonNull }",
            "type Topt { afield: String }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: String @semanticNonNull }",
            "type Topt { afield: String }",
            "type Topt { afield: String }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: String! }",
            "type Topt { afield: String @semanticNonNull }",
            "type Topt { afield: String @semanticNonNull }",
        );

        assert_base_merge_expected!(
            "type Topt { afield: [String!] @semanticNonNull }",
            "type Topt { afield: [String]! }",
            "type Topt { afield: [String] @semanticNonNull }",
        );
    }

    #[test]
    fn test_merge_required_arg() {
        assert_base_merge_expected!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_merge_arg_type_change() {
        assert_base_merge_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int!): String }",
        );

        assert_base_merge_expected!(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int!): String }",
        );

        assert_base_merge_expected!(
            "type Query { myQ(a: [Int!]!): String }",
            "type Query { myQ(a: [Int]): String }",
            "type Query { myQ(a: [Int!]!): String }",
        );

        assert_base_merge_expected!(
            "type Query { myQ(a: [Int!]): String }",
            "type Query { myQ(a: [Int]!): String }",
            "type Query { myQ(a: [Int!]!): String }",
        );

        assert_base_merge_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: [Int]): String }",
            "type Query { myQ(a: Int): String }",
        );

        assert_base_merge_expected!(
            "type Query { myQ(a: [Int!]): String }",
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_merge_required_arg_with_default() {
        assert_base_merge_expected!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int! = 3): String }",
            "type Query { myQ(a: Int! = 3): String }",
        );
    }

    #[test]
    fn test_merge_optional_arg() {
        assert_base_merge_expected!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_merge_arg_to_same_field() {
        assert_base_merge_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(b: String!): String }",
            "type Query { myQ(a: Int, b: String!): String }",
        );
    }

    #[test]
    fn test_merge_input_unchanged() {
        assert_base_merge_expected!(
            "input X { field: String } type Query { myQ(arg: X): String }",
            "",
            "input X { field: String } type Query { myQ(arg: X): String }",
        );
    }

    #[test]
    fn test_merge_input_type_changed() {
        assert_base_merge_expected!(
            "input X { field: String }",
            "input X { field: String! }",
            "input X { field: String! }",
        );

        assert_base_merge_expected!(
            "input X { field: String! }",
            "input X { field: String }",
            "input X { field: String! }",
        );

        assert_base_merge_expected!(
            "input X { field: [String] }",
            "input X { field: [String!]! }",
            "input X { field: [String!]! }",
        );
    }

    #[test]
    fn test_merge_field_added() {
        assert_base_merge_expected!(
            "type root1 {f: String} type Query {q1: root1}",
            "type Query {q2: String}",
            "type root1 {f: String} type Query {q1: root1, q2: String}",
        );
    }

    #[test]
    fn test_merge_field_to_existing_type() {
        assert_base_merge_expected!(
            "type Query {q1: String}",
            "type Query {q2: String}",
            "type Query {q1: String, q2: String}",
        );
    }

    #[test]
    fn test_merge_interface_implementation() {
        assert_base_merge_expected!(
            r#"
                type Concrete {
                  n: String!
                }

                interface Inf {
                  n: String!
                }

                type Query {
                  myQ: Concrete
                }
            "#,
            "type Concrete implements Inf",
            r#"
                type Concrete implements Inf {
                  n: String!
                }

                interface Inf {
                  n: String!
                }

                type Query {
                  myQ: Concrete
                }
            "#,
        );
    }

    #[test]
    fn test_merge_union_member() {
        assert_base_merge_expected!("union U = T", "union U = T2", "union U = T | T2");
    }

    #[test]
    fn test_merge_enum_value() {
        assert_base_merge_expected!(
            "enum T { One, Two }",
            "enum T { Three }",
            "enum T { One, Two, Three }",
        );
    }

    #[test]
    fn test_merge_new_type() {
        assert_base_merge_expected!(
            "type Query { myQ: Int }",
            "type T { afield: String }",
            "type T { afield: String } type Query { myQ: Int }",
        );
    }

    #[test]
    fn test_merge_directive() {
        // We are not properly merging directives on arguments, input fields, and enum values yet.
        assert_base_merge_expected!(
            r#"
                enum T {
                  One
                }

                type Query {
                  myQ(arg: X): T
                }

                input X {
                  field: String
                }
            "#,
            r#"
                enum T @deprecated {
                  One @deprecated
                }

                type Query {
                  myQ(arg: X @deprecated): T @deprecated
                }

                input X @deprecated {
                  field: String @deprecated
                }
            "#,
            r#"
                enum T @deprecated {
                  One
                }

                type Query {
                  myQ(arg: X @deprecated): T @deprecated
                }

                input X @deprecated {
                  field: String @deprecated
                }
            "#,
        );
    }
}
