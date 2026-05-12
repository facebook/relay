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
use schema::TypeReference;

use crate::OutputNonNull;
use crate::OutputTypeReference;
use crate::SchemaDefinitionItem;
use crate::SchemaSet;
use crate::SetArgument;
use crate::SetArgumentValue;
use crate::SetDirective;
use crate::SetDirectiveValue;
use crate::SetEnum;
use crate::SetField;
use crate::SetInputObject;
use crate::SetInterface;
use crate::SetMemberType;
use crate::SetObject;
use crate::SetScalar;
use crate::SetType;
use crate::SetUnion;
use crate::schema_set::HasDefinitionItem;
use crate::schema_set::SetRootSchema;

lazy_static! {
    pub static ref MISSING_REQUIRED_DIRECTIVE: DirectiveName =
        DirectiveName("missing_required_directive".intern());
    pub static ref MISSING_REQUIRED_DIRECTIVE_NAME: ArgumentName = ArgumentName("name".intern());
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
    /// So SchemaSet(`my_field: Foo @deprecated`) exclude SchemaSet(`my_field: Foo`) is an empty set.
    ///
    /// For *most* directives, if they are in the base schema but not in the to-exclude schema, they will be *left* in the
    /// base schema. For instance `type Foo @strong(field: "id")` exclude `type Foo` will leave `@strong(field: "id")`,
    /// so the resulting SchemaSet will not be empty.
    pub subset_directives: StringKeySet,

    /// Directives that, when present on a type or field in the superset schema,
    /// must also be present on the corresponding type or field in the subset schema.
    /// Missing ones are flagged with `@missing_required_directive` markers.
    pub base_restricted_directives: StringKeySet,

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
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
                let included_directives =
                    exclude_directives(&this_value.directives, &other_value.directives, options);

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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            interfaces: exclude_set_members(&self.interfaces, &other.interfaces),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            interfaces: exclude_set_members(&self.interfaces, &other.interfaces),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            members: exclude_set_members(&self.members, &other.members),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            definition: exclude_definition_if(
                self.name.0,
                self.definition.as_ref(),
                !other.is_client_definition() || self.is_client_definition(),
            ),
            directives: exclude_directives(&self.directives, &other.directives, options),
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
            directives: exclude_directives(&self.directives, &other.directives, options),
            name: self.name,
            type_: self.type_.clone(),
        }
    }
}

impl CanBeEmpty for SetArgument {
    fn is_set_empty(&self) -> bool {
        // We don't need to check things like the type or default value: if it HAS a definition, then it is NOT empty.
        // Likewise the definition cannot exist if its definition is empty, UNLESS there are just directives extending it
        self.definition.is_none() && self.directives.is_empty()
    }
}

