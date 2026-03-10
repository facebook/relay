/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::cmp::Ordering;
use std::cmp::Ordering::Greater;
use std::cmp::Ordering::Less;
use std::fmt::Display;
use std::str::FromStr;

use intern::string_key::Intern;
use intern::string_key::StringKey;
use logos::Lexer;
use logos::Logos;

#[derive(Debug, PartialEq, Eq, Hash, Clone)]
pub enum SchemaCoordinate {
    Directive {
        name: StringKey,
    },
    DirectiveArgument {
        directive_name: StringKey,
        argument_name: StringKey,
    },
    Type {
        name: StringKey,
    },
    Member {
        parent_name: StringKey,
        member_name: StringKey,
    },
    Argument {
        parent_name: StringKey,
        member_name: StringKey,
        argument_name: StringKey,
    },
}

impl SchemaCoordinate {
    pub fn root_name(&self) -> StringKey {
        match self {
            SchemaCoordinate::Type { name } => *name,
            SchemaCoordinate::Member { parent_name, .. } => *parent_name,
            SchemaCoordinate::Argument { parent_name, .. } => *parent_name,
            SchemaCoordinate::Directive { name } => *name,
            SchemaCoordinate::DirectiveArgument { directive_name, .. } => *directive_name,
        }
    }
}

/// Spec-compliant Schema Coordinate parsing, as per https://spec.graphql.org/draft/#sec-Schema-Coordinates
pub fn parse_schema_coordinate(input: &str) -> Result<SchemaCoordinate, String> {
    match parse_schema_coordinate_impl(input, false) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!(
            "Failed to parse Schema Coordinate '{}' with error: {}",
            input, e
        )),
    }
}

/// A technically spec-non-compliant version of schema coordinate parsing:
/// will get the schema coordinate, but will also handle what is likely the *intention*
/// of "coordinates" like "Type.field.argument" that should be like "Type.field(argument:)"
///
/// Useful for CLI and handling user intention in a non-strict environment.
pub fn parse_schema_coordinate_best_effort(input: &str) -> Result<SchemaCoordinate, String> {
    match parse_schema_coordinate_impl(input, true) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!(
            "Failed a best-effort parse of Schema Coordinate '{}' with error: {}",
            input, e
        )),
    }
}

fn parse_schema_coordinate_impl(
    input: &str,
    best_effort: bool,
) -> Result<SchemaCoordinate, String> {
    let mut lex = Token::lexer(input.trim());

    let parsed = match lex.next() {
        None => Err("Expected Name or '@', got empty input.".to_string()),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lex.slice())),
        Some(Ok(token)) => match token {
            Token::At => parse_directive_coordinate(&mut lex, best_effort),
            Token::Name(name) => parse_type_coordinate(name, &mut lex, best_effort),
            _ => Err(format!("Expected Name or '@', got {}", token)),
        },
    }?;

    match lex.next() {
        None => Ok(parsed),
        Some(_) if best_effort => Ok(parsed),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lex.slice())),
        Some(Ok(token)) => Err(format!("Expected end of input, got: '{}'", token)),
    }
}

#[derive(Logos, Debug, PartialEq)]
#[logos(error = String)]
enum Token {
    #[token("@")]
    At,

    #[token(".")]
    Period,

    #[token("(")]
    OpenParen,

    #[token(")")]
    CloseParen,

    #[token(":")]
    Colon,

    // https://spec.graphql.org/draft/#sec-Names
    #[regex("[a-zA-Z][a-zA-Z0-9_]*", |lex| lex.slice().intern())]
    Name(StringKey),
}

impl std::fmt::Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Token::At => write!(f, "@"),
            Token::Period => write!(f, "."),
            Token::OpenParen => write!(f, "("),
            Token::CloseParen => write!(f, ")"),
            Token::Colon => write!(f, ":"),
            Token::Name(name) => write!(f, "{}", name),
        }
    }
}

