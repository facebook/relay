/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
use fnv::{FnvHashMap, FnvHashSet};
use graphql_ir::{
    associated_data_impl, Argument, ConstantValue, Directive, FragmentDefinition, FragmentSpread,
    OperationDefinition, Program, ScalarField, Selection, Transformed, Transformer,
    ValidationMessage, Value,
};
use intern::string_key::{Intern, StringKey};
use itertools::Itertools;
use lazy_static::lazy_static;
use schema::{Field, FieldID, Schema, Type};
use std::sync::Arc;

lazy_static! {
    static ref REACT_FLIGHT_TRANSITIVE_COMPONENTS_DIRECTIVE_NAME: StringKey =
        "react_flight".intern();
    static ref REACT_FLIGHT_TRANSITIVE_COMPONENTS_DIRECTIVE_ARG: StringKey = "components".intern();
    pub static ref REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY: StringKey =
        "__ReactFlightComponent".intern();
    static ref REACT_FLIGHT_COMPONENT_ARGUMENT_NAME: StringKey = "component".intern();
    static ref REACT_FLIGHT_PROPS_ARGUMENT_NAME: StringKey = "props".intern();
    static ref REACT_FLIGHT_PROPS_TYPE: StringKey = "ReactFlightProps".intern();
    static ref REACT_FLIGHT_COMPONENT_TYPE: StringKey = "ReactFlightComponent".intern();
    static ref REACT_FLIGHT_FIELD_NAME: StringKey = "flight".intern();
    static ref REACT_FLIGHT_EXTENSION_DIRECTIVE_NAME: StringKey = "react_flight_component".intern();
    static ref NAME: StringKey = "name".intern();
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct ReactFlightLocalComponentsMetadata {
    pub components: Vec<StringKey>,
}
associated_data_impl!(ReactFlightLocalComponentsMetadata);

/// Transform to find calls to React Flight schema extension fields and rewrite them into calls
/// to a generic `flight(component, props)` field. Also tracks which Flight fields each document
/// references locally (stored as a metadata directive on fragments/operations) as well as which
/// Flight fields each operation uses transitively (stored as a server directive on operations).
pub fn react_flight(program: &Program) -> DiagnosticsResult<Program> {
    // No-op unless the special props/component types and flight directive are defined
    let props_type = program.schema.get_type(*REACT_FLIGHT_PROPS_TYPE);
    let component_type = program.schema.get_type(*REACT_FLIGHT_COMPONENT_TYPE);
    let (props_type, component_type) = match (props_type, component_type) {
        (Some(props_type), Some(component_type)) => (props_type, component_type),
        _ => return Ok(program.clone()),
    };
    let mut transform = ReactFlightTransform::new(program, props_type, component_type);
    let transform_result = transform.transform_program(program);
    if transform.errors.is_empty() {
        Ok(transform_result.replace_or_else(|| program.clone()))
    } else {
        Err(transform.errors)
    }
}

struct ReactFlightTransform<'s> {
    component_type: Type,
    errors: Vec<Diagnostic>,
    program: &'s Program,
    props_type: Type,
    // server components encountered as a dependency of the visited operation/fragment
    // NOTE: this is operation/fragment-specific
    local_components: FnvHashSet<StringKey>,
    transitive_components: FnvHashSet<StringKey>,
    fragments: FnvHashMap<StringKey, FragmentResult>,
}

enum FragmentResult {
    Pending,
    Resolved {
        fragment: Transformed<FragmentDefinition>,
        transitive_components: FnvHashSet<StringKey>,
    },
}

