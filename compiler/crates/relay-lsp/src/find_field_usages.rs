/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod find_field_locations;

use std::collections::HashMap;
use std::sync::Arc;

use common::Location as IRLocation;
use common::WithLocation;
pub(crate) use find_field_locations::find_field_locations;
use graphql_ir::FragmentDefinition;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Visitor;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use itertools::Itertools;
use lsp_types::request::Request;
use schema::FieldID;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;
use serde::Deserialize;
use serde::Serialize;

use crate::LSPRuntimeError;
use crate::LSPRuntimeResult;
use crate::location::transform_relay_location_on_disk_to_lsp_location;
use crate::server::GlobalState;

// This implementation of FindFieldUsages find matching fields in:
//   - exact type matches
//   - subtypes (of the input type)
//   - (not supertypes, since this could introduce many false positives)
// It currently does a shallow traversal of Operations and Fragments,
//  not following fragment spreads to named fragments
//   - this could result in false negatives, but saves on memory / time
pub struct FindFieldUsages {}

#[derive(Deserialize, Serialize)]
pub struct FindFieldUsagesParams {
    pub schema_name: String,
    pub type_name: String,
    pub field_name: String,
}

#[derive(Deserialize, Serialize)]
struct FindFieldUsageResultItem {
    location_uri: String,
    location_range: lsp_types::Range,
    label: String,
}

#[derive(Deserialize, Serialize)]
pub struct FindFieldUsagesResult {
    usages: Vec<FindFieldUsageResultItem>,
}

impl Request for FindFieldUsages {
    type Params = FindFieldUsagesParams;
    type Result = FindFieldUsagesResult;
    const METHOD: &'static str = "relay/findFieldUsages";
}

pub fn on_find_field_usages(
    state: &impl GlobalState,
    params: <FindFieldUsages as Request>::Params,
) -> LSPRuntimeResult<<FindFieldUsages as Request>::Result> {
    let schema_name = params.schema_name.intern();
    let type_name = params.type_name.intern();
    let field_name = params.field_name.intern();

    let schema = state.get_schema(&schema_name)?;
    let program = state.get_program(&schema_name)?;
    let root_dir = &state.root_dir();

    let ir_locations = get_usages(&program, &schema, type_name, field_name)?;
    let lsp_locations = ir_locations
        .into_iter()
        .map(|(label, ir_location)| {
            let lsp_location =
                transform_relay_location_on_disk_to_lsp_location(root_dir, ir_location)?;
            Ok(FindFieldUsageResultItem {
                location_uri: lsp_location.uri.to_string(),
                location_range: lsp_location.range,
                label,
            })
        })
        .collect::<Result<Vec<_>, LSPRuntimeError>>()?;
    Ok(FindFieldUsagesResult {
        usages: lsp_locations,
    })
}

pub fn get_usages(
    program: &Program,
    schema: &Arc<SDLSchema>,
    type_name: StringKey,
    field_name: StringKey,
) -> LSPRuntimeResult<Vec<(String, IRLocation)>> {
    let type_ = schema
        .get_type(type_name)
        .ok_or_else(|| LSPRuntimeError::UnexpectedError(format!("Type {type_name} not found!")))?;
    let mut usage_finder = FieldUsageFinder::new(schema, type_, field_name);
    usage_finder.visit_program(program);

    let mut result = Vec::with_capacity(usage_finder.usages.len());
    for (label, locations) in usage_finder.usages.into_iter().sorted() {
        if let [location] = locations.as_slice() {
            // exactly 1 location, so no need to enumerate
            result.push((label.to_string(), *location));
        } else {
            for (idx, location) in locations.into_iter().enumerate() {
                result.push((format!("{label} - {idx}"), location));
            }
        }
    }
    Ok(result)
}

#[derive(Default)]
struct FieldUsageFinderScope {
    // Types that a visited field acts on
    //  - reset when we see a linked field, a fragment, or an operation
    //  - pushed when we see type refinement (inline fragments)
    types: Vec<StringKey>,
    // name of the enclosing Fragment or Operation
    label: Option<StringKey>,
}