fn parse_directive_coordinate<'a>(
    lexer: &mut Lexer<'a, Token>,
    best_effort: bool,
) -> Result<SchemaCoordinate, String> {
    let name = match lexer.next() {
        None => Err("Expected directive name".to_string()),
        Some(Ok(Token::Name(name))) => Ok(name),
        Some(Ok(bad_token)) => Err(format!("Expected directive name, got: '{}'", bad_token)),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
    }?;

    match parse_argument_name(lexer, best_effort) {
        Ok(None) => Ok(SchemaCoordinate::Directive { name }),
        Err(_) if best_effort => Ok(SchemaCoordinate::Directive { name }),
        Ok(Some(argument_name)) => Ok(SchemaCoordinate::DirectiveArgument {
            directive_name: name,
            argument_name,
        }),
        Err(e) => Err(e),
    }
}

fn parse_type_coordinate<'a>(
    name: StringKey,
    lexer: &mut Lexer<'a, Token>,
    best_effort: bool,
) -> Result<SchemaCoordinate, String> {
    match lexer.next() {
        None => Ok(SchemaCoordinate::Type { name }),
        Some(Ok(Token::Period)) => match lexer.next() {
            Some(Ok(Token::Name(member_name))) => match parse_argument_name(lexer, best_effort) {
                Ok(None) => Ok(SchemaCoordinate::Member {
                    parent_name: name,
                    member_name,
                }),
                Err(_) if best_effort => Ok(SchemaCoordinate::Member {
                    parent_name: name,
                    member_name,
                }),
                Ok(Some(argument_name)) => Ok(SchemaCoordinate::Argument {
                    parent_name: name,
                    member_name,
                    argument_name,
                }),
                Err(e) => Err(e),
            },
            Some(_) if best_effort => Ok(SchemaCoordinate::Type { name }),
            None if best_effort => Ok(SchemaCoordinate::Type { name }),
            None => Err("Expected Name after '.', reached end of input.".to_string()),
            Some(Ok(token)) => Err(format!("Expected Name after '.', got: '{}'", token)),
            Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
        },
        Some(Ok(_)) if best_effort => Ok(SchemaCoordinate::Type { name }),
        Some(Ok(token)) => Err(format!("Expected '.', got: '{}'", token)),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
    }
}

fn parse_argument_name<'a>(
    lexer: &mut Lexer<'a, Token>,
    best_effort: bool,
) -> Result<Option<StringKey>, String> {
    match lexer.next() {
        None => Ok(None),
        Some(Ok(Token::OpenParen)) => match lexer.next() {
            None if best_effort => Ok(None),
            None => Err("Expected Argument Name, reached end of input.".to_string()),
            Some(Ok(Token::Name(argument_name))) => {
                consume_argument_close(lexer, best_effort)?;
                Ok(Some(argument_name))
            }
            Some(Ok(bad_token)) if best_effort => Ok(None),
            Some(Ok(bad_token)) => Err(format!("Expected Argument Name, got: '{}'", bad_token)),
            Some(Err(_)) if best_effort => Ok(None),
            Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
        },
        Some(Ok(Token::Period)) if best_effort => match lexer.next() {
            None => Ok(None),
            Some(Ok(Token::Name(argument_name))) => Ok(Some(argument_name)),
            Some(Ok(_)) => Ok(None),
            Some(Err(_)) => Ok(None),
        },
        Some(Ok(token)) => Err(format!("Expected '(', got: '{}'", token)),
        Some(Err(_)) if best_effort => Ok(None),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
    }
}

/// Consume the trailing `:)` after an argument name per the spec format:
/// `Name ( Name : )`
fn consume_argument_close<'a>(
    lexer: &mut Lexer<'a, Token>,
    best_effort: bool,
) -> Result<(), String> {
    match lexer.next() {
        Some(Ok(Token::Colon)) => match lexer.next() {
            Some(Ok(Token::CloseParen)) => Ok(()),
            _ if best_effort => Ok(()),
            None => Err("Expected ')' after ':', reached end of input.".to_string()),
            Some(Ok(token)) => Err(format!("Expected ')' after ':', got: '{}'", token)),
            Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
        },
        None if best_effort => Ok(()),
        _ if best_effort => Ok(()),
        None => Err("Expected ':' after argument name, reached end of input.".to_string()),
        Some(Ok(token)) => Err(format!(
            "Expected ':' after argument name, got: '{}'",
            token
        )),
        Some(Err(_)) => Err(format!("Lexer error on: '{}'", lexer.slice())),
    }
}