impl<'s> ReactFlightTransform<'s> {
    fn new(program: &'s Program, props_type: Type, component_type: Type) -> Self {
        Self {
            component_type,
            errors: Default::default(),
            program,
            props_type,
            local_components: Default::default(),
            transitive_components: Default::default(),
            fragments: Default::default(),
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
                        field_name: field_definition.name.item,
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

    // Generate a metadata directive recording which server components were reachable
    // from the visited IR nodes
    fn generate_flight_local_flight_components_metadata_directive(&self) -> Directive {
        ReactFlightLocalComponentsMetadata {
            components: self.local_components.iter().copied().sorted().collect(),
        }
        .into()
    }

    // Generate a server directive recording which server components were *transitively* reachable
    // from the visited IR nodes
    fn generate_flight_transitive_flight_components_server_directive(&self) -> Directive {
        let mut components: Vec<StringKey> = self.transitive_components.iter().copied().collect();
        components.sort();
        Directive {
            name: WithLocation::generated(*REACT_FLIGHT_TRANSITIVE_COMPONENTS_DIRECTIVE_NAME),
            arguments: vec![Argument {
                name: WithLocation::generated(*REACT_FLIGHT_TRANSITIVE_COMPONENTS_DIRECTIVE_ARG),
                value: WithLocation::generated(Value::Constant(ConstantValue::List(
                    components.into_iter().map(ConstantValue::String).collect(),
                ))),
            }],
            data: None,
        }
    }
}

impl<'s> Transformer for ReactFlightTransform<'s> {
    const NAME: &'static str = "ReactFlightTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        // reset component lists per document
        self.local_components.clear();
        self.transitive_components.clear();
        let transformed = self.default_transform_operation(operation);

        // if there are no locally or transitively referenced server components there is no metadata
        // to add to the fragment
        if self.transitive_components.is_empty() && self.local_components.is_empty() {
            return transformed;
        }

        let mut operation = transformed.unwrap_or_else(|| operation.clone());
        self.transitive_components
            .extend(self.local_components.iter().cloned());
        operation.directives.reserve_exact(2);
        operation
            .directives
            .push(self.generate_flight_local_flight_components_metadata_directive());
        if self
            .program
            .schema
            .has_directive(*REACT_FLIGHT_TRANSITIVE_COMPONENTS_DIRECTIVE_NAME)
        {
            operation
                .directives
                .push(self.generate_flight_transitive_flight_components_server_directive());
        }
        Transformed::Replace(operation)
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if let Some(FragmentResult::Resolved { fragment, .. }) =
            self.fragments.get(&fragment.name.item)
        {
            // fragment has already been visited (a previous fragment transitively referenced this one)
            return fragment.clone();
        }

        // reset component lists per document
        self.local_components.clear();
        self.transitive_components.clear();
        let transformed = self.default_transform_fragment(fragment);

        // if there are no locally referenced server components there is no metadata to add to the fragment
        if self.local_components.is_empty() {
            return transformed;
        }

        let mut fragment = transformed.unwrap_or_else(|| fragment.clone());
        fragment.directives.reserve_exact(1);
        fragment
            .directives
            .push(self.generate_flight_local_flight_components_metadata_directive());

        Transformed::Replace(fragment)
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        match self.fragments.get(&spread.fragment.item) {
            Some(FragmentResult::Resolved {
                transitive_components,
                ..
            }) => {
                self.transitive_components
                    .extend(transitive_components.iter().cloned());
                return Transformed::Keep;
            }
            Some(FragmentResult::Pending) => {
                // recursive fragment, immediately return to avoid infinite loop. components will be added
                // at the point where the fragment was first reached
                return Transformed::Keep;
            }
            None => {}
        };
        // capture the local/transitive component sets prior to visiting the fragment
        let mut local_components = std::mem::take(&mut self.local_components);
        let mut transitive_components = std::mem::take(&mut self.transitive_components);
        // mark the fragment as pending in case of a recursive fragment and then visit it
        self.fragments
            .insert(spread.fragment.item, FragmentResult::Pending);
        let fragment =
            self.transform_fragment(self.program.fragment(spread.fragment.item).unwrap_or_else(
                || {
                    panic!(
                        "Tried to spread missing fragment: `{}`.",
                        spread.fragment.item
                    );
                },
            ));
        // extend the parent's transitive component set w the local and transitive components from the fragment
        transitive_components.extend(self.local_components.iter().cloned());
        transitive_components.extend(self.transitive_components.iter().cloned());
        // then make the parent's sets active again
        std::mem::swap(&mut self.local_components, &mut local_components);
        std::mem::swap(&mut self.transitive_components, &mut transitive_components);

        transitive_components.extend(local_components);
        self.fragments.insert(
            spread.fragment.item,
            FragmentResult::Resolved {
                fragment,
                transitive_components,
            },
        );
        Transformed::Keep
    }

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

        // Record that the given component is reachable from this field
        self.local_components.insert(component_name);

        // Rewrite into a call to the `flight` field, passing the original arguments
        // as values of the `props` argument:
        let alias = field.alias.unwrap_or(field_definition.name);
        let mut directives = Vec::with_capacity(field.directives.len() + 1);
        directives.extend(field.directives.iter().cloned());
        directives.push(Directive {
            name: WithLocation::generated(*REACT_FLIGHT_SCALAR_FLIGHT_FIELD_METADATA_KEY),
            arguments: vec![],
            data: None,
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
