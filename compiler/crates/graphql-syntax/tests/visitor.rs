/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::Diagnostic;
use common::SourceLocationKey;
use common::TextSource;
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use graphql_syntax::SyntaxVisitor;
use graphql_syntax::parse_executable;

/// A test visitor that tracks all visited nodes
struct TestVisitor {
    log: Vec<String>,
}

impl TestVisitor {
    fn new() -> Self {
        Self { log: Vec::new() }
    }

    fn log(&mut self, msg: impl Into<String>) {
        self.log.push(msg.into());
    }
}

impl SyntaxVisitor for TestVisitor {
    const NAME: &'static str = "TestVisitor";

    fn visit_operation(&mut self, operation: &graphql_syntax::OperationDefinition) {
        let op_kind = operation.operation_kind();
        let op_type = match op_kind {
            graphql_syntax::OperationKind::Query => "Query",
            graphql_syntax::OperationKind::Mutation => "Mutation",
            graphql_syntax::OperationKind::Subscription => "Subscription",
        };
        let name = operation
            .name
            .as_ref()
            .map(|n| n.value.to_string())
            .unwrap_or_else(|| "<anonymous>".to_string());
        self.log(format!("visit_operation: {} {}", op_type, name));
        self.default_visit_operation(operation);
    }

    fn visit_fragment(&mut self, fragment: &graphql_syntax::FragmentDefinition) {
        self.log(format!("visit_fragment: {}", fragment.name.value));
        self.default_visit_fragment(fragment);
    }

    fn visit_scalar_field(&mut self, field: &graphql_syntax::ScalarField) {
        let name = field
            .alias
            .as_ref()
            .map(|a| a.alias.value.to_string())
            .unwrap_or_else(|| field.name.value.to_string());
        self.log(format!("visit_scalar_field: {}", name));
        self.default_visit_scalar_field(field);
    }

    fn visit_linked_field(&mut self, field: &graphql_syntax::LinkedField) {
        let name = field
            .alias
            .as_ref()
            .map(|a| a.alias.value.to_string())
            .unwrap_or_else(|| field.name.value.to_string());
        self.log(format!("visit_linked_field: {}", name));
        self.default_visit_linked_field(field);
    }

    fn visit_inline_fragment(&mut self, fragment: &graphql_syntax::InlineFragment) {
        let type_condition = fragment
            .type_condition
            .as_ref()
            .map(|t| t.type_.value.to_string())
            .unwrap_or_else(|| "<none>".to_string());
        self.log(format!("visit_inline_fragment: on {}", type_condition));
        self.default_visit_inline_fragment(fragment);
    }

    fn visit_fragment_spread(&mut self, spread: &graphql_syntax::FragmentSpread) {
        self.log(format!("visit_fragment_spread: {}", spread.name.value));
        self.default_visit_fragment_spread(spread);
    }

    fn visit_directive(
        &mut self,
        directive: &graphql_syntax::Directive,
        location: graphql_syntax::DirectiveLocation,
    ) {
        self.log(format!(
            "visit_directive: @{} at {:?}",
            directive.name.value, location
        ));
        self.default_visit_directive(directive, location);
    }

    fn visit_argument(&mut self, argument: &graphql_syntax::Argument) {
        self.log(format!("visit_argument: {}", argument.name.value));
        self.default_visit_argument(argument);
    }

    fn visit_variable(&mut self, value: &graphql_syntax::VariableIdentifier) {
        self.log(format!("visit_variable: ${}", value.name));
    }

    fn visit_variable_definition(
        &mut self,
        variable_definition: &graphql_syntax::VariableDefinition,
    ) {
        self.log(format!(
            "visit_variable_definition: ${}",
            variable_definition.name.name
        ));
        self.default_visit_variable_definition(variable_definition);
    }

    // TypeSystemDefinition visitors