impl Display for SchemaCoordinate {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SchemaCoordinate::Type { name } => write!(f, "{}", name),
            SchemaCoordinate::Member {
                parent_name,
                member_name,
            } => {
                write!(f, "{}.{}", parent_name, member_name)
            }
            SchemaCoordinate::Argument {
                parent_name,
                member_name,
                argument_name,
            } => write!(f, "{}.{}({}:)", parent_name, member_name, argument_name),
            SchemaCoordinate::Directive { name } => write!(f, "@{}", name),
            SchemaCoordinate::DirectiveArgument {
                directive_name,
                argument_name,
            } => write!(f, "@{}({}:)", directive_name, argument_name),
        }
    }
}

impl FromStr for SchemaCoordinate {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        parse_schema_coordinate_best_effort(s)
    }
}

impl Ord for SchemaCoordinate {
    fn cmp(&self, other: &Self) -> Ordering {
        match (self, other) {
            // Within directives: compare by directive name, then by argument presence/name
            (Self::Directive { name: a }, Self::Directive { name: b }) => a.cmp(b),
            (
                Self::Directive { name: a },
                Self::DirectiveArgument {
                    directive_name: b, ..
                },
            ) => a.cmp(b).then(Less),
            (
                Self::DirectiveArgument {
                    directive_name: a, ..
                },
                Self::Directive { name: b },
            ) => a.cmp(b).then(Greater),
            (
                Self::DirectiveArgument {
                    directive_name: a_dir,
                    argument_name: a_arg,
                },
                Self::DirectiveArgument {
                    directive_name: b_dir,
                    argument_name: b_arg,
                },
            ) => a_dir.cmp(b_dir).then_with(|| a_arg.cmp(b_arg)),

            // Directives (@-prefixed) sort before non-directives
            (Self::Directive { .. } | Self::DirectiveArgument { .. }, _) => Less,
            (_, Self::Directive { .. } | Self::DirectiveArgument { .. }) => Greater,

            // Within non-directives: compare by parent/type name, then member, then argument
            (Self::Type { name: a }, Self::Type { name: b }) => a.cmp(b),
            (
                Self::Type { name: a },
                Self::Member { parent_name: b, .. } | Self::Argument { parent_name: b, .. },
            ) => a.cmp(b).then(Less),
            (
                Self::Member { parent_name: a, .. } | Self::Argument { parent_name: a, .. },
                Self::Type { name: b },
            ) => a.cmp(b).then(Greater),
            (
                Self::Member {
                    parent_name: a1,
                    member_name: a2,
                },
                Self::Member {
                    parent_name: b1,
                    member_name: b2,
                },
            ) => a1.cmp(b1).then_with(|| a2.cmp(b2)),
            (
                Self::Member {
                    parent_name: a1,
                    member_name: a2,
                },
                Self::Argument {
                    parent_name: b1,
                    member_name: b2,
                    ..
                },
            ) => a1.cmp(b1).then_with(|| a2.cmp(b2)).then(Less),
            (
                Self::Argument {
                    parent_name: a1,
                    member_name: a2,
                    ..
                },
                Self::Member {
                    parent_name: b1,
                    member_name: b2,
                },
            ) => a1.cmp(b1).then_with(|| a2.cmp(b2)).then(Greater),
            (
                Self::Argument {
                    parent_name: a1,
                    member_name: a2,
                    argument_name: a3,
                },
                Self::Argument {
                    parent_name: b1,
                    member_name: b2,
                    argument_name: b3,
                },
            ) => a1.cmp(b1).then_with(|| a2.cmp(b2)).then_with(|| a3.cmp(b3)),
        }
    }
}

impl PartialOrd for SchemaCoordinate {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

#[cfg(test)]
mod tests {
    use intern::string_key::Intern;

    use super::*;

    // ── parse_schema_coordinate (strict) ────────────────────────────

    #[test]
    fn strict_type() {
        assert_eq!(
            parse_schema_coordinate("Query"),
            Ok(SchemaCoordinate::Type {
                name: "Query".intern(),
            })
        );
    }

    #[test]
    fn strict_member() {
        assert_eq!(
            parse_schema_coordinate("Query.viewer"),
            Ok(SchemaCoordinate::Member {
                parent_name: "Query".intern(),
                member_name: "viewer".intern(),
            })
        );
    }

    #[test]
    fn strict_argument() {
        assert_eq!(
            parse_schema_coordinate("Query.user(id:)"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Query".intern(),
                member_name: "user".intern(),
                argument_name: "id".intern(),
            })
        );
    }

