/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::DirectiveName;
use common::Location;
use common::WithLocation;
use fnv::FnvHashMap;
use graphql_ir::Directive;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use lazy_static::lazy_static;
use schema::Schema;

use crate::ClientEdgeMetadata;

/// A transform that group all client selections and generates ... @__clientExtension inline fragments
/// the generated result is used by codegen only to generate `ClientExtension` nodes.
/// We mark client selection as  `Transformed::Delete`, and consume them in `transform_selections`.
pub fn client_extensions(program: &Program) -> Program {
    let mut transform = ClientExtensionsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type Seen<'a> = FnvHashMap<&'a Selection, Transformed<Selection>>;

lazy_static! {
    pub static ref CLIENT_EXTENSION_DIRECTIVE_NAME: DirectiveName =
        DirectiveName("__clientExtension".intern());
}

struct ClientExtensionsTransform<'program> {
    program: &'program Program,
    seen: Seen<'program>,
}

impl<'program> ClientExtensionsTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            seen: Default::default(),
        }
    }

    fn transform_client_edge(
        &mut self,
        fragment: &InlineFragment,
        metadata: ClientEdgeMetadata<'program>,
    ) -> Transformed<Selection> {
        // Backing field should always be a RelayResolver. We can't wrap a
        // resolver. If its a scalar (no fragment) we don't need to wrap
        // anything because normalizer ignores the field itself.
        // If it's an inline fragment, on a server type, we can traverse in

        // Here we transform each field and then ignore the case that the
        // transform has identified either selection as being a client extension
        // by calling `unwrap_or_else` with the untransformed value. This ensures the
        // selections get deeply transformed, but that neither of the direct
        // fields of the client edge get wrapped with a client extension inline
        // fragment or deleted.
        let backing_field = self
            .transform_selection(metadata.backing_field)
            .unwrap_or_else(|| metadata.backing_field.clone());

        let selections = self
            .transform_linked_field(metadata.linked_field)
            .unwrap_or_else(|| Selection::LinkedField(Arc::new(metadata.linked_field.clone())));

        Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
            selections: vec![backing_field, selections],
            ..fragment.clone()
        })))
    }
}

impl<'a> Transformer<'a> for ClientExtensionsTransform<'a> {
    const NAME: &'static str = "ClientExtensionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_selections(
        &mut self,
        selections: &'a [Selection],
    ) -> TransformedValue<Vec<Selection>> {
        if selections.is_empty() {
            return TransformedValue::Keep;
        }
        let mut client_selections = vec![];
        let mut server_selections = vec![];
        let mut has_changes = false;
        for (index, prev_item) in selections.iter().enumerate() {
            let next_item = self.transform_selection(prev_item);
            match next_item {
                Transformed::Keep => {
                    if has_changes {
                        server_selections.push(prev_item.clone());
                    }
                }
                Transformed::Delete => {
                    if has_changes {
                        client_selections.push(prev_item.clone());
                    } else {
                        debug_assert!(client_selections.capacity() == 0);
                        debug_assert!(server_selections.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        server_selections.reserve(selections.len());
                        server_selections.extend(selections.iter().take(index).cloned());
                        client_selections.push(prev_item.clone());
                        has_changes = true;
                    }
                }
                Transformed::Replace(next_item) => {
                    if !has_changes {
                        debug_assert!(client_selections.capacity() == 0);
                        debug_assert!(server_selections.capacity() == 0);
                        // assume most items won't be skipped and allocate space for all items
                        server_selections.reserve(selections.len());
                        server_selections.extend(selections.iter().take(index).cloned());
                        has_changes = true;
                    }
                    server_selections.push(next_item);
                }
            }
        }
        if has_changes {
            if !client_selections.is_empty() {
                server_selections.push(Selection::InlineFragment(Arc::new(InlineFragment {
                    type_condition: None,
                    directives: vec![build_client_extension_directive()],
                    selections: client_selections,
                    spread_location: Location::generated(),
                })));
            }
            TransformedValue::Replace(server_selections)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_selection(&mut self, selection: &'a Selection) -> Transformed<Selection> {
        if let Some(prev) = self.seen.get(selection) {
            return prev.clone();
        }

        let result = self.default_transform_selection(selection);
        self.seen.insert(selection, result.clone());
        result
    }

    fn transform_inline_fragment(
        &mut self,
        fragment: &'a InlineFragment,
    ) -> Transformed<Selection> {
        // Client Edges are modeled in the IR as inline fragments. If we
        // traverse into those fragments, and pull its contents out into a
        // separate inline fragment (without this directive) we will have lost
        // the fact that these selections belong to the client edge.
        //
        // Client edges are all explicitly handled for each artifact type, so we
        // don't need to handle them specifically as client schema extensions.
        if let Some(metadata) = ClientEdgeMetadata::find(fragment) {
            return self.transform_client_edge(fragment, metadata);
        }
        if let Some(type_condition) = fragment.type_condition
            && self.program.schema.is_extension_type(type_condition)
        {
            return Transformed::Delete;
        }
        self.default_transform_inline_fragment(fragment)
    }

    fn transform_linked_field(&mut self, field: &'a LinkedField) -> Transformed<Selection> {
        if self
            .program
            .schema
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            self.default_transform_linked_field(field)
        }
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        if self
            .program
            .schema
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}

// TODO(T63388023): Returns a typed directive
fn build_client_extension_directive() -> Directive {
    Directive {
        name: WithLocation::generated(*CLIENT_EXTENSION_DIRECTIVE_NAME),
        arguments: Default::default(),
        data: None,
        location: Location::generated(),
    }
}
