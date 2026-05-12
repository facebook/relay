/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::TypeReference;
use serde::Serialize;
use thiserror::Error;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SchemaSet;
use crate::SetDirectiveValue;
use crate::SetType;
use crate::schema_set::CanHaveDirectives;
use crate::schema_set::HasArguments;
use crate::schema_set::HasFields;
use crate::schema_set::SchemaDefinitionItem;
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
use crate::schema_set::StringKeyNamed;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "type", content = "args")]
pub enum SetMergeError {
    #[error(
        "Cannot merge different root operation types for {operation_type}: '{existing}' and '{other}'."
    )]
    ConflictingRootOperationTypes {
        operation_type: String,
        existing: StringKey,
        other: StringKey,
    },

    #[error(
        "Cannot merge different type kinds for '{name}': existing is {existing_kind}, incoming is {other_kind}."
    )]
    CannotMergeDifferentTypeKinds {
        name: String,
        existing_kind: String,
        other_kind: String,
    },

    #[error(
        "Cannot merge mismatched types for field '{field_name}' on type '{parent_type}': '{existing}' and '{other}'."
    )]
    MismatchedFieldTypes {
        field_name: String,
        parent_type: String,
        existing: String,
        other: String,
    },

    #[error(
        "Cannot merge mismatched types for argument '{argument_name}' on '{parent_type}': '{existing}' and '{other}'."
    )]
    MismatchedArgumentTypes {
        argument_name: String,
        parent_type: String,
        existing: String,
        other: String,
    },
}

fn first_definition_location(definition: &Option<SchemaDefinitionItem>) -> Location {
    definition
        .as_ref()
        .and_then(|def| def.locations.first().cloned())
        .unwrap_or(Location::generated())
}

fn set_type_definition(t: &SetType) -> &Option<SchemaDefinitionItem> {
    match t {
        SetType::Scalar(s) => &s.definition,
        SetType::Enum(e) => &e.definition,
        SetType::Object(o) => &o.definition,
        SetType::Interface(i) => &i.definition,
        SetType::Union(u) => &u.definition,
        SetType::InputObject(io) => &io.definition,
    }
}

fn merge_definition(
    target: &mut Option<SchemaDefinitionItem>,
    source: &Option<SchemaDefinitionItem>,
) {
    match (target.as_mut(), source) {
        (Some(existing), Some(incoming)) => {
            for loc in &incoming.locations {
                if !existing.locations.contains(loc) {
                    existing.locations.push(*loc);
                }
            }

            // a non-client-definition always supersedes a client definition
            existing.is_client_definition =
                existing.is_client_definition && incoming.is_client_definition;
        }
        (None, Some(_)) => {
            *target = source.clone();
        }
        _ => {}
    }
}

/// Methods to make it easy to union/merge together two schema sets
pub trait Merges {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()>;
}

impl Merges for SchemaSet {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        // Merge schema roots
        self.root_schema.merge(other.root_schema)?;

        for (name, other_directive) in other.directives {
            if let Some(existing_directive) = self.directives.get_mut(&name) {
                existing_directive.merge(other_directive)?;
            } else {
                self.directives.insert(name, other_directive);
            }
        }

        for (name, other_type) in other.types {
            if let Some(existing_type) = self.types.get_mut(&name) {
                existing_type.merge(other_type)?;
            } else {
                self.types.insert(name, other_type);
            }
        }

        Ok(())
    }
}

// Sometimes we need to merge a parent type's definition in with the child definition.
// Use this trait to indicate definitions that may have this property.
pub trait MergesFromAbstractDefinition<TAbstract> {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: TAbstract,
        original_definition: Option<&Self>,
        parent_type: &str,
    ) -> DiagnosticsResult<()>;
}

impl Merges for SetRootSchema {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_directive_values(self, other.directives);
        merge_root_operation_type(
            &mut self.query_type,
            other.query_type,
            "query",
            &self.definition,
            &other.definition,
        )?;
        merge_root_operation_type(
            &mut self.mutation_type,
            other.mutation_type,
            "mutation",
            &self.definition,
            &other.definition,
        )?;
        merge_root_operation_type(
            &mut self.subscription_type,
            other.subscription_type,
            "subscription",
            &self.definition,
            &other.definition,
        )?;
        Ok(())
    }
}