    #[test]
    fn strict_directive() {
        assert_eq!(
            parse_schema_coordinate("@skip"),
            Ok(SchemaCoordinate::Directive {
                name: "skip".intern(),
            })
        );
    }

    #[test]
    fn strict_directive_argument() {
        assert_eq!(
            parse_schema_coordinate("@include(if:)"),
            Ok(SchemaCoordinate::DirectiveArgument {
                directive_name: "include".intern(),
                argument_name: "if".intern(),
            })
        );
    }

    #[test]
    fn strict_trims_whitespace() {
        assert_eq!(
            parse_schema_coordinate("  Query  "),
            Ok(SchemaCoordinate::Type {
                name: "Query".intern(),
            })
        );
    }

    #[test]
    fn strict_underscore_names() {
        assert_eq!(
            parse_schema_coordinate("My_Type.my_field"),
            Ok(SchemaCoordinate::Member {
                parent_name: "My_Type".intern(),
                member_name: "my_field".intern(),
            })
        );
    }

    #[test]
    fn strict_rejects_empty() {
        assert_eq!(
            parse_schema_coordinate(""),
            Err("Failed to parse Schema Coordinate '' with error: Expected Name or '@', got empty input.".to_string())
        );
    }

    #[test]
    fn strict_rejects_dot_separated_argument() {
        // Type.field.argument is not valid per spec; must be Type.field(argument:)
        assert_eq!(
            parse_schema_coordinate("Type.field.argument"),
            Err("Failed to parse Schema Coordinate 'Type.field.argument' with error: Expected '(', got: '.'".to_string())
        );
    }

    #[test]
    fn strict_rejects_trailing_dot() {
        assert_eq!(
            parse_schema_coordinate("Type."),
            Err("Failed to parse Schema Coordinate 'Type.' with error: Expected Name after '.', reached end of input.".to_string())
        );
    }

    #[test]
    fn strict_rejects_bare_at() {
        assert_eq!(
            parse_schema_coordinate("@"),
            Err(
                "Failed to parse Schema Coordinate '@' with error: Expected directive name"
                    .to_string()
            )
        );
    }

    #[test]
    fn strict_rejects_unclosed_argument_paren() {
        // Missing `:)` after argument name
        assert_eq!(
            parse_schema_coordinate("Type.field(arg"),
            Err("Failed to parse Schema Coordinate 'Type.field(arg' with error: Expected ':' after argument name, reached end of input.".to_string())
        );
    }

    #[test]
    fn strict_rejects_missing_argument_colon() {
        // `)` without preceding `:`
        assert_eq!(
            parse_schema_coordinate("Type.field(arg)"),
            Err("Failed to parse Schema Coordinate 'Type.field(arg)' with error: Expected ':' after argument name, got: ')'".to_string())
        );
    }

    #[test]
    fn strict_rejects_missing_close_paren() {
        // `:` without following `)`
        assert_eq!(
            parse_schema_coordinate("Type.field(arg:"),
            Err("Failed to parse Schema Coordinate 'Type.field(arg:' with error: Expected ')' after ':', reached end of input.".to_string())
        );
    }

    #[test]
    fn strict_rejects_leading_dot() {
        assert_eq!(
            parse_schema_coordinate(".field"),
            Err("Failed to parse Schema Coordinate '.field' with error: Expected Name or '@', got .".to_string())
        );
    }

    #[test]
    fn strict_rejects_paren_without_member() {
        assert_eq!(
            parse_schema_coordinate("Type(arg:)"),
            Err(
                "Failed to parse Schema Coordinate 'Type(arg:)' with error: Expected '.', got: '('"
                    .to_string()
            )
        );
    }

    #[test]
    fn strict_rejects_leading_digit() {
        assert_eq!(
            parse_schema_coordinate("123"),
            Err(
                "Failed to parse Schema Coordinate '123' with error: Lexer error on: '1'"
                    .to_string()
            )
        );
    }

    #[test]
    fn strict_rejects_intermediate_whitespace() {
        assert_eq!(
            parse_schema_coordinate("Type. field"),
            Err(
                "Failed to parse Schema Coordinate 'Type. field' with error: Lexer error on: ' '"
                    .to_string()
            )
        );
    }

    // ── parse_schema_coordinate_best_effort ─────────────────────────

