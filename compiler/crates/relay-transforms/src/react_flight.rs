/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use graphql_ir::{
    Argument, ConstantValue, Directive, Program, ScalarField, Selection, Transformed, Transformer,
    ValidationMessage, Value,
};
use interner::{Intern, StringKey};
use lazy_static::lazy_static;
use schema::{Field, FieldID, Type};
use std::sync::Arc;

lazy_static! {
    pub static ref REACT_FLIGHT_DIRECTIVE_NAME: StringKey = "__ReactFlightComponent".intern();
    static ref REACT_FLIGHT_COMPONENT_ARGUMENT_NAME: StringKey = "component".intern();
    static ref REACT_FLIGHT_PROPS_ARGUMENT_NAME: StringKey = "props".intern();
    static ref REACT_FLIGHT_PROPS_TYPE: StringKey = "ReactFlightProps".intern();
    static ref REACT_FLIGHT_COMPONENT_TYPE: StringKey = "ReactFlightComponent".intern();
    static ref REACT_FLIGHT_FIELD_NAME: StringKey = "flight".intern();
    static ref REACT_FLIGHT_EXTENSION_DIRECTIVE_NAME: StringKey = "react_flight_component".intern();
    static ref NAME: StringKey = "name".intern();
}

/// Transform to find calls to React Flight schema extension fields and rewrite them into calls
/// to a generic `flight(component, props)` field.
pub fn react_flight(program: &Program) -> DiagnosticsResult<Program> {
    // No-op unless the special props/component types and flight directive are defined
    let props_type = program.schema.get_type(*REACT_FLIGHT_PROPS_TYPE);
    let component_type = program.schema.get_type(*REACT_FLIGHT_COMPONENT_TYPE);
    let (props_type, component_type) = match (props_type, component_type) {
        (Some(props_type), Some(component_type)) => (props_type, component_type),
        _ => return Ok(program.clone()),
    };
    let mut transform = ReactFlightTransform::new(program, props_type, component_type);
    if transform.errors.is_empty() {
        Ok(transform
            .transform_program(program)
            .replace_or_else(|| program.clone()))
    } else {
        Err(transform.errors)
    }
}

struct ReactFlightTransform<'s> {
    component_type: Type,
    errors: Vec<Diagnostic>,
    program: &'s Program,
    props_type: Type,
}

impl<'s> ReactFlightTransform<'s> {
    fn new(program: &'s Program, props_type: Type, component_type: Type) -> Self {
        Self {
            component_type,
            errors: Default::default(),
            program,
            props_type,
        }
    }

    fn get_component_name_for_field(
        &mut self,
        field_definition: &Field,
        location: Location,
    ) -> Result<StringKey, ()> {
        // the field definition must specify the backing component's module name
        let component_directive = match field_definition
            .directives
            .named(*REACT_FLIGHT_EXTENSION_DIRECTIVE_NAME)
        {
            Some(component_directive) => component_directive,
            None => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::InvalidFlightFieldMissingModuleDirective,
                    location,
                ));
                return Err(());
            }
        };
        // extract the component name
        let value = component_directive
            .arguments
            .iter()
            .cloned()
            .find(|arg| arg.name == *NAME)
            .unwrap()
            .value;
        match value {
            graphql_syntax::ConstantValue::String(node) => Ok(node.value),
            _ => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::InvalidFlightFieldExpectedModuleNameString,
                    location,
                ));
                Err(())
            }
        }
    }

    // validates that the field's parent type also has a field conforming to the
    // following specification:
    //
    // ```
    // flight(
    //   component: String
    //   props: ReactFlightProps
    // ): ReactFlightComponent
    // ```
    fn validate_flight_field(
        &mut self,
        field_definition: &Field,
        location: Location,
    ) -> Result<FieldID, ()> {
        // not a built-in field, so there must be a parent type or the schema is
        // invalid (which is a compiler error not a user error)
        let parent_type = field_definition
            .parent_type
            .unwrap_or_else(|| panic!("Expected field to have a parent type"));

        // the parent type must have the generic `flight` field
        let flight_field_id = match self
            .program
            .schema
            .named_field(parent_type, *REACT_FLIGHT_FIELD_NAME)
        {
            Some(flight_field_id) => flight_field_id,
            None => {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::InvalidFlightFieldNotDefinedOnType {
                        field_name: field_definition.name,
                    },
                    location,
                ));
                return Err(());
            }
        };
        let flight_field_definition = self.program.schema.field(flight_field_id);

        // flight field must have `props: ReactFlightProps` arg
        let props_argument = flight_field_definition.arguments.iter().find(|arg| {
            arg.name == *REACT_FLIGHT_PROPS_ARGUMENT_NAME && arg.type_.inner() == self.props_type
        });
        if props_argument.is_none() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::InvalidFlightFieldPropsArgument,
                location,
            ));
            return Err(());
        }
        // flight field must have `component: String` arg
        let component_argument = flight_field_definition.arguments.iter().find(|arg| {
            arg.name == *REACT_FLIGHT_COMPONENT_ARGUMENT_NAME
                && Some(arg.type_.inner()) == self.program.schema.get_type("String".intern())
        });
        if component_argument.is_none() {
            self.errors.push(Diagnostic::error(
                ValidationMessage::InvalidFlightFieldComponentArgument,
                location,
            ));
            return Err(());
        }
        // flight field must return `ReactFlightComponent`
        if flight_field_definition.type_.inner() != self.component_type {
            self.errors.push(Diagnostic::error(
                ValidationMessage::InvalidFlightFieldReturnType,
                location,
            ));
            return Err(());
        }
        Ok(flight_field_id)
    }
}

impl<'s> Transformer for ReactFlightTransform<'s> {
    const NAME: &'static str = "ReactFlightTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let field_definition = self.program.schema.field(field.definition.item);
        // Activate the transform based on the return type since this is a fast check
        if field_definition.type_.inner() != self.component_type {
            return Transformed::Keep;
        }

        // Extract the backing component's name from the field definition
        let component_name =
            match self.get_component_name_for_field(field_definition, field.definition.location) {
                Ok(value) => value,
                Err(_) => return Transformed::Keep,
            };

        // Determine the type's `flight` field
        let flight_field_id =
            match self.validate_flight_field(field_definition, field.definition.location) {
                Ok(value) => value,
                Err(_) => return Transformed::Keep,
            };

        // Rewrite into a call to the `flight` field, passing the original arguments
        // as values of the `props` argument:
        let alias = field
            .alias
            .unwrap_or_else(|| WithLocation::generated(field_definition.name));
        let mut directives = Vec::with_capacity(field.directives.len() + 1);
        directives.extend(field.directives.iter().cloned());
        directives.push(Directive {
            name: WithLocation::generated(*REACT_FLIGHT_DIRECTIVE_NAME),
            arguments: vec![],
        });
        Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
            alias: Some(alias),
            arguments: vec![
                Argument {
                    name: WithLocation::generated(*REACT_FLIGHT_COMPONENT_ARGUMENT_NAME),
                    value: WithLocation::generated(Value::Constant(ConstantValue::String(
                        component_name,
                    ))),
                },
                Argument {
                    name: WithLocation::generated(*REACT_FLIGHT_PROPS_ARGUMENT_NAME),
                    value: WithLocation::generated(Value::Object(field.arguments.clone())),
                },
            ],
            definition: WithLocation::generated(flight_field_id),
            directives,
        })))
    }
}
