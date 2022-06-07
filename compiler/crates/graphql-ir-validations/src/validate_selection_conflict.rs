/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use self::ignoring_type_and_location::arguments_equals;
use common::{Diagnostic, DiagnosticsResult, Location, PointerAddress};
use dashmap::{DashMap, DashSet};
use errors::{par_try_map, validate_map};
use graphql_ir::{
    node_identifier::LocationAgnosticBehavior, Argument, Field as IRField, FragmentDefinition,
    LinkedField, OperationDefinition, Program, ScalarField, Selection,
};
use intern::string_key::StringKey;
use schema::{SDLSchema, Schema, Type, TypeReference};
use std::collections::HashMap;
use std::marker::PhantomData;
use std::sync::Arc;
use thiserror::Error;

pub fn validate_selection_conflict<B: LocationAgnosticBehavior + Sync>(
    program: &Program,
    cache_verified_fields: bool,
) -> DiagnosticsResult<()> {
    ValidateSelectionConflict::<B>::new(program, cache_verified_fields).validate_program(program)
}

#[derive(Clone, PartialEq, Debug)]
enum Field<'s> {
    LinkedField(&'s LinkedField),
    ScalarField(&'s ScalarField),
}

type Fields<'s> = HashMap<StringKey, Vec<Field<'s>>>;

struct ValidateSelectionConflict<'s, TBehavior: LocationAgnosticBehavior> {
    program: &'s Program,
    fragment_cache: DashMap<StringKey, Arc<Fields<'s>>>,
    fields_cache: DashMap<PointerAddress, Arc<Fields<'s>>>,
    cache_verified_fields: bool,
    verified_fields_pair: DashSet<(PointerAddress, PointerAddress)>,
    _behavior: PhantomData<TBehavior>,
}

impl<'s, B: LocationAgnosticBehavior + Sync> ValidateSelectionConflict<'s, B> {
    fn new(program: &'s Program, cache_verified_fields: bool) -> Self {
        Self {
            program,
            fragment_cache: Default::default(),
            fields_cache: Default::default(),
            cache_verified_fields,
            verified_fields_pair: DashSet::new(),
            _behavior: PhantomData::<B>,
        }
    }

    fn validate_program(&self, program: &'s Program) -> DiagnosticsResult<()> {
        // NOTE: Fragments may be visited multiple times due to the parallel traversal for
        // operations! Today the extra overhead is acceptable, compared to single thread
        // `try_map` for opeartions.
        // TODO: visit the fragments in parallel with topology order before visiting the operations.
        par_try_map(&program.operations, |operation| {
            self.validate_operation(operation)
        })?;
        Ok(())
    }

    fn validate_operation(&self, operation: &'s OperationDefinition) -> DiagnosticsResult<()> {
        self.validate_selections(&operation.selections)?;
        Ok(())
    }

    fn validate_selections(&self, selections: &'s [Selection]) -> DiagnosticsResult<Fields<'s>> {
        let mut fields = Default::default();
        validate_map(selections, |selection| {
            self.validate_selection(&mut fields, selection)
        })?;
        Ok(fields)
    }

    fn validate_selection(
        &self,
        fields: &mut Fields<'s>,
        selection: &'s Selection,
    ) -> DiagnosticsResult<()> {
        match selection {
            Selection::LinkedField(field) => {
                self.validate_linked_field_selections(field)?;
                let field = Field::LinkedField(field.as_ref());
                self.validate_and_insert_field_selection(fields, &field, false)
            }
            Selection::ScalarField(field) => {
                let field = Field::ScalarField(field.as_ref());
                self.validate_and_insert_field_selection(fields, &field, false)
            }
            Selection::Condition(condition) => {
                let new_fields = self.validate_selections(&condition.selections)?;
                self.validate_and_merge_fields(fields, &new_fields, false)
            }
            Selection::InlineFragment(fragment) => {
                let new_fields = self.validate_selections(&fragment.selections)?;
                self.validate_and_merge_fields(fields, &new_fields, false)
            }
            Selection::FragmentSpread(spread) => {
                let fragment = self.program.fragment(spread.fragment.item).unwrap();
                let new_fields = self.validate_and_collect_fragment(fragment)?;
                self.validate_and_merge_fields(fields, &new_fields, false)
            }
        }
    }

    fn validate_and_collect_fragment(
        &self,
        fragment: &'s FragmentDefinition,
    ) -> DiagnosticsResult<Arc<Fields<'s>>> {
        if let Some(cached) = self.fragment_cache.get(&fragment.name.item) {
            return Ok(Arc::clone(&cached));
        }
        let fields = Arc::new(self.validate_selections(&fragment.selections)?);
        self.fragment_cache
            .insert(fragment.name.item, Arc::clone(&fields));
        Ok(fields)
    }

