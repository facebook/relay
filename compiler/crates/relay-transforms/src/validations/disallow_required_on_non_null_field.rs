/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;

use ::errors::try_all;
use common::Diagnostic;
use common::DiagnosticTag;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::Location;
use common::NamedItem;
use errors::try2;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Validator;
use graphql_ir::reexport::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::SDLSchema;
use schema::Schema;

use crate::CATCH_DIRECTIVE_NAME;
use crate::CHILDREN_CAN_BUBBLE_METADATA_KEY;
use crate::REQUIRED_DIRECTIVE_NAME;
use crate::ValidationMessageWithData;

lazy_static! {
    static ref SEMANTIC_NON_NULL_DIRECTIVE: DirectiveName =
        DirectiveName("semanticNonNull".intern());
    static ref THROW_ON_FIELD_ERROR_DIRECTIVE: DirectiveName =
        DirectiveName("throwOnFieldError".intern());
}

pub fn disallow_required_on_non_null_field(program: &Program) -> DiagnosticsResult<()> {
    let mut validator = DisallowRequiredOnNonNullField::new(&program.schema);
    validator.validate_program(program)?;

    if validator.warnings.is_empty() {
        Ok(())
    } else {
        Err(validator.warnings)
    }
}

type FieldPath = Vec<StringKey>;

struct DisallowRequiredOnNonNullField<'a> {
    schema: &'a Arc<SDLSchema>,
    warnings: Vec<Diagnostic>,
    path: FieldPath,
    modifiable_fields: HashMap<FieldPath, Action>,
}

impl<'a> DisallowRequiredOnNonNullField<'a> {
    fn new(schema: &'a Arc<SDLSchema>) -> Self {
        Self {
            schema,
            warnings: vec![],
            path: vec![],
            modifiable_fields: HashMap::new(),
        }
    }

    // Tracks field required-directive removal eligibility. If a field's required directive,
    // is not removable, it remains not removable forever. Otherwise it is removable and we
    // accumulate the locations where it can be removed... unless it becomes not removable
    // later on.
    fn update_field_action(&mut self, new_action: Action) {
        let mut path = self.path.clone();
        path.reverse();
        let existing_action = self.modifiable_fields.get(&path);
        self.modifiable_fields.insert(
            path,
            match existing_action {
                None => new_action,
                Some(Action::NotRemovable) => {
                    // already not removable, keep it that way
                    Action::NotRemovable
                }
                Some(Action::Removable(list)) => match new_action {
                    Action::NotRemovable => Action::NotRemovable,
                    Action::Removable(new_list) => {
                        let mut new_list = new_list.clone();
                        new_list.extend(list.clone());
                        Action::Removable(new_list)
                    }
                },
            },
        );
    }

    fn validate_required_field(
        &mut self,
        field: &Arc<impl Field>,
        errors_are_caught: bool,
    ) -> DiagnosticsResult<()> {
        if !errors_are_caught {
            return Ok(());
        }

        let required_directive = field.directives().named(*REQUIRED_DIRECTIVE_NAME);

        if required_directive.is_none() {
            return Ok(());
        }

        if self
            .schema
            .field(field.definition().item)
            .type_
            .is_non_null()
        {
            self.update_field_action(Action::Removable(vec![Message {
                message: ValidationMessageWithData::RequiredOnNonNull,
                location: required_directive.unwrap().location,
            }]));
        } else if self
            .schema
            .field(field.definition().item)
            .directives
            .named(*SEMANTIC_NON_NULL_DIRECTIVE)
            .is_some()
        {
            // @required on a semantically-non-null field is unnecessary
            self.update_field_action(Action::Removable(vec![Message {
                message: ValidationMessageWithData::RequiredOnSemanticNonNull,
                location: required_directive.unwrap().location,
            }]));
        } else {
            self.update_field_action(Action::NotRemovable);
        }

        Ok(())
    }

    fn validate_selection_fields(
        &mut self,
        selections: &[Selection],
        errors_are_caught: bool,
    ) -> DiagnosticsResult<()> {
        try_all(selections.iter().map(|selection| match selection {
            Selection::LinkedField(linked_field) => {
                let errors_are_caught = errors_are_caught
                    || linked_field
                        .directives()
                        .named(*CATCH_DIRECTIVE_NAME)
                        .is_some();

                let field_result = match linked_field
                    .directives()
                    .named(*CHILDREN_CAN_BUBBLE_METADATA_KEY)
                {
                    Some(_) => Ok(()),
                    None => self.validate_required_field(linked_field, errors_are_caught),
                };

                self.path.push(linked_field.alias_or_name(self.schema));

                let selection_result =
                    self.validate_selection_fields(&linked_field.selections, errors_are_caught);

                try2(field_result, selection_result)?;
                self.path.pop();
                Ok(())
            }
            Selection::ScalarField(scalar_field) => {
                self.validate_required_field(scalar_field, errors_are_caught)
            }
            Selection::InlineFragment(fragment) => {
                if let Ok(Some(alias)) = fragment.alias(self.schema) {
                    self.path.push(alias.item);
                    let result =
                        self.validate_selection_fields(&fragment.selections, errors_are_caught);
                    self.path.pop();
                    result
                } else {
                    self.validate_selection_fields(&fragment.selections, errors_are_caught)
                }
            }
            _ => Ok(()),
        }))?;
        Ok(())
    }

    fn modifiable_fields_to_warnings(&mut self) {
        for (_, action) in self.modifiable_fields.iter() {
            match action {
                Action::NotRemovable => {}
                Action::Removable(message_list) => {
                    for message in message_list {
                        self.warnings.push(Diagnostic::hint_with_data(
                            message.message.clone(),
                            message.location,
                            vec![DiagnosticTag::UNNECESSARY],
                        ));
                    }
                }
            }
        }
    }
}

impl Validator for DisallowRequiredOnNonNullField<'_> {
    const NAME: &'static str = "disallow_required_on_non_null_field";
    const VALIDATE_ARGUMENTS: bool = false;
    const VALIDATE_DIRECTIVES: bool = false;

    fn validate_fragment(&mut self, fragment: &FragmentDefinition) -> DiagnosticsResult<()> {
        self.modifiable_fields.clear();
        let throw_on_field_error_directive =
            fragment.directives.named(*THROW_ON_FIELD_ERROR_DIRECTIVE);

        let has_throw_on_field_error_directive = throw_on_field_error_directive.is_some();

        let ret = self
            .validate_selection_fields(&fragment.selections, has_throw_on_field_error_directive);
        self.modifiable_fields_to_warnings();
        ret
    }

    fn validate_operation(
        &mut self,
        operation: &graphql_ir::OperationDefinition,
    ) -> DiagnosticsResult<()> {
        self.modifiable_fields.clear();
        let throw_on_field_error_directive =
            operation.directives.named(*THROW_ON_FIELD_ERROR_DIRECTIVE);

        let has_throw_on_field_error_directive = throw_on_field_error_directive.is_some();
        let result = self
            .validate_selection_fields(&operation.selections, has_throw_on_field_error_directive);
        self.modifiable_fields_to_warnings();
        result
    }
}

#[derive(Clone, Debug)]
struct Message {
    location: Location,
    message: ValidationMessageWithData,
}

enum Action {
    NotRemovable,
    Removable(Vec<Message>),
}
