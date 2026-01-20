/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::collections::HashSet;
use std::collections::VecDeque;
use std::marker::PhantomData;
use std::sync::Arc;

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::PointerAddress;
use dashmap::DashMap;
use dashmap::DashSet;
use errors::par_try_map;
use errors::validate_map;
use graphql_ir::Argument;
use graphql_ir::Field as IRField;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::node_identifier::LocationAgnosticBehavior;
use intern::Lookup;
use intern::string_key::StringKey;
use relay_config::ProjectConfig;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use schema::TypeReference;
use thiserror::Error;

use self::ignoring_type_and_location::arguments_equals;

/// Note:set `further_optimization` will enable: (1) cache the paired-fields; and (2) avoid duplicate fragment validations in multi-core machines.
pub fn validate_selection_conflict<B: LocationAgnosticBehavior + Sync>(
    program: &Program,
    project_config: &ProjectConfig,
    further_optimization: bool,
) -> DiagnosticsResult<()> {
    ValidateSelectionConflict::<B>::new(program, project_config, further_optimization)
        .validate_program(program)
}

#[derive(Clone, PartialEq, Debug)]
enum Field<'s> {
    LinkedField(&'s LinkedField),
    ScalarField(&'s ScalarField),
}

type Fields<'s> = HashMap<StringKey, Vec<Field<'s>>, intern::BuildIdHasher<u32>>;

struct ValidateSelectionConflict<'s, TBehavior: LocationAgnosticBehavior> {
    program: &'s Program,
    project_config: &'s ProjectConfig,
    fragment_cache: DashMap<StringKey, Arc<Fields<'s>>, intern::BuildIdHasher<u32>>,
    fields_cache: DashMap<PointerAddress, Arc<Fields<'s>>>,
    further_optimization: bool,
    verified_fields_pair: DashSet<(PointerAddress, PointerAddress, bool)>,
    _behavior: PhantomData<TBehavior>,
}

impl<'s, B: LocationAgnosticBehavior + Sync> ValidateSelectionConflict<'s, B> {
    fn new(
        program: &'s Program,
        project_config: &'s ProjectConfig,
        further_optimization: bool,
    ) -> Self {
        Self {
            program,
            project_config,
            fragment_cache: Default::default(),
            fields_cache: Default::default(),
            further_optimization,
            verified_fields_pair: Default::default(),
            _behavior: PhantomData::<B>,
        }
    }

    fn validate_program(&self, program: &'s Program) -> DiagnosticsResult<()> {
        if self.further_optimization {
            self.prewarm_fragments(program)?;
        }

        par_try_map(&program.operations, |operation| {
            self.validate_operation(operation)
        })?;
        Ok(())
    }

