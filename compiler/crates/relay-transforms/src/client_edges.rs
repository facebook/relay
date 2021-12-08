/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::refetchable_fragment::{RefetchableFragment, REFETCHABLE_NAME};
use fnv::FnvHashMap;
use graphql_syntax::OperationKind;
use intern::string_key::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::Type;
use std::sync::Arc;

use crate::relay_resolvers::RELAY_RESOLVER_DIRECTIVE_NAME;
use common::{Diagnostic, DiagnosticsResult, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, Field, FragmentDefinition, InlineFragment, LinkedField,
    OperationDefinition, Program, Selection, Transformed, Transformer, Value,
};
use schema::Schema;

lazy_static! {
    // This gets attached to the client edge field
    pub static ref CLIENT_EDGE_METADATA_KEY: StringKey = "__clientEdge".intern();
    // This gets attached to the generated query
    pub static ref CLIENT_EDGE_QUERY_METADATA_KEY: StringKey = "__clientEdgeQuery".intern();
    pub static ref QUERY_NAME_ARG: StringKey = "queryName".intern();
    pub static ref CLIENT_EDGE_SOURCE_NAME: StringKey = "clientEdgeSourceDocument".intern();
    // This gets attached to fragment which defines the selection in the generated query
    pub static ref CLIENT_EDGE_GENERATED_FRAGMENT_KEY: StringKey = "__clientEdgeGeneratedFragment".intern();
}

pub struct ClientEdgeMetadata<'a> {
    pub backing_field: &'a Selection,
    pub selections: &'a Selection,
    pub query_name: StringKey,
}

// Client edges consists of two parts:
//
// 1. A backing field which contains the ID defining the graph relationship
// 2. A linked field containing the selections that the user has asked for off
// of that relationship.
//
// In order to ensure both of these elements are present in our IR, and also get
// traversed by subsequent transform steps, we model Client Edges in our IR as
// an inline fragment containing these two children in an implict order.
//
// This utility method is intended to reduce the number of places that need to
// know about this implicit contract by reading an inline fragment and returning
// structured metadata, if present.
impl<'a> ClientEdgeMetadata<'a> {
    pub fn find(fragment: &'a InlineFragment) -> Option<Self> {
        fragment
            .directives
            .named(*CLIENT_EDGE_METADATA_KEY)
            .map(|directive| {
                let query_name = directive
                    .arguments
                    .named(*QUERY_NAME_ARG)
                    .expect("Client Edge metadata should have a query name")
                    .value
                    .item
                    .get_string_literal()
                    .expect("queryName is a string literal");

                ClientEdgeMetadata {
                    query_name,
                    backing_field: fragment
                        .selections
                        .get(0)
                        .expect("Client Edge inline fragments have exactly two selections"),
                    selections: fragment
                        .selections
                        .get(1)
                        .expect("Client Edge inline fragments have exactly two selections"),
                }
            })
    }
}
pub fn client_edges(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesTransform::new(program);
    let mut next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        for fragment in transform.new_fragments {
            next_program.insert_fragment(fragment);
        }
        for operation in transform.new_operations {
            next_program.insert_operation(Arc::new(operation));
        }
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct ClientEdgesTransform<'program> {
    path: Vec<&'program str>,
    document_name: Option<StringKey>,
    query_names: FnvHashMap<StringKey, usize>,
    program: &'program Program,
    new_fragments: Vec<Arc<FragmentDefinition>>,
    new_operations: Vec<OperationDefinition>,
    errors: Vec<Diagnostic>,
}

