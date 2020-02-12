/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::ast::*;
use crate::errors::{Result, SchemaError};
use crate::lexer::Lexer;
use crate::token::TokenKind;
use interner::{Intern, StringKey};

pub struct Parser<'a> {
    lexer: Lexer<'a>,
}

impl<'a> Parser<'a> {
    pub fn new(lexer: Lexer<'a>) -> Self {
        Self { lexer }
    }

    /**
     * Document : Definition+
     */
    pub fn parse_schema_document(mut self) -> Result<Vec<Definition>> {
        self.wrapped_list(
            TokenKind::SOF,
            Self::parse_type_system_definition,
            TokenKind::EOF,
        )
    }

    /**
     * TypeSystemExtension :
     *   - SchemaExtension
     *   - TypeExtension
     *
     * TypeExtension :
     *   - ScalarTypeExtension
     *   - ObjectTypeExtension
     *   - InterfaceTypeExtension
     *   - UnionTypeExtension
     *   - EnumTypeExtension
     *   - InputObjectTypeDefinition
     */
    #[allow(dead_code)]
    pub fn parse_type_system_extension(&mut self) -> Result<Definition> {
        self.expect_keyword("extend")?;
        match self.peek() {
            TokenKind::Name("schema") => self.parse_schema_extension(),
            TokenKind::Name("scalar") => self.parse_scalar_type_extension(),
            TokenKind::Name("type") => self.parse_object_type_extension(),
            TokenKind::Name("interface") => self.parse_interface_type_extension(),
            TokenKind::Name("union") => self.parse_union_type_extension(),
            TokenKind::Name("enum") => self.parse_enum_type_extension(),
            TokenKind::Name("input") => self.parse_input_object_type_extension(),
            token => Err(SchemaError::Syntax(format!("Unexpected token {}", token))),
        }
    }

