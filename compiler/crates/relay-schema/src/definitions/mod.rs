/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::NamedItem;
use docblock_shared::RELAY_RESOLVER_MODEL_DIRECTIVE_NAME;
use docblock_shared::RELAY_RESOLVER_MODEL_INSTANCE_FIELD;
use docblock_shared::RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE;
use schema::Schema;
use schema::Type;

pub trait ResolverType {
    fn is_resolver_object<S: Schema>(&self, schema: &S) -> bool;
    fn is_weak_resolver_object<S: Schema>(&self, schema: &S) -> bool;
    fn is_terse_resolver_object<S: Schema>(&self, schema: &S) -> bool;
}

impl ResolverType for Type {
    fn is_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        if let Type::Object(object_id) = self {
            let object = schema.object(*object_id);
            object
                .directives
                .named(*RELAY_RESOLVER_MODEL_DIRECTIVE_NAME)
                .is_some()
        } else {
            false
        }
    }

    fn is_weak_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        if let Type::Object(object_id) = self {
            let object = schema.object(*object_id);
            object
                .directives
                .named(*RELAY_RESOLVER_WEAK_OBJECT_DIRECTIVE)
                .is_some()
        } else {
            false
        }
    }

    fn is_terse_resolver_object<S: Schema>(&self, schema: &S) -> bool {
        if let Type::Object(object_id) = self {
            let object = schema.object(*object_id);
            object.fields.iter().any(|field_id| {
                schema.field(*field_id).name.item == *RELAY_RESOLVER_MODEL_INSTANCE_FIELD
            })
        } else {
            false
        }
    }
}
