/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt;

use common::Named;
use common::Span;
use intern::string_key::Intern;
use intern::string_key::StringKey;

use super::constant_directive::ConstantDirective;
use super::constant_value::StringNode;
use super::executable::OperationKind;
use super::primitive::*;
use super::type_annotation::TypeAnnotation;
use crate::DefaultValue;
use crate::TokenKind;

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub enum TypeSystemDefinition {
    SchemaDefinition(SchemaDefinition),
    SchemaExtension(SchemaExtension),
    EnumTypeDefinition(EnumTypeDefinition),
    EnumTypeExtension(EnumTypeExtension),
    InterfaceTypeDefinition(InterfaceTypeDefinition),
    InterfaceTypeExtension(InterfaceTypeExtension),
    ObjectTypeDefinition(ObjectTypeDefinition),
    ObjectTypeExtension(ObjectTypeExtension),
    UnionTypeDefinition(UnionTypeDefinition),
    UnionTypeExtension(UnionTypeExtension),
    InputObjectTypeDefinition(InputObjectTypeDefinition),
    InputObjectTypeExtension(InputObjectTypeExtension),
    ScalarTypeDefinition(ScalarTypeDefinition),
    ScalarTypeExtension(ScalarTypeExtension),
    DirectiveDefinition(DirectiveDefinition),
}

impl TypeSystemDefinition {
    pub fn span(&self) -> Span {
        match self {
            TypeSystemDefinition::SchemaDefinition(_extension) => Span::empty(), // Not implemented
            TypeSystemDefinition::SchemaExtension(_extension) => Span::empty(),  // Not implemented
            TypeSystemDefinition::ObjectTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::ObjectTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InterfaceTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InterfaceTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::UnionTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::UnionTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::DirectiveDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InputObjectTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::InputObjectTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::EnumTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::EnumTypeExtension(extension) => extension.name.span,
            TypeSystemDefinition::ScalarTypeDefinition(extension) => extension.name.span,
            TypeSystemDefinition::ScalarTypeExtension(extension) => extension.name.span,
        }
    }
}

impl fmt::Display for TypeSystemDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TypeSystemDefinition::SchemaDefinition(SchemaDefinition {
                directives,
                operation_types,
                ..
            }) => write_schema_definition_helper(f, directives, &operation_types.items),
            TypeSystemDefinition::SchemaExtension(SchemaExtension {
                directives,
                operation_types,
                ..
            }) => write_schema_extension_helper(f, directives, operation_types),
            TypeSystemDefinition::ObjectTypeDefinition(ObjectTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
                ..
            }) => write_object_helper(f, &name.value, interfaces, fields, directives, false),
            TypeSystemDefinition::ObjectTypeExtension(ObjectTypeExtension {
                name,
                interfaces,
                fields,
                directives,
                ..
            }) => write_object_helper(f, &name.value, interfaces, fields, directives, true),
            TypeSystemDefinition::InterfaceTypeDefinition(InterfaceTypeDefinition {
                name,
                interfaces,
                fields,
                directives,
                ..
            }) => write_interface_helper(f, &name.value, interfaces, fields, directives, false),
            TypeSystemDefinition::InterfaceTypeExtension(InterfaceTypeExtension {
                name,
                interfaces,
                fields,
                directives,
                ..
            }) => write_interface_helper(f, &name.value, interfaces, fields, directives, true),
            TypeSystemDefinition::UnionTypeDefinition(UnionTypeDefinition {
                name,
                directives,
                members,
                ..
            }) => write_union_type_definition_helper(f, &name.value, directives, members, false),
            TypeSystemDefinition::UnionTypeExtension(UnionTypeExtension {
                name,
                directives,
                members,
                ..
            }) => write_union_type_definition_helper(f, &name.value, directives, members, true),
            TypeSystemDefinition::DirectiveDefinition(DirectiveDefinition {
                name,
                arguments,
                repeatable,
                locations,
                description,
                hack_source,
                ..
            }) => write_directive_definition_helper(
                f,
                &name.value,
                arguments,
                repeatable,
                locations,
                description,
                hack_source,
            ),
            TypeSystemDefinition::InputObjectTypeDefinition(InputObjectTypeDefinition {
                name,
                directives,
                fields,
                ..
            }) => {
                write_input_object_type_definition_helper(f, &name.value, directives, fields, false)
            }
            TypeSystemDefinition::InputObjectTypeExtension(InputObjectTypeExtension {
                name,
                directives,
                fields,
                ..
            }) => {
                write_input_object_type_definition_helper(f, &name.value, directives, fields, true)
            }
            TypeSystemDefinition::EnumTypeDefinition(EnumTypeDefinition {
                name,
                directives,
                values,
                ..
            }) => write_enum_type_definition_helper(f, &name.value, directives, values, false),
            TypeSystemDefinition::EnumTypeExtension(EnumTypeExtension {
                name,
                directives,
                values,
                ..
            }) => write_enum_type_definition_helper(f, &name.value, directives, values, true),
            TypeSystemDefinition::ScalarTypeDefinition(ScalarTypeDefinition {
                name,
                directives,
                ..
            }) => write_scalar_type_definition_helper(f, &name.value, directives, false),
            TypeSystemDefinition::ScalarTypeExtension(ScalarTypeExtension {
                name,
                directives,
                ..
            }) => write_scalar_type_definition_helper(f, &name.value, directives, true),
        }
    }
}

