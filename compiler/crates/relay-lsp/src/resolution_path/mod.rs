/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![allow(dead_code)]
use common::Span;
use graphql_syntax::{
    Argument, BooleanNode, ConstantArgument, ConstantValue, DefaultValue, Directive, EnumNode,
    ExecutableDefinition, ExecutableDocument, FloatNode, FragmentDefinition, FragmentSpread,
    Identifier, InlineFragment, IntNode, LinkedField, List, ListTypeAnnotation,
    NamedTypeAnnotation, NonNullTypeAnnotation, OperationDefinition, OperationKind, ScalarField,
    Selection, StringNode, Token, TypeAnnotation, TypeCondition, Value, VariableDefinition,
    VariableIdentifier,
};

mod constant_value_root;
pub use constant_value_root::ConstantValueRoot;
mod argument_root;
pub use argument_root::*;
mod selection_parent_type;
mod variable_definition_path;

/// This module resolves a position (`Span`) to a `ResolvePosition` which
/// enumerates the types of AST nodes which have a "surface area", meaning a
/// character in the code which belongs to the AST node but none of its
/// children.
///
/// By convention each `ResolvePosition` variant wraps a `[NODE_TYPE]Path`
/// struct. The `[NODE_TYPE]Path` stucts can be thought of an edge between an
/// child node (`inner`) and its parent (`parent`). By chaining these edges we can
/// construct a type safe path from the leaf node up to the AST root.
///
/// The `parent` field of each `[NODE_TYPE]Path` struct is -- again, by
/// convention -- either an enum or a type alias called `[NODE_TYPE]Parent`. If
/// a node type has only one valid parent AST node type, then a type alias to
/// that parent's `[NODE_TYPE]Path` is used. If a node type has multiple valid
/// parents, and enum wrapping all the valid `[NODE_TYPE]Path]`s is used.
///
/// **Note**: In some cases, a node type may appear as the child of a given
/// parent in multiple different fields. For example, an `Identifier` might
/// appear as either the name _or_ the alias of a `ScalarField`. In this case
/// the `IdentParent` enum should include two variants for `ScalarField`, one
/// for name and one for alias. This allows consumers to understand exactly where
/// the AST this `Identifier` appears.
///
/// ## Implementation Details
///
/// Each AST node type must implement three things:
///
/// - A `[NODE_TYPE]Parent` enum or type alias defining the valid parent///Path
///     type(s) that this node can have.
/// - A `[NODE_TYPE]Path` struct which is a `Path` with the type arguments
///     `Inner` defined as the AST node itself and `Parent` defined as the above
///     `[NODE_TYPE]Parent`.
/// - Implement the `ResolvePosition` trait for the AST node itself.
///
/// The actual logic of the module lives in the implementation of
/// `ResolvePosition::resolve` for each AST node. Each implementation must call
/// `.contains()` on each of its child nodes. When the child node containing the
/// `position` is discovered, it must return the result of calling `.resolve()`
/// on that child. If no child contains the `position`, then the node must
/// assume that _it itself_ is the leaf node and return its own variant of
/// `ResolutionPath`.
///
/// This approach is not ideal because there is an implicit (not enforced by the
/// compiler) contract that each parent node must check the result of
/// `.contains()` on a child before calling that child's `.resolve()` method.
/// Ideally `.resolve()` could return an `Option`, however calling `.resolve()`
/// moves the parent into child's method which means we need to convince the
/// compiler that we are only ever going to return the result of one child's
/// `.resolve()`. This pattern of `.contains()` followed by unconditionally
/// returning the result of the child's `.resolve()` allows us to prove this to
/// the compiler.