pub(crate) struct FieldUsageFinder<'schema> {
    usages: HashMap<StringKey, Vec<IRLocation>>,
    schema: &'schema Arc<SDLSchema>,
    type_: Type,
    field_name: StringKey,
    current_scope: FieldUsageFinderScope,
}

impl<'schema> FieldUsageFinder<'schema> {
    pub(crate) fn new(
        schema: &'schema Arc<SDLSchema>,
        type_: Type,
        field_name: StringKey,
    ) -> FieldUsageFinder<'schema> {
        FieldUsageFinder {
            usages: Default::default(),
            schema,
            type_,
            field_name,
            current_scope: Default::default(),
        }
    }

    fn match_field(&mut self, field: &WithLocation<FieldID>) -> bool {
        // check field name match
        if self.schema.field(field.item).name.item == self.field_name {
            // check for
            // - exact type match
            // - inferred types (spread on concrete should match all abstract)
            for curr_typename in &self.current_scope.types {
                if self.schema.is_named_type_subtype_of(
                    self.schema.get_type(*curr_typename).unwrap(),
                    self.type_,
                ) {
                    return true;
                }
            }
        }
        false
    }

    fn add_field(&mut self, field: &WithLocation<FieldID>) {
        let current_label = self
            .current_scope
            .label
            .expect("Expected label in find_field_usages");
        self.usages
            .entry(current_label)
            .or_default()
            .push(field.location);
    }

    pub(crate) fn get_locations(&self) -> Vec<IRLocation> {
        self.usages.values().flatten().copied().collect_vec()
    }
}

impl Visitor for FieldUsageFinder<'_> {
    const NAME: &'static str = "FieldUsageFinder";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn visit_operation(&mut self, operation: &OperationDefinition) {
        // Check that scope is empty + populate the name + type (Query/Mutation/Subscription)
        //  before recursively visiting the operation's selections
        assert!(self.current_scope.label.is_none());
        assert!(self.current_scope.types.is_empty());
        self.current_scope.label = Some(operation.name.item.0);
        self.current_scope
            .types
            .push(self.schema.get_type_name(operation.type_));

        self.default_visit_operation(operation);

        self.current_scope.types.pop();
        self.current_scope.label = None;
        assert!(self.current_scope.types.is_empty());
    }

    fn visit_fragment(&mut self, fragment: &FragmentDefinition) {
        assert!(self.current_scope.label.is_none());
        assert!(self.current_scope.types.is_empty());

        self.current_scope.label = Some(fragment.name.item.0);
        self.current_scope
            .types
            .push(self.schema.get_type_name(fragment.type_condition));

        self.default_visit_fragment(fragment);

        self.current_scope.types.pop();
        self.current_scope.label = None;
        assert!(self.current_scope.types.is_empty());
    }

    fn visit_inline_fragment(&mut self, fragment: &InlineFragment) {
        // Inline fragments might not have a type condition
        // fragment Foo on User {
        //   ... {
        //     name
        //   }
        // }
        let should_pop = if let Some(type_) = fragment.type_condition {
            self.current_scope
                .types
                .push(self.schema.get_type_name(type_));
            true
        } else {
            false
        };
        self.default_visit_inline_fragment(fragment);

        if should_pop {
            self.current_scope.types.pop();
        }
    }

    fn visit_linked_field(&mut self, field: &LinkedField) {
        if self.match_field(&field.definition) {
            self.add_field(&field.definition);
        }

        // save all enclosing types
        let prev_types = std::mem::take(&mut self.current_scope.types);

        // remember linked type
        let linked_type = self.schema.field(field.definition.item).type_.inner();
        self.current_scope
            .types
            .push(self.schema.get_type_name(linked_type));

        self.default_visit_linked_field(field);

        self.current_scope.types.pop();
        assert!(self.current_scope.types.is_empty());
        self.current_scope.types = prev_types;
    }

    fn visit_scalar_field(&mut self, field: &ScalarField) {
        if self.match_field(&field.definition) {
            self.add_field(&field.definition);
        }
    }
}