impl Named for TypeSystemDefinition {
    type Name = StringKey;
    fn name(&self) -> StringKey {
        match self {
            TypeSystemDefinition::SchemaDefinition(_definition) => "".intern(), // Not implemented
            TypeSystemDefinition::SchemaExtension(_extension) => "".intern(),   // Not implemented
            TypeSystemDefinition::ObjectTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::ObjectTypeExtension(extension) => extension.name.value,
            TypeSystemDefinition::InterfaceTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::InterfaceTypeExtension(extension) => extension.name.value,
            TypeSystemDefinition::UnionTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::UnionTypeExtension(extension) => extension.name.value,
            TypeSystemDefinition::DirectiveDefinition(definition) => definition.name.value,
            TypeSystemDefinition::InputObjectTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::InputObjectTypeExtension(extension) => extension.name.value,
            TypeSystemDefinition::EnumTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::EnumTypeExtension(extension) => extension.name.value,
            TypeSystemDefinition::ScalarTypeDefinition(definition) => definition.name.value,
            TypeSystemDefinition::ScalarTypeExtension(extension) => extension.name.value,
        }
    }
}

/// This trait provides a *single* known into method, so we don't need
/// to type method usages that utilize this trait and call into_definition().
/// It may be useful in the future to define a DefinitionIntoExtension trait
/// that does the inverse, but we haven't needed it yet (add it when we do!).
pub trait ExtensionIntoDefinition: Sized {
    type DefinitionType: From<Self>;

