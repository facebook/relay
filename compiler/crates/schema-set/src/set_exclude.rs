/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::BTreeMap;

use common::ArgumentName;
use common::DirectiveName;
use common::NamedItem;
use common::Span;
use common::WithLocation;
use graphql_syntax::ConstantValue;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TokenKind;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use intern::string_key::StringKeySet;
use lazy_static::lazy_static;
use schema::ArgumentValue;
use schema::DirectiveValue;
use schema::TypeReference;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SchemaDefinitionItem;
use crate::SchemaSet;
use crate::SetArgument;
use crate::SetDirective;
use crate::SetEnum;
use crate::SetField;
use crate::SetInputObject;
use crate::SetInterface;
use crate::SetMemberType;
use crate::SetObject;
use crate::SetScalar;
use crate::SetType;
use crate::SetUnion;
use crate::schema_set::SetRootSchema;

lazy_static! {
    static ref MISSING_REQUIRED_DIRECTIVE: DirectiveName =
        DirectiveName("missing_required_directive".intern());
    static ref MISSING_REQUIRED_DIRECTIVE_NAME: ArgumentName = ArgumentName("name".intern());
}

/// These options can be used to describe changes that may not be "classically" GraphQL breaking changes:
/// old apps will not break if an output type changes from Nullable to NonNull.
/// However the *build* may break.
///
/// These changes *can* be made, so long as they are made *atomically* across server and client,
/// or if possible are made on the client *first*.
#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct SafeExclusionOptions {
    /// Some directives need to be applied to a subset *before* being applied to a superset,
    /// for example `my_field: Foo @deprecated` is a SUBSET of `my_field: Foo`, just like
    /// `my_field: Foo` is a subset of `my_field: Foo!`.
    ///
    /// When the directive IS in the base schema, but NOT in the excluded schema,
    /// we will still remove the directive during exclude.
    /// So SchemaSet(`my_field: Foo @deprecated`) exclude SchemSet(`my_field: Foo`) is an empty set.
    ///
    /// For *most* directives, if they are in the base schema but not in the to-exclude schema, they will be *left* in the
    /// base schema. For instance `type Foo @strong(field: "id")` exclude `type Foo` will leave `@strong(field: "id")`,
    /// so the resulting SchemaSet will not be empty.
    pub subset_directives: StringKeySet,

    /// Even though adding new enum values is a safe change *at runtime*, it *may not* be a safe change
    /// depending on the compilation and type checking options. For instance, if our compiler
    /// requires exhaustive switching, adding a new enum value may cause compilation failures.
    /// Similarly *removing* an output enum value is a breaking change, as the referenced enum value
    /// will no longer be present.
    pub output_enum_values_must_match: bool,

    /// While in theory it's always OK to return a non-null value when a field (on the client) expects nullable,
    /// in practice compilation can break depending on the strictness of nullability type checking.
    pub output_nullability_must_match: bool,

    /// TECHNICALLY it's OK in GraphQL to "upgrade" a singleton item to a list item.
    /// In practice this won't compile as no reasonable compiler or type system lets you pass single elements when
    /// it's expecting a list!
    pub input_plurality_must_match: bool,
}

pub trait CanBeEmpty {
    fn is_set_empty(&self) -> bool;
}

pub trait SetExclude: Clone + CanBeEmpty {
    /// Given this and some other set item, give back all of this minus all of other's values removed.
    /// This may cause the returned set to be an empty set!
    ///
    /// See example test test_exclude_simple_example for a simple overview.
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self;
}

impl CanBeEmpty for SchemaSet {
    fn is_set_empty(&self) -> bool {
        self.root_schema.directives.is_empty()
            && self.directives.is_set_empty()
            && self.types.is_set_empty()
    }
}

impl SetExclude for SchemaSet {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            root_schema: self.root_schema.exclude(&other.root_schema, options),
            directives: self.directives.exclude(&other.directives, options),
            types: self.types.exclude(&other.types, options),
        }
    }
}

