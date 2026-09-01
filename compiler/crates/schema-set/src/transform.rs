/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! A visitor for rewriting a [`SchemaSet`] in place.

use graphql_ir::Transformed;

use crate::schema_set::CanHaveDirectives;
use crate::schema_set::SchemaSet;
use crate::schema_set::SetArgument;
use crate::schema_set::SetDirective;
use crate::schema_set::SetDirectiveValue;
use crate::schema_set::SetEnumValue;
use crate::schema_set::SetField;
use crate::schema_set::SetRootSchema;
use crate::schema_set::SetType;

/// Rewrites a [`SchemaSet`] in place.
///
/// Every `transform_*` hook defaults to the matching `default_transform_*`,
/// which recurses into that node's children. Override a hook to change what
/// happens at that node; call the `default_transform_*` from the override to
/// keep recursing.
pub trait Transformer {
    /// Identifies the transform in logs and errors.
    const NAME: &'static str;

    fn transform_schema_set(&mut self, schema_set: &mut SchemaSet) {
        self.default_transform_schema_set(schema_set);
    }

    fn default_transform_schema_set(&mut self, schema_set: &mut SchemaSet) {
        self.transform_root_schema(&mut schema_set.root_schema);
        for type_ in schema_set.types.values_mut() {
            self.transform_type(type_);
        }
        for directive in schema_set.directives.values_mut() {
            self.transform_directive_definition(directive);
        }
    }

    fn transform_root_schema(&mut self, root_schema: &mut SetRootSchema) {
        self.default_transform_root_schema(root_schema);
    }

    fn default_transform_root_schema(&mut self, root_schema: &mut SetRootSchema) {
        self.transform_directives(&mut root_schema.directives);
    }

    fn transform_type(&mut self, type_: &mut SetType) {
        self.default_transform_type(type_);
    }

    fn default_transform_type(&mut self, type_: &mut SetType) {
        self.transform_directives(type_.directives_mut());
        match type_ {
            SetType::Object(object) => {
                for field in object.fields.values_mut() {
                    self.transform_field(field);
                }
            }
            SetType::Interface(interface) => {
                for field in interface.fields.values_mut() {
                    self.transform_field(field);
                }
            }
            SetType::InputObject(input_object) => {
                for field in input_object.fields.values_mut() {
                    self.transform_argument(field);
                }
            }
            SetType::Enum(enum_) => {
                for value in enum_.values.values_mut() {
                    self.transform_enum_value(value);
                }
            }
            // Scalars and unions carry directives but have no directive-bearing
            // children: union members are `SetMemberType`, which has none.
            SetType::Scalar(_) | SetType::Union(_) => {}
        }
    }

    fn transform_field(&mut self, field: &mut SetField) {
        self.default_transform_field(field);
    }

    fn default_transform_field(&mut self, field: &mut SetField) {
        self.transform_directives(&mut field.directives);
        for argument in field.arguments.values_mut() {
            self.transform_argument(argument);
        }
    }

    fn transform_argument(&mut self, argument: &mut SetArgument) {
        self.default_transform_argument(argument);
    }

    fn default_transform_argument(&mut self, argument: &mut SetArgument) {
        self.transform_directives(&mut argument.directives);
    }

    fn transform_enum_value(&mut self, enum_value: &mut SetEnumValue) {
        self.default_transform_enum_value(enum_value);
    }

    fn default_transform_enum_value(&mut self, enum_value: &mut SetEnumValue) {
        self.transform_directives(&mut enum_value.directives);
    }

    fn transform_directive_definition(&mut self, directive: &mut SetDirective) {
        self.default_transform_directive_definition(directive);
    }

    fn default_transform_directive_definition(&mut self, directive: &mut SetDirective) {
        self.transform_directives(&mut directive.directives);
        for argument in directive.arguments.values_mut() {
            self.transform_argument(argument);
        }
    }

    /// Applies [`Transformer::transform_directive`] to one list of directive
    /// applications, honouring `Delete` and `Replace`.
    fn transform_directives(&mut self, directives: &mut Vec<SetDirectiveValue>) {
        self.default_transform_directives(directives);
    }

    fn default_transform_directives(&mut self, directives: &mut Vec<SetDirectiveValue>) {
        directives.retain_mut(|directive| match self.transform_directive(directive) {
            Transformed::Keep => true,
            Transformed::Replace(replacement) => {
                *directive = replacement;
                true
            }
            Transformed::Delete => false,
        });
    }

    /// Reached for every directive application in the set. Defaults to keeping
    /// it untouched.
    fn transform_directive(
        &mut self,
        _directive: &SetDirectiveValue,
    ) -> Transformed<SetDirectiveValue> {
        Transformed::Keep
    }
}