impl SetExclude for SetArgument {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        let directives = exclude_directives(&self.directives, &other.directives, options);

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
/// This logical difficulty is described in the spec here: https://spec.graphql.org/September2025/#sec-Root-Operation-Types.Default-Root-Operation-Type-Names
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
                    name,
                    locations: Vec::new(),
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
            let excluded_directives = exclude_directives(&[], &other_arg.directives, options);
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

// Given a list of directives and a list of directives from the exclude source, give the
// directives that WERE NOT excluded.
//
// For base_restricted_directives: if a directive from other is in the restricted set and
// this does not have it, insert a @missing_required_directive marker so the violation
// walker can emit BaseDirectiveNotInSubset.
//
// We can't implement SetExclude for Vec<SetDirectiveValue>, because it's subtly NOT empty
// if other has base_restricted directives that this is missing
fn exclude_directives(
    this: &[SetDirectiveValue],
    other: &[SetDirectiveValue],
    options: &SafeExclusionOptions,
) -> Vec<SetDirectiveValue> {
    let mut not_excluded = Vec::new();

    // Keep those directives NOT in the subset allowlist and NOT in other, or that are in other but is not a directive subset.
    for this_directive in this {
        if !options.subset_directives.contains(&this_directive.name.0)
            && other
                .named(this_directive.name)
                .is_none_or(|other_directive| {
                    !set_directive_value_is_subset_of(this_directive, other_directive)
                })
        {
            not_excluded.push(this_directive.clone());
        }
    }

    // For base_restricted_directives: if the directive is on the base but
    // missing from the subset, insert a @missing_required_directive marker so
    // the violation walker can emit BaseDirectiveNotInSubset.
    for other_directive in other {
        if options
            .base_restricted_directives
            .contains(&other_directive.name.0)
            && this
                .named(other_directive.name)
                .is_none_or(|this_directive| {
                    !set_directive_value_is_subset_of(this_directive, other_directive)
                })
        {
            not_excluded.push(build_missing_required_directive(other_directive))
        }
    }

    not_excluded
}

/// Semantic subset for SetDirectiveValue, ignoring Token/Span source positions
/// in directive argument values. Checks that 'this' is a subset of 'other'.
///
/// The derived PartialEq on DirectiveValue compares argument ConstantValues structurally,
/// which includes Token (containing Span { start, end }). Two semantically identical directives
/// parsed at different byte offsets compare as unequal. This function compares only the semantic
/// content: directive name, argument names, and argument values (ignoring source positions).
fn set_directive_value_is_subset_of(this: &SetDirectiveValue, other: &SetDirectiveValue) -> bool {
    if this.name != other.name {
        return false;
    }

    if this.arguments.is_empty() {
        // We merge directives with no arguments and directives with arguments, so we also consider
        // a no-argument directive as a subset of a directive with arguments.
        return true;
    }

    if this.arguments.len() != other.arguments.len() {
        return false;
    }

    this.arguments
        .iter()
        .zip(other.arguments.iter())
        .all(|(a, b)| a.name == b.name && constant_value_semantically_eq(&a.value, &b.value))
}

/// Semantic equality for ConstantValue, ignoring Token/Span source positions.
fn constant_value_semantically_eq(a: &ConstantValue, b: &ConstantValue) -> bool {
    match (a, b) {
        (ConstantValue::Int(a), ConstantValue::Int(b)) => a.value == b.value,
        (ConstantValue::Float(a), ConstantValue::Float(b)) => {
            a.value == b.value && a.source_value == b.source_value
        }
        (ConstantValue::String(a), ConstantValue::String(b)) => a.value == b.value,
        (ConstantValue::Boolean(a), ConstantValue::Boolean(b)) => a.value == b.value,
        (ConstantValue::Null(_), ConstantValue::Null(_)) => true,
        (ConstantValue::Enum(a), ConstantValue::Enum(b)) => a.value == b.value,
        (ConstantValue::List(a), ConstantValue::List(b)) => {
            a.items.len() == b.items.len()
                && a.items
                    .iter()
                    .zip(b.items.iter())
                    .all(|(a, b)| constant_value_semantically_eq(a, b))
        }
        (ConstantValue::Object(a), ConstantValue::Object(b)) => {
            a.items.len() == b.items.len()
                && a.items.iter().zip(b.items.iter()).all(|(a, b)| {
                    a.name.value == b.name.value
                        && constant_value_semantically_eq(&a.value, &b.value)
                })
        }
        _ => false,
    }
}

fn build_missing_required_directive(directive_from_other: &SetDirectiveValue) -> SetDirectiveValue {
    SetDirectiveValue {
        definition: None,
        name: *MISSING_REQUIRED_DIRECTIVE,
        arguments: vec![SetArgumentValue {
            definition: None,
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
        // This is not *quite* the same if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.values().all(|v| v.is_set_empty())
    }
}

impl<V: CanBeEmpty> CanBeEmpty for StringKeyIndexMap<V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same if there are no items in the set.
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
        // This is not *quite* the same if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.values().all(|v| v.is_set_empty())
    }
}

impl<V: CanBeEmpty> CanBeEmpty for Vec<V> {
    fn is_set_empty(&self) -> bool {
        // This is not *quite* the same if there are no items in the set.
        // If each item ended up being empty (for instance via an exclude), then the set is empty
        self.iter().all(|v| !v.is_set_empty())
    }
}

impl<V: SetExclude> SetExclude for StringKeyMap<V> {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        self.iter()
            .filter_map(|(k, v)| {
                if let Some(other_v) = other.get(k) {
                    // This key exists in both sets - exclude and filter if empty
                    let excluded = v.exclude(other_v, options);
                    if excluded.is_set_empty() {
                        None
                    } else {
                        Some((*k, excluded))
                    }
                } else {
                    // This key only exists in self - preserve it as-is
                    Some((*k, v.clone()))
                }
            })
            .collect()
    }
}