impl CanBeEmpty for SetRootSchema {
    fn is_set_empty(&self) -> bool {
        // Doing set operations on the root schema definitions is a surprisingly
        // tricky problem, due to the way the spec works with what it means for a root schema to be "default" and how many permutations
        // of a default-looking root schema there are.
        //
        // The below logic is probably not quite right as you can have defined root types AND BE EMPTY (because those root types are only default types).
        // We are unlikely to see this problem soon as none of Meta's schema use directives on the root schema or non-default root types,
        // so the `schema { ... }` part of SDL is just never defined.
        // See https://spec.graphql.org/September2025/#sec-Root-Operation-Types.Default-Root-Operation-Type-Names
        self.directives.is_empty()
            && self.query_type.is_none()
            && self.mutation_type.is_none()
            && self.subscription_type.is_none()
    }
}

impl SetExclude for SetRootSchema {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: self.definition.clone(),
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            query_type: exclude_operation_type(self.query_type, other.query_type),
            mutation_type: exclude_operation_type(self.mutation_type, other.mutation_type),
            subscription_type: exclude_operation_type(
                self.subscription_type,
                other.subscription_type,
            ),
        }
    }
}

impl CanBeEmpty for SetDirective {
    fn is_set_empty(&self) -> bool {
        // definition will NOT be none if repeatable has changed!
        self.definition.is_none() && self.arguments.is_empty() && self.locations.is_empty()
    }
}

impl SetExclude for SetDirective {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        // Keep Definition around if we DROPPED repeatable changed to make clear this is not an empty value, even if there are no arguments!
        let definition = exclude_definition_if(
            self.name.0,
            self.definition.as_ref(),
            !self.repeatable || other.repeatable,
        );

        let locations = self
            .locations
            .iter()
            .filter(|this_loc| {
                other
                    .locations
                    .iter()
                    .any(|other_loc| *this_loc == other_loc)
            })
            .cloned()
            .collect();

        Self {
            definition,
            locations,
            arguments: exclude_argument_definitions(&self.arguments, &other.arguments, options),
            name: self.name,
            repeatable: self.repeatable,
        }
    }
}

impl CanBeEmpty for SetType {
    fn is_set_empty(&self) -> bool {
        match self {
            SetType::Scalar(t) => t.is_set_empty(),
            SetType::Enum(t) => t.is_set_empty(),
            SetType::Object(t) => t.is_set_empty(),
            SetType::Interface(t) => t.is_set_empty(),
            SetType::Union(t) => t.is_set_empty(),
            SetType::InputObject(t) => t.is_set_empty(),
        }
    }
}

impl SetExclude for SetType {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        match (self, other) {
            (SetType::Scalar(t), SetType::Scalar(o)) => SetType::Scalar(t.exclude(o, options)),
            (SetType::Enum(t), SetType::Enum(o)) => SetType::Enum(t.exclude(o, options)),
            (SetType::Object(t), SetType::Object(o)) => SetType::Object(t.exclude(o, options)),
            (SetType::Interface(t), SetType::Interface(o)) => {
                SetType::Interface(t.exclude(o, options))
            }
            (SetType::Union(t), SetType::Union(o)) => SetType::Union(t.exclude(o, options)),
            (SetType::InputObject(t), SetType::InputObject(o)) => {
                SetType::InputObject(t.exclude(o, options))
            }

            // There is *technically* a way to make union be a strict subset of interface,
            // but to do so you'd need to know all the types *implementing* the other interface,
            // and things get messy for this relatively rare operation.
            (SetType::Union(_), SetType::Interface(_)) => self.clone(),

            // Likewise it is *theoretically possible* to make an Object be a subset of an Interface,
            // but as long as people make product decisions based on __typename, this is not a safe
            // assumption.
            (SetType::Object(_), SetType::Interface(_)) => self.clone(),

            // If there's any other mismatch in types we just preserve self as-is: it is NOT a subset of other's type
            _ => self.clone(),
        }
    }
}

impl CanBeEmpty for SetScalar {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none() && self.directives.is_empty()
    }
}

impl SetExclude for SetScalar {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: None,
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            name: self.name,
        }
    }
}