    fn visit_type_system_definition(&mut self, definition: &graphql_syntax::TypeSystemDefinition) {
        match definition {
            graphql_syntax::TypeSystemDefinition::SchemaDefinition(_) => {
                self.log("visit_type_system_definition: SchemaDefinition".to_string())
            }
            graphql_syntax::TypeSystemDefinition::SchemaExtension(_) => {
                self.log("visit_type_system_definition: SchemaExtension".to_string())
            }
            graphql_syntax::TypeSystemDefinition::ObjectTypeDefinition(def) => self.log(format!(
                "visit_type_system_definition: type {}",
                def.name.value
            )),
            graphql_syntax::TypeSystemDefinition::ObjectTypeExtension(ext) => self.log(format!(
                "visit_type_system_definition: extend type {}",
                ext.name.value
            )),
            graphql_syntax::TypeSystemDefinition::InterfaceTypeDefinition(def) => self.log(
                format!("visit_type_system_definition: interface {}", def.name.value),
            ),
            graphql_syntax::TypeSystemDefinition::InterfaceTypeExtension(ext) => self.log(format!(
                "visit_type_system_definition: extend interface {}",
                ext.name.value
            )),
            graphql_syntax::TypeSystemDefinition::UnionTypeDefinition(def) => self.log(format!(
                "visit_type_system_definition: union {}",
                def.name.value
            )),
            graphql_syntax::TypeSystemDefinition::UnionTypeExtension(ext) => self.log(format!(
                "visit_type_system_definition: extend union {}",
                ext.name.value
            )),
            graphql_syntax::TypeSystemDefinition::ScalarTypeDefinition(def) => self.log(format!(
                "visit_type_system_definition: scalar {}",
                def.name.value
            )),
            graphql_syntax::TypeSystemDefinition::ScalarTypeExtension(ext) => self.log(format!(
                "visit_type_system_definition: extend scalar {}",
                ext.name.value
            )),
            graphql_syntax::TypeSystemDefinition::EnumTypeDefinition(def) => self.log(format!(
                "visit_type_system_definition: enum {}",
                def.name.value
            )),
            graphql_syntax::TypeSystemDefinition::EnumTypeExtension(ext) => self.log(format!(
                "visit_type_system_definition: extend enum {}",
                ext.name.value
            )),
            graphql_syntax::TypeSystemDefinition::InputObjectTypeDefinition(def) => self.log(
                format!("visit_type_system_definition: input {}", def.name.value),
            ),
            graphql_syntax::TypeSystemDefinition::InputObjectTypeExtension(ext) => {
                self.log(format!(
                    "visit_type_system_definition: extend input {}",
                    ext.name.value
                ))
            }
            graphql_syntax::TypeSystemDefinition::DirectiveDefinition(def) => self.log(format!(
                "visit_type_system_definition: directive @{}",
                def.name.value
            )),
        }
        self.default_visit_type_system_definition(definition);
    }

    fn visit_constant_directive(&mut self, directive: &graphql_syntax::ConstantDirective) {
        self.log(format!(
            "visit_constant_directive: @{}",
            directive.name.value
        ));
        self.default_visit_constant_directive(directive);
    }

    fn visit_field_definition(&mut self, field: &graphql_syntax::FieldDefinition) {
        self.log(format!("visit_field_definition: {}", field.name.value));
        self.default_visit_field_definition(field);
    }

    fn visit_input_value_definition(&mut self, input_value: &graphql_syntax::InputValueDefinition) {
        self.log(format!(
            "visit_input_value_definition: {}",
            input_value.name.value
        ));
        self.default_visit_input_value_definition(input_value);
    }

    fn visit_enum_value_definition(&mut self, enum_value: &graphql_syntax::EnumValueDefinition) {
        self.log(format!(
            "visit_enum_value_definition: {}",
            enum_value.name.value
        ));
        self.default_visit_enum_value_definition(enum_value);
    }
}

pub async fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let document = parse_executable(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let mut visitor = TestVisitor::new();

    for definition in &document.definitions {
        visitor.visit_executable_definition(definition);
    }

    Ok(visitor.log.join("\n"))
}

pub async fn transform_schema_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let document = graphql_syntax::parse_schema_document(
        fixture.content,
        SourceLocationKey::standalone(fixture.file_name),
    )
    .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))?;

    let mut visitor = TestVisitor::new();

    for definition in &document.definitions {
        visitor.visit_type_system_definition(definition);
    }

    Ok(visitor.log.join("\n"))
}

// NOTE: copied from graphql-test-helpers to avoid cyclic dependency breaking Rust Analyzer
fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer =
        DiagnosticPrinter::new(|_| Some(TextSource::from_whole_document(source.to_string())));
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
