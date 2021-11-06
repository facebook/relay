/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Location, Span};

use crate::{ExecutableDefinition, TypeSystemDefinition};

/// A GraphQL document containing any type of definition. This can represent
/// any GraphQL document.
#[derive(Debug)]
pub struct Document {
    pub location: Location,
    pub definitions: Vec<Definition>,
}

/// Any GraphQL definition.
#[derive(Debug)]
pub enum Definition {
    ExecutableDefinition(ExecutableDefinition),
    TypeSystemDefinition(TypeSystemDefinition),
}

/// A document only consisting of executable definitions (fragments and operations).
/// This excludes schema definitions and schema extensions.
#[derive(Clone, Debug, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct ExecutableDocument {
    pub span: Span,
    pub definitions: Vec<ExecutableDefinition>,
}

/// A document only consisting of type system definitions.
/// This excludes executable operations or fragment definitions.
#[derive(Debug)]
pub struct SchemaDocument {
    pub location: Location,
    pub definitions: Vec<TypeSystemDefinition>,
}