    #[test]
    fn best_effort_type() {
        assert_eq!(
            parse_schema_coordinate_best_effort("Query"),
            Ok(SchemaCoordinate::Type {
                name: "Query".intern(),
            })
        );
    }

    #[test]
    fn best_effort_member() {
        assert_eq!(
            parse_schema_coordinate_best_effort("Query.viewer"),
            Ok(SchemaCoordinate::Member {
                parent_name: "Query".intern(),
                member_name: "viewer".intern(),
            })
        );
    }

    #[test]
    fn best_effort_argument() {
        assert_eq!(
            parse_schema_coordinate_best_effort("Query.user(id:)"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Query".intern(),
                member_name: "user".intern(),
                argument_name: "id".intern(),
            })
        );
    }

    #[test]
    fn best_effort_directive() {
        assert_eq!(
            parse_schema_coordinate_best_effort("@skip"),
            Ok(SchemaCoordinate::Directive {
                name: "skip".intern(),
            })
        );
    }

    #[test]
    fn best_effort_directive_argument() {
        assert_eq!(
            parse_schema_coordinate_best_effort("@include(if:)"),
            Ok(SchemaCoordinate::DirectiveArgument {
                directive_name: "include".intern(),
                argument_name: "if".intern(),
            })
        );
    }

    #[test]
    fn best_effort_dot_separated_argument() {
        // Type.field.argument is parsed as an argument coordinate
        assert_eq!(
            parse_schema_coordinate_best_effort("Type.field.argument"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Type".intern(),
                member_name: "field".intern(),
                argument_name: "argument".intern(),
            })
        );
    }

    #[test]
    fn best_effort_trailing_dot() {
        // Trailing dot is ignored; falls back to Type coordinate
        assert_eq!(
            parse_schema_coordinate_best_effort("Type."),
            Ok(SchemaCoordinate::Type {
                name: "Type".intern(),
            })
        );
    }

    #[test]
    fn best_effort_unclosed_argument_paren() {
        // Missing `:)` is tolerated in best-effort mode
        assert_eq!(
            parse_schema_coordinate_best_effort("Type.field(arg"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Type".intern(),
                member_name: "field".intern(),
                argument_name: "arg".intern(),
            })
        );
    }

    #[test]
    fn best_effort_missing_argument_colon() {
        // `)` without `:` is tolerated in best-effort mode
        assert_eq!(
            parse_schema_coordinate_best_effort("Type.field(arg)"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Type".intern(),
                member_name: "field".intern(),
                argument_name: "arg".intern(),
            })
        );
    }

    #[test]
    fn best_effort_missing_close_paren() {
        // `:` without `)` is tolerated in best-effort mode
        assert_eq!(
            parse_schema_coordinate_best_effort("Type.field(arg:"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Type".intern(),
                member_name: "field".intern(),
                argument_name: "arg".intern(),
            })
        );
    }

    #[test]
    fn best_effort_directive_dot_argument() {
        // @directive.arg is parsed as a directive argument coordinate
        assert_eq!(
            parse_schema_coordinate_best_effort("@skip.reason"),
            Ok(SchemaCoordinate::DirectiveArgument {
                directive_name: "skip".intern(),
                argument_name: "reason".intern(),
            })
        );
    }

    #[test]
    fn best_effort_extra_dots_ignored() {
        // Only the first two segments after the type are used
        assert_eq!(
            parse_schema_coordinate_best_effort("Type.field.argument.extra"),
            Ok(SchemaCoordinate::Argument {
                parent_name: "Type".intern(),
                member_name: "field".intern(),
                argument_name: "argument".intern(),
            })
        );
    }

    #[test]
    fn best_effort_paren_without_member() {
        // No member name before paren; falls back to Type coordinate
        assert_eq!(
            parse_schema_coordinate_best_effort("Type(arg:)"),
            Ok(SchemaCoordinate::Type {
                name: "Type".intern(),
            })
        );
    }

    #[test]
    fn best_effort_still_rejects_empty() {
        assert_eq!(
            parse_schema_coordinate_best_effort(""),
            Err("Failed a best-effort parse of Schema Coordinate '' with error: Expected Name or '@', got empty input.".to_string())
        );
    }

    #[test]
    fn best_effort_still_rejects_bare_at() {
        assert_eq!(
            parse_schema_coordinate_best_effort("@"),
            Err("Failed a best-effort parse of Schema Coordinate '@' with error: Expected directive name".to_string())
        );
    }

    // ── Display ─────────────────────────────────────────────────────

    #[test]
    fn display_type() {
        let coord = SchemaCoordinate::Type {
            name: "Query".intern(),
        };
        assert_eq!(coord.to_string(), "Query");
    }

    #[test]
    fn display_member() {
        let coord = SchemaCoordinate::Member {
            parent_name: "Query".intern(),
            member_name: "viewer".intern(),
        };
        assert_eq!(coord.to_string(), "Query.viewer");
    }

    #[test]
    fn display_argument() {
        let coord = SchemaCoordinate::Argument {
            parent_name: "Query".intern(),
            member_name: "user".intern(),
            argument_name: "id".intern(),
        };
        assert_eq!(coord.to_string(), "Query.user(id:)");
    }

    #[test]
    fn display_directive() {
        let coord = SchemaCoordinate::Directive {
            name: "skip".intern(),
        };
        assert_eq!(coord.to_string(), "@skip");
    }

    #[test]
    fn display_directive_argument() {
        let coord = SchemaCoordinate::DirectiveArgument {
            directive_name: "include".intern(),
            argument_name: "if".intern(),
        };
        assert_eq!(coord.to_string(), "@include(if:)");
    }

    #[test]
    fn display_roundtrips_through_strict() {
        // Display outputs the spec format, which strict parsing now handles.
        let coordinates = vec![
            SchemaCoordinate::Type {
                name: "Query".intern(),
            },
            SchemaCoordinate::Member {
                parent_name: "Query".intern(),
                member_name: "viewer".intern(),
            },
            SchemaCoordinate::Argument {
                parent_name: "Query".intern(),
                member_name: "user".intern(),
                argument_name: "id".intern(),
            },
            SchemaCoordinate::Directive {
                name: "skip".intern(),
            },
            SchemaCoordinate::DirectiveArgument {
                directive_name: "include".intern(),
                argument_name: "if".intern(),
            },
        ];
        for coord in coordinates {
            let displayed = coord.to_string();
            let reparsed = parse_schema_coordinate(&displayed)
                .unwrap_or_else(|e| panic!("Failed to reparse '{}': {}", displayed, e));
            assert_eq!(coord, reparsed, "Roundtrip failed for '{}'", displayed);
        }
    }

    // ── Ord ───────────────────────────────────────────────────────────

    fn assert_sorted_order(coords: &[&str]) {
        let mut parsed: Vec<_> = coords
            .iter()
            .rev()
            .map(|s| parse_schema_coordinate(s).unwrap())
            .collect();
        parsed.sort();
        let result: Vec<String> = parsed.iter().map(|c| c.to_string()).collect();
        let expected: Vec<&str> = coords.to_vec();
        assert_eq!(result, expected);
    }

    #[test]
    fn ord_directives_before_types() {
        assert_sorted_order(&["@zzz", "AAA"]);
    }

    #[test]
    fn ord_type_before_member_same_name() {
        assert_sorted_order(&["Foo", "Foo.bar"]);
    }

    #[test]
    fn ord_member_before_argument_same_prefix() {
        assert_sorted_order(&["Foo.bar", "Foo.bar(id:)"]);
    }

    #[test]
    fn ord_directive_before_directive_argument_same_name() {
        assert_sorted_order(&["@skip", "@skip(if:)"]);
    }

    #[test]
    fn ord_dot_sorts_before_name_chars() {
        assert_sorted_order(&["Foo.bar", "Foobar"]);
    }

    #[test]
    fn ord_mixed_variants() {
        assert_sorted_order(&[
            "@include",
            "@include(if:)",
            "@skip",
            "@skip(if:)",
            "Apple",
            "Apple.a_field",
            "Apple.a_field(id:)",
            "Apple.z_field",
            "Query",
            "Query.user",
            "Query.user(id:)",
            "Zebra",
        ]);
    }

    #[test]
    fn ord_equal_coordinates() {
        let a = parse_schema_coordinate("Query.user").unwrap();
        let b = parse_schema_coordinate("Query.user").unwrap();
        assert_eq!(a.cmp(&b), std::cmp::Ordering::Equal);
    }
}
