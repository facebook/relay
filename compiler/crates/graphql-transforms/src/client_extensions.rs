/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::util::PointerAddress;
use common::{FileKey, Location, Span, WithLocation};
use fnv::FnvHashMap;
use graphql_ir::{
    Directive, InlineFragment, LinkedField, Program, ScalarField, Selection, Transformed,
    TransformedValue, Transformer,
};
use interner::Intern;
use interner::StringKey;
use std::sync::Arc;

/// A transform that group all client selections and generates ... @__clientExtension inline fragments
/// the generated result is used by codegen only to generate `ClientExtension` nodes.
/// We mark client selection as  `Transformed::Delete`, and consume them in `transform_selections`.
pub fn client_extensions<'s>(program: &Program<'s>) -> Program<'s> {
    let mut transform = ClientExtensionsTransform::new(program);
    transform
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

type Seen = FnvHashMap<PointerAddress, Transformed<Selection>>;

pub struct ClientExtensionConstants {
    pub client_extension_directive_name: StringKey,
}

impl Default for ClientExtensionConstants {
    fn default() -> Self {
        Self {
            client_extension_directive_name: "__clientExtension".intern(),
        }
    }
}

struct ClientExtensionsTransform<'s> {
    client_extension_constants: ClientExtensionConstants,
    program: &'s Program<'s>,
    empty_location: Location,
    seen: Seen,
}

impl<'s> ClientExtensionsTransform<'s> {
    fn new(program: &'s Program<'s>) -> Self {
        Self {
            client_extension_constants: Default::default(),
            program,
            seen: Default::default(),
            empty_location: Location::new(FileKey::new(""), Span::new(0, 0)),
        }
    }

    // TODO(T63388023): Returns a typed directive
    fn build_client_extension_directive(self: &Self) -> Directive {
        Directive {
            name: WithLocation::new(
                // The directive is only used at codegen step, location is not necessary
                self.empty_location,
                self.client_extension_constants
                    .client_extension_directive_name,
            ),
            arguments: Default::default(),
        }
    }
}

impl<'s> Transformer for ClientExtensionsTransform<'s> {
    const NAME: &'static str = "ClientExtensionsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_selections(
        &mut self,
        selections: &[Selection],
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
                    directives: vec![self.build_client_extension_directive()],
                    selections: client_selections,
                })));
            }
            TransformedValue::Replace(server_selections)
        } else {
            TransformedValue::Keep
        }
    }

    fn transform_selection(&mut self, selection: &Selection) -> Transformed<Selection> {
        let key = PointerAddress::new(selection);
        if let Some(prev) = self.seen.get(&key) {
            prev.clone()
        } else {
            self.seen.insert(key, Transformed::Keep);
            let result = self.default_transform_selection(selection);
            self.seen.insert(key, result.clone());
            result
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        if let Some(type_condition) = fragment.type_condition {
            if self.program.schema().is_extension_type(type_condition) {
                return Transformed::Delete;
            }
        }
        self.default_transform_inline_fragment(fragment)
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        if self
            .program
            .schema()
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
            .schema()
            .field(field.definition.item)
            .is_extension
        {
            Transformed::Delete
        } else {
            Transformed::Keep
        }
    }
}