impl Merges for SetType {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        match (self, other) {
            (SetType::Scalar(s), SetType::Scalar(other)) => s.merge(other),
            (SetType::Enum(s), SetType::Enum(other)) => s.merge(other),
            (SetType::Object(s), SetType::Object(other)) => s.merge(other),
            (SetType::Interface(s), SetType::Interface(other)) => s.merge(other),
            (SetType::Union(s), SetType::Union(other)) => s.merge(other),
            (SetType::InputObject(s), SetType::InputObject(other)) => s.merge(other),
            (a, b) => {
                let existing_location = first_definition_location(set_type_definition(a));
                let other_location = first_definition_location(set_type_definition(&b));
                let name = a.string_key_name().to_string();
                Err(vec![
                    Diagnostic::error(
                        SetMergeError::CannotMergeDifferentTypeKinds {
                            name,
                            existing_kind: set_type_kind_name(a).to_string(),
                            other_kind: set_type_kind_name(&b).to_string(),
                        },
                        other_location,
                    )
                    .annotate_if_location_exists(
                        "conflicts with existing type definition here",
                        existing_location,
                    ),
                ])
            }
        }
    }
}

impl Merges for SetEnum {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        for (value_name, other_value) in other.values {
            self.values.entry(value_name).or_insert(other_value);
        }
        merge_directive_values(self, other.directives);
        Ok(())
    }
}

impl Merges for SetInterface {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_directive_values(self, other.directives);

        merge_members(&mut self.interfaces, other.interfaces)?;
        merge_fields(self, other.fields, &self.name.to_string())?;
        Ok(())
    }
}
// Special merge for merging from an interface's field definition
impl MergesFromAbstractDefinition<SetInterface> for SetInterface {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: SetInterface,
        original_definition: Option<&SetInterface>,
        parent_type: &str,
    ) -> DiagnosticsResult<()> {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        // Also do not merge directives: any that we needed should have already
        // been defined on the object itself.

        merge_members_from_abstract_parent(&mut self.interfaces, abstract_definition.interfaces);
        merge_fields_from_abstract_parent(
            self,
            abstract_definition.fields,
            original_definition.map(|def| &def.fields),
            parent_type,
        )
    }
}

impl Merges for SetObject {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_directive_values(self, other.directives);

        merge_members(&mut self.interfaces, other.interfaces)?;
        merge_fields(self, other.fields, &self.name.to_string())?;
        Ok(())
    }
}

impl MergesFromAbstractDefinition<SetInterface> for SetObject {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_definition: SetInterface,
        original_definition: Option<&SetObject>,
        parent_type: &str,
    ) -> DiagnosticsResult<()> {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        // Also do not merge directives: any that we needed should have already
        // been defined on the object itself.
        merge_members_from_abstract_parent(&mut self.interfaces, abstract_definition.interfaces);
        merge_fields_from_abstract_parent(
            self,
            abstract_definition.fields,
            original_definition.map(|def| &def.fields),
            parent_type,
        )
    }
}

impl Merges for SetUnion {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_directive_values(self, other.directives);
        merge_members(&mut self.members, other.members)?;
        Ok(())
    }
}

impl Merges for SetInputObject {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        // This merges the Input Object's fields
        merge_arguments(self, other.fields, &self.name.to_string())?;
        merge_directive_values(self, other.directives);
        Ok(())
    }
}

impl Merges for SetScalar {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_directive_values(self, other.directives);
        Ok(())
    }
}

impl Merges for SetDirective {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);
        merge_arguments(self, other.arguments, &self.name.to_string())?;

        // We CANNOT just use extend, as locations is a Vec<DirectiveLocation>
        for other_locaiton in other.locations {
            if !self.locations.contains(&other_locaiton) {
                self.locations.push(other_locaiton);
            }
        }
        Ok(())
    }
}

