/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::executable_node::*;
use crate::lexer::TokenKind;
use crate::syntax_error::SyntaxError;
use common::{Diagnostic, DiagnosticsResult, Location, SourceLocationKey, Span};
use interner::Intern;
use logos::Logos;

type ParseResult<T> = Result<T, ()>;

#[derive(Default)]
pub struct ParserFeatures {
    /// Enable the experimental fragment variables definitions syntax
    pub enable_variable_definitions: bool,
}

pub struct Parser<'a> {
    current: Token,
    features: ParserFeatures,
    lexer: logos::Lexer<'a, TokenKind>,
    errors: Vec<Diagnostic>,
    source_location: SourceLocationKey,
    source: &'a str,
}

/// Parser for the *executable* subset of the GraphQL specification:
/// https://github.com/graphql/graphql-spec/blob/master/spec/Appendix%20B%20--%20Grammar%20Summary.md
impl<'a> Parser<'a> {
    pub fn new(
        source: &'a str,
        source_location: SourceLocationKey,
        features: ParserFeatures,
    ) -> Self {
        // To enable fast lookahead the parser needs to store at least the 'kind' (TokenKind)
        // of the next token: the simplest option is to store the full current token, but
        // the Parser requires an initial value. Rather than incur runtime/code overhead
        // of dealing with an Option or UnsafeCell, the constructor uses a dummy token
        // value to construct the Parser, then immediately advance()s to move to the
        // first real token.
        let lexer = TokenKind::lexer(source);
        let dummy = Token {
            kind: TokenKind::EndOfFile,
            span: Span::empty(),
        };
        let mut parser = Parser {
            current: dummy,
            errors: Vec::new(),
            features,
            lexer,
            source_location,
            source,
        };
        // Advance to the first real token before doing any work
        parser.parse_token();
        parser
    }

    /// Parses a document consisting only of executable nodes: operations and
    /// fragments.
    pub fn parse_executable_document(mut self) -> DiagnosticsResult<ExecutableDocument> {
        let document = self.parse_executable_document_impl();
        if self.errors.is_empty() {
            self.parse_eof()?;
            Ok(document.unwrap())
        } else {
            Err(self.errors)
        }
    }

    /// Parses a type annotation such as `ID` or `[User!]!`.
    pub fn parse_type(mut self) -> DiagnosticsResult<TypeAnnotation> {
        let type_annotation = self.parse_type_annotation();
        if self.errors.is_empty() {
            self.parse_eof()?;
            Ok(type_annotation.unwrap())
        } else {
            Err(self.errors)
        }
    }

    fn parse_eof(mut self) -> DiagnosticsResult<()> {
        self.parse_kind(TokenKind::EndOfFile)
            .map(|_| ())
            .map_err(|_| self.errors)
    }

    // Document / Definitions

    /// Document : Definition+
    fn parse_executable_document_impl(&mut self) -> ParseResult<ExecutableDocument> {
        let start = self.index();
        let definitions = self.parse_list(
            |s| s.peek_executable_definition(),
            |s| s.parse_executable_definition(),
        )?;
        let end = self.index();
        let span = Span::new(start, end);
        Ok(ExecutableDocument { span, definitions })
    }

    /// Definition :
    /// [x] ExecutableDefinition
    /// []  TypeSystemDefinition
    /// []  TypeSystemExtension
    fn peek_executable_definition(&self) -> bool {
        let token = self.peek();
        match token.kind {
            TokenKind::OpenBrace => true, // unnamed query
            TokenKind::Identifier => match self.source(&token) {
                "query" => true,
                "mutation" => true,
                "fragment" => true,
                "subscription" => true,
                _ => false,
            },
            _ => false,
        }
    }