    fn validate_linked_field_selections(
        &self,
        field: &'s LinkedField,
    ) -> DiagnosticsResult<Arc<Fields<'s>>> {
        let key = PointerAddress::new(field);
        if let Some(fields) = self.fields_cache.get(&key) {
            return Ok(Arc::clone(&fields));
        }
        let fields = Arc::new(self.validate_selections(&field.selections)?);
        self.fields_cache.insert(key, Arc::clone(&fields));
        Ok(fields)
    }

    fn validate_and_merge_fields(
        &self,
        left: &mut Fields<'s>,
        right: &Fields<'s>,
        parent_fields_mutually_exclusive: bool,
    ) -> DiagnosticsResult<()> {
        validate_map(right.values().flatten(), |field| {
            self.validate_and_insert_field_selection(left, field, parent_fields_mutually_exclusive)
        })
    }

    fn validate_and_insert_field_selection(
        &self,
        fields: &mut Fields<'s>,
        field: &Field<'s>,
        parent_fields_mutually_exclusive: bool,
    ) -> DiagnosticsResult<()> {
        let key = field.get_response_key(&self.program.schema);
        if !fields.contains_key(&key) {
            fields.entry(key).or_default().push(field.clone());
            return Ok(());
        }

        let mut errors = vec![];

        for existing_field in fields.get(&key).unwrap() {
            if field == existing_field {
                return if errors.is_empty() {
                    Ok(())
                } else {
                    Err(errors)
                };
            }

            if self.cache_verified_fields {
                let addr1 = PointerAddress::new(&field);
                let addr2 = PointerAddress::new(existing_field);
                let pair_hash = (addr1, addr2);
                let pair_hash2 = (addr2, addr1);

                if self.verified_fields_pair.contains(&pair_hash)
                    || self.verified_fields_pair.contains(&pair_hash2)
                {
                    continue;
                }
            }

            let l_definition = existing_field.get_field_definition(&self.program.schema);
            let r_definition = field.get_field_definition(&self.program.schema);

            let is_parent_fields_mutually_exclusive = || {
                parent_fields_mutually_exclusive
                    || l_definition.parent_type != r_definition.parent_type
                        && matches!(
                            (l_definition.parent_type, r_definition.parent_type),
                            (Some(Type::Object(_)), Some(Type::Object(_)))
                        )
            };

            match (existing_field, &field) {
                (Field::LinkedField(l), Field::LinkedField(r)) => {
                    let fields_mutually_exclusive = is_parent_fields_mutually_exclusive();
                    if !fields_mutually_exclusive {
                        if let Err(err) = self.validate_same_field(
                            key,
                            l_definition.name.item,
                            r_definition.name.item,
                            *l,
                            *r,
                        ) {
                            errors.push(err)
                        };
                    }
                    if has_same_type_reference_wrapping(&l_definition.type_, &r_definition.type_) {
                        let mut l_fields = self.validate_linked_field_selections(l)?;
                        let r_fields = self.validate_linked_field_selections(r)?;

                        if let Err(errs) = self.validate_and_merge_fields(
                            Arc::make_mut(&mut l_fields),
                            &r_fields,
                            fields_mutually_exclusive,
                        ) {
                            errors.extend(errs);
                        }
                    } else {
                        errors.push(
                            Diagnostic::error(
                                ValidationMessage::AmbiguousFieldType {
                                    response_key: key,
                                    l_name: l_definition.name.item,
                                    r_name: r_definition.name.item,
                                    l_type_string: self
                                        .program
                                        .schema
                                        .get_type_string(&l_definition.type_),
                                    r_type_string: self
                                        .program
                                        .schema
                                        .get_type_string(&r_definition.type_),
                                },
                                l.definition.location,
                            )
                            .annotate("the other field", r.definition.location),
                        );
                    }
                }
                (Field::ScalarField(l), Field::ScalarField(r)) => {
                    if !is_parent_fields_mutually_exclusive() {
                        if let Err(err) = self.validate_same_field(
                            key,
                            l_definition.name.item,
                            r_definition.name.item,
                            *l,
                            *r,
                        ) {
                            errors.push(err)
                        };
                    } else if l_definition.type_ != r_definition.type_ {
                        errors.push(
                            Diagnostic::error(
                                ValidationMessage::AmbiguousFieldType {
                                    response_key: key,
                                    l_name: l_definition.name.item,
                                    r_name: r_definition.name.item,
                                    l_type_string: self
                                        .program
                                        .schema
                                        .get_type_string(&l_definition.type_),
                                    r_type_string: self
                                        .program
                                        .schema
                                        .get_type_string(&r_definition.type_),
                                },
                                l.definition.location,
                            )
                            .annotate("the other field", r.definition.location),
                        );
                    }
                }
                (existing_field, _) => {
                    errors.push(
                        Diagnostic::error(
                            ValidationMessage::AmbiguousFieldType {
                                response_key: key,
                                l_name: l_definition.name.item,
                                r_name: r_definition.name.item,
                                l_type_string: self
                                    .program
                                    .schema
                                    .get_type_string(&l_definition.type_),
                                r_type_string: self
                                    .program
                                    .schema
                                    .get_type_string(&r_definition.type_),
                            },
                            existing_field.loc(),
                        )
                        .annotate("the other field", field.loc()),
                    );
                }
            }

            // save the verified pair into cache
            if self.cache_verified_fields && errors.is_empty() {
                let addr1 = PointerAddress::new(&field);
                let addr2 = PointerAddress::new(existing_field);
                let pair_hash = (addr1, addr2);
                self.verified_fields_pair.insert(pair_hash);
            }
        }
        if errors.is_empty() {
            fields.entry(key).or_default().push(field.clone());
            Ok(())
        } else {
            Err(errors)
        }
    }

    fn validate_same_field<F: IRField>(
        &self,
        response_key: StringKey,
        l_name: StringKey,
        r_name: StringKey,
        l: &F,
        r: &F,
    ) -> Result<(), Diagnostic> {
        if l_name != r_name {
            Err(Diagnostic::error(
                ValidationMessage::AmbiguousFieldAlias {
                    response_key,
                    l_name,
                    r_name,
                },
                l.definition().location,
            )
            .annotate("the other field", r.definition().location))
        } else if !(arguments_equals::<B>(l.arguments(), r.arguments())) {
            Err(self.create_conflicting_fields_error(
                response_key,
                l.definition().location,
                l.arguments(),
                r.definition().location,
                r.arguments(),
            ))
        } else {
            let left_stream_directive = l
                .directives()
                .iter()
                .find(|d| d.name.item.lookup() == "stream");
            let right_stream_directive = r
                .directives()
                .iter()
                .find(|d| d.name.item.lookup() == "stream");
            match (left_stream_directive, right_stream_directive) {
                (Some(_), None) => Err(Diagnostic::error(
                    ValidationMessage::StreamConflictOnlyUsedInOnePlace { response_key },
                    l.definition().location,
                )
                .annotate("not marked in", r.definition().location)),
                (None, Some(_)) => Err(Diagnostic::error(
                    ValidationMessage::StreamConflictOnlyUsedInOnePlace { response_key },
                    r.definition().location,
                )
                .annotate("not marked in", l.definition().location)),
                (Some(_), Some(_)) => Err(Diagnostic::error(
                    ValidationMessage::StreamConflictUsedInMultiplePlaces { response_key },
                    l.definition().location,
                )
                .annotate("the other field", r.definition().location)),
                (None, None) => Ok(()),
            }
        }
    }

    fn create_conflicting_fields_error(
        &self,
        field_name: StringKey,
        location_a: Location,
        arguments_a: &[Argument],
        location_b: Location,
        arguments_b: &[Argument],
    ) -> Diagnostic {
        Diagnostic::error(
            ValidationMessage::InvalidSameFieldWithDifferentArguments {
                field_name,
                arguments_a: graphql_text_printer::print_arguments(
                    &self.program.schema,
                    arguments_a,
                    graphql_text_printer::PrinterOptions::default(),
                ),
            },
            location_a,
        )
        .annotate(
            format!(
                "which conflicts with this field with applied argument values {}",
                graphql_text_printer::print_arguments(
                    &self.program.schema,
                    arguments_b,
                    graphql_text_printer::PrinterOptions::default()
                ),
            ),
            location_b,
        )
    }
}

