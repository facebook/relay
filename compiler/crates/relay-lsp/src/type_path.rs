/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::OperationKind;
use interner::StringKey;
use log::info;
use schema::{Schema, Type};

#[derive(Debug)]
/// An item in the list of type metadata that we can use to resolve the leaf
/// type the request (completion/hover) is being made against
pub enum TypePathItem {
    Operation(OperationKind),
    FragmentDefinition { type_name: StringKey },
    InlineFragment { type_name: StringKey },
    LinkedField { name: StringKey },
    ScalarField { name: StringKey },
}

/// Given a root path item and the schema this function will return a root type of the document
/// For operations -> Query/Mutation/Subscription
/// For fragments -> type of the fragment
fn resolve_root_type(root_path_item: TypePathItem, schema: &Schema) -> Option<Type> {
    match root_path_item {
        TypePathItem::Operation(kind) => match kind {
            OperationKind::Query => schema.query_type(),
            OperationKind::Mutation => schema.mutation_type(),
            OperationKind::Subscription => schema.subscription_type(),
        },
        TypePathItem::FragmentDefinition { type_name } => schema.get_type(type_name),
        _ => {
            // TODO(brandondail) log here
            None
        }
    }
}

fn resolve_relative_type(
    parent_type: Type,
    path_item: TypePathItem,
    schema: &Schema,
) -> Option<Type> {
    match path_item {
        TypePathItem::Operation(_) => {
            // TODO(brandondail) log here
            None
        }
        TypePathItem::FragmentDefinition { .. } => {
            // TODO(brandondail) log here
            None
        }
        TypePathItem::LinkedField { name } => {
            let field_id = schema.named_field(parent_type, name)?;
            let field = schema.field(field_id);
            info!("resolved type for {:?} : {:?}", field.name, field.type_);
            Some(field.type_.inner())
        }
        TypePathItem::ScalarField { .. } => Some(parent_type),
        TypePathItem::InlineFragment { type_name } => schema.get_type(type_name),
    }
}

#[derive(Debug, Default)]
pub struct TypePath(Vec<TypePathItem>);

impl TypePath {
    pub fn add_type(&mut self, type_path_item: TypePathItem) {
        self.0.push(type_path_item)
    }

    /// Returns the leaf type, which is the type that the completion request is being made against.
    pub fn resolve_leaf_type(self, schema: &Schema) -> Option<Type> {
        let mut type_path = self.0;
        type_path.reverse();
        let mut type_ =
            resolve_root_type(type_path.pop().expect("path must be non-empty"), schema)?;
        while let Some(path_item) = type_path.pop() {
            type_ = resolve_relative_type(type_, path_item, schema)?;
        }
        Some(type_)
    }
}
