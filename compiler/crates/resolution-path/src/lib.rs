/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![allow(dead_code)]
use common::Span;
use graphql_syntax::Argument;
use graphql_syntax::BooleanNode;
use graphql_syntax::ConstantArgument;
use graphql_syntax::ConstantDirective;
use graphql_syntax::ConstantValue;
use graphql_syntax::DefaultValue;
use graphql_syntax::Directive;
use graphql_syntax::DirectiveDefinition;
use graphql_syntax::EnumNode;
use graphql_syntax::EnumTypeDefinition;
use graphql_syntax::EnumTypeExtension;
use graphql_syntax::EnumValueDefinition;
use graphql_syntax::ExecutableDefinition;
use graphql_syntax::ExecutableDocument;
use graphql_syntax::FieldDefinition;
use graphql_syntax::FloatNode;
use graphql_syntax::FragmentDefinition;
use graphql_syntax::FragmentSpread;
use graphql_syntax::Identifier;
use graphql_syntax::InlineFragment;
use graphql_syntax::InputObjectTypeDefinition;
use graphql_syntax::InputObjectTypeExtension;
use graphql_syntax::InputValueDefinition;
use graphql_syntax::IntNode;
use graphql_syntax::InterfaceTypeDefinition;
use graphql_syntax::InterfaceTypeExtension;
use graphql_syntax::LinkedField;
use graphql_syntax::List;
use graphql_syntax::ListTypeAnnotation;
use graphql_syntax::NamedTypeAnnotation;
use graphql_syntax::NonNullTypeAnnotation;
use graphql_syntax::ObjectTypeDefinition;
use graphql_syntax::ObjectTypeExtension;
use graphql_syntax::OperationDefinition;
use graphql_syntax::OperationKind;
use graphql_syntax::OperationTypeDefinition;
use graphql_syntax::ScalarField;
use graphql_syntax::ScalarTypeDefinition;
use graphql_syntax::ScalarTypeExtension;
use graphql_syntax::SchemaDefinition;
use graphql_syntax::SchemaDocument;
use graphql_syntax::SchemaExtension;
use graphql_syntax::Selection;
use graphql_syntax::StringNode;
use graphql_syntax::Token;
use graphql_syntax::TypeAnnotation;
use graphql_syntax::TypeCondition;
use graphql_syntax::UnionTypeDefinition;
use graphql_syntax::UnionTypeExtension;
use graphql_syntax::Value;
use graphql_syntax::VariableDefinition;
use graphql_syntax::VariableIdentifier;

mod constant_value_root;
pub use constant_value_root::ConstantValueRoot;
mod argument_root;
pub use argument_root::*;
use schema::TypeSystemDefinition;
mod selection_parent_type;
mod variable_definition_path;

#[cfg(test)]
#[macro_use]
extern crate assert_matches;