impl CanBeEmpty for SetEnum {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none() && self.directives.is_empty() && self.values.is_empty()
    }
}

impl SetExclude for SetEnum {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        let mut values = BTreeMap::default();

        for (key, this_value) in &self.values {
            // Preserve items when:
            if let Some(other_value) = other.values.get(key) {
                // - Other has the item but other's directives are not a superset
                let included_directives = exclude_directives(
                    &this_value.directives,
                    &other_value.directives,
                    &options.subset_directives,
                );

                // In practice adding a new enum value to an output enums is NOT a 100% safe operation,
                // so if there is ANY difference between the two we need to preserve them.
                // We COULD differentiate between output and input enum values, but today
                // they are conflated.
                if !included_directives.is_empty() {
                    values.insert(*key, this_value.clone());
                }
            } else {
                // - Other does not have the item
                values.insert(*key, this_value.clone());
            }
        }

        // Add back in any missing enum values from the exclude set when the option
        // to consider only matching enum values the same is true.
        if options.output_enum_values_must_match {
            for (key, other_value) in &other.values {
                if !self.values.contains_key(key) {
                    values.insert(*key, other_value.clone());
                }
            }
        }

        Self {
            definition: None,
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            values,
            name: self.name,
        }
    }
}

impl CanBeEmpty for SetObject {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none()
            && self.interfaces.is_empty()
            && self.directives.is_empty()
            && self.fields.is_set_empty()
    }
}

impl SetExclude for SetObject {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: None,
            interfaces: exclude_set_members(&self.interfaces, &other.interfaces),
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            fields: self.fields.exclude(&other.fields, options),
            name: self.name,
        }
    }
}

impl CanBeEmpty for SetInterface {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none()
            && self.interfaces.is_empty()
            && self.directives.is_empty()
            && self.fields.is_set_empty()
    }
}

impl SetExclude for SetInterface {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: None,
            interfaces: exclude_set_members(&self.interfaces, &other.interfaces),
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            fields: self.fields.exclude(&other.fields, options),
            name: self.name,
        }
    }
}

impl CanBeEmpty for SetUnion {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none() && self.members.is_empty() && self.directives.is_empty()
    }
}

impl SetExclude for SetUnion {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: None,
            members: exclude_set_members(&self.members, &other.members),
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            name: self.name,
        }
    }
}

impl CanBeEmpty for SetInputObject {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none() && self.directives.is_empty() && self.fields.is_empty()
    }
}

impl SetExclude for SetInputObject {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        Self {
            definition: None,
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            fields: exclude_argument_definitions(&self.fields, &other.fields, options),
            name: self.name,
            // fully_recursively_visited is only a helper marker for collecting used sets,
            // not really relevant here.
            fully_recursively_visited: self.fully_recursively_visited,
        }
    }
}

impl CanBeEmpty for SetField {
    fn is_set_empty(&self) -> bool {
        self.definition.is_none() && self.arguments.is_set_empty() && self.directives.is_empty()
    }
}

impl SetExclude for SetField {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        let definition = exclude_definition_if(
            self.name.0,
            self.definition.as_ref(),
            is_excluded_output_type(&self.type_, &other.type_, options),
        );
        Self {
            definition,
            arguments: exclude_argument_definitions(&self.arguments, &other.arguments, options),
            directives: exclude_directives(
                &self.directives,
                &other.directives,
                &options.subset_directives,
            ),
            name: self.name,
            type_: self.type_.clone(),
        }
    }
}

impl CanBeEmpty for SetArgument {
    fn is_set_empty(&self) -> bool {
        // We don't need to check things liek the type or default value: if it HAS a definition, then it is NOT empty.
        // Likewise the definition cannot exist if its definition is empty, UNLESS there are just directives extending it
        self.definition.is_none() && self.directives.is_empty()
    }
}

impl SetExclude for SetArgument {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        let directives = exclude_directives(
            &self.directives,
            &other.directives,
            &options.subset_directives,
        );

        let is_type_excluded = is_excluded_input_type(&self.type_, &other.type_, options);

        let definition =
            exclude_definition_if(self.name, self.definition.as_ref(), is_type_excluded);

