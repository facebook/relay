/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::ValidationMessage;
use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentSpread, Program, ScalarField, Selection,
    Transformed, Transformer, Value,
};
use graphql_syntax::ConstantValue as SyntaxConstantValue;
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use schema::{ArgumentValue, Field, Schema};
use std::sync::Arc;

pub fn relay_resolvers(program: &Program) -> DiagnosticsResult<Program> {
    let mut transform = ClientResolverTransform::new(program);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

lazy_static! {
    pub static ref RELAY_RESOLVER_DIRECTIVE_NAME: StringKey = "relay_resolver".intern();
    pub static ref RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME: StringKey = "fragment_name".intern();
    pub static ref RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME: StringKey = "import_path".intern();
    pub static ref RELAY_RESOLVER_JS_RETURN_TYPE_ARGUMENT_NAME: StringKey =
        "js_return_type".intern();
    pub static ref RELAY_RESOLVER_METADATA_FIELD_NAME: StringKey = "field_name".intern();
    pub static ref RELAY_RESOLVER_METADATA_FIELD_ALIAS: StringKey = "field_alias".intern();
    pub static ref RELAY_RESOLVER_METADATA_DIRECTIVE_NAME: StringKey = "__relayResolver".intern();
}

struct ClientResolverTransform<'program> {
    program: &'program Program,
    errors: Vec<Diagnostic>,
}

impl<'program> ClientResolverTransform<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            errors: Default::default(),
        }
    }
}

impl Transformer for ClientResolverTransform<'_> {
    const NAME: &'static str = "RelayResolversTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let field_type = self.program.schema.field(field.definition.item);
        match get_resolver_info(field_type, field.definition.location) {
            Some(info) => {
                match info {
                    Ok((fragment_name, import_path, js_return_type)) => {
                        if let Some(directive) = field.directives.first() {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::RelayResolverUnexpectedDirective {},
                                directive.name.location,
                            ));
                        }
                        if self.program.fragment(fragment_name).is_none() {
                            self.errors.push(Diagnostic::error(
                                ValidationMessage::InvalidRelayResolverFragmentName {
                                    fragment_name,
                                },
                                // We don't have locations for schema files.
                                field.definition.location,
                            ));
                            return Transformed::Keep;
                        }
                        Transformed::Replace(
                            // Note: Using a fragment spread with a metadata
                            // directive to represent a Relay Resolver field is
                            // a bit awkward. Using a linked field would allow
                            // us to more naturally preserve the name and alias
                            // as well as any attached directives.
                            //
                            // While this would work well for the rest of our
                            // compiler, we would need an addititonal transform
                            // to convert the linked field to an inline fragment
                            // for the actual persisted query.
                            //
                            // For now we'll use a fragment spread an dissallow
                            // directives on Relay Resolver fields.
                            Selection::FragmentSpread(Arc::new(FragmentSpread {
                                fragment: WithLocation::generated(fragment_name),
                                directives: vec![get_metadata_directive(
                                    import_path,
                                    js_return_type,
                                    self.program.schema.field(field.definition.item).name,
                                    field.alias.map(|alias| alias.item),
                                )],
                                arguments: vec![],
                            })),
                        )
                    }
                    Err(diagostics) => {
                        for diagnostic in diagostics {
                            self.errors.push(diagnostic);
                        }
                        Transformed::Keep
                    }
                }
            }
            None => Transformed::Keep,
        }
    }
}

fn get_resolver_info(
    field_type: &Field,
    error_location: Location,
) -> Option<DiagnosticsResult<(StringKey, StringKey, StringKey)>> {
    if !field_type.is_extension {
        return None;
    }
    field_type
        .directives
        .named(*RELAY_RESOLVER_DIRECTIVE_NAME)
        .map(|directive| {
            let arguments = &directive.arguments;
            let fragment_name = get_argument_value(
                arguments,
                *RELAY_RESOLVER_FRAGMENT_ARGUMENT_NAME,
                error_location,
            )?;
            let import_path = get_argument_value(
                arguments,
                *RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME,
                error_location,
            )?;
            let js_return_type = get_argument_value(
                arguments,
                *RELAY_RESOLVER_JS_RETURN_TYPE_ARGUMENT_NAME,
                error_location,
            )?;

            Ok((fragment_name, import_path, js_return_type))
        })
}

fn get_argument_value(
    arguments: &[ArgumentValue],
    argument_name: StringKey,
    error_location: Location,
) -> DiagnosticsResult<StringKey> {
    match arguments.named(argument_name) {
        Some(argument) => {
            match &argument.value {
                SyntaxConstantValue::String(import_path) => Ok(import_path.value),
                _ => {
                    // This is a validation error, but ideally it would be done when we validate the client schema.
                    Err(vec![Diagnostic::error(
                        ValidationMessage::InvalidRelayResolverKeyArg { key: argument_name },
                        error_location,
                    )])
                }
            }
        }
        None => {
            // Should we expect schema validation to catch this for required fields?
            Err(vec![Diagnostic::error(
                ValidationMessage::MissingRelayResolverKeyArg { key: argument_name },
                error_location,
            )])
        }
    }
}

fn get_metadata_directive(
    resolver_import_path: StringKey,
    js_return_type: StringKey,
    field_name: StringKey,
    field_alias: Option<StringKey>,
) -> Directive {
    let mut arguments = vec![
        Argument {
            name: WithLocation::generated(*RELAY_RESOLVER_JS_RETURN_TYPE_ARGUMENT_NAME),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(js_return_type))),
        },
        Argument {
            name: WithLocation::generated(*RELAY_RESOLVER_IMPORT_PATH_ARGUMENT_NAME),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(
                resolver_import_path,
            ))),
        },
        Argument {
            name: WithLocation::generated(*RELAY_RESOLVER_METADATA_FIELD_NAME),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(field_name))),
        },
    ];

    if let Some(alias) = field_alias {
        arguments.push(Argument {
            name: WithLocation::generated(*RELAY_RESOLVER_METADATA_FIELD_ALIAS),
            value: WithLocation::generated(Value::Constant(ConstantValue::String(alias))),
        })
    }

    Directive {
        name: WithLocation::generated(*RELAY_RESOLVER_METADATA_DIRECTIVE_NAME),
        arguments,
    }
}
