/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::*;

impl<'a> TypeAnnotationParent<'a> {
    pub fn find_variable_definition_path(&'a self) -> &'a VariableDefinitionPath<'a> {
        match self {
            TypeAnnotationParent::VariableDefinition(variable_definition_path) => {
                variable_definition_path
            }
            TypeAnnotationParent::ListTypeAnnotation(ListTypeAnnotationPath {
                inner: _,
                parent: list_type_annotation_parent,
            }) => list_type_annotation_parent
                .parent
                .find_variable_definition_path(),
            TypeAnnotationParent::NonNullTypeAnnotation(NonNullTypeAnnotationPath {
                inner: _,
                parent: non_null_type_annotation_parent,
            }) => non_null_type_annotation_parent
                .parent
                .find_variable_definition_path(),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::resolution_path::test::test_resolution;

    use super::*;

    #[test]
    fn variable_definition_path_named_type_annotation() {
        let source = r#"
            query Foo($isCool: Boolean) {
                me
            }
        "#;
        test_resolution(source, "Boolean", |resolved| {
            if let ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                        inner: _,
                        parent:
                            TypeAnnotationPath {
                                inner: _,
                                parent: type_annotation_parent,
                            },
                    }),
            }) = resolved
            {
                let variable_definition_path =
                    type_annotation_parent.find_variable_definition_path();
                assert!(variable_definition_path.inner.name.name.lookup() == "isCool");
            } else {
                panic!(
                    "Should resolve to Ident with parent NamedTypedAnnotation, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn variable_definition_path_list() {
        let source = r#"
            query Foo($isCool: [Boolean]) {
                me
            }
        "#;
        test_resolution(source, "Boolean", |resolved| {
            if let ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                        inner: _,
                        parent:
                            TypeAnnotationPath {
                                inner: _,
                                parent: type_annotation_parent,
                            },
                    }),
            }) = resolved
            {
                let variable_definition_path =
                    type_annotation_parent.find_variable_definition_path();
                assert!(variable_definition_path.inner.name.name.lookup() == "isCool");
            } else {
                panic!(
                    "Should resolve to Ident with parent NamedTypedAnnotation, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn variable_definition_path_non_null() {
        let source = r#"
            query Foo($isCool: Boolean!) {
                me
            }
        "#;
        test_resolution(source, "Boolean", |resolved| {
            if let ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                        inner: _,
                        parent:
                            TypeAnnotationPath {
                                inner: _,
                                parent: type_annotation_parent,
                            },
                    }),
            }) = resolved
            {
                let variable_definition_path =
                    type_annotation_parent.find_variable_definition_path();
                assert!(variable_definition_path.inner.name.name.lookup() == "isCool");
            } else {
                panic!(
                    "Should resolve to Ident with parent NamedTypedAnnotation, instead got {:?}",
                    resolved
                );
            }
        })
    }

    #[test]
    fn variable_definition_path_non_null_list_of_non_null() {
        let source = r#"
            query Foo($isCool: [Boolean!]!) {
                me
            }
        "#;
        test_resolution(source, "Boolean", |resolved| {
            if let ResolutionPath::Ident(IdentPath {
                inner: _,
                parent:
                    IdentParent::NamedTypeAnnotation(NamedTypeAnnotationPath {
                        inner: _,
                        parent:
                            TypeAnnotationPath {
                                inner: _,
                                parent: type_annotation_parent,
                            },
                    }),
            }) = resolved
            {
                let variable_definition_path =
                    type_annotation_parent.find_variable_definition_path();
                assert!(variable_definition_path.inner.name.name.lookup() == "isCool");
            } else {
                panic!(
                    "Should resolve to Ident with parent NamedTypedAnnotation, instead got {:?}",
                    resolved
                );
            }
        })
    }
}