        Self {
            definition,
            directives,
            // type is either a subset, in which case definition is empty, OR it is NOT a subset and definition is set.
            type_: self.type_.clone(),
            name: self.name,
            // Default value can change in either direction, it's never a determinant of the argument being a subset.
            // Theoretically there might be an issue if it switches to null when the type is nonnull but that would just make the
            // argument invalid
            default_value: self.default_value.clone(),
        }
    }
}

// Whether
fn is_excluded_input_type(
    this_type: &TypeReference<StringKey>,
    other_type: &TypeReference<StringKey>,
    options: &SafeExclusionOptions,
) -> bool {
    match (this_type, other_type) {
        // When they are the same kind, check name or keep recursing into both
        (TypeReference::Named(this_name), TypeReference::Named(other_name)) => {
            this_name == other_name
        }
        (TypeReference::NonNull(this_inner), TypeReference::NonNull(other_inner)) => {
            is_excluded_input_type(this_inner, other_inner, options)
        }
        (TypeReference::List(this_inner), TypeReference::List(other_inner)) => {
            is_excluded_input_type(this_inner, other_inner, options)
        }

        // Less obvious valid cases
        // A nonnull input is a subset of the same nullable input
        (TypeReference::NonNull(this_inner), _) => {
            is_excluded_input_type(this_inner, other_type, options)
        }
        // You can keep using singleton value inside locations that expect a List, so a single is a subset of a list
        // See https://spec.graphql.org/September2025/#sec-List.Input-Coercion
        // However it's highly likely that passing a single to a list-requiring arg will not compile
        (_, TypeReference::List(other_inner)) => {
            !options.input_plurality_must_match
                && is_excluded_input_type(this_type, other_inner, options)
        }

        // Failure cases
        // A list is NOT a subset of a singleton, as you can use a list in the subset and it will not work in the superset
        (TypeReference::List(_), _) => false,
        // Similarly, a nullable is NOT a subset of a nonnull
        // See https://spec.graphql.org/September2025/#sec-Non-Null.Input-Coercion
        (_, TypeReference::NonNull(_)) => false,
    }
}

// This function excludes everything and MORE that is_excluded_input_type(other_type, this_type) excludes (i.e. just reversin the inputs).
// It is NOT symmetric: this will exclude lists that are NOT excluded by inputs, due to input list coercion.
// Whereas for NonNull, this is symmetrically coerceable (never returning null to a nullable field is fine, just like never passing null to a nullable input is fine).
fn is_excluded_output_type(
    this_type: &OutputTypeReference<StringKey>,
    other_type: &OutputTypeReference<StringKey>,
    options: &SafeExclusionOptions,
) -> bool {
    match (this_type, other_type) {
        // When they are the same kind, check name or keep recursing into both
        (OutputTypeReference::Named(this_name), OutputTypeReference::Named(other_name)) => {
            this_name == other_name
        }
        (
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(this_inner)),
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(other_inner)),
        ) => is_excluded_output_type(this_inner, other_inner, options),
        (
            OutputTypeReference::NonNull(OutputNonNull::Semantic(this_inner)),
            OutputTypeReference::NonNull(OutputNonNull::Semantic(other_inner)),
        ) => is_excluded_output_type(this_inner, other_inner, options),
        (OutputTypeReference::List(this_inner), OutputTypeReference::List(other_inner)) => {
            is_excluded_output_type(this_inner, other_inner, options)
        }

        // Less obvious valid cases, that may cause compiler/build problems
        // A Semantic NonNull is a valid subset of a KillsParent NonNull
        (
            OutputTypeReference::NonNull(OutputNonNull::Semantic(this_inner)),
            OutputTypeReference::NonNull(OutputNonNull::KillsParent(other_inner)),
        ) => {
            !options.output_nullability_must_match
                && is_excluded_output_type(this_inner, other_inner, options)
        }
        // A nullable type is a valid subset of a compatible NonNull type
        (_, OutputTypeReference::NonNull(other_nonnull)) => {
            !options.output_nullability_must_match
                && is_excluded_output_type(this_type, other_nonnull.of(), options)
        }

        // Failure cases
        // Output lists are NOT subsets of singletons: a response handler can't coerce a list when it's expecting a singleton,
        // even though a GraphQL server CAN coerce a singleton when it expects a list.
        (OutputTypeReference::List(_), _) => false,
        (_, OutputTypeReference::List(_)) => false,
        (OutputTypeReference::NonNull(_), _) => false,
    }
}