impl<'program> ClientEdgesTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            path: Default::default(),
            query_names: Default::default(),
            document_name: Default::default(),
            new_fragments: Default::default(),
            new_operations: Default::default(),
            errors: Default::default(),
        }
    }

    fn generate_query_name(&mut self) -> StringKey {
        let document_name = self.document_name.expect("We are within a document");
        let name_root =
            format!("ClientEdgeQuery_{}_{}", document_name, self.path.join("__")).intern();

        // Due to duplicate inline fragments, or inline fragmetns without type
        // conditions, it's possible that multiple fields will have the same
        // path. In this case, we will append incrementing numbers to the end of
        // the query name to ensure uniqueness.
        let num = self
            .query_names
            .entry(name_root)
            .and_modify(|n| *n += 1)
            .or_insert(0);

        match num {
            0 => name_root,
            n => format!("{}_{}", name_root, n).intern(),
        }
    }

    fn generate_client_edge_query(
        &mut self,
        generated_query_name: StringKey,
        field_type: Type,
        selections: Vec<Selection>,
    ) {
        let synthetic_fragment_name =
            WithLocation::generated(format!("Refetchable{}", generated_query_name).intern());

        let synthetic_refetchable_fragment = FragmentDefinition {
            name: synthetic_fragment_name,
            variable_definitions: Vec::new(),
            used_global_variables: Vec::new(),
            type_condition: field_type,
            directives: vec![Directive {
                name: WithLocation::generated(*CLIENT_EDGE_GENERATED_FRAGMENT_KEY),
                arguments: vec![Argument {
                    name: WithLocation::generated(*CLIENT_EDGE_SOURCE_NAME),
                    value: WithLocation::generated(Value::Constant(ConstantValue::String(
                        self.document_name.expect("Expect to be within a document"),
                    ))),
                }],
                data: None,
            }],
            selections,
        };

        let mut transformer = RefetchableFragment::new(self.program, false);

        let refetchable_fragment = transformer
            .transform_refetch_fragment_with_refetchable_directive(
                &Arc::new(synthetic_refetchable_fragment),
                &make_refetchable_directive(generated_query_name),
            );

        match refetchable_fragment {
            Err(diagnostics) => {
                self.errors.extend(diagnostics);
            }
            Ok((refetchable_directive, refetchable_root)) => {
                self.new_fragments.push(refetchable_root.fragment);

                let query_type = self.program.schema.query_type().unwrap();

                let mut directives = refetchable_directive.directives;
                directives.push(Directive {
                    name: WithLocation::generated(*CLIENT_EDGE_QUERY_METADATA_KEY),
                    arguments: vec![Argument {
                        name: WithLocation::generated(*CLIENT_EDGE_SOURCE_NAME),
                        value: WithLocation::generated(Value::Constant(ConstantValue::String(
                            self.document_name.expect("Expect to be within a document"),
                        ))),
                    }],
                    data: None,
                });
                self.new_operations.push(OperationDefinition {
                    kind: OperationKind::Query,
                    name: WithLocation::generated(refetchable_directive.query_name.item),
                    type_: query_type,
                    variable_definitions: refetchable_root.variable_definitions,
                    directives,
                    selections: refetchable_root.selections,
                });
            }
        };
    }

    fn transform_linked_field_impl(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let field_type = self.program.schema.field(field.definition.item);
        if !field_type.is_extension {
            return self.default_transform_linked_field(field);
        };

        // Eventually we will want to enable client edges on non-resolver client
        // schema extensions, but we'll start with limiting them to resolvers.
        if field_type
            .directives
            .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
            .is_none()
        {
            return self.default_transform_linked_field(field);
        }

        let new_selections = self
            .transform_selections(&field.selections)
            .replace_or_else(|| field.selections.clone());

        let client_edge_query_name = self.generate_query_name();

        self.generate_client_edge_query(
            client_edge_query_name,
            field_type.type_.inner(),
            new_selections.clone(),
        );

        let transformed_field = Arc::new(LinkedField {
            selections: new_selections,
            ..field.clone()
        });

        let inline_fragment = InlineFragment {
            type_condition: None,
            directives: vec![Directive {
                name: WithLocation::generated(*CLIENT_EDGE_METADATA_KEY),
                arguments: vec![Argument {
                    name: WithLocation::generated(*QUERY_NAME_ARG),
                    value: WithLocation::generated(Value::Constant(ConstantValue::String(
                        client_edge_query_name,
                    ))),
                }],
                data: None,
            }],
            selections: vec![
                Selection::LinkedField(transformed_field.clone()),
                Selection::LinkedField(transformed_field),
            ],
        };

        Transformed::Replace(Selection::InlineFragment(Arc::new(inline_fragment)))
    }
}

impl Transformer for ClientEdgesTransform<'_> {
    const NAME: &'static str = "ClientEdgesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.document_name = Some(fragment.name.item);
        let new_fragment = self.default_transform_fragment(fragment);
        self.document_name = None;
        new_fragment
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.document_name = Some(operation.name.item);
        let new_operation = self.default_transform_operation(operation);
        self.document_name = None;
        new_operation
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        match fragment
            .type_condition
            .map(|type_| self.program.schema.get_type_name(type_))
        {
            Some(type_name) => {
                self.path.push(type_name.lookup());

                let new_inline_fragment = self.default_transform_inline_fragment(fragment);
                self.path.pop();

                new_inline_fragment
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        self.path
            .push(field.alias_or_name(&self.program.schema).lookup());

        let new_linked_field = self.transform_linked_field_impl(field);

        self.path.pop();

        new_linked_field
    }
}

fn make_refetchable_directive(query_name: StringKey) -> Directive {
    Directive {
        name: WithLocation::generated(*REFETCHABLE_NAME),
        arguments: vec![Argument {
            name: WithLocation::generated(*QUERY_NAME_ARG),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(query_name))),
        }],
        data: None,
    }
}

pub fn preserve_client_edge_selections(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesCleanupTransform::new(CleanupMode::PreserveSelectionsField);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    Ok(next_program)
}

pub fn preserve_client_edge_backing_ids(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientEdgesCleanupTransform::new(CleanupMode::PreserveBackingField);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    Ok(next_program)
}

enum CleanupMode {
    PreserveBackingField,
    PreserveSelectionsField,
}

struct ClientEdgesCleanupTransform {
    cleanup_mode: CleanupMode,
}

impl ClientEdgesCleanupTransform {
    fn new(cleanup_mode: CleanupMode) -> Self {
        Self { cleanup_mode }
    }
}

impl Transformer for ClientEdgesCleanupTransform {
    const NAME: &'static str = "ClientEdgesCleanupTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        match ClientEdgeMetadata::find(fragment) {
            Some(metadata) => {
                let new_selection = match self.cleanup_mode {
                    CleanupMode::PreserveBackingField => metadata.backing_field,
                    CleanupMode::PreserveSelectionsField => metadata.selections,
                };

                Transformed::Replace(
                    self.transform_selection(new_selection)
                        .unwrap_or_else(|| new_selection.clone()),
                )
            }
            None => self.default_transform_inline_fragment(fragment),
        }
    }
}
