/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;
use std::sync::LazyLock;

use common::DirectiveName;
use common::Location;
use common::PointerAddress;
use common::WithLocation;
use common::sync::*;
use dashmap::DashMap;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionNameMap;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use schema::SDLSchema;
use schema::Schema;
use schema::Type;

use crate::util::generate_abstract_type_refinement_key;
use crate::util::is_relay_custom_inline_fragment_directive;

pub static TYPE_DISCRIMINATOR_DIRECTIVE_NAME: LazyLock<DirectiveName> =
    LazyLock::new(|| DirectiveName("__TypeDiscriminator".intern()));

/// Transform to add the `__typename` field to any LinkedField that both a) returns an
/// abstract type and b) does not already directly query `__typename`.
///
/// Parallelizes over operations and fragments. Uses a SHARED `DashMap` cache
/// keyed by the `PointerAddress` of `&InlineFragment` (i.e. the address of
/// the InlineFragment data inside its `Arc`). Same source `Arc<InlineFragment>`
/// across threads → same cached output `Transformed<Selection>` → same output
/// `Arc<InlineFragment>` for downstream `PointerAddress`-keyed caches in
/// `flatten` and `skip_redundant_nodes`.
///
/// A shared cache (rather than per-call) is required to preserve the
/// cross-call Arc-identity invariant that downstream transforms depend on.
pub fn generate_typename(program: &Program, is_for_codegen: bool) -> Program {
    let seen: Arc<Seen> = Arc::new(DashMap::default());

    let new_operations: Vec<Arc<OperationDefinition>> = par_iter(&program.operations)
        .filter_map(|op| {
            let mut t = GenerateTypenameTransform::new(program, is_for_codegen, Arc::clone(&seen));
            match t.transform_operation(op) {
                Transformed::Delete => None,
                Transformed::Keep => Some(Arc::clone(op)),
                Transformed::Replace(replacement) => Some(Arc::new(replacement)),
            }
        })
        .collect();

    let new_fragments: FragmentDefinitionNameMap<Arc<FragmentDefinition>> =
        par_iter(&program.fragments)
            .filter_map(|(name, fragment)| {
                let mut t =
                    GenerateTypenameTransform::new(program, is_for_codegen, Arc::clone(&seen));
                match t.transform_fragment(fragment) {
                    Transformed::Delete => None,
                    Transformed::Keep => Some((*name, Arc::clone(fragment))),
                    Transformed::Replace(replacement) => {
                        Some((replacement.name.item, Arc::new(replacement)))
                    }
                }
            })
            .collect();

    Program {
        schema: Arc::clone(&program.schema),
        operations: new_operations,
        fragments: new_fragments,
    }
}

type Seen = DashMap<PointerAddress, Transformed<Selection>>;

struct GenerateTypenameTransform<'s> {
    program: &'s Program,
    seen: Arc<Seen>,
    is_for_codegen: bool,
    parent_type: Option<Type>,
}

impl<'s> GenerateTypenameTransform<'s> {
    fn new(program: &'s Program, is_for_codegen: bool, seen: Arc<Seen>) -> Self {
        Self {
            program,
            seen,
            is_for_codegen,
            parent_type: None,
        }
    }
}