    /// Definition :
    /// [x] ExecutableDefinition
    /// []  TypeSystemDefinition
    /// []  TypeSystemExtension
    fn parse_executable_definition(&mut self) -> ParseResult<ExecutableDefinition> {
        let token = self.peek();
        let source = self.source(&token);
        match (token.kind, source) {
            (TokenKind::OpenBrace, _) => Ok(ExecutableDefinition::Operation(
                self.parse_operation_definition()?,
            )),
            (TokenKind::Identifier, "query")
            | (TokenKind::Identifier, "mutation")
            | (TokenKind::Identifier, "subscription") => Ok(ExecutableDefinition::Operation(
                self.parse_operation_definition()?,
            )),
            (TokenKind::Identifier, "fragment") => Ok(ExecutableDefinition::Fragment(
                self.parse_fragment_definition()?,
            )),
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedDefinition,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
        }
    }

    /// FragmentDefinition : fragment FragmentName TypeCondition Directives? SelectionSet
    fn parse_fragment_definition(&mut self) -> ParseResult<FragmentDefinition> {
        let start = self.index();
        let fragment = self.parse_keyword("fragment")?;
        let name = self.parse_identifier()?;
        let variable_definitions = if self.features.enable_variable_definitions {
            self.parse_optional_delimited_list(TokenKind::OpenParen, TokenKind::CloseParen, |s| {
                s.parse_variable_definition()
            })?
        } else {
            None
        };
        let type_condition = self.parse_type_condition()?;
        let directives = self.parse_directives()?;
        let selections = self.parse_selections()?;
        let end = self.index();
        let span = Span::new(start, end);
        Ok(FragmentDefinition {
            location: Location::new(self.source_location, span),
            fragment,
            name,
            variable_definitions,
            type_condition,
            directives,
            selections,
        })
    }

