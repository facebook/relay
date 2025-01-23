/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod extract_docblock_ir;
mod ir_to_schema;
mod mark_document_as_base;

pub use extract_docblock_ir::extract_docblock_ir;
pub use ir_to_schema::build_resolver_types_schema_documents;
pub use ir_to_schema::extend_schema_with_field_ir;