    fn into_definition(self) -> Self::DefinitionType {
        self.into()
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct SchemaDefinition {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: List<OperationTypeDefinition>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct SchemaExtension {
    pub directives: Vec<ConstantDirective>,
    pub operation_types: Option<List<OperationTypeDefinition>>,
    pub span: Span,
}
impl From<SchemaExtension> for SchemaDefinition {
    fn from(ext: SchemaExtension) -> Self {
        Self {
            directives: ext.directives,
            operation_types: ext.operation_types.unwrap_or(List {
                span: Span::empty(),
                start: Token {
                    span: Span::empty(),
                    kind: TokenKind::OpenBrace,
                },
                items: Vec::new(),
                end: Token {
                    span: Span::empty(),
                    kind: TokenKind::CloseBrace,
                },
            }),
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for SchemaExtension {
    type DefinitionType = SchemaDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct OperationTypeDefinition {
    pub operation: OperationType,
    pub type_: Identifier,
    pub span: Span,
}

impl fmt::Display for OperationTypeDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.operation, self.type_)
    }
}

#[derive(Eq, PartialEq, Ord, PartialOrd, Debug, Copy, Clone, serde::Serialize)]
pub enum OperationType {
    Query,
    Mutation,
    Subscription,
}

impl fmt::Display for OperationType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OperationType::Query => write!(f, "query"),
            OperationType::Mutation => write!(f, "mutation"),
            OperationType::Subscription => write!(f, "subscription"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ObjectTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ObjectTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
    pub span: Span,
}
impl From<ObjectTypeExtension> for ObjectTypeDefinition {
    fn from(ext: ObjectTypeExtension) -> Self {
        Self {
            name: ext.name,
            interfaces: ext.interfaces,
            directives: ext.directives,
            fields: ext.fields,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for ObjectTypeExtension {
    type DefinitionType = ObjectTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InterfaceTypeDefinition {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InterfaceTypeExtension {
    pub name: Identifier,
    pub interfaces: Vec<Identifier>,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<FieldDefinition>>,
    pub span: Span,
}
impl From<InterfaceTypeExtension> for InterfaceTypeDefinition {
    fn from(ext: InterfaceTypeExtension) -> Self {
        Self {
            name: ext.name,
            interfaces: ext.interfaces,
            directives: ext.directives,
            fields: ext.fields,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for InterfaceTypeExtension {
    type DefinitionType = InterfaceTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct UnionTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct UnionTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub members: Vec<Identifier>,
    pub span: Span,
}
impl From<UnionTypeExtension> for UnionTypeDefinition {
    fn from(ext: UnionTypeExtension) -> Self {
        Self {
            name: ext.name,
            directives: ext.directives,
            members: ext.members,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for UnionTypeExtension {
    type DefinitionType = UnionTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ScalarTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct ScalarTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub span: Span,
}
impl From<ScalarTypeExtension> for ScalarTypeDefinition {
    fn from(ext: ScalarTypeExtension) -> Self {
        Self {
            name: ext.name,
            directives: ext.directives,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for ScalarTypeExtension {
    type DefinitionType = ScalarTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub values: Option<List<EnumValueDefinition>>,
    pub span: Span,
}
impl From<EnumTypeExtension> for EnumTypeDefinition {
    fn from(ext: EnumTypeExtension) -> Self {
        Self {
            name: ext.name,
            directives: ext.directives,
            values: ext.values,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for EnumTypeExtension {
    type DefinitionType = EnumTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InputObjectTypeDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
    pub description: Option<StringNode>,
    pub span: Span,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct InputObjectTypeExtension {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub fields: Option<List<InputValueDefinition>>,
    pub span: Span,
}
impl From<InputObjectTypeExtension> for InputObjectTypeDefinition {
    fn from(ext: InputObjectTypeExtension) -> Self {
        Self {
            name: ext.name,
            directives: ext.directives,
            fields: ext.fields,
            // Extensions cannot have descriptions
            description: None,
            span: ext.span,
        }
    }
}
impl ExtensionIntoDefinition for InputObjectTypeExtension {
    type DefinitionType = InputObjectTypeDefinition;
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct EnumValueDefinition {
    pub name: Identifier,
    pub directives: Vec<ConstantDirective>,
    pub description: Option<StringNode>,
    pub span: Span,
}

impl fmt::Display for EnumValueDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        write_directives(f, &self.directives)
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct DirectiveDefinition {
    pub name: Identifier,
    pub arguments: Option<List<InputValueDefinition>>,
    pub repeatable: bool,
    pub locations: Vec<DirectiveLocation>,
    pub description: Option<StringNode>,
    pub hack_source: Option<StringNode>,
    pub span: Span,
}

#[derive(PartialEq, Eq, Ord, PartialOrd, Hash, Debug, Clone, Copy)]
pub enum DirectiveLocation {
    Query,
    Mutation,
    Subscription,
    Field,
    FragmentDefinition,
    FragmentSpread,
    InlineFragment,
    Schema,
    Scalar,
    Object,
    FieldDefinition,
    ArgumentDefinition,
    Interface,
    Union,
    Enum,
    EnumValue,
    InputObject,
    InputFieldDefinition,
    VariableDefinition,
}

impl From<OperationKind> for DirectiveLocation {
    fn from(operation: OperationKind) -> Self {
        match operation {
            OperationKind::Query => Self::Query,
            OperationKind::Mutation => Self::Mutation,
            OperationKind::Subscription => Self::Subscription,
        }
    }
}

impl fmt::Display for DirectiveLocation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match *self {
            DirectiveLocation::Query => write!(f, "QUERY"),
            DirectiveLocation::Mutation => write!(f, "MUTATION"),
            DirectiveLocation::Subscription => write!(f, "SUBSCRIPTION"),
            DirectiveLocation::Field => write!(f, "FIELD"),
            DirectiveLocation::FragmentDefinition => write!(f, "FRAGMENT_DEFINITION"),
            DirectiveLocation::FragmentSpread => write!(f, "FRAGMENT_SPREAD"),
            DirectiveLocation::InlineFragment => write!(f, "INLINE_FRAGMENT"),
            DirectiveLocation::Schema => write!(f, "SCHEMA"),
            DirectiveLocation::Scalar => write!(f, "SCALAR"),
            DirectiveLocation::Object => write!(f, "OBJECT"),
            DirectiveLocation::FieldDefinition => write!(f, "FIELD_DEFINITION"),
            DirectiveLocation::ArgumentDefinition => write!(f, "ARGUMENT_DEFINITION"),
            DirectiveLocation::Interface => write!(f, "INTERFACE"),
            DirectiveLocation::Union => write!(f, "UNION"),
            DirectiveLocation::Enum => write!(f, "ENUM"),
            DirectiveLocation::EnumValue => write!(f, "ENUM_VALUE"),
            DirectiveLocation::InputObject => write!(f, "INPUT_OBJECT"),
            DirectiveLocation::InputFieldDefinition => write!(f, "INPUT_FIELD_DEFINITION"),
            DirectiveLocation::VariableDefinition => write!(f, "VARIABLE_DEFINITION"),
        }
    }
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug, Hash)]
pub struct InputValueDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub default_value: Option<DefaultValue>,
    pub directives: Vec<ConstantDirective>,
    pub description: Option<StringNode>,
    pub span: Span,
}

impl fmt::Display for InputValueDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}: {}", self.name, self.type_)?;
        if let Some(v) = &self.default_value {
            write!(f, " = {v}")?;
        }

        if !self.directives.is_empty() {
            write!(f, " ")?;
            write_list(f, &self.directives, " ")?;
        }

        Ok(())
    }
}

/// A field definition which includes just the field name and arguments.
/// Used by Relay Resolvers.
#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct FieldDefinitionStub {
    pub name: Identifier,
    pub arguments: Option<List<InputValueDefinition>>,
}

#[derive(Clone, Eq, PartialEq, Ord, PartialOrd, Debug)]
pub struct FieldDefinition {
    pub name: Identifier,
    pub type_: TypeAnnotation,
    pub arguments: Option<List<InputValueDefinition>>,
    pub directives: Vec<ConstantDirective>,
    pub description: Option<StringNode>,
    pub hack_source: Option<StringNode>,
    pub span: Span,
}

impl fmt::Display for FieldDefinition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.name)?;
        if let Some(arguments) = self.arguments.as_ref() {
            write_arguments(f, &arguments.items)?;
        }
        write!(f, ": {}", self.type_)?;
        write_directives(f, &self.directives)
    }
}

fn write_list(
    f: &mut fmt::Formatter<'_>,
    list: &[impl fmt::Display],
    separator: &str,
) -> fmt::Result {
    let v = list
        .iter()
        .map(|elem| elem.to_string())
        .collect::<Vec<String>>()
        .join(separator);
    write!(f, "{v}")
}

fn write_arguments(f: &mut fmt::Formatter<'_>, arguments: &[impl fmt::Display]) -> fmt::Result {
    if arguments.is_empty() {
        return Ok(());
    }

    write!(f, "(")?;
    write_list(f, arguments, ", ")?;
    write!(f, ")")
}

fn write_directives(f: &mut fmt::Formatter<'_>, directives: &[ConstantDirective]) -> fmt::Result {
    if directives.is_empty() {
        return Ok(());
    }

    write!(f, " ")?;
    write_list(f, directives, " ")
}

fn write_fields(f: &mut fmt::Formatter<'_>, fields: &[impl fmt::Display]) -> fmt::Result {
    if fields.is_empty() {
        return Ok(());
    }

    write!(f, " {{\n  ")?;
    write_list(f, fields, "\n  ")?;
    write!(f, "\n}}")
}

fn write_schema_definition_helper(
    f: &mut fmt::Formatter<'_>,
    directives: &[ConstantDirective],
    operation_types: &[OperationTypeDefinition],
) -> fmt::Result {
    write!(f, "schema")?;
    write_directives(f, directives)?;
    write_fields(f, operation_types)?;
    writeln!(f)
}

fn write_schema_extension_helper(
    f: &mut fmt::Formatter<'_>,
    directives: &[ConstantDirective],
    operation_types: &Option<List<OperationTypeDefinition>>,
) -> fmt::Result {
    write!(f, "extend schema")?;
    write_directives(f, directives)?;
    if let Some(operation_types) = operation_types.as_ref() {
        write_fields(f, &operation_types.items)?;
    }
    writeln!(f)
}

fn write_object_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    interfaces: &[Identifier],
    fields: &Option<List<FieldDefinition>>,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "type {name}")?;
    if !interfaces.is_empty() {
        write!(f, " implements ")?;
        write_list(f, interfaces, " & ")?;
    }
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_interface_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    interfaces: &[Identifier],
    fields: &Option<List<FieldDefinition>>,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "interface {name}")?;
    if !interfaces.is_empty() {
        write!(f, " implements ")?;
        write_list(f, interfaces, " & ")?;
    }
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_union_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    members: &[Identifier],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "union {name}")?;
    write_directives(f, directives)?;
    if !members.is_empty() {
        write!(f, " = ")?;
        write_list(f, members, " | ")?;
    }
    writeln!(f)
}

fn write_directive_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    arguments: &Option<List<InputValueDefinition>>,
    repeatable: &bool,
    locations: &[DirectiveLocation],
    _description: &Option<StringNode>,
    _hack_source: &Option<StringNode>,
) -> fmt::Result {
    write!(f, "directive @{name}")?;
    if let Some(arguments) = arguments.as_ref() {
        write_arguments(f, &arguments.items)?;
    }
    if *repeatable {
        write!(f, " repeatable")?;
    }
    write!(f, " on ")?;
    write_list(f, locations, " | ")?;
    writeln!(f)
}

fn write_input_object_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    fields: &Option<List<InputValueDefinition>>,
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "input {name}")?;
    write_directives(f, directives)?;
    if let Some(fields) = fields.as_ref() {
        write_fields(f, &fields.items)?;
    }
    writeln!(f)
}

fn write_enum_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    values: &Option<List<EnumValueDefinition>>,
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "enum {name}")?;
    write_directives(f, directives)?;
    if let Some(values) = values.as_ref() {
        write_fields(f, &values.items)?;
    }

    writeln!(f)
}

fn write_scalar_type_definition_helper(
    f: &mut fmt::Formatter<'_>,
    name: &StringKey,
    directives: &[ConstantDirective],
    is_extension: bool,
) -> fmt::Result {
    if is_extension {
        write!(f, "extend ")?;
    }

    write!(f, "scalar {name}")?;
    write_directives(f, directives)?;
    writeln!(f)
}

impl fmt::Display for ConstantDirective {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "@{}", self.name)?;
        if let Some(arguments) = self.arguments.as_ref() {
            write_arguments(f, &arguments.items)?;
        }
        Ok(())
    }
}
