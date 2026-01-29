/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;

#[derive(Debug, Clone)]
pub struct UsedSchemaCollectionOptions {
    /// For *GraphServices*, if you request __typename but do not explicitly include the concrete type,
    /// we will translate what we get over-the-wire to an unknown "MyInterface" value.
    /// Basically, a user adding __typename forces the list of member types to act as an enumeration.
    ///
    /// This should *only* be an issue *for GraphServices*, and only if people explicitly *switch on the typename string*.
    /// To combat that, if 'include_implementations_when_typename_requested' and we include an *explicit* `__typename` on the abstract type,
    /// then the library needs to consider *every child type* as a used type.
    /// For now, we just *always* require this, regardless of whether we're in Pando or GraphServices: it should help
    /// showcase to product teams *how* their usage of __typename unnecessarily adds complexity to their product
    ///
    /// IMPORTANT NOTE: this should *always* be false when visting a post-transforms-applied IR.
    ///
    /// When Some, we DO include implementations, EXCEPT if using the directive blocklist
    pub include_implementations_when_typename_requested: Option<Vec<DirectiveName>>,
    pub include_all_overlapping_concrete_types: bool,
    /// Do we include directives on the SDL types themselves? For code-generation and transformation use cases,
    /// we DO usually need these directives to know, for instance, whether we explicitly insert strong_id__ fields.
    pub include_directives_on_schema_definitions: bool,
    /// Directives are usually fairly well centralized.
    ///
    /// For most cases we likely want to pull out a "known centralized schema" instead, but for simple cases,
    /// like perusing a query's used schema, not including any directives is a reasonable flag.
    pub include_directive_definitions: bool,

    /// Do we need implicitly used enum values?
    pub include_implicit_output_enum_values: bool,
    pub include_implicit_input_fields_and_enum_values: bool,
}

impl UsedSchemaCollectionOptions {
    /// What people think of when they think "used schema": the types and fields that are referenced
    /// including types that are referenced via transform (i.e. PageInfo when using @pando_connection).
    pub fn only_explicitly_used_without_directives_options() -> Self {
        Self {
            include_implementations_when_typename_requested: None,
            include_all_overlapping_concrete_types: false,
            include_directives_on_schema_definitions: false,
            include_directive_definitions: false,
            include_implicit_output_enum_values: false,
            include_implicit_input_fields_and_enum_values: false,
        }
    }

    pub fn explicitly_used_outputs_and_implicit_inputs_without_directives_options() -> Self {
        Self {
            include_implementations_when_typename_requested: None,
            include_all_overlapping_concrete_types: false,
            include_directives_on_schema_definitions: false,
            include_directive_definitions: false,
            include_implicit_output_enum_values: false,
            include_implicit_input_fields_and_enum_values: true,
        }
    }
}
