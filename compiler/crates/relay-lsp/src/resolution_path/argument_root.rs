/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::*;

impl<'a> ArgumentParent<'a> {
    pub fn find_argument_root(&'a self) -> ArgumentRoot<'a> {
        match self {
            Self::Directive(directive_path) => ArgumentRoot::Directive(directive_path),
            Self::ScalarField(scalar_field_path) => ArgumentRoot::ScalarField(scalar_field_path),
            Self::LinkedField(linked_field_path) => ArgumentRoot::LinkedField(linked_field_path),
            Self::ConstantObject(ConstantObjectPath { inner: _, parent }) => parent
                .parent
                .find_enclosing_argument_path()
                .parent
                .find_argument_root(),
        }
    }
}

/// An Argument contains a Value. One variant of Value is a vector of Arguments.
/// This makes it difficult to match on arguments to find their "logical parent"
/// (i.e. the first parent that isn't another argument.)
///
/// The ArgumentParentRoot enum represents the possible logical parents for these
/// arguments. An argument can ultimately be passed to a field or a directive.
#[derive(Debug)]
pub enum ArgumentRoot<'a> {
    LinkedField(&'a LinkedFieldPath<'a>),
    ScalarField(&'a ScalarFieldPath<'a>),
    Directive(&'a DirectivePath<'a>),
}

#[cfg(test)]
mod test {
    use crate::resolution_path::test::test_resolution;

    use super::*;

    #[test]
    fn argument_root_scalar_field_constant_object_path() {
        let source = r#"
            query Foo {
                me(foo: {bar: {baz: $qux}})
            }
        "#;
        test_resolution(source, ": $qux", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::ConstantObject(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::ScalarField(_))
            } else {
                panic!(
                    "Should resolve to Argument with ConstantObject parent, instead got {:?}",
                    resolved
                );
            }
        });
    }

    #[test]
    fn argument_root_scalar_field_scalar_field_path() {
        let source = r#"
            query Foo {
                me(foo: {bar: {baz: $qux}})
            }
        "#;
        test_resolution(source, ": {bar", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::ScalarField(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::ScalarField(_))
            } else {
                panic!(
                    "Should resolve to Argument with ScalarField parent, instead got {:?}",
                    resolved
                );
            }
        });
    }

    #[test]
    fn argument_root_linked_field_constant_object_path() {
        let source = r#"
            query Foo {
                me(foo: {bar: {baz: $qux}}) {
                    name
                }
            }
        "#;
        test_resolution(source, ": $qux", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::ConstantObject(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::LinkedField(_))
            } else {
                panic!(
                    "Should resolve to Argument with ConstantObject parent, instead got {:?}",
                    resolved
                );
            }
        });
    }

    #[test]
    fn argument_root_linked_field_linked_field_path() {
        let source = r#"
            query Foo {
                me(foo: {bar: {baz: $qux}}) {
                    name
                }
            }
        "#;
        test_resolution(source, ": {bar", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::LinkedField(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::LinkedField(_))
            } else {
                panic!(
                    "Should resolve to Argument with LinkedField parent, instead got {:?}",
                    resolved
                );
            }
        });
    }

    #[test]
    fn argument_root_directive_constant_object_path() {
        let source = r#"
            query Foo {
                me @foo(param: {bar: {baz: $qux}})
            }
        "#;
        test_resolution(source, ": $qux", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::ConstantObject(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::Directive(_))
            } else {
                panic!(
                    "Should resolve to Argument with ConstantObject parent, instead got {:?}",
                    resolved
                );
            }
        });
    }

    #[test]
    fn argument_root_directive_directive_path() {
        let source = r#"
            query Foo {
                me @foo(param: {bar: {baz: $qux}})
            }
        "#;
        test_resolution(source, ": {bar", |resolved| {
            if let ResolutionPath::Argument(ArgumentPath {
                inner: _,
                parent: parent @ ArgumentParent::Directive(_),
            }) = resolved
            {
                assert_matches!(parent.find_argument_root(), ArgumentRoot::Directive(_))
            } else {
                panic!(
                    "Should resolve to Argument with Directive parent, instead got {:?}",
                    resolved
                );
            }
        });
    }
}
