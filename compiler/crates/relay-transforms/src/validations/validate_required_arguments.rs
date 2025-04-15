/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::DiagnosticsResult;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use errors::validate;
use graphql_ir::Argument;
use graphql_ir::Directive;
use graphql_ir::FIXME_FAT_INTERFACE;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::ValidationMessage;
use graphql_ir::Validator;
use intern::string_key::StringKey;
use schema::ArgumentDefinitions;
use schema::Schema;

pub fn validate_required_arguments(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = ValidateRequiredArguments::new(program);
    validator.validate_program(program)
}

struct ValidateRequiredArguments<'program> {
    program: &'program Program,
    root_name_with_location: Option<WithLocation<StringKey>>,
}

impl<'program> ValidateRequiredArguments<'program> {
    fn new(program: &'program Program) -> Self {
        Self {
            program,
            root_name_with_location: None,
        }
    }
}

impl Validator for ValidateRequiredArguments<'_> {
    const NAME: &'static str = "ValidateRequiredArguments";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = true;

    fn validate_operation(&mut self, operation: &OperationDefinition) -> DiagnosticsResult<()> {
        self.root_name_with_location = Some(WithLocation::new(
            operation.name.location,
            operation.name.item.0,
        ));
        self.default_validate_operation(operation)
    }

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        self.root_name_with_location = Some(fragment.name.map(|x| x.0));
        self.default_validate_fragment(fragment)
    }

    fn validate_scalar_field(&mut self, field: &ScalarField) -> DiagnosticsResult<()> {
        let definition = self.program.schema.field(field.definition.item);
        validate!(
            if field.directives.named(*FIXME_FAT_INTERFACE).is_some() {
                Ok(())
            } else {
                self.validate_required_arguments(
                    &definition.arguments,
                    &field.arguments,
                    field.alias_or_name(&self.program.schema),
                    field.alias_or_name_location(),
                    self.root_name_with_location.unwrap(),
                )
            },
            self.validate_directives(&field.directives)
        )
    }

    fn validate_linked_field(&mut self, field: &LinkedField) -> DiagnosticsResult<()> {
        let definition = self.program.schema.field(field.definition.item);
        validate!(
            if field.directives.named(*FIXME_FAT_INTERFACE).is_some() {
                Ok(())
            } else {
                self.validate_required_arguments(
                    &definition.arguments,
                    &field.arguments,
                    field.alias_or_name(&self.program.schema),
                    field.alias_or_name_location(),
                    self.root_name_with_location.unwrap(),
                )
            },
            self.default_validate_linked_field(field)
        )
    }

    fn validate_directive(&mut self, directive: &Directive) -> DiagnosticsResult<()> {
        let definition = self.program.schema.get_directive(directive.name.item);
        if let Some(definition) = definition {
            self.validate_required_arguments(
                &definition.arguments,
                &directive.arguments,
                directive.name.item.0,
                directive.location,
                self.root_name_with_location.unwrap(),
            )
        } else {
            Ok(())
        }
    }
}

impl ValidateRequiredArguments<'_> {
    fn validate_required_arguments(
        &self,
        argument_definitions: &ArgumentDefinitions,
        arguments: &[Argument],
        node_name: StringKey,
        node_location: Location,
        root_name_with_location: WithLocation<StringKey>,
    ) -> DiagnosticsResult<()> {
        if !argument_definitions.is_empty() {
            for def in argument_definitions.iter() {
                if def.type_.is_non_null()
                    && def.default_value.is_none()
                    && !arguments
                        .iter()
                        .map(|arg| arg.name.item)
                        .any(|x| x == def.name.item)
                {
                    return Err(vec![
                        Diagnostic::error(
                            ValidationMessage::MissingRequiredArgument {
                                argument_name: def.name.item,
                                node_name,
                                root_name: root_name_with_location.item,
                                type_string: self.program.schema.get_type_string(&def.type_),
                            },
                            node_location,
                        )
                        .annotate("Root definition:", root_name_with_location.location),
                    ]);
                }
            }
        }
        Ok(())
    }
}