fn has_same_type_reference_wrapping(l: &TypeReference, r: &TypeReference) -> bool {
    match (l, r) {
        (TypeReference::Named(_), TypeReference::Named(_)) => true,
        (TypeReference::NonNull(l), TypeReference::NonNull(r))
        | (TypeReference::List(l), TypeReference::List(r)) => {
            has_same_type_reference_wrapping(l, r)
        }
        _ => false,
    }
}

impl<'s> Field<'s> {
    fn get_response_key(&self, schema: &SDLSchema) -> StringKey {
        match self {
            Field::LinkedField(f) => f.alias_or_name(schema),
            Field::ScalarField(f) => f.alias_or_name(schema),
        }
    }

    fn get_field_definition(&self, schema: &'s SDLSchema) -> &'s schema::definitions::Field {
        match self {
            Field::LinkedField(f) => schema.field(f.definition.item),
            Field::ScalarField(f) => schema.field(f.definition.item),
        }
    }

    fn loc(&self) -> Location {
        match self {
            Field::LinkedField(f) => f.definition.location,
            Field::ScalarField(f) => f.definition.location,
        }
    }
}

mod ignoring_type_and_location {
    use graphql_ir::node_identifier::{LocationAgnosticBehavior, LocationAgnosticPartialEq};
    use graphql_ir::{Argument, Value};