    /// OperationDefinition :
    ///     OperationType Name? VariableDefinitions? Directives? SelectionSet
    ///     SelectionSet
    fn parse_operation_definition(&mut self) -> ParseResult<OperationDefinition> {
        let start = self.index();
        // Special case: anonymous query
        if self.peek_token_kind() == TokenKind::OpenBrace {
            let selections = self.parse_selections()?;
            let span = Span::new(start, self.index());
            return Ok(OperationDefinition {
                location: Location::new(self.source_location, span),
                operation: None,
                name: None,
                variable_definitions: None,
                directives: Vec::new(),
                selections,
            });
        }
        // Otherwise requires operation type and name
        let maybe_operation_token = self.peek();
        let operation = match (
            maybe_operation_token.kind,
            self.source(&maybe_operation_token),
        ) {
            (TokenKind::Identifier, "mutation") => (self.parse_token(), OperationKind::Mutation),
            (TokenKind::Identifier, "query") => (self.parse_token(), OperationKind::Query),
            (TokenKind::Identifier, "subscription") => {
                (self.parse_token(), OperationKind::Subscription)
            }
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedOperationKind,
                    Location::new(self.source_location, maybe_operation_token.span),
                );
                self.record_error(error);
                return Err(());
            }
        };
        let name = if self.peek_token_kind() == TokenKind::Identifier {
            Some(self.parse_identifier()?)
        } else {
            None
        };
        let variable_definitions =
            self.parse_optional_delimited_list(TokenKind::OpenParen, TokenKind::CloseParen, |s| {
                s.parse_variable_definition()
            })?;
        let directives = self.parse_directives()?;
        let selections = self.parse_selections()?;
        let span = Span::new(start, self.index());
        Ok(OperationDefinition {
            location: Location::new(self.source_location, span),
            operation: Some(operation),
            name,
            variable_definitions,
            directives,
            selections,
        })
    }

    /// VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
    fn parse_variable_definition(&mut self) -> ParseResult<VariableDefinition> {
        let start = self.index();
        let name = self.parse_variable_identifier()?;
        let colon = self.parse_kind(TokenKind::Colon)?;
        let type_ = self.parse_type_annotation()?;
        let default_value = if self.peek_token_kind() == TokenKind::Equals {
            Some(self.parse_default_value()?)
        } else {
            None
        };
        let directives = self.parse_directives()?;
        let span = Span::new(start, self.index());
        Ok(VariableDefinition {
            span,
            name,
            colon,
            type_,
            default_value,
            directives,
        })
    }

    /// DefaultValue : = Value[Const]
    fn parse_default_value(&mut self) -> ParseResult<DefaultValue> {
        let start = self.index();
        let equals = self.parse_kind(TokenKind::Equals)?;
        let value = self.parse_constant_value()?;
        let span = Span::new(start, self.index());
        Ok(DefaultValue {
            span,
            equals,
            value,
        })
    }

    /// Type :
    ///     NamedType
    ///     ListType
    ///     NonNullType
    fn parse_type_annotation(&mut self) -> ParseResult<TypeAnnotation> {
        let start = self.index();
        let token = self.peek();
        let type_annotation = match token.kind {
            TokenKind::Identifier => TypeAnnotation::Named(self.parse_identifier()?),
            TokenKind::OpenBracket => {
                let open = self.parse_kind(TokenKind::OpenBracket)?;
                let type_ = self.parse_type_annotation()?;
                let close = self.parse_kind(TokenKind::CloseBracket)?;
                TypeAnnotation::List(Box::new(ListTypeAnnotation {
                    span: Span::new(start, self.index()),
                    open,
                    type_,
                    close,
                }))
            }
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedTypeAnnotation,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                return Err(());
            }
        };
        if self.peek_token_kind() == TokenKind::Exclamation {
            let exclamation = self.parse_kind(TokenKind::Exclamation)?;
            Ok(TypeAnnotation::NonNull(Box::new(NonNullTypeAnnotation {
                span: Span::new(start, self.index()),
                type_: type_annotation,
                exclamation,
            })))
        } else {
            Ok(type_annotation)
        }
    }

    /// Directives[Const] : Directive[?Const]+
    fn parse_directives(&mut self) -> ParseResult<Vec<Directive>> {
        if self.peek_token_kind() == TokenKind::At {
            self.parse_list(|s| s.peek_kind(TokenKind::At), |s| s.parse_directive())
        } else {
            Ok(vec![])
        }
    }

    /// Directive[Const] : @ Name Arguments[?Const]?
    fn parse_directive(&mut self) -> ParseResult<Directive> {
        let start = self.index();
        let at = self.parse_kind(TokenKind::At)?;
        let name = self.parse_identifier()?;
        let arguments = self.parse_optional_arguments()?;
        let span = Span::new(start, self.index());
        Ok(Directive {
            span,
            at,
            name,
            arguments,
        })
    }

    /// TypeCondition : on NamedType
    /// NamedType : Name
    fn parse_type_condition(&mut self) -> ParseResult<TypeCondition> {
        let start = self.index();
        let on = self.parse_keyword("on")?;
        let type_ = self.parse_identifier()?;
        Ok(TypeCondition {
            span: Span::new(start, self.index()),
            on,
            type_,
        })
    }

    /// SelectionSet : { Selection+ }
    fn parse_selections(&mut self) -> ParseResult<List<Selection>> {
        self.parse_delimited_list(TokenKind::OpenBrace, TokenKind::CloseBrace, |s| {
            s.parse_selection()
        })
    }

    /// Selection :
    ///     Field
    ///     FragmentSpread
    ///     InlineFragment
    fn parse_selection(&mut self) -> ParseResult<Selection> {
        let token = self.peek();
        match token.kind {
            TokenKind::Spread => self.parse_spread(),
            TokenKind::Identifier => self.parse_field(),
            // hint for invalid spreads
            TokenKind::Period | TokenKind::PeriodPeriod => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedSpread,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedSelection,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
        }
    }

    /// Field : Alias? Name Arguments? Directives? SelectionSet?
    fn parse_field(&mut self) -> ParseResult<Selection> {
        let start = self.index();
        let name = self.parse_identifier()?;
        let (name, alias) = if self.peek_token_kind() == TokenKind::Colon {
            let colon = self.parse_kind(TokenKind::Colon)?;
            let alias = name;
            let name = self.parse_identifier()?;
            (
                name,
                Some(Alias {
                    span: Span::new(start, self.index()),
                    alias,
                    colon,
                }),
            )
        } else {
            (name, None)
        };
        let arguments = self.parse_optional_arguments()?;
        let directives = self.parse_directives()?;
        if self.peek_token_kind() == TokenKind::OpenBrace {
            let selections = self.parse_selections()?;
            Ok(Selection::LinkedField(LinkedField {
                span: Span::new(start, self.index()),
                alias,
                name,
                arguments,
                directives,
                selections,
            }))
        } else {
            Ok(Selection::ScalarField(ScalarField {
                span: Span::new(start, self.index()),
                alias,
                name,
                arguments,
                directives,
            }))
        }
    }

    /// FragmentSpread : ... FragmentName Directives?
    /// InlineFragment : ... TypeCondition? Directives? SelectionSet
    fn parse_spread(&mut self) -> ParseResult<Selection> {
        let start = self.index();
        let spread = self.parse_kind(TokenKind::Spread)?;
        let is_on_keyword = self.peek_keyword("on");
        if !is_on_keyword && self.peek_token_kind() == TokenKind::Identifier {
            // fragment spread
            let name = self.parse_identifier()?;
            let directives = self.parse_directives()?;
            Ok(Selection::FragmentSpread(FragmentSpread {
                span: Span::new(start, self.index()),
                spread,
                name,
                directives,
            }))
        } else {
            // inline fragment with or without a type condition
            let type_condition = if is_on_keyword {
                Some(self.parse_type_condition()?)
            } else {
                None
            };
            let directives = self.parse_directives()?;
            let selections = self.parse_selections()?;
            Ok(Selection::InlineFragment(InlineFragment {
                span: Span::new(start, self.index()),
                spread,
                type_condition,
                directives,
                selections,
            }))
        }
    }

    /// Arguments[Const] : ( Argument[?Const]+ )
    fn parse_arguments(&mut self) -> ParseResult<List<Argument>> {
        self.parse_delimited_list(TokenKind::OpenParen, TokenKind::CloseParen, |s| {
            s.parse_argument()
        })
    }

    /// Arguments?
    fn parse_optional_arguments(&mut self) -> ParseResult<Option<List<Argument>>> {
        if self.peek_token_kind() == TokenKind::OpenParen {
            Ok(Some(self.parse_arguments()?))
        } else {
            Ok(None)
        }
    }

    /// Argument[Const] : Name : Value[?Const]
    fn parse_argument(&mut self) -> ParseResult<Argument> {
        let start = self.index();
        let name = self.parse_identifier()?;
        let colon = self.parse_kind(TokenKind::Colon)?;
        let value = self.parse_value()?;
        let span = Span::new(start, self.index());
        Ok(Argument {
            span,
            name,
            colon,
            value,
        })
    }

    /// Value[?Const] :
    ///     [~Const] Variable
    ///     ListValue[?Const]
    ///     ObjectValue[?Const]
    // (delegated):
    ///     IntValue
    ///     FloatValue
    ///     StringValue
    ///     BooleanValue
    ///     NullValue
    ///     EnumValue
    fn parse_value(&mut self) -> ParseResult<Value> {
        let token = self.peek();
        match token.kind {
            TokenKind::OpenBracket => {
                let list = self.parse_delimited_list(
                    TokenKind::OpenBracket,
                    TokenKind::CloseBracket,
                    |s| s.parse_value(),
                )?;
                // Promote a Value::List() with all constant items to Value::Constant()
                if list.items.iter().all(|x| x.is_constant()) {
                    let mut constants = Vec::with_capacity(list.items.len());
                    for item in list.items {
                        match item {
                            Value::Constant(c) => {
                                constants.push(c);
                            }
                            _ => unreachable!("Already checked all items are constant"),
                        }
                    }
                    Ok(Value::Constant(ConstantValue::List(List {
                        span: list.span,
                        start: list.start,
                        items: constants,
                        end: list.end,
                    })))
                } else {
                    Ok(Value::List(list))
                }
            }
            TokenKind::OpenBrace => {
                let list =
                    self.parse_delimited_list(TokenKind::OpenBrace, TokenKind::CloseBrace, |s| {
                        s.parse_argument()
                    })?;
                // Promote a Value::Object() with all constant values to Value::Constant()
                if list.items.iter().all(|x| x.value.is_constant()) {
                    let mut arguments = Vec::with_capacity(list.items.len());
                    for argument in list.items {
                        let value = match argument.value {
                            Value::Constant(c) => c,
                            _ => unreachable!("Already checked all items are constant"),
                        };
                        arguments.push(ConstantArgument {
                            span: argument.span,
                            name: argument.name,
                            colon: argument.colon,
                            value,
                        });
                    }
                    Ok(Value::Constant(ConstantValue::Object(List {
                        span: list.span,
                        start: list.start,
                        items: arguments,
                        end: list.end,
                    })))
                } else {
                    Ok(Value::Object(list))
                }
            }
            TokenKind::Dollar => Ok(Value::Variable(self.parse_variable_identifier()?)),
            _ => Ok(Value::Constant(self.parse_literal_value()?)),
        }
    }

    // Constant Values

    /// Value[Const=true] :
    ///     IntValue
    ///     FloatValue
    ///     StringValue
    ///     BooleanValue
    ///     NullValue
    ///     EnumValue
    ///     ListValue[Const=true]
    ///     ObjectValue[Const=true]
    fn parse_constant_value(&mut self) -> ParseResult<ConstantValue> {
        match self.peek_token_kind() {
            TokenKind::OpenBracket => Ok(ConstantValue::List(self.parse_delimited_list(
                TokenKind::OpenBracket,
                TokenKind::CloseBracket,
                |s| s.parse_constant_value(),
            )?)),
            TokenKind::OpenBrace => Ok(ConstantValue::Object(self.parse_delimited_list(
                TokenKind::OpenBrace,
                TokenKind::CloseBrace,
                |s| s.parse_constant_argument(),
            )?)),
            _ => self.parse_literal_value(),
        }
    }

    /// Argument[Const=true] : Name : Value[Const=true]
    fn parse_constant_argument(&mut self) -> ParseResult<ConstantArgument> {
        let start = self.index();
        let name = self.parse_identifier()?;
        let colon = self.parse_kind(TokenKind::Colon)?;
        let value = self.parse_constant_value()?;
        let span = Span::new(start, self.index());
        Ok(ConstantArgument {
            span,
            name,
            colon,
            value,
        })
    }

    /// IntValue
    /// FloatValue
    /// StringValue
    /// BooleanValue
    /// NullValue
    /// EnumValue
    fn parse_literal_value(&mut self) -> ParseResult<ConstantValue> {
        let token = self.parse_token();
        let source = self.source(&token);
        match &token.kind {
            TokenKind::StringLiteral => {
                let value = source[1..source.len() - 1].to_string();
                Ok(ConstantValue::String(StringNode {
                    token,
                    value: value.intern(),
                }))
            }
            TokenKind::IntegerLiteral => {
                let value = source.parse::<i64>();
                match value {
                    Ok(value) => Ok(ConstantValue::Int(IntNode { token, value })),
                    Err(_) => {
                        let error = Diagnostic::error(
                            SyntaxError::InvalidInteger,
                            Location::new(self.source_location, token.span),
                        );
                        self.record_error(error);
                        Err(())
                    }
                }
            }
            TokenKind::FloatLiteral => {
                let value = source.parse::<f64>();
                match value {
                    Ok(value) => Ok(ConstantValue::Float(FloatNode {
                        token,
                        value: FloatValue::new(value),
                        source_value: source.intern(),
                    })),
                    Err(_) => {
                        let error = Diagnostic::error(
                            SyntaxError::InvalidFloat,
                            Location::new(self.source_location, token.span),
                        );
                        self.record_error(error);
                        Err(())
                    }
                }
            }
            TokenKind::Identifier => Ok(match source {
                "true" => ConstantValue::Boolean(BooleanNode { token, value: true }),
                "false" => ConstantValue::Boolean(BooleanNode {
                    token,
                    value: false,
                }),
                "null" => ConstantValue::Null(token),
                _ => ConstantValue::Enum(EnumNode {
                    token,
                    value: source.intern(),
                }),
            }),
            TokenKind::ErrorFloatLiteralMissingZero => {
                let error = Diagnostic::error(
                    SyntaxError::InvalidFloatLiteralMissingZero,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            TokenKind::ErrorNumberLiteralLeadingZero
            | TokenKind::ErrorNumberLiteralTrailingInvalid => {
                let error = Diagnostic::error(
                    SyntaxError::InvalidNumberLiteral,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            TokenKind::ErrorUnsupportedStringCharacter => {
                let error = Diagnostic::error(
                    SyntaxError::UnsupportedStringCharacter,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            TokenKind::ErrorUnterminatedString => {
                let error = Diagnostic::error(
                    SyntaxError::UnterminatedString,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            TokenKind::ErrorUnterminatedBlockString => {
                let error = Diagnostic::error(
                    SyntaxError::UnterminatedBlockString,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::ExpectedConstantValue,
                    Location::new(self.source_location, token.span),
                );
                self.record_error(error);
                Err(())
            }
        }
    }

    /// Variable : $ Name
    fn parse_variable_identifier(&mut self) -> ParseResult<VariableIdentifier> {
        let start = self.index();
        let dollar_token = self.parse_token();
        if dollar_token.kind != TokenKind::Dollar {
            self.record_error(Diagnostic::error(
                SyntaxError::ExpectedVariable,
                Location::new(self.source_location, dollar_token.span),
            ));
            return Err(());
        }

        let token = self.parse_token();
        if token.kind == TokenKind::Identifier {
            let name = self.source(&token).intern();
            Ok(VariableIdentifier {
                span: Span::new(start, token.span.end),
                token,
                name,
            })
        } else {
            let error = Diagnostic::error(
                SyntaxError::ExpectedVariableIdentifier,
                Location::new(self.source_location, token.span),
            );
            self.record_error(error);
            Err(())
        }
    }

    /// Name :: /[_A-Za-z][_0-9A-Za-z]*/
    fn parse_identifier(&mut self) -> ParseResult<Identifier> {
        let token = self.parse_token();
        let source = self.source(&token);
        let span = token.span;
        match token.kind {
            TokenKind::Identifier => Ok(Identifier {
                span,
                token,
                value: source.intern(),
            }),
            _ => {
                let error = Diagnostic::error(
                    SyntaxError::Expected(TokenKind::Identifier),
                    Location::new(self.source_location, span),
                );
                self.record_error(error);
                Err(())
            }
        }
    }

    // Helpers

    /// <item>*
    fn parse_list<T, F1, F2>(&mut self, peek: F1, parse: F2) -> ParseResult<Vec<T>>
    where
        F1: Fn(&mut Self) -> bool,
        F2: Fn(&mut Self) -> ParseResult<T>,
    {
        let mut items = vec![];
        while peek(self) {
            items.push(parse(self)?);
        }
        Ok(items)
    }

    /// Parse delimited items into a `Vec`
    /// <start> <item>* <end>
    fn parse_delimited_items<T, F>(
        &mut self,
        start_kind: TokenKind,
        end_kind: TokenKind,
        parse: F,
    ) -> ParseResult<(Token, Vec<T>, Token)>
    where
        F: Fn(&mut Self) -> ParseResult<T>,
    {
        let start = self.parse_kind(start_kind)?;
        let mut items = vec![];
        while !self.peek_kind(end_kind) {
            items.push(parse(self)?);
        }
        let end = self.parse_kind(end_kind)?;
        Ok((start, items, end))
    }

    /// Parse delimited items into a `List`
    /// <start> <item>* <end>
    fn parse_delimited_list<T, F>(
        &mut self,
        start_kind: TokenKind,
        end_kind: TokenKind,
        parse: F,
    ) -> ParseResult<List<T>>
    where
        F: Fn(&mut Self) -> ParseResult<T>,
    {
        let span_start = self.index();
        let (start, items, end) = self.parse_delimited_items(start_kind, end_kind, parse)?;
        let span = Span::new(span_start, self.index());
        Ok(List {
            span,
            start,
            items,
            end,
        })
    }

    /// (<start> <item>* <end>)?
    fn parse_optional_delimited_list<T, F>(
        &mut self,
        start_kind: TokenKind,
        end_kind: TokenKind,
        parse: F,
    ) -> ParseResult<Option<List<T>>>
    where
        F: Fn(&mut Self) -> ParseResult<T>,
    {
        if self.peek_token_kind() == start_kind {
            Ok(Some(
                self.parse_delimited_list(start_kind, end_kind, parse)?,
            ))
        } else {
            Ok(None)
        }
    }

    /// A &str for the source of the inner span of the given token.
    fn source(&self, token: &Token) -> &str {
        let (start, end) = token.span.as_usize();
        &self.source[start..end]
    }

    /// Peek at the next token
    fn peek(&self) -> &Token {
        &self.current
    }

    /// Return true if the next token has the expected kind
    fn peek_kind(&self, expected: TokenKind) -> bool {
        self.peek_token_kind() == expected
    }

    /// Peek at the kind of the next token
    fn peek_token_kind(&self) -> TokenKind {
        self.current.kind
    }

    /// Parse the next token, succeeding if it has the expected kind and failing
    /// otherwise.
    fn parse_kind(&mut self, expected: TokenKind) -> ParseResult<Token> {
        let start = self.index();
        let token = self.parse_token();
        if token.kind == expected {
            Ok(token)
        } else {
            let error = Diagnostic::error(
                SyntaxError::Expected(expected),
                Location::new(self.source_location, Span::new(start, self.index())),
            );
            self.record_error(error);
            Err(())
        }
    }

    /// Return true if the current token is an Identifier matching the given keyword.
    fn peek_keyword(&self, expected: &'static str) -> bool {
        self.peek_kind(TokenKind::Identifier) && self.source(self.peek()) == expected
    }

    /// Parse the next token, succeeding if it is an Identifier that matches the
    /// given keyword
    fn parse_keyword(&mut self, expected: &'static str) -> ParseResult<Token> {
        let token = self.parse_kind(TokenKind::Identifier)?;
        if self.source(&token) == expected {
            Ok(token)
        } else {
            let error = Diagnostic::error(
                SyntaxError::ExpectedKeyword(expected),
                Location::new(self.source_location, token.span),
            );
            self.record_error(error);
            Err(())
        }
    }

    /// Get the byte offset of the *start* of the current token
    fn index(&self) -> u32 {
        self.current.span.start
    }

    /// Get the next token (and advance)
    fn parse_token(&mut self) -> Token {
        // Skip over (and record) any invalid tokens until either a valid token or an EOF is encountered
        loop {
            let kind = self.lexer.next().unwrap_or(TokenKind::EndOfFile);
            match kind {
                TokenKind::Error => {
                    if let Some(error_token_kind) = self.lexer.extras.error_token {
                        // Reset the error token
                        self.lexer.extras.error_token = None;
                        // If error_token is set, return that error token
                        // instead of a generic error.
                        return std::mem::replace(
                            &mut self.current,
                            Token {
                                kind: error_token_kind,
                                span: self.lexer.span().into(),
                            },
                        );
                    } else {
                        // Record and skip over unknown character errors
                        let error = Diagnostic::error(
                            SyntaxError::UnsupportedCharacter,
                            Location::new(self.source_location, self.lexer.span().into()),
                        );
                        self.record_error(error);
                    }
                }
                _ => {
                    return std::mem::replace(
                        &mut self.current,
                        Token {
                            kind,
                            span: self.lexer.span().into(),
                        },
                    );
                }
            }
        }
    }

    fn record_error(&mut self, error: Diagnostic) {
        // NOTE: Useful for debugging parse errors:
        // panic!("{:?}", error);
        self.errors.push(error);
    }
}