/// THIS IS NOT SPEC COMPLIANT
///
/// Please please please someone coming after take a look at this and make it right!
/// This is not right because we are not handling *default* type exclusions: if one schema has NO defaults
/// and the other only uses default types, they are actually identical and should be excluded!
///
/// Th'is logical difficulty is desribed in the spec here: https://spec.graphql.org/September2025/#sec-Root-Operation-Types.Default-Root-Operation-Type-Names
fn exclude_operation_type(this: Option<StringKey>, other: Option<StringKey>) -> Option<StringKey> {
    match (this, other) {
        // Nothing to exclude away
        (None, _) => None,
        (Some(t), None) => Some(t),
        // If the names are *different* just preserve the original name: we can't exclude an
        // operation definition when the operation its pointing to is different!
        (Some(t), Some(o)) => {
            if t == o {
                None
            } else {
                Some(t)
            }
        }
    }
}

fn exclude_definition_if(
    name: StringKey,
    original_definition: Option<&SchemaDefinitionItem>,
    definition_is_excluded: bool,
) -> Option<SchemaDefinitionItem> {
    if definition_is_excluded {
        None
    } else {
        Some(
            original_definition
                .cloned()
                .unwrap_or_else(|| SchemaDefinitionItem {
                    name: WithLocation::generated(name),
                    is_client_definition: false,
                    description: None,
                    hack_source: None,
                }),
        )
    }
}

fn exclude_set_members(
    this: &StringKeyIndexMap<SetMemberType>,
    other: &StringKeyIndexMap<SetMemberType>,
) -> StringKeyIndexMap<SetMemberType> {
    this.iter()
        .filter_map(|(k, v)| {
            if other.contains_key(k) {
                None
            } else {
                Some((*k, v.clone()))
            }
        })
        .collect()
}

fn exclude_argument_definitions(
    this: &StringKeyIndexMap<SetArgument>,
    other: &StringKeyIndexMap<SetArgument>,
    options: &SafeExclusionOptions,
) -> StringKeyIndexMap<SetArgument> {
    let mut preserved_arguments = StringKeyIndexMap::default();

    for (arg_name, this_arg) in this {
        if let Some(excluded_arg) = exclude_argument(Some(this_arg), other.get(arg_name), options) {
            if !excluded_arg.is_set_empty() {
                preserved_arguments.insert(*arg_name, excluded_arg);
            }
        }
    }

    // Go through other args that are NOT in this to find any required or required-subset-directive-containing arguments
    for (arg_name, other_arg) in other.iter().filter(|(k, _)| !this.contains_key(*k)) {
        if let Some(excluded_arg) = exclude_argument(None, Some(other_arg), options) {
            if !excluded_arg.is_set_empty() {
                preserved_arguments.insert(*arg_name, excluded_arg);
            }
        }
    }
    preserved_arguments
}

fn exclude_argument(
    this: Option<&SetArgument>,
    other: Option<&SetArgument>,
    options: &SafeExclusionOptions,
) -> Option<SetArgument> {
    match (this, other) {
        (Some(this_arg), Some(other_arg)) => Some(this_arg.exclude(other_arg, options)),
        (Some(this_arg), None) => Some(this_arg.clone()),
        (None, Some(other_arg)) => {
            // If other is required, or if there are any non-excluded directive from other, then we need to
            // include other in what was failed to exclude.
            let excluded_directives =
                exclude_directives(&[], &other_arg.directives, &options.subset_directives);
            let is_other_arg_required =
                other_arg.type_.is_non_null() && other_arg.default_value.is_none();
            if is_other_arg_required || !excluded_directives.is_empty() {
                Some(other_arg.clone())
            } else {
                None
            }
        }
        (None, None) => None,
    }
}