    fn advance(&mut self) -> TokenKind<'a> {
        let token = self.lexer.token;
        self.lexer.advance();
        token
    }
    fn peek(&self) -> &TokenKind<'a> {
        &self.lexer.token
    }

    // Implements the parsing rules in the Operations section.

    /**
     * Arguments : ( Argument+ )
     */
    fn parse_arguments(&mut self) -> Result<Vec<Argument>> {
        self.optional_wrapped_list(TokenKind::ParenL, Self::parse_argument, TokenKind::ParenR)
    }

    fn parse_argument(&mut self) -> Result<Argument> {
        let name = self.parse_name()?;
        self.expect_token(TokenKind::Colon)?;
        let value = self.parse_value_literal()?;
        Ok(Argument { name, value })
    }

    // Implements the parsing rules in the Directives section.

    /**
     * Directives : Directive+
     */
    fn parse_directives(&mut self) -> Result<Vec<Directive>> {
        let mut directives = vec![];
        if *self.peek() == TokenKind::At {
            while *self.peek() == TokenKind::At {
                directives.push(self.parse_directive()?)
            }
        }
        Ok(directives)
    }

    /**
     * Directive : @ Name Arguments?
     */
    fn parse_directive(&mut self) -> Result<Directive> {
        self.expect_token(TokenKind::At)?;
        Ok(Directive {
            name: self.parse_name()?,
            arguments: self.parse_arguments()?,
        })
    }

    // Implements the parsing rules in the Types section.

    /**
     * Type :
     *   - NamedType
     *   - ListType
     *   - NonNullType
     */
    fn parse_type_reference(&mut self) -> Result<Type> {
        let nullable_type = if self.expect_optional_token(TokenKind::BracketL) {
            let of_type = self.parse_type_reference()?;
            self.expect_token(TokenKind::BracketR)?;
            Type::List(Box::new(of_type))
        } else {
            Type::Named(self.parse_name()?)
        };
        if self.expect_optional_token(TokenKind::Bang) {
            Ok(Type::NonNull(Box::new(nullable_type)))
        } else {
            Ok(nullable_type)
        }
    }

    // Implements the parsing rules in the Type Definition section.

    /**
     * TypeSystemDefinition :
     *   - SchemaDefinition
     *   - TypeDefinition
     *   - DirectiveDefinition
     *
     * TypeDefinition :
     *   - ScalarTypeDefinition
     *   - ObjectTypeDefinition
     *   - InterfaceTypeDefinition
     *   - UnionTypeDefinition
     *   - EnumTypeDefinition
     *   - InputObjectTypeDefinition
     *
     * TypeSystemExtension :
     *   - SchemaExtension
     *   - TypeExtension
     *
     * TypeExtension :
     *   - ScalarTypeExtension
     *   - ObjectTypeExtension
     *   - InterfaceTypeExtension
     *   - UnionTypeExtension
     *   - EnumTypeExtension
     *   - InputObjectTypeDefinition
     */
    fn parse_type_system_definition(&mut self) -> Result<Definition> {
        let _desc = self.parse_description();
        let keyword_token = self.peek();
        match keyword_token {
            TokenKind::Name("schema") => self.parse_schema_definition(),
            TokenKind::Name("scalar") => self.parse_scalar_type_definition(),
            TokenKind::Name("type") => self.parse_object_type_definition(),
            TokenKind::Name("interface") => self.parse_interface_type_definition(),
            TokenKind::Name("union") => self.parse_union_type_definition(),
            TokenKind::Name("enum") => self.parse_enum_type_definition(),
            TokenKind::Name("input") => self.parse_input_object_type_definition(),
            TokenKind::Name("directive") => self.parse_directive_definition(),
            TokenKind::Name("extend") => self.parse_type_system_extension(),
            token => Err(SchemaError::Syntax(format!("Unexpected token {:?}", token))),
        }
    }

    /**
     * Description : StringValue
     */
    fn parse_description(&mut self) -> Option<&str> {
        // TODO actually return the description
        let value = match self.peek() {
            TokenKind::Str(value) => Some(*value),
            TokenKind::BlockString(value) => Some(*value),
            _ => None,
        };
        if value.is_some() {
            self.advance();
        }
        value
    }

    /**
     * SchemaDefinition : schema Directives? { OperationTypeDefinition+ }
     */
    fn parse_schema_definition(&mut self) -> Result<Definition> {
        self.expect_keyword("schema")?;
        let directives = self.parse_directives()?;
        assert!(
            directives.is_empty(),
            "directives on schema are not supported"
        );
        let operation_types = self.wrapped_list(
            TokenKind::BraceL,
            Self::parse_operation_type_definition,
            TokenKind::BraceR,
        )?;
        Ok(Definition::SchemaDefinition {
            directives,
            operation_types,
        })
    }

    /**
     * OperationTypeDefinition : OperationType : NamedType
     */
    fn parse_operation_type_definition(&mut self) -> Result<OperationTypeDefinition> {
        let operation = self.parse_operation_type()?;
        self.expect_token(TokenKind::Colon)?;
        let type_ = self.parse_name()?;
        Ok(OperationTypeDefinition { type_, operation })
    }

    /**
     * OperationType : one of query mutation subscription
     */
    fn parse_operation_type(&mut self) -> Result<OperationType> {
        match self.advance() {
            TokenKind::Name("query") => Ok(OperationType::Query),
            TokenKind::Name("mutation") => Ok(OperationType::Mutation),
            TokenKind::Name("subscription") => Ok(OperationType::Subscription),
            token => Err(SchemaError::Syntax(format!(
                "Unexpected token: {:?}",
                token
            ))),
        }
    }

    /**
     * ScalarTypeDefinition : Description? scalar Name Directives?
     */
    fn parse_scalar_type_definition(&mut self) -> Result<Definition> {
        self.expect_keyword("scalar")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        Ok(Definition::ScalarTypeDefinition { name, directives })
    }

    /**
     * ObjectTypeDefinition :
     *   Description?
     *   type Name ImplementsInterfaces? Directives? FieldsDefinition?
     */
    fn parse_object_type_definition(&mut self) -> Result<Definition> {
        self.expect_keyword("type")?;
        let name = self.parse_name()?;
        let interfaces = self.parse_implements_interfaces()?;
        let directives = self.parse_directives()?;
        let fields = self.parse_fields_definition()?;
        Ok(Definition::ObjectTypeDefinition {
            name,
            fields,
            interfaces,
            directives,
        })
    }

    /**
     * ImplementsInterfaces :
     *   - implements `&`? NamedType
     *   - ImplementsInterfaces & NamedType
     */
    fn parse_implements_interfaces(&mut self) -> Result<Vec<StringKey>> {
        if self.expect_optional_keyword("implements") {
            self.expect_optional_token(TokenKind::Amp);
            let mut interfaces = vec![self.parse_name()?];
            while self.expect_optional_token(TokenKind::Amp) {
                interfaces.push(self.parse_name()?);
            }
            Ok(interfaces)
        } else {
            Ok(vec![])
        }
    }

    /**
     * FieldsDefinition : { FieldDefinition+ }
     */
    fn parse_fields_definition(&mut self) -> Result<Vec<FieldDefinition>> {
        self.optional_wrapped_list(
            TokenKind::BraceL,
            Self::parse_field_definition,
            TokenKind::BraceR,
        )
    }

    /**
     * FieldDefinition :
     *   - Description? Name ArgumentsDefinition? : Type Directives?
     */
    fn parse_field_definition(&mut self) -> Result<FieldDefinition> {
        self.parse_description();
        let name = self.parse_name()?;
        let arguments = self.parse_argument_defs()?;
        self.expect_token(TokenKind::Colon)?;
        let type_ = self.parse_type_reference()?;
        let directives = self.parse_directives()?;
        Ok(FieldDefinition {
            type_,
            name,
            arguments,
            directives,
        })
    }

    /**
     * ArgumentsDefinition : ( InputValueDefinition+ )
     */
    fn parse_argument_defs(&mut self) -> Result<Vec<InputValueDefinition>> {
        self.optional_wrapped_list(
            TokenKind::ParenL,
            Self::parse_input_value_def,
            TokenKind::ParenR,
        )
    }

    /**
     * InputValueDefinition :
     *   - Description? Name : Type DefaultValue? Directives?
     */
    fn parse_input_value_def(&mut self) -> Result<InputValueDefinition> {
        // TODO desc
        let name = self.parse_name()?;
        self.expect_token(TokenKind::Colon)?;
        let type_ = self.parse_type_reference()?;
        let default_value = if self.expect_optional_token(TokenKind::Equals) {
            Some(self.parse_value_literal()?)
        } else {
            None
        };
        let directives = self.parse_directives()?;
        Ok(InputValueDefinition {
            name,
            type_,
            default_value,
            directives,
        })
    }

    /**
     * InterfaceTypeDefinition :
     *   - Description? interface Name Directives? FieldsDefinition?
     */
    fn parse_interface_type_definition(&mut self) -> Result<Definition> {
        self.parse_description();
        self.expect_keyword("interface")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        let fields = self.parse_fields_definition()?;
        Ok(Definition::InterfaceTypeDefinition {
            name,
            directives,
            fields,
        })
    }

    /**
     * UnionTypeDefinition :
     *   - Description? union Name Directives? UnionMemberTypes?
     */
    fn parse_union_type_definition(&mut self) -> Result<Definition> {
        self.parse_description();
        self.expect_keyword("union")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        let members = self.parse_union_member_types()?;
        Ok(Definition::UnionTypeDefinition {
            name,
            directives,
            members,
        })
    }

    /**
     * UnionMemberTypes :
     *   - = `|`? NamedType
     *   - UnionMemberTypes | NamedType
     */
    fn parse_union_member_types(&mut self) -> Result<Vec<StringKey>> {
        let mut members = vec![];
        if self.expect_optional_token(TokenKind::Equals) {
            self.expect_optional_token(TokenKind::Pipe);
            members.push(self.parse_name()?);
            while self.expect_optional_token(TokenKind::Pipe) {
                members.push(self.parse_name()?);
            }
        }
        Ok(members)
    }

    /**
     * EnumTypeDefinition :
     *   - Description? enum Name Directives? EnumValuesDefinition?
     */
    fn parse_enum_type_definition(&mut self) -> Result<Definition> {
        self.parse_description();
        self.expect_keyword("enum")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        let values = self.parse_enum_values_definition()?;
        Ok(Definition::EnumTypeDefinition {
            name,
            directives,
            values,
        })
    }

    /**
     * EnumValuesDefinition : { EnumValueDefinition+ }
     */
    fn parse_enum_values_definition(&mut self) -> Result<Vec<EnumValueDefinition>> {
        self.optional_wrapped_list(
            TokenKind::BraceL,
            Self::parse_enum_value_definition,
            TokenKind::BraceR,
        )
    }

    /**
     * EnumValueDefinition : Description? EnumValue Directives?
     *
     * EnumValue : Name
     */
    fn parse_enum_value_definition(&mut self) -> Result<EnumValueDefinition> {
        self.parse_description();
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        Ok(EnumValueDefinition { name, directives })
    }

    /**
     * InputObjectTypeDefinition :
     *   - Description? input Name Directives? InputFieldsDefinition?
     */
    fn parse_input_object_type_definition(&mut self) -> Result<Definition> {
        self.parse_description();
        self.expect_keyword("input")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        let fields = self.parse_input_fields_definition()?;
        Ok(Definition::InputObjectTypeDefinition {
            name,
            directives,
            fields,
        })
    }

    /**
     * InputFieldsDefinition : { InputValueDefinition+ }
     */
    fn parse_input_fields_definition(&mut self) -> Result<Vec<InputValueDefinition>> {
        self.optional_wrapped_list(
            TokenKind::BraceL,
            Self::parse_input_value_def,
            TokenKind::BraceR,
        )
    }

    /**
     * SchemaExtension :
     *  - extend schema Directives? { OperationTypeDefinition+ }
     *  - extend schema Directives
     */
    fn parse_schema_extension(&mut self) -> Result<Definition> {
        unimplemented!("parse_schema_extension");
    }

    /**
     * ScalarTypeExtension :
     *   - extend scalar Name Directives
     */
    fn parse_scalar_type_extension(&mut self) -> Result<Definition> {
        unimplemented!("parse_scalar_type_extension")
    }

    /**
     * ObjectTypeExtension :
     *  - extend type Name ImplementsInterfaces? Directives? FieldsDefinition
     *  - extend type Name ImplementsInterfaces? Directives
     *  - extend type Name ImplementsInterfaces
     */
    fn parse_object_type_extension(&mut self) -> Result<Definition> {
        // Name(extend) was parsed before
        self.expect_keyword("type")?;
        let name = self.parse_name()?;
        let interfaces = self.parse_implements_interfaces()?;
        let directives = self.parse_directives()?;
        let fields = self.parse_fields_definition()?;
        if interfaces.is_empty() && directives.is_empty() && fields.is_empty() {
            return Err(SchemaError::Syntax("Unexpected".to_string()));
        }
        Ok(Definition::ObjectTypeExtension {
            name,
            fields,
            interfaces,
            directives,
        })
    }

    /**
     * InterfaceTypeExtension :
     *   - extend interface Name Directives? FieldsDefinition
     *   - extend interface Name Directives
     */
    fn parse_interface_type_extension(&mut self) -> Result<Definition> {
        // Name(extend) was parsed before
        self.expect_keyword("interface")?;
        let name = self.parse_name()?;
        let directives = self.parse_directives()?;
        let fields = self.parse_fields_definition()?;
        Ok(Definition::InterfaceTypeExtension {
            name,
            fields,
            directives,
        })
    }

    /**
     * UnionTypeExtension :
     *   - extend union Name Directives? UnionMemberTypes
     *   - extend union Name Directives
     */
    fn parse_union_type_extension(&mut self) -> Result<Definition> {
        unimplemented!("parse_union_type_extension")
    }

    /**
     * EnumTypeExtension :
     *   - extend enum Name Directives? EnumValuesDefinition
     *   - extend enum Name Directives
     */
    fn parse_enum_type_extension(&mut self) -> Result<Definition> {
        unimplemented!("parse_enum_type_extension")
    }

    /**
     * InputObjectTypeExtension :
     *   - extend input Name Directives? InputFieldsDefinition
     *   - extend input Name Directives
     */
    fn parse_input_object_type_extension(&mut self) -> Result<Definition> {
        unimplemented!("parse_input_object_type_extension")
    }

    /**
     * DirectiveDefinition :
     *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
     */
    fn parse_directive_definition(&mut self) -> Result<Definition> {
        self.expect_keyword("directive")?;
        self.expect_token(TokenKind::At)?;
        let name = self.parse_name()?;
        let arguments = self.parse_argument_defs()?;
        let repeatable = self.expect_optional_keyword("repeatable");
        self.expect_keyword("on")?;
        let locations = self.parse_directive_locations()?;
        // TODO add directives
        Ok(Definition::DirectiveDefinition {
            name,
            arguments,
            repeatable,
            locations,
        })
    }

    /**
     * DirectiveLocations :
     *   - `|`? DirectiveLocation
     *   - DirectiveLocations | DirectiveLocation
     */
    fn parse_directive_locations(&mut self) -> Result<Vec<DirectiveLocation>> {
        self.expect_optional_token(TokenKind::Pipe);
        let mut locations = vec![];

        self.expect_optional_token(TokenKind::Pipe);
        locations.push(self.parse_directive_location()?);
        while self.expect_optional_token(TokenKind::Pipe) {
            locations.push(self.parse_directive_location()?);
        }
        Ok(locations)
    }

    /*
     * DirectiveLocation :
     *   - ExecutableDirectiveLocation
     *   - TypeSystemDirectiveLocation
     *
     * ExecutableDirectiveLocation : one of
     *   `QUERY`
     *   `MUTATION`
     *   `SUBSCRIPTION`
     *   `FIELD`
     *   `FRAGMENT_DEFINITION`
     *   `FRAGMENT_SPREAD`
     *   `INLINE_FRAGMENT`
     *
     * TypeSystemDirectiveLocation : one of
     *   `SCHEMA`
     *   `SCALAR`
     *   `OBJECT`
     *   `FIELD_DEFINITION`
     *   `ARGUMENT_DEFINITION`
     *   `INTERFACE`
     *   `UNION`
     *   `ENUM`
     *   `ENUM_VALUE`
     *   `INPUT_OBJECT`
     *   `INPUT_FIELD_DEFINITION`
     */
    fn parse_directive_location(&mut self) -> Result<DirectiveLocation> {
        match self.advance() {
            TokenKind::Name("QUERY") => Ok(DirectiveLocation::Query),
            TokenKind::Name("MUTATION") => Ok(DirectiveLocation::Mutation),
            TokenKind::Name("SUBSCRIPTION") => Ok(DirectiveLocation::Subscription),
            TokenKind::Name("FIELD") => Ok(DirectiveLocation::Field),
            TokenKind::Name("FRAGMENT_DEFINITION") => Ok(DirectiveLocation::FragmentDefinition),
            TokenKind::Name("FRAGMENT_SPREAD") => Ok(DirectiveLocation::FragmentSpread),
            TokenKind::Name("INLINE_FRAGMENT") => Ok(DirectiveLocation::InlineFragment),
            TokenKind::Name("SCHEMA") => Ok(DirectiveLocation::Schema),
            TokenKind::Name("SCALAR") => Ok(DirectiveLocation::Scalar),
            TokenKind::Name("OBJECT") => Ok(DirectiveLocation::Object),
            TokenKind::Name("FIELD_DEFINITION") => Ok(DirectiveLocation::FieldDefinition),
            TokenKind::Name("ARGUMENT_DEFINITION") => Ok(DirectiveLocation::ArgumentDefinition),
            TokenKind::Name("INTERFACE") => Ok(DirectiveLocation::Interface),
            TokenKind::Name("UNION") => Ok(DirectiveLocation::Union),
            TokenKind::Name("ENUM") => Ok(DirectiveLocation::Enum),
            TokenKind::Name("ENUM_VALUE") => Ok(DirectiveLocation::EnumValue),
            TokenKind::Name("INPUT_OBJECT") => Ok(DirectiveLocation::InputObject),
            TokenKind::Name("INPUT_FIELD_DEFINITION") => {
                Ok(DirectiveLocation::InputFieldDefinition)
            }
            // experimental
            TokenKind::Name("VARIABLE_DEFINITION") => Ok(DirectiveLocation::VariableDefinition),
            token => Err(SchemaError::Syntax(format!(
                "Unexpected token: {:?}",
                token
            ))),
        }
    }

    /**
     * Value :
     *   - IntValue
     *   - FloatValue
     *   - StringValue
     *   - BooleanValue
     *   - NullValue
     *   - EnumValue
     *   - ListValue
     *   - ObjectValue
     *
     * BooleanValue : one of `true` `false`
     *
     * NullValue : `null`
     *
     * EnumValue : Name but not `true`, `false` or `null`
     */
    fn parse_value_literal(&mut self) -> Result<Value> {
        match self.peek() {
            TokenKind::BracketL => Ok(Value::List(self.parse_list()?)),
            TokenKind::BraceL => Ok(Value::Object(self.parse_object()?)),
            TokenKind::Str(string_value) => {
                let value = Value::String((*string_value).to_string());
                self.advance();
                Ok(value)
            }
            TokenKind::Name("true") => {
                self.advance();
                Ok(Value::Boolean(true))
            }
            TokenKind::Name("false") => {
                self.advance();
                Ok(Value::Boolean(false))
            }
            TokenKind::Name("null") => {
                self.advance();
                Ok(Value::Null)
            }
            TokenKind::Name(_) => {
                let name = self.parse_name()?;
                Ok(Value::Enum(name))
            }
            TokenKind::Int(value) => {
                let node = Value::Int((*value).to_string());
                self.advance();
                Ok(node)
            }
            TokenKind::Float(value) => {
                let node = Value::Float((*value).to_string());
                self.advance();
                Ok(node)
            }
            token => Err(SchemaError::Syntax(format!("Unexpected token {:?}", token))),
        }
    }

    /**
     * ListValue :
     *   - [ ]
     *   - [ Value+ ]
     */
    fn parse_list(&mut self) -> Result<ListValue> {
        Ok(ListValue {
            values: self.any(
                TokenKind::BracketL,
                Self::parse_value_literal,
                TokenKind::BracketR,
            )?,
        })
    }

    /**
     * ObjectValue :
     *   - { }
     *   - { ObjectField+ }
     */
    fn parse_object(&mut self) -> Result<ObjectValue> {
        Ok(ObjectValue {
            fields: self.any(
                TokenKind::BraceL,
                Self::parse_object_field,
                TokenKind::BraceR,
            )?,
        })
    }

    /**
     * ObjectField : Name : Value
     */
    fn parse_object_field(&mut self) -> Result<ObjectField> {
        let name = self.parse_name()?;
        self.expect_token(TokenKind::Colon)?;
        let value = self.parse_value_literal()?;
        Ok(ObjectField { name, value })
    }

    /**
     * NamedType : Name
     */
    fn parse_name(&mut self) -> Result<StringKey> {
        match self.advance() {
            TokenKind::Name(name) => Ok(name.intern()),
            token => Err(SchemaError::Syntax(format!(
                "Expected a name, got {:?}.",
                token
            ))),
        }
    }

    /**
     * If the next token is a given keyword, advance the lexer.
     * Otherwise, do not change the parser state and throw an error.
     */
    fn expect_keyword(&mut self, value: &str) -> Result<()> {
        match self.advance() {
            TokenKind::Name(name) if name == value => Ok(()),
            token => Err(SchemaError::Syntax(format!(
                "Expected keyword {}, got {:?}.",
                value, token
            ))),
        }
    }

    /**
     * If the next token is a given keyword, return "true" after advancing
     * the lexer. Otherwise, do not change the parser state and return "false".
     */
    fn expect_optional_keyword(&mut self, expected: &str) -> bool {
        match self.peek() {
            TokenKind::Name(actual) if *actual == expected => {
                self.advance();
                true
            }
            _ => false,
        }
    }

    /**
     * If the next token is of the given kind, return that token after advancing
     * the lexer. Otherwise, do not change the parser state and throw an error.
     */
    fn expect_token(&mut self, expected: TokenKind<'_>) -> Result<()> {
        let actual = self.advance();
        if actual == expected {
            Ok(())
        } else {
            Err(SchemaError::Syntax(format!(
                "Expected {:?}, got {:?}.",
                expected, actual
            )))
        }
    }

    /**
     * If the next token is of the given kind, return that token after advancing
     * the lexer. Otherwise, do not change the parser state and return undefined.
     */
    fn expect_optional_token(&mut self, expected: TokenKind<'_>) -> bool {
        if *self.peek() == expected {
            self.advance();
            true
        } else {
            false
        }
    }

    /**
     * Returns a possibly empty list of parse nodes, determined by
     * the parseFn. This list begins with a lex token of openKind
     * and ends with a lex token of closeKind. Advances the parser
     * to the next lex token after the closing token.
     */
    fn any<T, ParseItemFn>(
        &mut self,
        open: TokenKind<'_>,
        mut parse_item: ParseItemFn,
        close: TokenKind<'_>,
    ) -> Result<Vec<T>>
    where
        ParseItemFn: FnMut(&mut Self) -> Result<T>,
    {
        self.expect_token(open)?;
        let mut nodes = vec![];
        while !self.expect_optional_token(close) {
            nodes.push(parse_item(self)?);
        }
        Ok(nodes)
    }
    /**
     * Returns a non-empty list of parse nodes, determined by
     * the parseFn. This list begins with a lex token of openKind
     * and ends with a lex token of closeKind. Advances the parser
     * to the next lex token after the closing token.
     */
    fn wrapped_list<T, ParseItemFn>(
        &mut self,
        open: TokenKind<'_>,
        mut parse_item: ParseItemFn,
        close: TokenKind<'_>,
    ) -> Result<Vec<T>>
    where
        ParseItemFn: FnMut(&mut Self) -> Result<T>,
    {
        self.expect_token(open)?;
        let mut nodes = vec![parse_item(self)?];
        while !self.expect_optional_token(close) {
            nodes.push(parse_item(self)?);
        }
        Ok(nodes)
    }

    fn optional_wrapped_list<T, ParseItemFn>(
        &mut self,
        open: TokenKind<'_>,
        mut parse_item: ParseItemFn,
        close: TokenKind<'_>,
    ) -> Result<Vec<T>>
    where
        ParseItemFn: FnMut(&mut Self) -> Result<T>,
    {
        if self.expect_optional_token(open) {
            let mut nodes = vec![parse_item(self)?];
            while !self.expect_optional_token(close) {
                nodes.push(parse_item(self)?);
            }
            Ok(nodes)
        } else {
            Ok(vec![])
        }
    }
}