    /// Verify that two sets of arguments are equivalent - same argument names
    /// and values. Notably, this ignores the types of arguments and values,
    /// which may not always be inferred identically.
    pub fn arguments_equals<B: LocationAgnosticBehavior>(a: &[Argument], b: &[Argument]) -> bool {
        order_agnostic_slice_equals(a, b, |a, b| {
            a.name.location_agnostic_eq::<B>(&b.name)
                && value_equals::<B>(&a.value.item, &b.value.item)
        })
    }

    fn value_equals<B: LocationAgnosticBehavior>(a: &Value, b: &Value) -> bool {
        match (a, b) {
            (Value::Constant(a), Value::Constant(b)) => a.location_agnostic_eq::<B>(b),
            (Value::Variable(a), Value::Variable(b)) => a.name.location_agnostic_eq::<B>(&b.name),
            (Value::List(a), Value::List(b)) => slice_equals(a, b, value_equals::<B>),
            (Value::Object(a), Value::Object(b)) => arguments_equals::<B>(a, b),
            _ => false,
        }
    }

    fn order_agnostic_slice_equals<T, F>(a: &[T], b: &[T], eq: F) -> bool
    where
        F: Fn(&T, &T) -> bool,
    {
        if a.len() != b.len() {
            false
        } else {
            let len = a.len();
            let mut matched = vec![false; len];
            for l in a {
                for i in 0..len {
                    if !matched[i] && eq(l, &b[i]) {
                        matched[i] = true;
                        break;
                    }
                }
            }
            matched.into_iter().all(|v| v)
        }
    }

    fn slice_equals<T, F>(a: &[T], b: &[T], eq: F) -> bool
    where
        F: Fn(&T, &T) -> bool,
    {
        a.len() == b.len() && a.iter().zip(b).all(|(a, b)| eq(a, b))
    }
}

#[derive(Clone, Debug, Error, Eq, PartialEq, Ord, PartialOrd, Hash)]
enum ValidationMessage {
    #[error(
        "Field '{response_key}' is ambiguous because it references two different fields: '{l_name}' and '{r_name}'"
    )]
    AmbiguousFieldAlias {
        response_key: StringKey,
        l_name: StringKey,
        r_name: StringKey,
    },

    #[error(
        "Field '{response_key}' is ambiguous because it references fields with different types: '{l_name}' with type '{l_type_string}' and '{r_name}' with type '{r_type_string}'"
    )]
    AmbiguousFieldType {
        response_key: StringKey,
        l_name: StringKey,
        l_type_string: String,
        r_name: StringKey,
        r_type_string: String,
    },

    #[error(
        "Expected all fields on the same parent with the name or alias `{field_name}` to have the same argument values after applying fragment arguments. This field has the applied argument values: {arguments_a}"
    )]
    InvalidSameFieldWithDifferentArguments {
        field_name: StringKey,
        arguments_a: String,
    },

    #[error(
        "Field '{response_key}' is marked with @stream in one place, and not marked in another place. Please use alias to distinguish the 2 fields.'"
    )]
    StreamConflictOnlyUsedInOnePlace { response_key: StringKey },

    #[error(
        "Field '{response_key}' is marked with @stream in multiple places. Please use an alias to distinguish them'"
    )]
    StreamConflictUsedInMultiplePlaces { response_key: StringKey },
}