// Given a list of directives and a list of directives from the exclude source, PLUS the subset directives, give the
// directives that WERE NOT excluded.
//
// If any directives from other are subset directives, then insert an @missing_required_directive(name: "<>") (once per missing directive).
// For example, if other has an @deprecated but this does not, we'll add @missing_required_directive(name: "deprecated") to indicate that
// this parent definition is NOT a pure subset of the other parent definition
//
// We can't implement SetExclude for Vec<DirectiveValue>, because it's subtly NOT empty
// if other has subset directives that this is missing
fn exclude_directives(
    this: &[DirectiveValue],
    other: &[DirectiveValue],
    subset_directives: &StringKeySet,
) -> Vec<DirectiveValue> {
    let mut not_excluded = Vec::new();

    // Keep those directives NOT in the subset allowlist and NOT in other, or that are in other but are not equal.
    for this_directive in this {
        if !subset_directives.contains(&this_directive.name.0)
            && other
                .named(this_directive.name)
                .is_none_or(|other_directive| this_directive != other_directive)
        {
            not_excluded.push(this_directive.clone());
        }
    }

    // Now verify that all subset directives on other are contained in self with equal definitions!
    for other_diretive in other {
        if subset_directives.contains(&other_diretive.name.0)
            && this
                .named(other_diretive.name)
                .is_none_or(|this_directive| other_diretive != this_directive)
        {
            not_excluded.push(build_missing_required_directive(other_diretive))
        }
    }

    not_excluded
}

fn build_missing_required_directive(directive_from_other: &DirectiveValue) -> DirectiveValue {
    DirectiveValue {
        name: *MISSING_REQUIRED_DIRECTIVE,
        arguments: vec![ArgumentValue {
            name: *MISSING_REQUIRED_DIRECTIVE_NAME,
            value: ConstantValue::String(StringNode {
                token: Token {
                    span: Span::empty(),
                    kind: TokenKind::StringLiteral,
                },
                value: directive_from_other.name.0,
            }),
        }],
    }
}

impl<V: CanBeEmpty> CanBeEmpty for StringKeyMap<V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same  if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.values().all(|v| v.is_set_empty())
    }
}

impl<V: CanBeEmpty> CanBeEmpty for StringKeyIndexMap<V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same  if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.values().all(|v| v.is_set_empty())
    }
}

impl CanBeEmpty for StringKeySet {
    fn is_set_empty(&self) -> bool {
        self.is_empty()
    }
}

impl<K, V: CanBeEmpty> CanBeEmpty for BTreeMap<K, V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same  if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.values().all(|v| v.is_set_empty())
    }
}

impl<V: CanBeEmpty> CanBeEmpty for Vec<V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same  if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.iter().all(|v| !v.is_set_empty())
    }
}

impl<V: SetExclude> SetExclude for StringKeyMap<V> {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        self.iter()
            .map(|(k, v)| {
                if let Some(other_v) = other.get(k) {
                    (*k, v.exclude(other_v, options))
                } else {
                    (*k, v.clone())
                }
            })
            .filter(|(_, v)| !v.is_set_empty())
            .collect()
    }
}

impl<K: Clone + Ord, V: SetExclude> SetExclude for BTreeMap<K, V> {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        self.iter()
            .map(|(k, v)| {
                if let Some(other_v) = other.get(k) {
                    (k.clone(), v.exclude(other_v, options))
                } else {
                    (k.clone(), v.clone())
                }
            })
            .filter(|(_, v)| !v.is_set_empty())
            .collect()
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
    macro_rules! assert_base_exclude_expected {
        ($original:expr, $excluded:expr, $expected:expr $(,)?) => {
            assert_base_exclude_expected!(
                $original,
                $excluded,
                $expected,
                SafeExclusionOptions::default()
            )
        };

        ($original:expr, $excluded:expr, $expected:expr, $options:expr $(,)?) => {
            let after_exclusion =
                set_from_str($original).exclude(&set_from_str($excluded), &$options);
            let expected_doc = format!("{}", set_from_str($expected).to_sdl_definition());
            let excluded_doc = format!("{}", after_exclusion.to_sdl_definition());
            assert_eq!(excluded_doc, expected_doc);
        };
    }