impl<'s> Transformer<'s> for GenerateTypenameTransform<'s> {
    const NAME: &'static str = "GenerateTypenameTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &'s OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.parent_type = Some(operation.type_);
        self.default_transform_operation(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &'s FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.parent_type = Some(fragment.type_condition);
        let schema = &self.program.schema;
        let mut selections = self.transform_selections(&fragment.selections);
        let type_ = fragment.type_condition;
        if !schema.is_extension_type(type_) && type_.is_abstract_type() {
            let mut next_selections = Vec::with_capacity(fragment.selections.len() + 1);
            next_selections.push(generate_abstract_key_field(
                schema,
                type_,
                fragment.name.location,
                self.is_for_codegen,
            ));
            if let TransformedValue::Replace(selections) = selections {
                next_selections.extend(selections)
            } else {
                next_selections.extend(fragment.selections.iter().cloned())
            };
            selections = TransformedValue::Replace(next_selections);
        }
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => Transformed::Replace(FragmentDefinition {
                selections,
                ..fragment.clone()
            }),
        }
    }

    fn transform_linked_field(&mut self, field: &'s LinkedField) -> Transformed<Selection> {
        let schema = &self.program.schema;
        let field_definition = schema.field(field.definition.item);
        let parent_type = self.parent_type;
        self.parent_type = Some(field_definition.type_.inner());
        let selections = self.transform_selections(&field.selections);
        self.parent_type = parent_type;
        let is_abstract = field_definition.type_.inner().is_abstract_type();
        let selections = if is_abstract && !has_typename_field(schema, &field.selections) {
            let mut next_selections = Vec::with_capacity(field.selections.len() + 1);
            next_selections.push(Selection::ScalarField(Arc::new(ScalarField {
                alias: None,
                definition: WithLocation::new(field.definition.location, schema.typename_field()),
                arguments: Default::default(),
                directives: Default::default(),
            })));
            if let TransformedValue::Replace(selections) = selections {
                next_selections.extend(selections)
            } else {
                next_selections.extend(field.selections.iter().cloned());
            }
            TransformedValue::Replace(next_selections)
        } else {
            selections
        };
        match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                    alias: field.alias,
                    definition: field.definition,
                    arguments: field.arguments.clone(),
                    directives: field.directives.clone(),
                    selections,
                })))
            }
        }
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &'s InlineFragment,
    ) -> Transformed<Selection> {
        let key = PointerAddress::new(fragment);
        if let Some(prev) = self.seen.get(&key) {
            return prev.clone();
        }
        // NOTE: the original serial code inserted Transformed::Delete here as a
        // placeholder cycle guard. With a shared cross-thread cache that
        // placeholder becomes visible to other threads as a "real" Delete result
        // and propagates incorrect deletions all the way up to operation level,
        // panicking generate_artifacts. IR is acyclic — no cycle guard needed.
        let parent_type = self.parent_type;
        if fragment.type_condition.is_some() {
            self.parent_type = fragment.type_condition;
        }
        let mut selections = self.transform_selections(&fragment.selections);
        self.parent_type = parent_type;
        let schema = &self.program.schema;
        let type_ = if let Some(type_) = fragment.type_condition {
            type_
        } else {
            parent_type.expect("Expect the parent type to exist.")
        };
        if !fragment
            .directives
            .iter()
            .any(is_relay_custom_inline_fragment_directive)
            && !schema.is_extension_type(type_)
            && type_.is_abstract_type()
        {
            let mut next_selections = Vec::with_capacity(fragment.selections.len() + 1);
            next_selections.push(generate_abstract_key_field(
                schema,
                type_,
                Location::generated(),
                self.is_for_codegen,
            ));
            if let TransformedValue::Replace(selections) = selections {
                next_selections.extend(selections)
            } else {
                next_selections.extend(fragment.selections.iter().cloned())
            };
            selections = TransformedValue::Replace(next_selections);
        }
        let result = match selections {
            TransformedValue::Keep => Transformed::Keep,
            TransformedValue::Replace(selections) => {
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: fragment.type_condition,
                    directives: fragment.directives.clone(),
                    selections,
                    spread_location: fragment.spread_location,
                })))
            }
        };
        // First-thread-wins: if another thread raced and already cached a
        // result for this fragment, return THEIR cached value so downstream
        // PointerAddress caches see a consistent Arc<InlineFragment> identity.
        // Our locally-computed `result` is discarded in the race-loser case.
        self.seen.entry(key).or_insert(result).clone()
    }

    fn transform_scalar_field(&mut self, _field: &ScalarField) -> Transformed<Selection> {
        Transformed::Keep
    }

    fn transform_fragment_spread(&mut self, _spread: &FragmentSpread) -> Transformed<Selection> {
        Transformed::Keep
    }
}