impl SetField {
    fn merge_with_parent(&mut self, other: Self, parent_type: &str) -> DiagnosticsResult<()> {
        merge_definition(&mut self.definition, &other.definition);

        if self.type_ != other.type_ {
            let existing_location = first_definition_location(&self.definition);
            let other_location = first_definition_location(&other.definition);
            self.type_ =
                merge_output_field_type(&self.type_, &other.type_, self.name.0, parent_type)
                    .map_err(|diagnostics| {
                        diagnostics
                            .into_iter()
                            .map(|d| {
                                Diagnostic::error(d.message().to_string(), other_location)
                                    .annotate_if_location_exists(
                                        "conflicts with existing field type here",
                                        existing_location,
                                    )
                            })
                            .collect::<Vec<_>>()
                    })?;
        }

        merge_directive_values(self, other.directives);
        merge_arguments(self, other.arguments, parent_type)?;
        Ok(())
    }
}

// Special merge for merging from an interface's field definition
impl MergesFromAbstractDefinition<Self> for SetField {
    fn merge_from_abstract_definition(
        &mut self,
        abstract_field: Self,
        original: Option<&Self>,
        parent_type: &str,
    ) -> DiagnosticsResult<()> {
        // Do not update the is_extension from self: if this field was *explicitly*
        // defined by a client definition, then
        if let Some(original) = original {
            merge_directive_values(self, original.directives.clone());
            merge_arguments(self, abstract_field.arguments, parent_type)?;
        } else {
            merge_directive_values(self, abstract_field.directives);
            merge_arguments(self, abstract_field.arguments, parent_type)?;
        }
        Ok(())
    }
}

impl Merges for SetMemberType {
    fn merge(&mut self, other: Self) -> DiagnosticsResult<()> {
        self.is_extension = other.is_extension && self.is_extension;
        Ok(())
    }
}

impl SetArgument {
    fn merge_with_parent(&mut self, other: Self, parent_type: &str) -> DiagnosticsResult<()> {
        if self.definition.is_none() {
            self.definition = other.definition.clone();
        } else {
            merge_definition(&mut self.definition, &other.definition);
        }

        if self.type_ != other.type_ {
            let existing_location = first_definition_location(&self.definition);
            let other_location = first_definition_location(&other.definition);
            self.type_ =
                merge_input_argument_type(&self.type_, &other.type_, self.name, parent_type)
                    .map_err(|diagnostics| {
                        diagnostics
                            .into_iter()
                            .map(|d| {
                                Diagnostic::error(d.message().to_string(), other_location)
                                    .annotate_if_location_exists(
                                        "conflicts with existing argument type here",
                                        existing_location,
                                    )
                            })
                            .collect::<Vec<_>>()
                    })?;
        }

        if self.default_value.is_none() {
            self.default_value = other.default_value;
        }

        merge_directive_values(self, other.directives);
        Ok(())
    }
}

fn merge_directive_values<T: CanHaveDirectives>(existing: &mut T, other: Vec<SetDirectiveValue>) {
    let existing_directives: &mut Vec<SetDirectiveValue> = existing.directives_mut();
    for value in other {
        let existing_pos = existing_directives
            .iter()
            .position(|d| d.name == value.name);
        if let Some(pos) = existing_pos {
            if existing_directives[pos].arguments.is_empty() {
                existing_directives[pos].arguments = value.arguments;
            }
        } else {
            existing_directives.push(value);
        }
    }
}