impl<K: Clone + Ord, V: SetExclude> SetExclude for BTreeMap<K, V> {
    fn exclude(&self, other: &Self, options: &SafeExclusionOptions) -> Self {
        self.iter()
            .filter_map(|(k, v)| {
                if let Some(other_v) = other.get(k) {
                    // This key exists in both sets - exclude and filter if empty
                    let excluded = v.exclude(other_v, options);
                    if excluded.is_set_empty() {
                        None
                    } else {
                        Some((k.clone(), excluded))
                    }
                } else {
                    // This key only exists in self - preserve it as-is
                    Some((k.clone(), v.clone()))
                }
            })
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
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
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
            let expected_doc = &format!("{}", set_from_str($expected).to_sdl_definition());
            let excluded_doc = &format!("{}", after_exclusion.to_sdl_definition());
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
            extend type A implements Y {
              id: ID!
            }

            extend type B @strong(field: "id")
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
            "extend type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_required_arg_added() {
        assert_base_exclude_expected!(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int!): String }",
            "extend type Query { myQ(a: Int!): String }",
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
            "extend type Query { myQ(a: Int): String }",
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
            "extend type Query { myQ(a: Int): String }",
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
            "extend type Query { myQ(a: Int): String }",
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
            "extend type Query { myQ(a: Int): String }",
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
            "extend type Query { myQ(a: Int!): String }",
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
            "extend type Query {q2: String}",
        );
    }

    #[test]
    fn test_field_nonnull_to_null() {
        assert_base_exclude_expected!(
            "type Query { myQ: String! }",
            "type Query { myQ: String }",
            "extend type Query { myQ: String! }",
        );
    }

    #[test]
    fn test_field_semantic_nonnull_to_null() {
        assert_base_exclude_expected!(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String }",
            "extend type Query { myQ: String @semanticNonNull }",
        );
    }

    #[test]
    fn test_field_null_to_nonnull() {
        assert_base_exclude_empty!("type Query { myQ: String }", "type Query { myQ: String! }");
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "type Query { myQ: String }",
            "type Query { myQ: String! }",
            "extend type Query { myQ: String }",
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
            "extend type Query { myQ: String }",
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
            "extend type Query { myQ: String! }",
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
            "extend type Query { myQ: String @semanticNonNull }",
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
            "extend type T { name1: String }",
        );
    }

    #[test]
    fn test_interface_removed() {
        assert_base_exclude_expected!(
            "type Concrete implements Inf { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
            "type Concrete { n: String! } interface Inf { n: String! } type Query { myQ: Concrete }",
            "extend type Concrete implements Inf",
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
        assert_base_exclude_expected!("union U = T | T2", "union U = T", "extend union U = T2");
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
            "extend enum T { Three }",
        );
    }

    #[test]
    fn test_enum_value_added() {
        assert_base_exclude_empty!("enum T { One, Two }", "enum T { One, Two, Three }");
        // Valid in spec but could cause compilation issues
        assert_base_exclude_expected!(
            "enum T { One, Two }",
            "enum T { One, Two, Three }",
            "extend enum T { Three }",
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
        assert_base_exclude_empty!(
            "enum T { One } type Query { myQ(arg: X): T } input X { field: String }",
            "enum T @deprecated { One @deprecated } type Query { myQ(arg: X @deprecated): T @deprecated } input X @deprecated { field: String @deprecated }",
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
            "extend enum T @deprecated { One @deprecated } extend type Query { myQ(arg: X @deprecated): T @deprecated } extend input X @deprecated { field: String @deprecated }",
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

    /// Regression test: directive value comparison should be semantic, ignoring source
    /// byte positions (Span). When two schemas contain semantically identical types with
    /// directive arguments, but the types are at different byte offsets (e.g., because one
    /// schema has extra types prepended), exclude should still recognize them as equal.
    #[test]
    fn directive_value_comparison_ignores_span() {
        // Both schemas contain the same type B with a directive that has arguments.
        // Schema "base" has an extra type A prepended, which shifts byte offsets
        // for everything after it. Schema "excluded" has the same type B starting
        // at a different byte position.
        //
        // The exclude should be empty for type B because it's semantically identical,
        // and should only show type A (which is only in base).
        let base = r#"
            type A {
                id: ID
            }
            type B @strong(field: "id") {
                id: ID
                name: String
            }
        "#;
        let excluded = r#"
            type B @strong(field: "id") {
                id: ID
                name: String
            }
        "#;

        // Type B is semantically identical in both schemas, only A is unique to base
        assert_base_exclude_expected!(
            base,
            excluded,
            r#"
            type A {
                id: ID
            }
            "#,
        );
    }

    /// Same test but with multiple directive arguments and different value types.
    #[test]
    fn directive_value_comparison_ignores_span_multiple_args() {
        let base = r#"
            type Padding { id: ID }
            type MyType @fb_owner(oncall: "my_oncall") @retention(purgeAfterMs: 86400000) {
                field: String
            }
        "#;
        let excluded = r#"
            type MyType @fb_owner(oncall: "my_oncall") @retention(purgeAfterMs: 86400000) {
                field: String
            }
        "#;

        assert_base_exclude_expected!(
            base,
            excluded,
            r#"
            type Padding {
                id: ID
            }
            "#,
        );
    }

    /// Test that directive comparison still detects actual semantic differences,
    /// even when at different byte positions.
    #[test]
    fn directive_value_comparison_detects_real_differences() {
        let base = r#"
            type Padding { id: ID }
            type MyType @strong(field: "id") {
                field: String
            }
        "#;
        let excluded = r#"
            type MyType @strong(field: "name") {
                field: String
            }
        "#;

        // The directive argument value is different ("id" vs "name"),
        // so MyType should appear in the diff
        assert_base_exclude_expected!(
            base,
            excluded,
            r#"
            type Padding {
                id: ID
            }
            extend type MyType @strong(field: "id")
            "#,
        );
    }

    #[test]
    fn test_exclude_preserves_empty_types_not_in_exclusion_set() {
        // Regression test: Empty types that are NOT in the exclusion set should
        // be preserved after exclusion. Previously, the exclude implementation
        // would filter out ALL empty types, including ones that weren't touched.
        let base = r#"
            scalar String
            scalar Int

            type EmptyType
        "#;
        let excluded = r#"
            scalar String
            scalar Int
        "#;

        // EmptyType has no fields (is "empty"), but it should be preserved
        // because it's not in the exclusion set.
        assert_base_exclude_expected!(
            base,
            excluded,
            r#"
            type EmptyType
            "#,
        );
    }

    /// A directive with no arguments is a subset of the same directive with arguments,
    /// matching the merge behavior where a no-arg directive adopts the other's arguments.
    #[test]
    fn directive_no_args_is_subset_of_directive_with_args() {
        assert_base_exclude_expected!(
            r#"
            type Padding { id: ID }
            type MyType @strong {
                field: String
            }
            "#,
            r#"
            type MyType @strong(field: "id") {
                field: String
            }
            "#,
            r#"
            type Padding {
                id: ID
            }
            "#,
        );
    }

    /// A directive WITH arguments is NOT a subset of the same directive with no arguments.
    /// This is asymmetric: no-args is subset of with-args, but not vice versa.
    #[test]
    fn directive_with_args_is_not_subset_of_directive_no_args() {
        assert_base_exclude_expected!(
            r#"
            type Padding { id: ID }
            type MyType @strong(field: "id") {
                field: String
            }
            "#,
            r#"
            type MyType @strong {
                field: String
            }
            "#,
            r#"
            type Padding {
                id: ID
            }
            extend type MyType @strong(field: "id")
            "#,
        );
    }

    /// Both directives have no arguments — they are equal and thus subsets of each other.
    #[test]
    fn directive_no_args_both_sides_excluded() {
        assert_base_exclude_expected!(
            r#"
            type Padding { id: ID }
            type MyType @deprecated {
                field: String
            }
            "#,
            r#"
            type MyType @deprecated {
                field: String
            }
            "#,
            r#"
            type Padding {
                id: ID
            }
            "#,
        );
    }

    /// Directives with different argument counts are NOT subsets (when both have args).
    #[test]
    fn directive_different_arg_count_not_excluded() {
        assert_base_exclude_expected!(
            r#"
            type MyType @strong(field: "id") {
                field: String
            }
            "#,
            r#"
            type MyType @strong(field: "id", other: "value") {
                field: String
            }
            "#,
            r#"
            extend type MyType @strong(field: "id")
            "#,
        );
    }

    /// For subset_directives: a no-arg subset directive in base is a subset of
    /// the with-arg version in exclude — result is empty.
    #[test]
    fn subset_directive_no_args_base_with_args_exclude() {
        assert_base_exclude_empty!(
            r#"
            type Query { myQ: String @deprecated }
            "#,
            r#"
            type Query { myQ: String @deprecated(reason: "use newQ") }
            "#,
            SafeExclusionOptions {
                subset_directives: ["deprecated".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            }
        );
    }

    /// For subset_directives: with-arg version on base, no-arg on exclude —
    /// the subset directive is stripped from self in the forward pass, so the
    /// result is empty.
    #[test]
    fn subset_directive_with_args_base_no_args_exclude() {
        assert_base_exclude_empty!(
            r#"
            type Query { myQ: String @deprecated(reason: "old") }
            "#,
            r#"
            type Query { myQ: String @deprecated }
            "#,
            SafeExclusionOptions {
                subset_directives: ["deprecated".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            }
        );
    }

    /// On fields: a no-arg directive on a field is a subset of the same directive with args.
    #[test]
    fn field_directive_no_args_subset_of_with_args() {
        assert_base_exclude_expected!(
            r#"
            type Padding { id: ID }
            type Query {
                myQ: String @deprecated
                other: Int
            }
            "#,
            r#"
            type Query {
                myQ: String @deprecated(reason: "use newQ")
                other: Int
            }
            "#,
            r#"
            type Padding {
                id: ID
            }
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_type_definition() {
        assert_base_exclude_expected!(
            r#"
            type Foo {
                id: ID
            }
            type Bar {
                name: String
            }
            "#,
            r#"
            extend type Foo {
                id: ID
            }
            "#,
            r#"
            type Foo
            type Bar {
                name: String
            }
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_interface_definition() {
        assert_base_exclude_expected!(
            r#"
            interface Foo {
                id: ID
            }
            "#,
            r#"
            extend interface Foo {
                id: ID
            }
            "#,
            r#"
            interface Foo
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_enum_definition() {
        assert_base_exclude_expected!(
            r#"
            enum Foo {
                A
                B
            }
            "#,
            r#"
            extend enum Foo {
                A
                B
            }
            "#,
            r#"
            enum Foo
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_union_definition() {
        assert_base_exclude_expected!(
            r#"
            type A { id: ID }
            type B { id: ID }
            union Foo = A | B
            "#,
            r#"
            extend union Foo = A | B
            "#,
            r#"
            type A {
                id: ID
            }
            type B {
                id: ID
            }
            union Foo
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_input_object_definition() {
        assert_base_exclude_expected!(
            r#"
            input Foo {
                id: ID
            }
            "#,
            r#"
            extend input Foo {
                id: ID
            }
            "#,
            r#"
            input Foo
            "#,
        );
    }

    #[test]
    fn test_extend_does_not_exclude_scalar_definition() {
        assert_base_exclude_expected!(
            r#"
            scalar Foo @deprecated
            "#,
            r#"
            extend scalar Foo @deprecated
            "#,
            r#"
            scalar Foo
            "#,
        );
    }

    // --- self=extend (definition None) excluding other=full (definition Some) tests ---
    //
    // These exercise the case where the base SchemaSet has only an `extend X`
    // (definition is None) and we exclude a full `type X` definition. The
    // result should keep `definition = None`, so any leftover fields/values
    // render as `extend X { ... }` rather than the full form.

    #[test]
    fn test_extend_type_minus_full_type_with_extra_field() {
        // self has `extend type Foo` with two fields; other is the full type
        // with only one field. Definition stays None (already None on self),
        // and the leftover `b` field renders inside `extend type Foo`.
        assert_base_exclude_expected!(
            r#"
            extend type Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            type Foo {
                a: ID
            }
            "#,
            r#"
            extend type Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_extend_interface_minus_full_interface_with_extra_field() {
        assert_base_exclude_expected!(
            r#"
            extend interface Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            interface Foo {
                a: ID
            }
            "#,
            r#"
            extend interface Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_extend_enum_minus_full_enum_with_extra_value() {
        assert_base_exclude_expected!(
            r#"
            extend enum Foo {
                A
                B
            }
            "#,
            r#"
            enum Foo {
                A
            }
            "#,
            r#"
            extend enum Foo {
                B
            }
            "#,
        );
    }

    #[test]
    fn test_extend_union_minus_full_union_with_extra_member() {
        assert_base_exclude_expected!(
            r#"
            type A { id: ID }
            type B { id: ID }
            extend union Foo = A | B
            "#,
            r#"
            type A { id: ID }
            type B { id: ID }
            union Foo = A
            "#,
            r#"
            extend union Foo = B
            "#,
        );
    }

    #[test]
    fn test_extend_input_object_minus_full_input_object_with_extra_field() {
        assert_base_exclude_expected!(
            r#"
            extend input Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            input Foo {
                a: ID
            }
            "#,
            r#"
            extend input Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_extend_scalar_minus_full_scalar_with_extra_directive() {
        // self has `extend scalar Foo @deprecated @other`; other is the full
        // `scalar Foo @deprecated`. The leftover `@other` directive renders as
        // `extend scalar Foo @other`.
        assert_base_exclude_expected!(
            r#"
            extend scalar Foo @deprecated @other
            "#,
            r#"
            scalar Foo @deprecated
            "#,
            r#"
            extend scalar Foo @other
            "#,
        );
    }

    // --- self=full (definition Some) excluding other=extend (definition None) tests ---
    //
    // The existing `test_extend_does_not_exclude_*_definition` tests cover the
    // case where self and other have the same fields (resulting in just the
    // bare `type Foo`). These tests cover the case where self has additional
    // fields beyond what other excludes — the leftover should stay inside the
    // full type definition, not become a separate `extend`.

    #[test]
    fn test_full_type_minus_extend_type_with_extra_field() {
        assert_base_exclude_expected!(
            r#"
            type Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            extend type Foo {
                a: ID
            }
            "#,
            r#"
            type Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_full_interface_minus_extend_interface_with_extra_field() {
        assert_base_exclude_expected!(
            r#"
            interface Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            extend interface Foo {
                a: ID
            }
            "#,
            r#"
            interface Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_full_enum_minus_extend_enum_with_extra_value() {
        assert_base_exclude_expected!(
            r#"
            enum Foo {
                A
                B
            }
            "#,
            r#"
            extend enum Foo {
                A
            }
            "#,
            r#"
            enum Foo {
                B
            }
            "#,
        );
    }

    #[test]
    fn test_full_union_minus_extend_union_with_extra_member() {
        assert_base_exclude_expected!(
            r#"
            type A { id: ID }
            type B { id: ID }
            union Foo = A | B
            "#,
            r#"
            type A { id: ID }
            type B { id: ID }
            extend union Foo = A
            "#,
            r#"
            union Foo = B
            "#,
        );
    }

    #[test]
    fn test_full_input_object_minus_extend_input_object_with_extra_field() {
        assert_base_exclude_expected!(
            r#"
            input Foo {
                a: ID
                b: String
            }
            "#,
            r#"
            extend input Foo {
                a: ID
            }
            "#,
            r#"
            input Foo {
                b: String
            }
            "#,
        );
    }

    #[test]
    fn test_full_scalar_minus_extend_scalar_with_extra_directive() {
        assert_base_exclude_expected!(
            r#"
            scalar Foo @deprecated @other
            "#,
            r#"
            extend scalar Foo @deprecated
            "#,
            r#"
            scalar Foo @other
            "#,
        );
    }

    #[test]
    fn base_restricted_type_directive_missing_from_self() {
        assert_base_exclude_expected!(
            r#"type T { f: String } type Query { q: T }"#,
            r#"type T @source(name: "x") { f: String } type Query { q: T }"#,
            r#"extend type T @missing_required_directive(name: "source")"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_type_directive_present_on_both() {
        assert_base_exclude_empty!(
            r#"type T @source(name: "x") { f: String } type Query { q: T }"#,
            r#"type T @source(name: "x") { f: String } type Query { q: T }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_field_directive_missing_from_self() {
        assert_base_exclude_expected!(
            r#"type Query { q: String }"#,
            r#"type Query { q: String @source(name: "x") }"#,
            r#"extend type Query { q: String @missing_required_directive(name: "source") }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_field_directive_present_on_both() {
        assert_base_exclude_empty!(
            r#"type Query { q: String @source(name: "x") }"#,
            r#"type Query { q: String @source(name: "x") }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_does_not_affect_non_restricted_directives() {
        assert_base_exclude_empty!(
            r#"type T { f: String } type Query { q: T }"#,
            r#"type T @other_directive { f: String } type Query { q: T }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_partial_field_coverage() {
        assert_base_exclude_expected!(
            r#"type T { a: String @source(name: "x"), b: Int } type Query { q: T }"#,
            r#"type T { a: String @source(name: "x"), b: Int @source(name: "y") } type Query { q: T }"#,
            r#"extend type T { b: Int @missing_required_directive(name: "source") }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_on_interface_field() {
        assert_base_exclude_expected!(
            r#"interface I { f: String } type Query { q: I }"#,
            r#"interface I { f: String @source(name: "x") } type Query { q: I }"#,
            r#"extend interface I { f: String @missing_required_directive(name: "source") }"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_on_enum_type() {
        assert_base_exclude_expected!(
            r#"enum E { A, B } type Query { q: E }"#,
            r#"enum E @source(name: "x") { A, B } type Query { q: E }"#,
            r#"extend enum E @missing_required_directive(name: "source")"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
        );
    }

    #[test]
    fn base_restricted_on_input_type() {
        assert_base_exclude_expected!(
            r#"input I { f: String } type Query { q(i: I): String }"#,
            r#"input I @source(name: "x") { f: String } type Query { q(i: I): String }"#,
            r#"extend input I @missing_required_directive(name: "source")"#,
            SafeExclusionOptions {
                base_restricted_directives: ["source".intern()].iter().cloned().collect(),
                ..SafeExclusionOptions::default()
            },
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
    fn test_exclude_extension_field_only_keeps_base_field() {
        // Original has both a base field and a client-extension field on Query.
        // We exclude only the extension-tagged field; the base field must remain
        // and the extensions half should now be empty.
        let original = set_from_base_and_extensions(
            "type Query { name: String }",
            "extend type Query { client_field: Int }",
        );
        let to_exclude =
            set_from_base_and_extensions("", "extend type Query { client_field: Int }");
        let after = original.exclude(&to_exclude, &SafeExclusionOptions::default());

        assert_base_and_extensions_eq!(after, "type Query { name: String }", "");
    }

    #[test]
    fn test_exclude_one_extension_field_keeps_other_extension_fields() {
        // Excluding a single extension-tagged field should leave both the base
        // half and the other extension field untouched.
        let original = set_from_base_and_extensions(
            "type Query { name: String age: Int }",
            "extend type Query { c1: Int c2: String }",
        );
        let to_exclude = set_from_base_and_extensions("", "extend type Query { c1: Int }");
        let after = original.exclude(&to_exclude, &SafeExclusionOptions::default());

        assert_base_and_extensions_eq!(
            after,
            "type Query { name: String age: Int }",
            "extend type Query { c2: String }",
        );
    }
}