    fn prewarm_fragments(&self, program: &'s Program) -> DiagnosticsResult<()> {
        // Validate the fragments in topology order.
        let mut unclaimed_fragment_queue: VecDeque<FragmentDefinitionName> = VecDeque::new();

        // Construct the dependency graph, which is represented by two maps:
        // DAG1: fragment K -> Used by: {Fragment v_1, v_2, v_3, ...}
        // DAG2: fragment K -> Spreading: {Fragment v_1, v_2, v_3, ...}
        let mut dag_used_by: HashMap<FragmentDefinitionName, HashSet<FragmentDefinitionName>> =
            HashMap::new();
        let mut dag_spreading: HashMap<FragmentDefinitionName, HashSet<FragmentDefinitionName>> =
            HashMap::new();
        for fragment in program.fragments() {
            let fragment_ = fragment.name.item;
            let spreads = fragment
                .selections
                .iter()
                .flat_map(|s| s.spreaded_fragments())
                .collect::<Vec<_>>();

            for spread in &spreads {
                let spread_ = spread.fragment.item;
                // got "fragment_" spreads "...spread_"
                dag_used_by.entry(spread_).or_default().insert(fragment_);
                dag_spreading.entry(fragment_).or_default().insert(spread_);
            }
            if spreads.is_empty() {
                unclaimed_fragment_queue.push_back(fragment_);
            }
        }

        let dummy_hashset = HashSet::new();
        while let Some(visiting) = unclaimed_fragment_queue.pop_front() {
            self.validate_and_collect_fragment(
                program
                    .fragment(visiting)
                    .expect("fragment must have been registered"),
            )?;

            for used_by in dag_used_by.get(&visiting).unwrap_or(&dummy_hashset) {
                // fragment "used_by" now can assume "...now" cached.
                let entries = dag_spreading.entry(*used_by).or_default();
                entries.remove(&visiting);
                if entries.is_empty() {
                    unclaimed_fragment_queue.push_back(*used_by);
                }
            }
        }
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
                if !self.should_validate_selection(field.definition.item) {
                    return Ok(());
                }
                self.validate_linked_field_selections(field)?;
                let field = Field::LinkedField(field.as_ref());
                self.validate_and_insert_field_selection(fields, &field, false)
            }
            Selection::ScalarField(field) => {
                if !self.should_validate_selection(field.definition.item) {
                    return Ok(());
                }
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

    fn should_validate_selection(&self, field_id: FieldID) -> bool {
        let schema_field = self.program.schema.field(field_id);
        let unselectable_directive_name = self
            .project_config
            .schema_config
            .unselectable_directive_name;
        schema_field
            .directives
            .named(unselectable_directive_name)
            .is_none()
    }

    fn validate_and_collect_fragment(
        &self,
        fragment: &'s FragmentDefinition,
    ) -> DiagnosticsResult<Arc<Fields<'s>>> {
        if let Some(cached) = self.fragment_cache.get(&fragment.name.item.0) {
            return Ok(Arc::clone(&cached));
        }
        let fields = Arc::new(self.validate_selections(&fragment.selections)?);
        self.fragment_cache
            .insert(fragment.name.item.0, Arc::clone(&fields));
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
        let addr1 = field.pointer_address();

        for existing_field in fields.get(&key).unwrap() {
            if field == existing_field {
                return if errors.is_empty() {
                    Ok(())
                } else {
                    Err(errors)
                };
            }

            let addr2 = existing_field.pointer_address();
            if self.further_optimization
                && self.verified_fields_pair.contains(&(
                    addr1,
                    addr2,
                    parent_fields_mutually_exclusive,
                ))
            {
                continue;
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
                    if !fields_mutually_exclusive
                        && let Err(err) = self.validate_same_field(
                            key,
                            l_definition.name.item,
                            r_definition.name.item,
                            *l,
                            *r,
                        )
                    {
                        errors.push(err);
                    };
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
                            errors.push(err);
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

            // Save the verified pair into cache. The same pair of fields can appear under different parent
            // fields, and the validation rule differs according to `parent_fields_mutually_exclusive`.
            if self.further_optimization {
                self.verified_fields_pair
                    .insert((addr1, addr2, parent_fields_mutually_exclusive));
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
                .find(|d| d.name.item.0.lookup() == "stream");
            let right_stream_directive = r
                .directives()
                .iter()
                .find(|d| d.name.item.0.lookup() == "stream");
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
        let arguments_a_printed = graphql_text_printer::print_arguments(
            &self.program.schema,
            arguments_a,
            graphql_text_printer::PrinterOptions::default(),
        );
        let arguments_b_printed = graphql_text_printer::print_arguments(
            &self.program.schema,
            arguments_b,
            graphql_text_printer::PrinterOptions::default(),
        );

        Diagnostic::error(
            ValidationMessage::InvalidSameFieldWithDifferentArguments {
                field_name,
                arguments_a: arguments_a_printed.clone(),
            },
            location_a,
        )
        .annotate(
            format!(
                "which conflicts with this field with applied argument values {}",
                &arguments_b_printed,
            ),
            location_b,
        )
        .metadata_for_machine("err", "InvalidSameFieldWithDifferentArguments")
        .metadata_for_machine("field_name", field_name.lookup())
        .metadata_for_machine("arg_a", arguments_a_printed)
        .metadata_for_machine("arg_b", arguments_b_printed)
        .metadata_for_machine("loc_a", format!("{location_a:?}"))
        .metadata_for_machine("loc_b", format!("{location_b:?}"))
    }
}

fn has_same_type_reference_wrapping(l: &TypeReference<Type>, r: &TypeReference<Type>) -> bool {
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

    fn pointer_address(&self) -> PointerAddress {
        match self {
            Field::LinkedField(f) => PointerAddress::new(&f.definition),
            Field::ScalarField(f) => PointerAddress::new(&f.definition),
        }
    }
}

mod ignoring_type_and_location {
    use graphql_ir::Argument;
    use graphql_ir::Value;
    use graphql_ir::node_identifier::LocationAgnosticBehavior;
    use graphql_ir::node_identifier::LocationAgnosticPartialEq;

    /// Verify that two sets of arguments are equivalent - same argument names
    /// and values. Notably, this ignores the types of arguments and values,
    /// which may not always be inferred identically.
    pub fn arguments_equals<B: LocationAgnosticBehavior>(a: &[Argument], b: &[Argument]) -> bool {
        order_agnostic_slice_equals(a, b, |a, b| {
            a.name.item.0.location_agnostic_eq::<B>(&b.name.item.0)
                && value_equals::<B>(&a.value.item, &b.value.item)
        })
    }

    fn value_equals<B: LocationAgnosticBehavior>(a: &Value, b: &Value) -> bool {
        match (a, b) {
            (Value::Constant(a), Value::Constant(b)) => a.location_agnostic_eq::<B>(b),
            (Value::Variable(a), Value::Variable(b)) => {
                a.name.item.0.location_agnostic_eq::<B>(&b.name.item.0)
            }
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

#[derive(
    Clone,
    Debug,
    Error,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Hash,
    serde::Serialize
)]
#[serde(tag = "type")]
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
        "Field '{response_key}' is marked with @stream in one place, and not marked in another place. Please use an alias to distinguish the two fields."
    )]
    StreamConflictOnlyUsedInOnePlace { response_key: StringKey },

    #[error(
        "Field '{response_key}' is marked with @stream in multiple places. Please use an alias to distinguish them."
    )]
    StreamConflictUsedInMultiplePlaces { response_key: StringKey },
}