fn merge_output_field_type(
    existing: &OutputTypeReference<StringKey>,
    other: &OutputTypeReference<StringKey>,
    field_name: StringKey,
    parent_type: &str,
) -> DiagnosticsResult<OutputTypeReference<StringKey>> {
    match (existing, other) {
        (OutputTypeReference::List(e_inner), OutputTypeReference::List(o_inner)) => {
            Ok(OutputTypeReference::List(Box::new(
                merge_output_field_type(e_inner, o_inner, field_name, parent_type)?,
            )))
        }
        (OutputTypeReference::Named(e_name), OutputTypeReference::Named(o_name)) => {
            if e_name != o_name {
                Err(vec![Diagnostic::error(
                    SetMergeError::MismatchedFieldTypes {
                        field_name: field_name.to_string(),
                        parent_type: parent_type.to_string(),
                        existing: e_name.to_string(),
                        other: o_name.to_string(),
                    },
                    Location::generated(),
                )])
            } else {
                Ok(OutputTypeReference::Named(*e_name))
            }
        }
        (OutputTypeReference::NonNull(e_nonnull), OutputTypeReference::NonNull(o_nonnull)) => {
            Ok(OutputTypeReference::NonNull(merge_output_nonnull(
                e_nonnull,
                o_nonnull,
                field_name,
                parent_type,
            )?))
        }
        // The lowest-common-denominator of a nullable and nonnull output is a nullable output, as the consumer must be robust to nulls.
        (OutputTypeReference::NonNull(nonnull), anything)
        | (anything, OutputTypeReference::NonNull(nonnull)) => {
            merge_output_field_type(nonnull.of(), anything, field_name, parent_type)
        }
        (existing, other) => Err(vec![Diagnostic::error(
            SetMergeError::MismatchedFieldTypes {
                field_name: field_name.to_string(),
                parent_type: parent_type.to_string(),
                existing: format!("{:?}", existing),
                other: format!("{:?}", other),
            },
            Location::generated(),
        )]),
    }
}

fn merge_output_nonnull(
    existing: &OutputNonNull<StringKey>,
    other: &OutputNonNull<StringKey>,
    field_name: StringKey,
    parent_type: &str,
) -> DiagnosticsResult<OutputNonNull<StringKey>> {
    match (existing, other) {
        (OutputNonNull::KillsParent(e_inner), OutputNonNull::KillsParent(o_inner)) => {
            Ok(OutputNonNull::KillsParent(Box::new(
                merge_output_field_type(e_inner, o_inner, field_name, parent_type)?,
            )))
        }
        (OutputNonNull::Semantic(e_inner), OutputNonNull::Semantic(o_inner)) => {
            Ok(OutputNonNull::Semantic(Box::new(merge_output_field_type(
                e_inner,
                o_inner,
                field_name,
                parent_type,
            )?)))
        }
        // Semantic NonNull is a subset of and more loose than KillsParent NonNull
        (OutputNonNull::KillsParent(e_inner), OutputNonNull::Semantic(o_inner))
        | (OutputNonNull::Semantic(e_inner), OutputNonNull::KillsParent(o_inner)) => {
            Ok(OutputNonNull::Semantic(Box::new(merge_output_field_type(
                e_inner,
                o_inner,
                field_name,
                parent_type,
            )?)))
        }
    }
}

fn merge_input_argument_type(
    existing: &TypeReference<StringKey>,
    other: &TypeReference<StringKey>,
    argument_name: StringKey,
    parent_type: &str,
) -> DiagnosticsResult<TypeReference<StringKey>> {
    match (existing, other) {
        (TypeReference::Named(e_name), TypeReference::Named(o_name)) if e_name == o_name => {
            Ok(TypeReference::Named(*e_name))
        }
        (TypeReference::List(e_inner), TypeReference::List(o_inner)) => {
            Ok(TypeReference::List(Box::new(merge_input_argument_type(
                e_inner,
                o_inner,
                argument_name,
                parent_type,
            )?)))
        }
        (TypeReference::NonNull(e_inner), TypeReference::NonNull(o_inner)) => {
            Ok(TypeReference::NonNull(Box::new(merge_input_argument_type(
                e_inner,
                o_inner,
                argument_name,
                parent_type,
            )?)))
        }

        // The lowest common denominator of a singular and list input is a singular input, as a singular value can be coerced to a list, but not vice-versa.
        // Also learned about match-guards with multiple patterns today: https://doc.rust-lang.org/book/ch19-03-pattern-syntax.html#listing-19-28
        (TypeReference::List(inner), singular) | (singular, TypeReference::List(inner))
            if !singular.is_list() =>
        {
            merge_input_argument_type(inner, singular, argument_name, parent_type)
        }

        // The lowest common denominator of a nullable and nonnull input is nonnull, as you must not pass null to a nonnull input.
        (TypeReference::NonNull(inner), anything) | (anything, TypeReference::NonNull(inner)) => {
            Ok(TypeReference::NonNull(Box::new(merge_input_argument_type(
                inner,
                anything,
                argument_name,
                parent_type,
            )?)))
        }
        (existing, other) => Err(vec![Diagnostic::error(
            SetMergeError::MismatchedArgumentTypes {
                argument_name: argument_name.to_string(),
                parent_type: parent_type.to_string(),
                existing: format!("{:?}", existing),
                other: format!("{:?}", other),
            },
            Location::generated(),
        )]),
    }
}