/// This module resolves a position (`Span`) to a `ResolvePosition` which
/// enumerates the types of AST nodes which have a "surface area", meaning a
/// character in the code which belongs to the AST node but none of its
/// children.
///
/// By convention each `ResolvePosition` variant wraps a `[NODE_TYPE]Path`
/// struct. The `[NODE_TYPE]Path` structs can be thought of an edge between an
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
    ConstantArgument(ConstantArgumentPath<'a>),
    ValueList(ValueListPath<'a>),
    VariableIdentifier(VariableIdentifierPath<'a>),
    ConstantObject(ConstantObjectPath<'a>),
    VariableDefinitionList(VariableDefinitionListPath<'a>),
    VariableDefinition(VariableDefinitionPath<'a>),
    ListTypeAnnotation(ListTypeAnnotationPath<'a>),
    NonNullTypeAnnotation(NonNullTypeAnnotationPath<'a>),
    DefaultValue(DefaultValuePath<'a>),

    SchemaDocument(&'a SchemaDocument),
    SchemaDefinition(SchemaDefinitionPath<'a>),
    SchemaExtension(SchemaExtensionPath<'a>),
    OperationTypeDefinition(OperationTypeDefinitionPath<'a>),
    DirectiveDefinition(DirectiveDefinitionPath<'a>),
    InputValueDefinition(InputValueDefinitionPath<'a>),
    UnionTypeDefinition(UnionTypeDefinitionPath<'a>),
    UnionTypeExtension(UnionTypeExtensionPath<'a>),
    InterfaceTypeDefinition(InterfaceTypeDefinitionPath<'a>),
    InterfaceTypeExtension(InterfaceTypeExtensionPath<'a>),
    ObjectTypeDefinition(ObjectTypeDefinitionPath<'a>),
    ObjectTypeExtension(ObjectTypeExtensionPath<'a>),
    InputObjectTypeDefinition(InputObjectTypeDefinitionPath<'a>),
    InputObjectTypeExtension(InputObjectTypeExtensionPath<'a>),
    EnumTypeDefinition(EnumTypeDefinitionPath<'a>),
    EnumTypeExtension(EnumTypeExtensionPath<'a>),
    EnumValueDefinition(EnumValueDefinitionPath<'a>),
    ScalarTypeDefinition(ScalarTypeDefinitionPath<'a>),
    ScalarTypeExtension(ScalarTypeExtensionPath<'a>),
    FieldDefinition(FieldDefinitionPath<'a>),
    ConstantDirective(ConstantDirectivePath<'a>),
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
    fn path(&'a self, parent: Self::Parent) -> Path<&'a Self, Self::Parent> {
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
                return default.resolve(
                    DefaultValueParent::VariableDefinition(self.path(parent)),
                    position,
                );
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
#[derive(Debug)]
pub enum DefaultValueParent<'a> {
    VariableDefinition(VariableDefinitionPath<'a>),
    InputValueDefinition(InputValueDefinitionPath<'a>),
}

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
    FieldDefinition(FieldDefinitionPath<'a>),
    InputValueDefinition(InputValueDefinitionPath<'a>),
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
    ConstantArgumentKey(ConstantArgumentPath<'a>),

    DirectiveDefinitionName(DirectiveDefinitionPath<'a>),
    UnionTypeDefinitionName(UnionTypeDefinitionPath<'a>),
    UnionTypeExtensionName(UnionTypeExtensionPath<'a>),
    UnionTypeMemberType(UnionTypeMemberParent<'a>),
    InterfaceTypeDefinitionName(InterfaceTypeDefinitionPath<'a>),
    InterfaceTypeExtensionName(InterfaceTypeExtensionPath<'a>),
    ObjectTypeDefinitionName(ObjectTypeDefinitionPath<'a>),
    ObjectTypeExtensionName(ObjectTypeExtensionPath<'a>),
    ImplementedInterfaceName(ImplementedInterfaceParent<'a>),
    InputObjectTypeDefinitionName(InputObjectTypeDefinitionPath<'a>),
    InputObjectTypeExtensionName(InputObjectTypeExtensionPath<'a>),
    EnumTypeDefinitionName(EnumTypeDefinitionPath<'a>),
    EnumTypeExtensionName(EnumTypeExtensionPath<'a>),
    EnumValueDefinitionName(EnumValueDefinitionPath<'a>),
    ScalarTypeDefinitionName(ScalarTypeDefinitionPath<'a>),
    ScalarTypeExtensionName(ScalarTypeExtensionPath<'a>),
    FieldDefinitionName(FieldDefinitionPath<'a>),
    InputValueDefinitionName(InputValueDefinitionPath<'a>),
    OperationTypeDefinitionType(OperationTypeDefinitionPath<'a>),
    ConstantDirectiveName(ConstantDirectivePath<'a>),
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
        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument
                        .resolve(ArgumentParent::FragmentSpread(self.path(parent)), position);
                }
            }
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
    FragmentSpread(FragmentSpreadPath<'a>),
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
    ConstantArgumentValue(ConstantArgumentPath<'a>),
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
                return arg.resolve(
                    ConstantArgumentParent::ConstantObj(self.path(parent)),
                    position,
                );
            }
        }
        ResolutionPath::ConstantObj(self.path(parent))
    }
    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ConstantArgumentPath<'a> = Path<&'a ConstantArgument, ConstantArgumentParent<'a>>;
#[derive(Debug)]
pub enum ConstantArgumentParent<'a> {
    ConstantObj(ConstantObjPath<'a>),
    ConstantDirective(ConstantDirectivePath<'a>),
}

impl<'a> ResolvePosition<'a> for ConstantArgument {
    type Parent = ConstantArgumentParent<'a>;
    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ConstantArgumentKey(self.path(parent)),
                position,
            );
        }
        if self.value.contains(position) {
            return self.value.resolve(
                ConstantValueParent::ConstantArgumentValue(self.path(parent)),
                position,
            );
        }
        ResolutionPath::ConstantArgument(self.path(parent))
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

pub type SchemaDocumentPath<'a> = Path<&'a SchemaDocument, ()>;

impl<'a> ResolvePosition<'a> for SchemaDocument {
    type Parent = ();

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for definition in &self.definitions {
            if definition.contains(position) {
                return definition.resolve(self.path(parent), position);
            }
        }

        // We didn't find the position in the definitions
        ResolutionPath::SchemaDocument(self)
    }

    fn contains(&'a self, position: Span) -> bool {
        self.location.span().contains(position)
    }
}

pub type TypeSystemDefinitionPath<'a> =
    Path<&'a TypeSystemDefinition, TypeSystemDefinitionParent<'a>>;
pub type TypeSystemDefinitionParent<'a> = SchemaDocumentPath<'a>;

impl<'a> ResolvePosition<'a> for TypeSystemDefinition {
    type Parent = TypeSystemDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        match self {
            TypeSystemDefinition::DirectiveDefinition(directive) => {
                directive.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::UnionTypeDefinition(union) => {
                union.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::UnionTypeExtension(union_ext) => {
                union_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::InterfaceTypeDefinition(interface) => {
                interface.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::InterfaceTypeExtension(interface_ext) => {
                interface_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::ObjectTypeDefinition(object) => {
                object.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::ObjectTypeExtension(object_ext) => {
                object_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::InputObjectTypeDefinition(input_object) => {
                input_object.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::InputObjectTypeExtension(input_object_ext) => {
                input_object_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::EnumTypeDefinition(enum_type) => {
                enum_type.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::EnumTypeExtension(enum_type_ext) => {
                enum_type_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::SchemaDefinition(schema) => {
                schema.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::SchemaExtension(schema_ext) => {
                schema_ext.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::ScalarTypeDefinition(scalar) => {
                scalar.resolve(self.path(parent), position)
            }
            TypeSystemDefinition::ScalarTypeExtension(scalar_ext) => {
                scalar_ext.resolve(self.path(parent), position)
            }
        }
    }

    fn contains(&'a self, position: Span) -> bool {
        match self {
            TypeSystemDefinition::DirectiveDefinition(directive) => directive.contains(position),
            TypeSystemDefinition::UnionTypeDefinition(union) => union.contains(position),
            TypeSystemDefinition::UnionTypeExtension(union_ext) => union_ext.contains(position),
            TypeSystemDefinition::InterfaceTypeDefinition(interface) => {
                interface.contains(position)
            }
            TypeSystemDefinition::InterfaceTypeExtension(interface_ext) => {
                interface_ext.contains(position)
            }
            TypeSystemDefinition::ObjectTypeDefinition(object) => object.contains(position),
            TypeSystemDefinition::ObjectTypeExtension(object_ext) => object_ext.contains(position),
            TypeSystemDefinition::InputObjectTypeDefinition(input_object) => {
                input_object.contains(position)
            }
            TypeSystemDefinition::InputObjectTypeExtension(input_object_ext) => {
                input_object_ext.contains(position)
            }
            TypeSystemDefinition::EnumTypeDefinition(enum_type) => enum_type.contains(position),
            TypeSystemDefinition::EnumTypeExtension(enum_type_ext) => {
                enum_type_ext.contains(position)
            }
            TypeSystemDefinition::SchemaDefinition(schema) => schema.contains(position),
            TypeSystemDefinition::SchemaExtension(schema_ext) => schema_ext.contains(position),
            TypeSystemDefinition::ScalarTypeDefinition(scalar) => scalar.contains(position),
            TypeSystemDefinition::ScalarTypeExtension(scalar_ext) => scalar_ext.contains(position),
        }
    }
}

pub type DirectiveDefinitionPath<'a> = Path<&'a DirectiveDefinition, DirectiveDefinitionParent<'a>>;
pub type DirectiveDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for DirectiveDefinition {
    type Parent = DirectiveDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::DirectiveDefinitionName(self.path(parent)),
                position,
            );
        }

        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument.resolve(
                        InputValueDefinitionParent::DirectiveDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::DirectiveDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

#[derive(Debug)]
pub enum UnionTypeMemberParent<'a> {
    UnionTypeDefinition(UnionTypeDefinitionPath<'a>),
    UnionTypeExtension(UnionTypeExtensionPath<'a>),
}

pub type UnionTypeDefinitionPath<'a> = Path<&'a UnionTypeDefinition, UnionTypeDefinitionParent<'a>>;
pub type UnionTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for UnionTypeDefinition {
    type Parent = UnionTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::UnionTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        for member in &self.members {
            if member.contains(position) {
                return member.resolve(
                    IdentParent::UnionTypeMemberType(UnionTypeMemberParent::UnionTypeDefinition(
                        self.path(parent),
                    )),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::UnionTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::UnionTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type UnionTypeExtensionPath<'a> = Path<&'a UnionTypeExtension, UnionTypeExtensionParent<'a>>;
pub type UnionTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for UnionTypeExtension {
    type Parent = UnionTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::UnionTypeExtensionName(self.path(parent)),
                position,
            );
        }

        for member in &self.members {
            if member.contains(position) {
                return member.resolve(
                    IdentParent::UnionTypeMemberType(UnionTypeMemberParent::UnionTypeExtension(
                        self.path(parent),
                    )),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::UnionTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::UnionTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

#[derive(Debug)]
pub enum ImplementedInterfaceParent<'a> {
    ObjectTypeDefinition(ObjectTypeDefinitionPath<'a>),
    ObjectTypeExtension(ObjectTypeExtensionPath<'a>),
    InterfaceTypeDefinition(InterfaceTypeDefinitionPath<'a>),
    InterfaceTypeExtension(InterfaceTypeExtensionPath<'a>),
}

pub type InterfaceTypeDefinitionPath<'a> =
    Path<&'a InterfaceTypeDefinition, InterfaceTypeDefinitionParent<'a>>;
pub type InterfaceTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for InterfaceTypeDefinition {
    type Parent = InterfaceTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::InterfaceTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        for interface in &self.interfaces {
            if interface.contains(position) {
                return interface.resolve(
                    IdentParent::ImplementedInterfaceName(
                        ImplementedInterfaceParent::InterfaceTypeDefinition(self.path(parent)),
                    ),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::InterfaceTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        FieldDefinitionParent::InterfaceTypeDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::InterfaceTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type InterfaceTypeExtensionPath<'a> =
    Path<&'a InterfaceTypeExtension, InterfaceTypeExtensionParent<'a>>;
pub type InterfaceTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for InterfaceTypeExtension {
    type Parent = InterfaceTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::InterfaceTypeExtensionName(self.path(parent)),
                position,
            );
        }

        for interface in &self.interfaces {
            if interface.contains(position) {
                return interface.resolve(
                    IdentParent::ImplementedInterfaceName(
                        ImplementedInterfaceParent::InterfaceTypeExtension(self.path(parent)),
                    ),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::InterfaceTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        FieldDefinitionParent::InterfaceTypeExtension(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::InterfaceTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ObjectTypeDefinitionPath<'a> =
    Path<&'a ObjectTypeDefinition, ObjectTypeDefinitionParent<'a>>;
pub type ObjectTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for ObjectTypeDefinition {
    type Parent = ObjectTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ObjectTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        for interface in &self.interfaces {
            if interface.contains(position) {
                return interface.resolve(
                    IdentParent::ImplementedInterfaceName(
                        ImplementedInterfaceParent::ObjectTypeDefinition(self.path(parent)),
                    ),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::ObjectTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        FieldDefinitionParent::ObjectTypeDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::ObjectTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

type ObjectTypeExtensionPath<'a> = Path<&'a ObjectTypeExtension, ObjectTypeExtensionParent<'a>>;
pub type ObjectTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for ObjectTypeExtension {
    type Parent = ObjectTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ObjectTypeExtensionName(self.path(parent)),
                position,
            );
        }

        for interface in &self.interfaces {
            if interface.contains(position) {
                return interface.resolve(
                    IdentParent::ImplementedInterfaceName(
                        ImplementedInterfaceParent::ObjectTypeExtension(self.path(parent)),
                    ),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::ObjectTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        FieldDefinitionParent::ObjectTypeExtension(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::ObjectTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type FieldDefinitionPath<'a> = Path<&'a FieldDefinition, FieldDefinitionParent<'a>>;
#[derive(Debug)]
pub enum FieldDefinitionParent<'a> {
    ObjectTypeDefinition(ObjectTypeDefinitionPath<'a>),
    ObjectTypeExtension(ObjectTypeExtensionPath<'a>),
    InterfaceTypeDefinition(InterfaceTypeDefinitionPath<'a>),
    InterfaceTypeExtension(InterfaceTypeExtensionPath<'a>),
}

impl<'a> ResolvePosition<'a> for FieldDefinition {
    type Parent = FieldDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::FieldDefinitionName(self.path(parent)),
                position,
            );
        }

        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument.resolve(
                        InputValueDefinitionParent::FieldDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        if self.type_.contains(position) {
            return self.type_.resolve(
                TypeAnnotationParent::FieldDefinition(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::FieldDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::FieldDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type InputObjectTypeDefinitionPath<'a> =
    Path<&'a InputObjectTypeDefinition, InputObjectTypeDefinitionParent<'a>>;
pub type InputObjectTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for InputObjectTypeDefinition {
    type Parent = InputObjectTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::InputObjectTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::InputObjectTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        InputValueDefinitionParent::InputObjectTypeDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::InputObjectTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type InputObjectTypeExtensionPath<'a> =
    Path<&'a InputObjectTypeExtension, InputObjectTypeExtensionParent<'a>>;
pub type InputObjectTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for InputObjectTypeExtension {
    type Parent = InputObjectTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::InputObjectTypeExtensionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::InputObjectTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        if let Some(field_list) = &self.fields {
            for field in &field_list.items {
                if field.contains(position) {
                    return field.resolve(
                        InputValueDefinitionParent::InputObjectTypeExtension(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::InputObjectTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type InputValueDefinitionPath<'a> =
    Path<&'a InputValueDefinition, InputValueDefinitionParent<'a>>;
#[derive(Debug)]
pub enum InputValueDefinitionParent<'a> {
    DirectiveDefinition(DirectiveDefinitionPath<'a>),
    InputObjectTypeDefinition(InputObjectTypeDefinitionPath<'a>),
    InputObjectTypeExtension(InputObjectTypeExtensionPath<'a>),
    FieldDefinition(FieldDefinitionPath<'a>),
}

impl<'a> ResolvePosition<'a> for InputValueDefinition {
    type Parent = InputValueDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::InputValueDefinitionName(self.path(parent)),
                position,
            );
        }

        if self.type_.contains(position) {
            return self.type_.resolve(
                TypeAnnotationParent::InputValueDefinition(self.path(parent)),
                position,
            );
        }

        if let Some(default_value) = &self.default_value {
            if default_value.contains(position) {
                return default_value.resolve(
                    DefaultValueParent::InputValueDefinition(self.path(parent)),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::InputValueDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::InputValueDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type EnumTypeDefinitionPath<'a> = Path<&'a EnumTypeDefinition, EnumTypeDefinitionParent<'a>>;
pub type EnumTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for EnumTypeDefinition {
    type Parent = EnumTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::EnumTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        if let Some(values) = &self.values {
            for value in &values.items {
                if value.contains(position) {
                    return value.resolve(
                        EnumValueDefinitionParent::EnumTypeDefinition(self.path(parent)),
                        position,
                    );
                }
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::EnumTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::EnumTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type EnumTypeExtensionPath<'a> = Path<&'a EnumTypeExtension, EnumTypeExtensionParent<'a>>;
pub type EnumTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for EnumTypeExtension {
    type Parent = EnumTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::EnumTypeExtensionName(self.path(parent)),
                position,
            );
        }

        if let Some(values) = &self.values {
            for value in &values.items {
                if value.contains(position) {
                    return value.resolve(
                        EnumValueDefinitionParent::EnumTypeExtension(self.path(parent)),
                        position,
                    );
                }
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::EnumTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::EnumTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type EnumValueDefinitionPath<'a> = Path<&'a EnumValueDefinition, EnumValueDefinitionParent<'a>>;
#[derive(Debug)]
pub enum EnumValueDefinitionParent<'a> {
    EnumTypeDefinition(EnumTypeDefinitionPath<'a>),
    EnumTypeExtension(EnumTypeExtensionPath<'a>),
}

impl<'a> ResolvePosition<'a> for EnumValueDefinition {
    type Parent = EnumValueDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::EnumValueDefinitionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::EnumValueDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::EnumValueDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type SchemaDefinitionPath<'a> = Path<&'a SchemaDefinition, SchemaDefinitionParent<'a>>;
pub type SchemaDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for SchemaDefinition {
    type Parent = SchemaDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        for operation_type in &self.operation_types.items {
            if operation_type.contains(position) {
                return operation_type.resolve(
                    OperationTypeDefinitionParent::SchemaDefinition(self.path(parent)),
                    position,
                );
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::SchemaDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::SchemaDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type SchemaExtensionPath<'a> = Path<&'a SchemaExtension, SchemaExtensionParent<'a>>;
pub type SchemaExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for SchemaExtension {
    type Parent = SchemaExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if let Some(operation_types) = &self.operation_types {
            for operation_type in &operation_types.items {
                if operation_type.contains(position) {
                    return operation_type.resolve(
                        OperationTypeDefinitionParent::SchemaExtension(self.path(parent)),
                        position,
                    );
                }
            }
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::SchemaExtension(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::SchemaExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type OperationTypeDefinitionPath<'a> =
    Path<&'a OperationTypeDefinition, OperationTypeDefinitionParent<'a>>;
#[derive(Debug)]
pub enum OperationTypeDefinitionParent<'a> {
    SchemaDefinition(SchemaDefinitionPath<'a>),
    SchemaExtension(SchemaExtensionPath<'a>),
}

impl<'a> ResolvePosition<'a> for OperationTypeDefinition {
    type Parent = OperationTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.type_.contains(position) {
            return self.type_.resolve(
                IdentParent::OperationTypeDefinitionType(self.path(parent)),
                position,
            );
        }

        ResolutionPath::OperationTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ScalarTypeDefinitionPath<'a> =
    Path<&'a ScalarTypeDefinition, ScalarTypeDefinitionParent<'a>>;
pub type ScalarTypeDefinitionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for ScalarTypeDefinition {
    type Parent = ScalarTypeDefinitionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ScalarTypeDefinitionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::ScalarTypeDefinition(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::ScalarTypeDefinition(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ScalarTypeExtensionPath<'a> = Path<&'a ScalarTypeExtension, ScalarTypeExtensionParent<'a>>;
pub type ScalarTypeExtensionParent<'a> = TypeSystemDefinitionPath<'a>;

impl<'a> ResolvePosition<'a> for ScalarTypeExtension {
    type Parent = ScalarTypeExtensionParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ScalarTypeExtensionName(self.path(parent)),
                position,
            );
        }

        for directive in self.directives.iter() {
            if directive.contains(position) {
                return directive.resolve(
                    ConstantDirectiveParent::ScalarTypeExtension(self.path(parent)),
                    position,
                );
            }
        }

        ResolutionPath::ScalarTypeExtension(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

pub type ConstantDirectivePath<'a> = Path<&'a ConstantDirective, ConstantDirectiveParent<'a>>;
#[derive(Debug)]
pub enum ConstantDirectiveParent<'a> {
    UnionTypeDefinition(UnionTypeDefinitionPath<'a>),
    UnionTypeExtension(UnionTypeExtensionPath<'a>),
    InterfaceTypeDefinition(InterfaceTypeDefinitionPath<'a>),
    InterfaceTypeExtension(InterfaceTypeExtensionPath<'a>),
    ObjectTypeDefinition(ObjectTypeDefinitionPath<'a>),
    ObjectTypeExtension(ObjectTypeExtensionPath<'a>),
    InputObjectTypeDefinition(InputObjectTypeDefinitionPath<'a>),
    InputObjectTypeExtension(InputObjectTypeExtensionPath<'a>),
    EnumTypeDefinition(EnumTypeDefinitionPath<'a>),
    EnumTypeExtension(EnumTypeExtensionPath<'a>),
    EnumValueDefinition(EnumValueDefinitionPath<'a>),
    ScalarTypeDefinition(ScalarTypeDefinitionPath<'a>),
    ScalarTypeExtension(ScalarTypeExtensionPath<'a>),
    SchemaDefinition(SchemaDefinitionPath<'a>),
    SchemaExtension(SchemaExtensionPath<'a>),
    FieldDefinition(FieldDefinitionPath<'a>),
    InputValueDefinition(InputValueDefinitionPath<'a>),
}

impl<'a> ResolvePosition<'a> for ConstantDirective {
    type Parent = ConstantDirectiveParent<'a>;

    fn resolve(&'a self, parent: Self::Parent, position: Span) -> ResolutionPath<'a> {
        // Note: We don't currently handle the `@` explicitly.
        if self.name.contains(position) {
            return self.name.resolve(
                IdentParent::ConstantDirectiveName(self.path(parent)),
                position,
            );
        }

        if let Some(arguments) = &self.arguments {
            for argument in &arguments.items {
                if argument.contains(position) {
                    return argument.resolve(
                        ConstantArgumentParent::ConstantDirective(self.path(parent)),
                        position,
                    );
                }
            }
        }

        ResolutionPath::ConstantDirective(self.path(parent))
    }

    fn contains(&'a self, position: Span) -> bool {
        self.span.contains(position)
    }
}

#[cfg(test)]
mod test;