    macro_rules! assert_base_exclude_empty {
        ($original:expr, $excluded:expr $(,)?) => {
            assert_base_exclude_empty!($original, $excluded, SafeExclusionOptions::default())
        };

        ($original:expr, $excluded:expr, $options:expr $(,)?) => {
            let after_exclusion =
                set_from_str($original).exclude(&set_from_str($excluded), &$options);
            assert!(
                after_exclusion.is_set_empty(),
                "Expected 'base' to be a subset of 'excluded', but the following was NOT excluded:\n{}",
                after_exclusion.to_sdl_definition()
            );
        };
    }

    #[test]
    fn test_exclude_multi_example() {
        let base = r#"
            type A implements Y {
              id: ID!
              name: String
              deprecated_base: B @deprecated
              deprecated_exclude: B
            }

            type B implements Y @strong(field: "id") {
              id: ID!
            }

            interface Y {
              id: ID!
            }
        "#;
        let to_exclude = r#"
            type A {
              name: String
              deprecated_base: B
              deprecated_exclude: B @deprecated
            }

            type B implements Y {
              id: ID!
            }

            interface Y {
              id: ID!
            }
        "#;

        let expected = r#"
            type A implements Y {
              id: ID!
              deprecated_exclude: B @missing_required_directive(name: "deprecated")
            }

            type B @strong(field: "id")
        "#;

        assert_base_exclude_expected!(
            base,
            to_exclude,
            expected,
            SafeExclusionOptions {
                subset_directives: ["deprecated".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn test_unchanged() {
        assert_base_exclude_empty!(
            "type Topt { afield: String! } type Query { myQ: Topt }",
            "type Topt { afield: String! } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_required_arg_removed() {
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ: String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_required_arg_added() {
        assert_base_exclude_expected!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_required_arg_with_default_added() {
        assert_base_exclude_empty!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int! = 3): String }",
        );
    }

    #[test]
    fn test_optional_arg_removed() {
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ: String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_optional_arg_added() {
        assert_base_exclude_empty!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_optional_to_required_arg() {
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_optional_to_required_with_default_arg() {
        // This is non-intuitive but correct.
        // We CAN allow no-argument => non-null-with-default, as that's
        // equivalent to adding an optional argument.
        // We CANNOT allow nullable => non-null (with OR without default),
        // as otherwise you could be passing an explicit null for a now-non-null value.
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int! = 7): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_required_to_optional_arg() {
        assert_base_exclude_empty!(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_singular_to_list_arg() {
        assert_base_exclude_empty!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: [Int]): String }",
        );
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: [Int]): String }",
            "type Query { myQ(a: Int): String }",
            SafeExclusionOptions {
                input_plurality_must_match: true,
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn test_arg_typechange() {
        assert_base_exclude_expected!(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: String!): String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_input_unchanged() {
        assert_base_exclude_empty!(
            "input X { field: String } type Query { myQ(arg: X): String }",
            "input X { field: String } type Query { myQ(arg: X): String }",
        );
    }

    #[test]
    fn test_field_added() {
        assert_base_exclude_empty!(
            "type root1 {f: String} type Query {q1: root1}",
            "type root1 {f: String} type Query {q1: root1, q2: String}",
        );
    }

    #[test]
    fn test_field_removed() {
        assert_base_exclude_expected!(
            "type root1 {f: String} type Query {q1: root1, q2: String}",
            "type root1 {f: String} type Query {q1: root1}",
            "type Query {q2: String}",
        );
    }

    #[test]
    fn test_field_nonnull_to_null() {
        assert_base_exclude_expected!(
            "type Query { myQ: String! }",
            "type Query { myQ: String }",
            "type Query { myQ: String! }",
        );
    }

    #[test]
    fn test_field_semantic_nonnull_to_null() {
        assert_base_exclude_expected!(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String }",
            "type Query { myQ: String @semanticNonNull }",
        );
    }

    #[test]
    fn test_field_null_to_nonnull() {
        assert_base_exclude_empty!("type Query { myQ: String }", "type Query { myQ: String! }");
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "type Query { myQ: String }",
            "type Query { myQ: String! }",
            "type Query { myQ: String }",
            SafeExclusionOptions {
                output_nullability_must_match: true,
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn test_field_null_to_semantic_nonnull() {
        assert_base_exclude_empty!(
            "type Query { myQ: String }",
            "type Query { myQ: String @semanticNonNull }"
        );
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "type Query { myQ: String }",
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String }",
            SafeExclusionOptions {
                output_nullability_must_match: true,
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn test_field_nonnull_to_semantic_non_null() {
        assert_base_exclude_expected!(
            "type Query { myQ: String! }",
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String! }",
        );
    }

    #[test]
    fn test_field_semantic_non_null_to_nonnull() {
        assert_base_exclude_empty!(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String! }"
        );
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String! }",
            "type Query { myQ: String @semanticNonNull }",
            SafeExclusionOptions {
                output_nullability_must_match: true,
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn test_field_renamed() {
        assert_base_exclude_expected!(
            "type T { name1: String } type Query { myQ: T }",
            "type T { name2: String } type Query { myQ: T }",
            "type T { name1: String }",
        );
    }

    #[test]
    fn test_interface_removed() {
        assert_base_exclude_expected!(
            "type Concrete implements Inf { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
            "type Concrete { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
            "type Concrete implements Inf",
        );
    }

    #[test]
    fn test_interface_added() {
        assert_base_exclude_empty!(
            "type Concrete { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
            "type Concrete implements Inf { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
        );
    }

    #[test]
    fn test_union_item_removed() {
        assert_base_exclude_expected!("union U = T | T2", "union U = T", "union U = T2");
    }

    #[test]
    fn test_union_item_added() {
        assert_base_exclude_empty!("union U = T", "union U = T | T2");
    }

    #[test]
    fn test_enum_value_removed() {
        assert_base_exclude_expected!(
            "enum T { One, Two, Three }",
            "enum T { One, Two }",
            "enum T { Three }",
        );
    }

    #[test]
    fn test_enum_value_added() {
        assert_base_exclude_empty!("enum T { One, Two }", "enum T { One, Two, Three }");
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "enum T { One, Two }",
            "enum T { One, Two, Three }",
            "enum T { Three }",
            SafeExclusionOptions {
                output_enum_values_must_match: true,
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn type_removed() {
        assert_base_exclude_expected!(
            "type T { afield: String } type Query { myQ: Int }",
            "type Query { myQ: Int }",
            "type T { afield: String }",
        );
    }

    #[test]
    fn type_kind_changed() {
        assert_base_exclude_expected!(
            "enum T { One, Two, Three} type Query { myQ: T}",
            "type T { a : String} type Query { myQ: T}",
            "enum T { One, Two, Three}",
        );
    }

    #[test]
    fn deprecated_added() {
        assert_base_exclude_empty!(
            "enum T { One } type Query { myQ(arg: X): T } input X { field: String }",
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
        );
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "enum T { One } type Query { myQ(arg: X): T } input X { field: String }",
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
            r#"
            type Query {
                myQ(arg: X @missing_required_directive(name: "deprecated")): T @missing_required_directive(name: "deprecated")
            }
            enum T @missing_required_directive(name: "deprecated") {
                One
            }
            input X @missing_required_directive(name: "deprecated") {
                field: String @missing_required_directive(name: "deprecated")
            }
            "#,
            SafeExclusionOptions {
                subset_directives: ["deprecated".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            }
        );
    }

    #[test]
    fn deprecated_removed() {
        assert_base_exclude_expected!(
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
            "enum T { One } type Query { myQ(arg: X): T } input X { field: String }",
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
        );
        assert_base_exclude_empty!(
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
            "enum T { One } type Query { myQ(arg: X): T } input X { field: String }",
            SafeExclusionOptions {
                subset_directives: ["deprecated".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            }
        );
    }
}