fn merge_root_operation_type(
    existing: &mut Option<StringKey>,
    other: Option<StringKey>,
    operation_type: &str,
    existing_definition: &Option<SchemaDefinitionItem>,
    other_definition: &Option<SchemaDefinitionItem>,
) -> DiagnosticsResult<()> {
    if let Some(other_type) = other {
        if let Some(existing_type) = *existing
            && existing_type != other_type
        {
            return Err(vec![
                Diagnostic::error(
                    SetMergeError::ConflictingRootOperationTypes {
                        operation_type: operation_type.to_string(),
                        existing: existing_type,
                        other: other_type,
                    },
                    first_definition_location(other_definition),
                )
                .annotate_if_location_exists(
                    "conflicts with existing schema definition here",
                    first_definition_location(existing_definition),
                ),
            ]);
        }
        *existing = Some(other_type);
    }
    Ok(())
}

fn merge_members(
    existing: &mut StringKeyIndexMap<SetMemberType>,
    other: StringKeyIndexMap<SetMemberType>,
) -> DiagnosticsResult<()> {
    for (name, member_type) in other {
        if let Some(existing_member) = existing.get_mut(&name) {
            existing_member.merge(member_type)?;
        } else {
            existing.insert(name, member_type);
        }
    }
    Ok(())
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

pub(crate) fn merge_fields<T: HasFields>(
    existing: &mut T,
    other_fields: StringKeyMap<SetField>,
    parent_type: &str,
) -> DiagnosticsResult<()> {
    let existing_fields = existing.fields_mut();
    for (field_name, other_field) in other_fields.into_iter() {
        if let Some(existing_field) = existing_fields.get_mut(&field_name) {
            existing_field.merge_with_parent(other_field, parent_type)?;
        } else {
            existing_fields.insert(field_name, other_field);
        }
    }
    Ok(())
}

pub(crate) fn merge_fields_from_abstract_parent<T: HasFields>(
    existing: &mut T,
    abstract_parent_fields: StringKeyMap<SetField>,
    original_definition_fields: Option<&StringKeyMap<SetField>>,
    parent_type: &str,
) -> DiagnosticsResult<()> {
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
        to_merge.merge_from_abstract_definition(other_field, original_field, parent_type)?;
    }
    Ok(())
}

// We don't need a separate same-type vs abstract-parent-type merging function:
// we always need to merge the *strictest* form of the argument back in.
fn merge_arguments<T: HasArguments>(
    existing: &mut T,
    other_arguments: StringKeyIndexMap<SetArgument>,
    parent_type: &str,
) -> DiagnosticsResult<()> {
    let existing_arguments = existing.arguments_mut();
    for (arg_name, other_argument) in other_arguments {
        if let Some(existing_arg) = existing_arguments.get_mut(&arg_name) {
            existing_arg.merge_with_parent(other_argument, parent_type)?;
        } else {
            existing_arguments.insert(arg_name, other_argument);
        }
    }
    Ok(())
}

fn set_type_kind_name(t: &SetType) -> &'static str {
    match t {
        SetType::Scalar(_) => "Scalar",
        SetType::Enum(_) => "Enum",
        SetType::Object(_) => "Object",
        SetType::Interface(_) => "Interface",
        SetType::Union(_) => "Union",
        SetType::InputObject(_) => "Input Object",
    }
}

#[cfg(test)]
pub mod tests {

    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;

