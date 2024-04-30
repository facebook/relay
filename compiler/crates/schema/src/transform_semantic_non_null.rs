/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::ArgumentName;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::NamedItem;
use intern::intern;

use crate::graphql_schema::Schema;
use crate::Field;
use crate::FieldID;
use crate::SDLSchema;
use crate::Type;
use crate::TypeReference;

/**
 * This function transforms fields with the `@semanticNonNull` directive to their non-null type
 * for the purposes of type generation.
 *
 * The `@semanticNonNull` directive is used to annotate fields that are only null when an error occurs. This
 * differs from the GraphQL spec's non-null syntax which is used to denote fields that are never null; if such
 * a field were going to become null due to an error, the error would bubble up to the next nullable field/object in the query.
 * @semanticNonNull fields do not bubble up errors, instead becoming null in the error case but in no other case.
 */
pub fn transform_semantic_non_null(schema: &mut SDLSchema) -> DiagnosticsResult<()> {
    let mut fields_to_modify: Vec<FieldID> = Vec::new();

    for (index, field) in schema.get_fields().enumerate() {
        if field
            .directives
            .named(DirectiveName(intern!("semanticNonNull")))
            .is_some()
        {
            fields_to_modify.push(FieldID(index.try_into().unwrap()));
        }
    }

    for field_id in fields_to_modify {
        let field = schema.field(field_id);
        schema.replace_field(
            field_id,
            Field {
                type_: get_semantic_type(field),
                ..field.clone()
            },
        )?;
    }

    Ok(())
}

fn get_semantic_type(field: &Field) -> TypeReference<Type> {
    match field
        .directives
        .named(DirectiveName(intern!("semanticNonNull")))
    {
        Some(directive) => {
            match directive
                .arguments
                .named(ArgumentName(intern!("levels")))
                .map(|levels| levels.expect_int_list())
            {
                Some(levels) => {
                    let mut type_ = field.type_.clone();
                    for level in levels {
                        type_ = type_.with_non_null_level(level);
                    }
                    type_
                }
                None => field.type_.non_null(),
            }
        }
        None => field.type_.clone(),
    }
}