#[cfg(test)]
mod tests {
    use common::DirectiveName;
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use intern::Lookup;
    use intern::string_key::Intern;

    use super::*;
    use crate::build_schema_document::ToSDLDefinition;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    /// Records every directive application the walk reaches.
    #[derive(Default)]
    struct RecordingTransform {
        seen: Vec<String>,
    }

    impl Transformer for RecordingTransform {
        const NAME: &'static str = "RecordingTransform";

        fn transform_directive(
            &mut self,
            directive: &SetDirectiveValue,
        ) -> Transformed<SetDirectiveValue> {
            self.seen.push(directive.name.0.lookup().to_string());
            Transformed::Keep
        }
    }

    /// Deletes every application of one directive.
    struct DeletingTransform {
        target: DirectiveName,
    }

    impl Transformer for DeletingTransform {
        const NAME: &'static str = "DeletingTransform";

        fn transform_directive(
            &mut self,
            directive: &SetDirectiveValue,
        ) -> Transformed<SetDirectiveValue> {
            if directive.name == self.target {
                Transformed::Delete
            } else {
                Transformed::Keep
            }
        }
    }

    /// Renames every application of one directive, exercising `Replace`.
    struct RenamingTransform {
        from: DirectiveName,
        to: DirectiveName,
    }

    impl Transformer for RenamingTransform {
        const NAME: &'static str = "RenamingTransform";

        fn transform_directive(
            &mut self,
            directive: &SetDirectiveValue,
        ) -> Transformed<SetDirectiveValue> {
            if directive.name == self.from {
                let mut replacement = directive.clone();
                replacement.name = self.to;
                Transformed::Replace(replacement)
            } else {
                Transformed::Keep
            }
        }
    }

    const SDL: &str = r#"
        directive @on_schema on SCHEMA
        directive @on_type on OBJECT
        directive @on_field on FIELD_DEFINITION
        directive @on_field_arg on ARGUMENT_DEFINITION
        directive @on_input_field on INPUT_FIELD_DEFINITION
        directive @on_enum_value on ENUM_VALUE

        schema @on_schema {
          query: Query
        }
        type T @on_type {
          afield(anarg: String @on_field_arg): String @on_field
        }
        input I {
          infield: String @on_input_field
        }
        enum E {
          VALUE @on_enum_value
        }
        type Query {
          myQ: T
        }
    "#;

    /// Every directive application the default walk reaches, sorted.
    ///
    /// The assertions go through the walk rather than the printed SDL: a
    /// substring probe cannot tell `@on_field` from `@on_field_arg`, nor from
    /// the `directive @on_field` definition.
    fn applications(set: &mut SchemaSet) -> Vec<String> {
        let mut transform = RecordingTransform::default();
        transform.transform_schema_set(set);
        transform.seen.sort();
        transform.seen
    }

    #[test]
    fn walk_reaches_every_directive_position() {
        let mut set = set_from_str(SDL);
        assert_eq!(
            applications(&mut set),
            vec![
                "on_enum_value",
                "on_field",
                "on_field_arg",
                "on_input_field",
                "on_schema",
                "on_type",
            ],
            "the default walk should reach directives on the root schema, types, fields, field arguments, input object fields and enum values"
        );
    }

    #[test]
    fn delete_removes_only_the_targeted_directive() {
        let mut set = set_from_str(SDL);
        DeletingTransform {
            target: DirectiveName("on_field".intern()),
        }
        .transform_schema_set(&mut set);

        assert_eq!(
            applications(&mut set),
            vec![
                "on_enum_value",
                "on_field_arg",
                "on_input_field",
                "on_schema",
                "on_type",
            ],
            "only @on_field should be gone; the similarly-named @on_field_arg must survive"
        );
    }

    #[test]
    fn replace_swaps_the_directive_in_place() {
        let mut set = set_from_str(SDL);
        RenamingTransform {
            from: DirectiveName("on_type".intern()),
            to: DirectiveName("renamed".intern()),
        }
        .transform_schema_set(&mut set);

        assert_eq!(
            applications(&mut set),
            vec![
                "on_enum_value",
                "on_field",
                "on_field_arg",
                "on_input_field",
                "on_schema",
                "renamed",
            ],
        );
    }

    #[test]
    fn keep_leaves_the_set_untouched() {
        let mut set = set_from_str(SDL);
        let before = set.to_sdl_definition().to_string();
        RecordingTransform::default().transform_schema_set(&mut set);
        assert_eq!(
            before,
            set.to_sdl_definition().to_string(),
            "a transform that only returns Keep must not alter the set"
        );
    }
}