    use super::*;
    use crate::ToSDLDefinition;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    // Note: keeping all args the same length to make reading in VSCode easier.
    // Also using macros so stack traces show the right line as panicking
    macro_rules! assert_base_merge_expected {
        ($base:expr, $to_add:expr, $expected:expr $(,)?) => {
            let mut merged = set_from_str($base);
            merged.merge(set_from_str($to_add)).unwrap();
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

    #[test]
    fn test_merge_directive_arguments_on_type() {
        // When existing directive already has arguments, they are kept as-is.
        assert_base_merge_expected!(
            r#"type A @strong(field: "id") { id: ID! }"#,
            r#"type A @strong(field: "name", other_arg: "value") { id: ID! }"#,
            r#"type A @strong(field: "id") { id: ID! }"#,
        );
    }

    #[test]
    fn test_merge_directive_arguments_on_field() {
        // When existing directive has arguments, other's arguments are not merged in.
        assert_base_merge_expected!(
            r#"
                type Query {
                  myQ: String @deprecated(reason: "old")
                }
            "#,
            r#"
                type Query {
                  myQ: String @deprecated(reason: "new", replacement: "newQ")
                }
            "#,
            r#"
                type Query {
                  myQ: String @deprecated(reason: "old")
                }
            "#,
        );
    }

    #[test]
    fn test_merge_directive_no_args_gets_other_args() {
        // Existing has no args, other has args -- other's args should be adopted.
        assert_base_merge_expected!(
            "type A @deprecated { id: ID! }",
            r#"type A @deprecated(reason: "use B") { id: ID! }"#,
            r#"type A @deprecated(reason: "use B") { id: ID! }"#,
        );
    }

    // --- Base + extension tests ---

    fn set_from_base_and_extensions(base_sdl: &str, ext_sdl: &str) -> SchemaSet {
        let base_doc = parse_schema_document(base_sdl, SourceLocationKey::generated()).unwrap();
        let ext_doc = parse_schema_document(ext_sdl, SourceLocationKey::generated()).unwrap();
        SchemaSet::from_schema_documents_with_extensions(&[base_doc], &[ext_doc]).unwrap()
    }

    /// Asserts the base/client printed output of `actual_set` equals what you
    /// would get by parsing `expected_base_sdl` + `expected_ext_sdl` through
    /// `from_schema_documents_with_extensions` and printing it.
    macro_rules! assert_base_and_extensions_eq {
        ($actual_set:expr, $expected_base:expr, $expected_ext:expr $(,)?) => {
            let (actual_base_defs, actual_client_defs) =
                $actual_set.print_base_and_client_definitions().unwrap();
            let expected = set_from_base_and_extensions($expected_base, $expected_ext);
            let (expected_base_defs, expected_client_defs) =
                expected.print_base_and_client_definitions().unwrap();
            assert_eq!(
                actual_base_defs.join("\n\n"),
                expected_base_defs.join("\n\n"),
                "base printed schema does not match expected"
            );
            assert_eq!(
                actual_client_defs.join("\n\n"),
                expected_client_defs.join("\n\n"),
                "extensions printed schema does not match expected"
            );
        };
    }

    #[test]
    fn test_merge_preserves_base_vs_extension_partition() {
        // Build a set that has a base type and a client extension on it, then
        // merge in another set that adds new fields on both sides.
        let mut left = set_from_base_and_extensions(
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
        let right = set_from_base_and_extensions(
            "type Query { age: Int }",
            "extend type Query { other_client_field: String }",
        );
        left.merge(right).unwrap();

        assert_base_and_extensions_eq!(
            left,
            "type Query { name: String age: Int }",
            "extend type Query { client_field: Int other_client_field: String }",
        );
    }

    #[test]
    fn test_merge_into_base_only_set_with_extensions_marks_new_fields_as_extension() {
        // `left` is purely base, `right` brings extensions for the same type.
        // After merge, the extension-tagged field should still print under the
        // client (extensions) half.
        let mut left = set_from_str("type Query { name: String }");
        let right = set_from_base_and_extensions(
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
        left.merge(right).unwrap();

        assert_base_and_extensions_eq!(
            left,
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
    }
}