#[derive(Debug)]
pub enum ResolutionPath<'a> {
    Ident(IdentPath<'a>),
    OperationDefinition(OperationDefinitionPath<'a>),
    Operation(OperationPath<'a>),
    ExecutableDocument(&'a ExecutableDocument),
    ScalarField(ScalarFieldPath<'a>),
    LinkedField(LinkedFieldPath<'a>),
    InlineFragment(InlineFragmentPath<'a>),
    TypeCondition(TypeConditionPath<'a>),
    FragmentDefinition(FragmentDefinitionPath<'a>),
    FragmentSpread(FragmentSpreadPath<'a>),
    Directive(DirectivePath<'a>),
    Argument(ArgumentPath<'a>),
    ConstantInt(ConstantIntPath<'a>),
    ConstantFloat(ConstantFloatPath<'a>),
    ConstantString(ConstantStringPath<'a>),
    ConstantBoolean(ConstantBooleanPath<'a>),
    ConstantNull(ConstantNullPath<'a>),
    ConstantEnum(ConstantEnumPath<'a>),
    ConstantList(ConstantListPath<'a>),
    ConstantObj(ConstantObjPath<'a>),
    ConstantArg(ConstantArgPath<'a>),
    ValueList(ValueListPath<'a>),
    VariableIdentifier(VariableIdentifierPath<'a>),
    ConstantObject(ConstantObjectPath<'a>),
    VariableDefinitionList(VariableDefinitionListPath<'a>),
    VariableDefinition(VariableDefinitionPath<'a>),
    ListTypeAnnotation(ListTypeAnnotationPath<'a>),
    NonNullTypeAnnotation(NonNullTypeAnnotationPath<'a>),
    DefaultValue(DefaultValuePath<'a>),
}
#[derive(Debug)]
pub struct Path<Inner, Parent> {
    pub inner: Inner,
    pub parent: Parent,
}

pub trait ResolvePosition<'a>: Sized {
    type Parent;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a>;
    fn contains(&'a self, position: Span) -> bool;
    fn path(&'a self, parent: Self::Parent) -> Path<&Self, Self::Parent> {
        Path {
            inner: self,
            parent,
        }
    }
}

pub type ExecutableDocumentPath<'a> = Path<&'a ExecutableDocument, ()>;

// Clippy gets grumpy about us passing around `()`, but we need it for consistency with other implementations of `ResolvePosition`.
#[allow(clippy::unit_arg)]
impl<'a> ResolvePosition<'a> for ExecutableDocument {
    type Parent = ();

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for definition in &self.definitions {
            if definition.contains(position) {
                return definition.resolve(self.path(parent), position);
            }
        }
        // We didn't find the position in the definitions
        ResolutionPath::ExecutableDocument(self)
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type OperationKindPath<'a> = Path<&'a (Token, OperationKind), OperationKindParent<'a>>;

pub type OperationKindParent<'a> = OperationDefinitionPath<'a>;

pub type FragmentDefinitionPath<'a> = Path<&'a FragmentDefinition, FragmentDefinitionParent<'a>>;

pub type FragmentDefinitionParent<'a> = ExecutableDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for FragmentDefinition {
    type Parent = FragmentDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently implement a node for the keyword `fragment`.
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::FragmentDefinitionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    DirectiveParent::FragmentDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(variable_definitions) = &self.variable_definitions {
            if variable_definitions.contains(position) {
                return variable_definitions.resolve(
                    VariableDefinitionListParent::FragmentDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if self.type_condition.contains(position) {
            return self.type_condition.resolve(
                TypeConditionParent::FragmentDefinition(self.path(parent)),
                position,
            );
        }
        for selection in &self.selections.items {
            if selection.span().contains(position) {
                return selection.resolve(
                    SelectionParent::FragmentDefinitionSelection(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::FragmentDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.location.contains(position)
    }
}

pub type VariableDefinitionListPath<'a> =
    Path<&'a List<VariableDefinition>, VariableDefinitionListParent<'a>>;

#[derive(Debug)]
pub enum VariableDefinitionListParent<'a> {
    FragmentDefinition(FragmentDefinitionPath<'a>),
    OperationDefinition(OperationDefinitionPath<'a>),
}

impl<'a> ResolvePosition<'a> for List<VariableDefinition> {
    type Parent = VariableDefinitionListParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for value in &self.items {
            if value.contains(position) {
                return value.resolve(self.path(parent), position);
            }
        }
        ResolutionPath::VariableDefinitionList(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type VariableDefinitionPath<'a> = Path<&'a VariableDefinition, VariableDefinitionParent<'a>>;
pub type VariableDefinitionParent<'a> = VariableDefinitionListPath<'a>;

impl<'a> ResolvePosition<'a> for VariableDefinition {
    type Parent = VariableDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                VariableIdentifierParent::VariableDefinition(self.path(parent)),
                position,
            );
        }
        // Note: We skip the `:` for now
        if self.type_.contains(position) {
            return self.type_.resolve(
                TypeAnnotationParent::VariableDefinition(self.path(parent)),
                position,
            );
        }

        if let Some(default) = &self.default_value {
            if default.contains(position) {
                return default.resolve(self.path(parent), position);
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    DirectiveParent::VariableDefinition(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::VariableDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type DefaultValuePath<'a> = Path<&'a DefaultValue, DefaultValueParent<'a>>;
pub type DefaultValueParent<'a> = VariableDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for DefaultValue {
    type Parent = DefaultValueParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.value.contains(position) {
            return self.value.resolve(
                ConstantValueParent::DefaultValue(self.path(parent)),
                position,
            );
        }

        // Note: We skip the `=` for now

        ResolutionPath::DefaultValue(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type TypeAnnotationPath<'a> = Path<&'a TypeAnnotation, TypeAnnotationParent<'a>>;
#[derive(Debug)]
pub enum TypeAnnotationParent<'a> {
    VariableDefinition(VariableDefinitionPath<'a>),
    ListTypeAnnotation(ListTypeAnnotationPath<'a>),
    NonNullTypeAnnotation(NonNullTypeAnnotationPath<'a>),
}
impl<'a> ResolvePosition<'a> for TypeAnnotation {
    type Parent = TypeAnnotationParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            TypeAnnotation::Named(named_type) => named_type.resolve(self.path(parent), position),
            TypeAnnotation::List(list) => list.resolve(Box::new(self.path(parent)), position),
            TypeAnnotation::NonNull(non_null) => {
                non_null.resolve(Box::new(self.path(parent)), position)
            }
        }
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span().contains(position)
    }
}

// Note: since a NamedTypeAnnotation contains only a single Ident, it is impossible
// to resolve a span to a NamedTypeAnnotationPath. Instead, such a span would resolve to
// an IdentPath whose parent is a NamedTypeAnnotationPath.
//
// As a consequence, the ResolutionPath enum does not contain a NamedTypeAnnotation
// variant, and we return self.name.resolve(...) directly instead.
impl<'a> ResolvePosition<'a> for NamedTypeAnnotation {
    type Parent = TypeAnnotationPath<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        self.name.resolve(
            IdentParent::NamedTypeAnnotation(self.path(parent)),
            position,
        )
    }

    fn contains(&'a self, position: Span) -> bool {
        self.name.contains(position)
    }
}

pub type NamedTypeAnnotationPath<'a> = Path<&'a NamedTypeAnnotation, TypeAnnotationPath<'a>>;

pub type ListTypeAnnotationPath<'a> =
    Path<&'a ListTypeAnnotation, Box<ListTypeAnnotationParent<'a>>>;
pub type ListTypeAnnotationParent<'a> = TypeAnnotationPath<'a>;

impl<'a> ResolvePosition<'a> for ListTypeAnnotation {
    type Parent = Box<ListTypeAnnotationParent<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently return the `[]` as separate tokens.
        if self.type_.contains(position) {
            return self.type_.resolve(
                TypeAnnotationParent::ListTypeAnnotation(self.path(parent)),
                position,
            );
        }
        ResolutionPath::ListTypeAnnotation(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type NonNullTypeAnnotationPath<'a> =
    Path<&'a NonNullTypeAnnotation, Box<NonNullTypeAnnotationParent<'a>>>;
pub type NonNullTypeAnnotationParent<'a> = TypeAnnotationPath<'a>;

impl<'a> ResolvePosition<'a> for NonNullTypeAnnotation {
    type Parent = Box<NonNullTypeAnnotationParent<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently return the `[]` as separate tokens.
        if self.type_.contains(position) {
            return self.type_.resolve(
                TypeAnnotationParent::NonNullTypeAnnotation(self.path(parent)),
                position,
            );
        }
        ResolutionPath::NonNullTypeAnnotation(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type OperationDefinitionPath<'a> = Path<&'a OperationDefinition, OperationDefinitionParent<'a>>;
pub type OperationDefinitionParent<'a> = ExecutableDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for OperationDefinition {
    type Parent = OperationDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if let Some(name) = &self.name {
            if name.contains(position) {
                return name.resolve(
                    IdentParent::OperationDefinitionName(self.path(parent)),
                    position,
                );
            }
        }
        if let Some(operation) = &self.operation {
            if operation.contains(position) {
                return operation.resolve(self.path(parent), position);
            }
        }
        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    DirectiveParent::OperationDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(variable_definitions) = &self.variable_definitions {
            if variable_definitions.contains(position) {
                return variable_definitions.resolve(
                    VariableDefinitionListParent::OperationDefinition(self.path(parent)),
                    position,
                );
            }
        }

        for selection in &self.selections.items {
            if selection.span().contains(position) {
                return selection.resolve(
                    SelectionParent::OperationDefinitionSelection(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::OperationDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.location.contains(position)
    }
}

pub type OperationPath<'a> = Path<&'a (Token, OperationKind), OperationParent<'a>>;
pub type OperationParent<'a> = OperationDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for (Token, OperationKind) {
    type Parent = OperationParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, _position: Span) -> ResolutionPath<'a> {
        ResolutionPath::Operation(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.0.span.contains(position)
    }
}

pub type ExecutableDefinitionPath<'a> =
    Path<&'a ExecutableDefinition, ExecutableDefinitionParent<'a>>;
pub type ExecutableDefinitionParent<'a> = ExecutableDocumentPath<'a>;

impl<'a> ResolvePosition<'a> for ExecutableDefinition {
    type Parent = ExecutableDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            ExecutableDefinition::Operation(operation) => {
                operation.resolve(self.path(parent), position)
            }
            ExecutableDefinition::Fragment(fragment) => {
                fragment.resolve(self.path(parent), position)
            }
        }
    }

    fn contains(&'a self, position: Span) -> bool {
        match self {
            ExecutableDefinition::Operation(def) => def.contains(position),
            ExecutableDefinition::Fragment(def) => def.contains(position),
        }
    }
}

pub type IdentPath<'a> = Path<&'a Identifier, IdentParent<'a>>;

#[derive(Debug)]
pub enum IdentParent<'a> {
    OperationDefinitionName(OperationDefinitionPath<'a>),
    FragmentDefinitionName(FragmentDefinitionPath<'a>),
    ScalarFieldName(ScalarFieldPath<'a>),
    ScalarFieldAlias(ScalarFieldPath<'a>),
    LinkedFieldName(LinkedFieldPath<'a>),
    LinkedFieldAlias(LinkedFieldPath<'a>),
    TypeConditionType(TypeConditionPath<'a>),
    FragmentSpreadName(FragmentSpreadPath<'a>),
    DirectiveName(DirectivePath<'a>),
    ArgumentName(ArgumentPath<'a>),
    ArgumentValue(ArgumentPath<'a>),
    NamedTypeAnnotation(NamedTypeAnnotationPath<'a>),
    ConstantArgKey(ConstantArgPath<'a>),
}

impl<'a> ResolvePosition<'a> for Identifier {
    type Parent = IdentParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, _position: Span) -> ResolutionPath<'a> {
        ResolutionPath::Ident(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type SelectionPath<'a> = Path<&'a Selection, SelectionParent<'a>>;
#[derive(Debug)]
pub enum SelectionParent<'a> {
    OperationDefinitionSelection(OperationDefinitionPath<'a>),
    LinkedFieldSelection(LinkedFieldPath<'a>),
    FragmentDefinitionSelection(FragmentDefinitionPath<'a>),
    InlineFragmentSelection(InlineFragmentPath<'a>),
}

impl<'a> ResolvePosition<'a> for Selection {
    type Parent = SelectionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            Selection::ScalarField(field) => field.resolve(self.path(parent), position),
            Selection::LinkedField(field) => field.resolve(Box::new(self.path(parent)), position),
            Selection::InlineFragment(fragment) => {
                fragment.resolve(Box::new(self.path(parent)), position)
            }
            Selection::FragmentSpread(fragment_spread) => {
                fragment_spread.resolve(self.path(parent), position)
            }
        }
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span().contains(position)
    }
}

pub type FragmentSpreadPath<'a> = Path<&'a FragmentSpread, FragmentSpreadParent<'a>>;
pub type FragmentSpreadParent<'a> = SelectionPath<'a>;

impl<'a> ResolvePosition<'a> for FragmentSpread {
    type Parent = FragmentSpreadParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently handle `...` explicitly
        if self.name.contains(position) {
            return self
                .name
                .resolve(IdentParent::FragmentSpreadName(self.path(parent)), position);
        }
        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive
                    .resolve(DirectiveParent::FragmentSpread(self.path(parent)), position);
            }
        }
        ResolutionPath::FragmentSpread(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type DirectivePath<'a> = Path<&'a Directive, DirectiveParent<'a>>;
#[derive(Debug)]
pub enum DirectiveParent<'a> {
    ScalarField(ScalarFieldPath<'a>),
    LinkedField(LinkedFieldPath<'a>),
    FragmentDefinition(FragmentDefinitionPath<'a>),
    FragmentSpread(FragmentSpreadPath<'a>),
    VariableDefinition(VariableDefinitionPath<'a>),
    OperationDefinition(OperationDefinitionPath<'a>),
    InlineFragment(InlineFragmentPath<'a>),
}
impl<'a> ResolvePosition<'a> for Directive {
    type Parent = DirectiveParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently handle the `@` explicitly.
        if self.name.contains(position) {
            return self
                .name
                .resolve(IdentParent::DirectiveName(self.path(parent)), position);
        }
        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument
                        .resolve(ArgumentParent::Directive(self.path(parent)), position);
                }
            }
        }
        ResolutionPath::Directive(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ScalarFieldPath<'a> = Path<&'a ScalarField, SelectionPath<'a>>;

impl<'a> ResolvePosition<'a> for ScalarField {
    type Parent = SelectionPath<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self
                .name
                .resolve(IdentParent::ScalarFieldName(self.path(parent)), position);
        }

        if let Some(alias) = &self.alias {
            if alias.span.contains(position) {
                return alias
                    .alias
                    .resolve(IdentParent::ScalarFieldAlias(self.path(parent)), position);
            }
        }

        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument
                        .resolve(ArgumentParent::ScalarField(self.path(parent)), position);
                }
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive
                    .resolve(DirectiveParent::ScalarField(self.path(parent)), position);
            }
        }
        ResolutionPath::ScalarField(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type LinkedFieldPath<'a> = Path<&'a LinkedField, Box<SelectionPath<'a>>>;

impl<'a> ResolvePosition<'a> for LinkedField {
    type Parent = Box<SelectionPath<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self
                .name
                .resolve(IdentParent::LinkedFieldName(self.path(parent)), position);
        }

        if let Some(alias) = &self.alias {
            if alias.span.contains(position) {
                return alias
                    .alias
                    .resolve(IdentParent::LinkedFieldAlias(self.path(parent)), position);
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive
                    .resolve(DirectiveParent::LinkedField(self.path(parent)), position);
            }
        }

        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument
                        .resolve(ArgumentParent::LinkedField(self.path(parent)), position);
                }
            }
        }
        for selection in &self.selections.items {
            if selection.contains(position) {
                return selection.resolve(
                    SelectionParent::LinkedFieldSelection(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::LinkedField(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type InlineFragmentPath<'a> = Path<&'a InlineFragment, Box<SelectionPath<'a>>>;

impl<'a> ResolvePosition<'a> for InlineFragment {
    type Parent = Box<SelectionPath<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't explicitly handle `...`
        if let Some(type_condition) = &self.type_condition {
            if type_condition.contains(position) {
                return type_condition.resolve(
                    TypeConditionParent::InlineFragment(self.path(parent)),
                    position,
                );
            }
        }
        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive
                    .resolve(DirectiveParent::InlineFragment(self.path(parent)), position);
            }
        }
        for selection in &self.selections.items {
            if selection.contains(position) {
                return selection.resolve(
                    SelectionParent::InlineFragmentSelection(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::InlineFragment(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type TypeConditionPath<'a> = Path<&'a TypeCondition, TypeConditionParent<'a>>;
#[derive(Debug)]
pub enum TypeConditionParent<'a> {
    InlineFragment(InlineFragmentPath<'a>),
    FragmentDefinition(FragmentDefinitionPath<'a>),
}
impl<'a> ResolvePosition<'a> for TypeCondition {
    type Parent = TypeConditionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't explicitly handle `on`
        if self.type_.contains(position) {
            return self
                .type_
                .resolve(IdentParent::TypeConditionType(self.path(parent)), position);
        }

        ResolutionPath::TypeCondition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ArgumentPath<'a> = Path<&'a Argument, ArgumentParent<'a>>;
#[derive(Debug)]
pub enum ArgumentParent<'a> {
    LinkedField(LinkedFieldPath<'a>),
    ScalarField(ScalarFieldPath<'a>),
    ConstantObject(ConstantObjectPath<'a>),
    Directive(DirectivePath<'a>),
}

impl<'a> ResolvePosition<'a> for Argument {
    type Parent = ArgumentParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't explicitly handle `:`
        if self.name.span.contains(position) {
            return self
                .name
                .resolve(IdentParent::ArgumentName(self.path(parent)), position);
        }
        if self.value.contains(position) {
            return self
                .value
                .resolve(ValueParent::ArgumentValue(self.path(parent)), position);
        }
        ResolutionPath::Argument(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ValuePath<'a> = Path<&'a Value, ValueParent<'a>>;
#[derive(Debug)]
pub enum ValueParent<'a> {
    ArgumentValue(ArgumentPath<'a>),
    ValueList(ValueListPath<'a>),
}
impl<'a> ResolvePosition<'a> for Value {
    type Parent = ValueParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            Value::Constant(val) => {
                val.resolve(ConstantValueParent::Value(self.path(parent)), position)
            }
            Value::Variable(val) => {
                val.resolve(VariableIdentifierParent::Value(self.path(parent)), position)
            }
            Value::List(list) => list.resolve(Box::new(self.path(parent)), position),
            Value::Object(obj) => obj.resolve(Box::new(self.path(parent)), position),
        }
    }

    fn contains(&'a self, position: Span) -> bool {
        match self {
            Value::Constant(val) => val.contains(position),
            Value::Variable(val) => val.contains(position),
            Value::List(list) => list.contains(position),
            Value::Object(obj) => obj.contains(position),
        }
    }
}

pub type ConstantValuePath<'a> = Path<&'a ConstantValue, ConstantValueParent<'a>>;
#[derive(Debug)]
pub enum ConstantValueParent<'a> {
    Value(ValuePath<'a>),
    DefaultValue(DefaultValuePath<'a>),
    ConstantList(ConstantListPath<'a>),
    ConstantObj(Box<ConstantObjPath<'a>>),
    ConstantArgValue(ConstantArgPath<'a>),
}
impl<'a> ResolvePosition<'a> for ConstantValue {
    type Parent = ConstantValueParent<'a>;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            ConstantValue::Int(int) => ResolutionPath::ConstantInt(ConstantIntPath {
                inner: int,
                parent: self.path(parent),
            }),
            ConstantValue::Float(float) => ResolutionPath::ConstantFloat(ConstantFloatPath {
                inner: float,
                parent: self.path(parent),
            }),
            ConstantValue::String(string) => ResolutionPath::ConstantString(ConstantStringPath {
                inner: string,
                parent: self.path(parent),
            }),
            ConstantValue::Boolean(boolean) => {
                ResolutionPath::ConstantBoolean(ConstantBooleanPath {
                    inner: boolean,
                    parent: self.path(parent),
                })
            }
            ConstantValue::Null(null) => ResolutionPath::ConstantNull(ConstantNullPath {
                inner: null,
                parent: self.path(parent),
            }),
            ConstantValue::Enum(enum_) => ResolutionPath::ConstantEnum(ConstantEnumPath {
                inner: enum_,
                parent: self.path(parent),
            }),
            ConstantValue::List(list) => list.resolve(Box::new(self.path(parent)), position),
            ConstantValue::Object(obj) => obj.resolve(Box::new(self.path(parent)), position),
        }
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span().contains(position)
    }
}

pub type ConstantIntPath<'a> = Path<&'a IntNode, ConstantValuePath<'a>>;
pub type ConstantFloatPath<'a> = Path<&'a FloatNode, ConstantValuePath<'a>>;
pub type ConstantStringPath<'a> = Path<&'a StringNode, ConstantValuePath<'a>>;
pub type ConstantBooleanPath<'a> = Path<&'a BooleanNode, ConstantValuePath<'a>>;
pub type ConstantNullPath<'a> = Path<&'a Token, ConstantValuePath<'a>>;
pub type ConstantEnumPath<'a> = Path<&'a EnumNode, ConstantValuePath<'a>>;

pub type ConstantListPath<'a> = Path<&'a List<ConstantValue>, Box<ConstantValuePath<'a>>>;
impl<'a> ResolvePosition<'a> for List<ConstantValue> {
    type Parent = Box<ConstantValuePath<'a>>;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for constant in &self.items {
            if constant.contains(position) {
                return constant.resolve(
                    ConstantValueParent::ConstantList(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::ConstantList(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ConstantObjPath<'a> = Path<&'a List<ConstantArgument>, Box<ConstantValuePath<'a>>>;

impl<'a> ResolvePosition<'a> for List<ConstantArgument> {
    type Parent = Box<ConstantValuePath<'a>>;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for arg in &self.items {
            if arg.contains(position) {
                return arg.resolve(self.path(parent), position);
            }
        }
        ResolutionPath::ConstantObj(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ConstantArgPath<'a> = Path<&'a ConstantArgument, ConstantObjPath<'a>>;

impl<'a> ResolvePosition<'a> for ConstantArgument {
    type Parent = ConstantObjPath<'a>;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self
                .name
                .resolve(IdentParent::ConstantArgKey(self.path(parent)), position);
        }
        if self.value.contains(position) {
            return self.value.resolve(
                ConstantValueParent::ConstantArgValue(self.path(parent)),
                position,
            );
        }
        ResolutionPath::ConstantArg(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type VariableIdentifierPath<'a> = Path<&'a VariableIdentifier, VariableIdentifierParent<'a>>;
#[derive(Debug)]
pub enum VariableIdentifierParent<'a> {
    Value(ValuePath<'a>),
    VariableDefinition(VariableDefinitionPath<'a>),
}
impl<'a> ResolvePosition<'a> for VariableIdentifier {
    type Parent = VariableIdentifierParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, _position: Span) -> ResolutionPath<'a> {
        ResolutionPath::VariableIdentifier(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ValueListPath<'a> = Path<&'a List<Value>, Box<ValuePath<'a>>>;

impl<'a> ResolvePosition<'a> for List<Value> {
    type Parent = Box<ValuePath<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for value in &self.items {
            if value.contains(position) {
                return value.resolve(ValueParent::ValueList(self.path(parent)), position);
            }
        }
        ResolutionPath::ValueList(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ConstantObjectPath<'a> = Path<&'a List<Argument>, Box<ValuePath<'a>>>;

impl<'a> ResolvePosition<'a> for List<Argument> {
    type Parent = Box<ValuePath<'a>>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for arg in &self.items {
            if arg.contains(position) {
                return arg.resolve(ArgumentParent::ConstantObject(self.path(parent)), position);
            }
        }
        ResolutionPath::ConstantObject(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

#[cfg(test)]
mod test;
