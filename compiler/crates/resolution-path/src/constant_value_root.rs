/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::*;

impl<'a> ConstantValueParent<'a> {
    pub fn find_constant_value_root(&'a self) -> ConstantValueRoot<'a> {
        match self {
            ConstantValueParent::DefaultValue(DefaultValuePath {
                inner: _,
                parent: DefaultValueParent::InputValueDefinition(input_value_definition_path),
            }) => ConstantValueRoot::InputValueDefinition(input_value_definition_path),
            ConstantValueParent::DefaultValue(DefaultValuePath {
                inner: _,
                parent: DefaultValueParent::VariableDefinition(variable_definition_path),
            }) => ConstantValueRoot::VariableDefinition(variable_definition_path),
            ConstantValueParent::Value(ValuePath {
                inner: _,
                parent: value_parent,
            }) => ConstantValueRoot::Argument(value_parent.find_enclosing_argument_path()),
            ConstantValueParent::ConstantList(ConstantListPath {
                inner: _,
                parent: constant_list_path_parent,
            }) => constant_list_path_parent.parent.find_constant_value_root(),
            ConstantValueParent::ConstantObj(constant_obj) => {
                constant_obj.parent.parent.find_constant_value_root()
            }
            ConstantValueParent::ConstantArgumentValue(constant_argument_path) => {
                match &constant_argument_path.parent {
                    ConstantArgumentParent::ConstantDirective(_) => {
                        ConstantValueRoot::ConstantArgument(constant_argument_path)
                    }
                    ConstantArgumentParent::ConstantObj(ConstantObjPath {
                        inner: _,
                        parent: constant_value_path,
                    }) => constant_value_path.parent.find_constant_value_root(),
                }
            }
        }
    }
}

impl<'a> ValueParent<'a> {
    /// Values can be contained in other Values or in an Argument, meaning
    /// that all Values ultimately are contained in an Argument.
    /// Recursively traverse the ValueParent until we find the enclosing
    /// Argument, and return the wrapping ArgumentPath.
    pub fn find_enclosing_argument_path(&'a self) -> &'a ArgumentPath<'a> {
        match self {
            ValueParent::ArgumentValue(argument_path) => argument_path,
            ValueParent::ValueList(ValueListPath {
                inner: _,
                parent: value_path,
            }) => value_path.parent.find_enclosing_argument_path(),
        }
    }
}

/// Constant objects and lists can contain each other, as well as constant
/// booleans, floats, ints, strings, nulls and enums. This makes it difficult to match
/// on these items to find their "logical parent" (i.e. the first parent that isn't
/// related to the literal).
///
/// The ConstantValueRoot enum represents the possible logical parents for these items.
/// This can be either a VariableDefinitionPath (meaning the value was part of a default
/// value for a variable), or an ArgumentPath (meaning the value was an argument to a
/// field or directive.)
#[derive(Debug)]
pub enum ConstantValueRoot<'a> {
    VariableDefinition(&'a VariableDefinitionPath<'a>),
    InputValueDefinition(&'a InputValueDefinitionPath<'a>),
    ConstantArgument(&'a ConstantArgumentPath<'a>),
    Argument(&'a ArgumentPath<'a>),
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::test::test_resolution;
    use crate::test::test_schema_resolution;

    #[test]
    fn constant_value_root_variable_definition_simple_boolean() {
        let source = r#"
            query Foo($isCool: Boolean = true) {
                me
            }
        "#;
        test_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::VariableDefinition(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_root_variable_definition_nested_boolean() {
        let source = r#"
            query Foo($isCool: AComplexType = {query: "Hello", inputs: [true]}) {
                me
            }
        "#;
        test_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::VariableDefinition(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_root_argument_simple_boolean() {
        let source = r#"
            query Foo {
                me(is_cool: true)
            }
        "#;
        test_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::Argument(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_root_argument_nested_boolean() {
        let source = r#"
            query Foo {
                me(is_cool: {query: "Hello", inputs:[true]})
            }
        "#;
        test_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::Argument(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_input_value_definition_simple_boolean() {
        let source = r#"
            input Foo {
                bar: Boolean = true
            }
        "#;
        test_schema_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::InputValueDefinition(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_input_value_definition_nested_boolean() {
        let source = r#"
            input Foo {
                bar: AComplexType = {greeting: "Hello", inputs: [true]}
            }
        "#;
        test_schema_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::InputValueDefinition(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_constant_argument_simple_boolean() {
        let source = r#"
            scalar Foo @bar(baz: true)
        "#;
        test_schema_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::ConstantArgument(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn constant_value_constant_argument_nested_boolean() {
        let source = r#"
            scalar Foo @bar(baz: {greeting: "Hello", inputs: [true]})
        "#;
        test_schema_resolution(source, "true", |resolved| {
            if let ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                inner: _,
                parent: ConstantValuePath { inner: _, parent },
            }) = resolved
            {
                assert_matches!(
                    parent.find_constant_value_root(),
                    ConstantValueRoot::ConstantArgument(_)
                )
            } else {
                panic!(
                    "Should resolve to ConstantBoolean, instead got {:?}",
                    resolved
                );
            }
        })
    }
}