fn has_typename_field(schema: &SDLSchema, selections: &[Selection]) -> bool {
    let typename_field = schema.typename_field();
    selections.iter().any(|x| match x {
        Selection::ScalarField(child) => {
            child.alias.is_none() && child.definition.item == typename_field
        }
        _ => false,
    })
}

fn generate_abstract_key_field(
    schema: &SDLSchema,
    type_: Type,
    location: Location,
    is_for_codegen: bool,
) -> Selection {
    let abstract_key = generate_abstract_type_refinement_key(schema, type_);
    Selection::ScalarField(Arc::new(ScalarField {
        alias: Some(WithLocation::new(location, abstract_key)),
        definition: WithLocation::new(location, schema.typename_field()),
        arguments: vec![],
        directives: if is_for_codegen {
            vec![Directive {
                name: WithLocation::new(location, *TYPE_DISCRIMINATOR_DIRECTIVE_NAME),
                arguments: vec![],
                data: None,
                location,
            }]
        } else {
            vec![]
        },
    }))
}

#[cfg(test)]
mod tests {
    use graphql_ir::OperationDefinitionName;
    use graphql_syntax::OperationKind;

    use super::*;

    /// Regression guard for the iter-16 bug fixed by this transform's shared
    /// cache: when the same `Arc<InlineFragment>` reaches `transform_inline_fragment`
    /// from multiple parallel operation traversals, every caller must receive the
    /// SAME output `Arc<InlineFragment>`. Downstream `PointerAddress`-keyed caches
    /// in `flatten` and `skip_redundant_nodes` rely on this identity. A per-call
    /// cache (which silently breaks identity) passes every fixture test but
    /// regresses end-to-end build wall by inflating downstream cache misses.
    #[test]
    fn shared_cache_preserves_arc_identity_across_operations() {
        let schema = Arc::new(
            schema::build_schema(
                "interface Node { id: ID }
                 type User implements Node { id: ID, name: String }
                 type Query { node: Node }",
            )
            .unwrap(),
        );
        let node_type = schema.get_type("Node".intern()).expect("Node exists");
        assert!(node_type.is_abstract_type(), "Node must be abstract");
        let query_type = schema.query_type().expect("Query exists");

        // Construct ONE Arc<InlineFragment> shared across multiple operations.
        // Empty selections + abstract type_condition force `transform_inline_fragment`
        // down the Replace path (it injects __isNode), so the cache stores a fresh
        // Arc whose identity we can compare across callers.
        let shared_inline = Arc::new(InlineFragment {
            type_condition: Some(node_type),
            directives: vec![],
            selections: vec![],
            spread_location: Location::generated(),
        });

        let make_op = |name: &str| {
            Arc::new(OperationDefinition {
                kind: OperationKind::Query,
                name: WithLocation::generated(OperationDefinitionName(name.intern())),
                type_: query_type,
                variable_definitions: vec![],
                directives: vec![],
                selections: vec![Selection::InlineFragment(Arc::clone(&shared_inline))],
            })
        };

        let mut program = Program::new(Arc::clone(&schema));
        for name in ["op1", "op2", "op3"] {
            program.insert_operation(make_op(name));
        }

        let result = generate_typename(&program, false);

        let extract_inline = |op: &OperationDefinition| -> Arc<InlineFragment> {
            // generate_typename returns Replace, so the cache holds a fresh Arc
            // and downstream operations reference it as their selection[0].
            match &op.selections[0] {
                Selection::InlineFragment(inline) => Arc::clone(inline),
                other => panic!("expected post-transform InlineFragment, got {other:?}"),
            }
        };

        let arcs: Vec<Arc<InlineFragment>> = result
            .operations
            .iter()
            .map(|op| extract_inline(op))
            .collect();
        assert_eq!(arcs.len(), 3);
        assert!(
            Arc::ptr_eq(&arcs[0], &arcs[1]),
            "shared cache must yield identical Arc identity for op1 and op2",
        );
        assert!(
            Arc::ptr_eq(&arcs[1], &arcs[2]),
            "shared cache must yield identical Arc identity for op2 and op3",
        );
    }
}
