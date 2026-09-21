/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::DirectiveName;
use common::NamedItem;
use intern::Lookup;
use intern::string_key::StringKey;
use intern::string_key::StringKeyIndexMap;
use intern::string_key::StringKeyMap;
use schema::TypeReference;
use schema_coordinates::SchemaCoordinate;
use serde::Serialize;

use crate::OutputNonNull;
use crate::SetDirectiveValue;
use crate::print_schema_set::print_set_directive_value;
use crate::set_exclude::MISSING_REQUIRED_DIRECTIVE;
use crate::set_exclude::MISSING_REQUIRED_DIRECTIVE_NAME;

/// A source file location for a schema coordinate.
#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct SchemaFileLocation {
    pub file: String,
    pub line: u32,
}

use crate::CanHaveDirectives;
use crate::DirectivePolicies;
use crate::DirectivePolicy;
use crate::DivergentArgs;
use crate::OutputTypeReference;
use crate::SchemaSet;
use crate::SetArgument;
use crate::SetDirective;
use crate::SetField;
use crate::SetType;

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SubsetViolationType {
    TypeRemoved,
    TypeChangedKind,
    FieldRemoved,
    FieldChangedKind,
    TypeRemovedFromUnion,
    ValueRemovedFromEnum,
    RequiredInputFieldAdded,
    ImplementedInterfaceRemoved,
    RequiredArgAdded,
    ArgRemoved,
    ArgChangedKind,
    DirectiveRemoved,
    DirectiveArgRemoved,
    RequiredDirectiveArgAdded,
    DirectiveLocationRemoved,
    InconsistentDirectiveUse,
    BaseDirectiveNotInSubset,
}

#[derive(Debug, Clone, Serialize)]
pub struct SubsetViolation {
    #[serde(rename = "type")]
    pub violation_type: SubsetViolationType,
    pub description: String,
    pub schema_coordinate: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub base: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subset: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub base_locations: Vec<SchemaFileLocation>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub subset_locations: Vec<SchemaFileLocation>,
}

/// Identifies all elements in the subset schema that are not properly included
/// in the base schema.
///
/// Uses `SchemaSet::exclude_set()` to compute the remainder (what's in subset
/// but not covered by base), then walks the remainder to produce structured
/// violation objects.
///
/// `directive_policies` describes how directives may diverge between base and subset:
///
/// * `client_only_ok = true` permits the subset to carry the directive even
///   when the base does not — e.g. a typical `@deprecated` policy lets a
///   subset field with `@deprecated` remain a valid subset of the same base
///   field without it.
/// * `service_only_ok = false` requires the subset to mirror the directive
///   whenever the base has it; the missing application is reported as a
///   `BaseDirectiveNotInSubset` violation.
pub fn find_subset_violations(
    base: &SchemaSet,
    subset: &SchemaSet,
    directive_policies: &DirectivePolicies,
) -> Vec<SubsetViolation> {
    let remainder = subset.exclude_set(base, directive_policies);
    let mut violations = Vec::new();

    for (type_name, rem_type) in &remainder.types {
        walk_type_violations(
            &mut violations,
            *type_name,
            rem_type,
            base,
            subset,
            directive_policies,
        );
    }

    for rem_dir in remainder.directives.values() {
        walk_directive_def_violations(&mut violations, rem_dir, base, subset);
    }

    violations.sort_by(|a, b| a.schema_coordinate.cmp(&b.schema_coordinate));
    violations
}

fn walk_type_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    rem_type: &SetType,
    base: &SchemaSet,
    subset: &SchemaSet,
    directive_policies: &DirectivePolicies,
) {
    match base.types.get(&type_name) {
        None => {
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::TypeRemoved,
                description: format!("{type_name} missing from base schema."),
                schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                base: None,
                subset: None,
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        }
        Some(base_type) => {
            if !same_type_kind(rem_type, base_type) {
                let base_kind = type_kind_name(base_type);
                let subset_kind = type_kind_name(rem_type);
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::TypeChangedKind,
                    description: format!(
                        "{type_name} changed from {} to {}.",
                        format_kind_name(base_kind),
                        format_kind_name(subset_kind),
                    ),
                    schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                    base: Some(base_kind.to_string()),
                    subset: Some(subset_kind.to_string()),
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            } else {
                walk_same_kind_violations(
                    violations,
                    type_name,
                    rem_type,
                    base_type,
                    subset,
                    directive_policies,
                );
            }
        }
    }
}

fn walk_same_kind_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    rem_type: &SetType,
    base_type: &SetType,
    subset: &SchemaSet,
    directive_policies: &DirectivePolicies,
) {
    match (rem_type, base_type) {
        (SetType::Object(rem_obj), SetType::Object(base_obj)) => {
            let subset_obj = match subset.types.get(&type_name) {
                Some(SetType::Object(o)) => Some(o),
                _ => None,
            };

            walk_field_violations(
                violations,
                type_name,
                &rem_obj.fields,
                &base_obj.fields,
                subset_obj.map(|o| &o.fields),
                directive_policies,
            );

            for (iface_name, _) in &rem_obj.interfaces {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::ImplementedInterfaceRemoved,
                    description: format!(
                        "{type_name} in base does not implement interface {iface_name}.",
                    ),
                    schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                    base: Some(iface_name.lookup().to_string()),
                    subset: None,
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
        }
        (SetType::Interface(rem_iface), SetType::Interface(base_iface)) => {
            let subset_iface = match subset.types.get(&type_name) {
                Some(SetType::Interface(i)) => Some(i),
                _ => None,
            };

            walk_field_violations(
                violations,
                type_name,
                &rem_iface.fields,
                &base_iface.fields,
                subset_iface.map(|i| &i.fields),
                directive_policies,
            );

            for (iface_name, _) in &rem_iface.interfaces {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::ImplementedInterfaceRemoved,
                    description: format!(
                        "{type_name} in base does not implement interface {iface_name}.",
                    ),
                    schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                    base: Some(iface_name.lookup().to_string()),
                    subset: None,
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
        }
        (SetType::Enum(rem_enum), SetType::Enum(base_enum)) => {
            for value_name in rem_enum.values.keys() {
                if !base_enum.values.contains_key(value_name) {
                    violations.push(SubsetViolation {
                        violation_type: SubsetViolationType::ValueRemovedFromEnum,
                        description: format!(
                            "{value_name} missing from base schema enum type {type_name}.",
                        ),
                        schema_coordinate: SchemaCoordinate::Member {
                            parent_name: type_name,
                            member_name: *value_name,
                        }
                        .to_string(),
                        base: Some(value_name.lookup().to_string()),
                        subset: None,
                        base_locations: Vec::new(),
                        subset_locations: Vec::new(),
                    });
                }
            }
        }
        (SetType::Union(rem_union), _) => {
            for (member_name, _) in &rem_union.members {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::TypeRemovedFromUnion,
                    description: format!(
                        "{member_name} missing from base schema union type {type_name}.",
                    ),
                    schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                    base: Some(member_name.lookup().to_string()),
                    subset: None,
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
        }
        (SetType::InputObject(rem_input), SetType::InputObject(base_input)) => {
            let subset_input = match subset.types.get(&type_name) {
                Some(SetType::InputObject(i)) => Some(i),
                _ => None,
            };

            walk_input_field_violations(
                violations,
                type_name,
                &rem_input.fields,
                &base_input.fields,
                subset_input.map(|i| &i.fields),
            );
        }
        _ => {}
    }

    walk_type_directive_violations(
        violations,
        type_name,
        rem_type,
        base_type,
        subset.types.get(&type_name),
        directive_policies,
    );
}

fn walk_field_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    rem_fields: &StringKeyMap<SetField>,
    base_fields: &StringKeyMap<SetField>,
    subset_fields: Option<&StringKeyMap<SetField>>,
    directive_policies: &DirectivePolicies,
) {
    for (field_name, rem_field) in rem_fields {
        match base_fields.get(field_name) {
            None => {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::FieldRemoved,
                    description: format!("{type_name}.{field_name} missing from base schema.",),
                    schema_coordinate: SchemaCoordinate::Member {
                        parent_name: type_name,
                        member_name: *field_name,
                    }
                    .to_string(),
                    base: None,
                    subset: None,
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
            Some(base_field) => {
                if rem_field.coordinate.is_some() {
                    let base_type = format_output_type_ref(&base_field.type_);
                    let subset_type = format_output_type_ref(&rem_field.type_);
                    violations.push(SubsetViolation {
                        violation_type: SubsetViolationType::FieldChangedKind,
                        description: format!(
                            "{type_name}.{field_name} changed type from {base_type} in base to {subset_type} in subset.",
                        ),
                        schema_coordinate: SchemaCoordinate::Member {
                            parent_name: type_name,
                            member_name: *field_name,
                        }
                        .to_string(),
                        base: Some(base_type),
                        subset: Some(subset_type),
                        base_locations: Vec::new(),
                        subset_locations: Vec::new(),
                    });
                }

                let subset_field = subset_fields.and_then(|sf| sf.get(field_name));

                walk_arg_violations(
                    violations,
                    type_name,
                    *field_name,
                    &rem_field.arguments,
                    &base_field.arguments,
                    subset_field.map(|f| &f.arguments),
                );

                walk_field_directive_violations(
                    violations,
                    type_name,
                    *field_name,
                    rem_field,
                    base_field,
                    subset_field,
                    directive_policies,
                );
            }
        }
    }
}

fn walk_arg_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    field_name: StringKey,
    rem_args: &StringKeyIndexMap<SetArgument>,
    base_args: &StringKeyIndexMap<SetArgument>,
    subset_args: Option<&StringKeyIndexMap<SetArgument>>,
) {
    for (arg_name, rem_arg) in rem_args {
        let in_subset = subset_args.is_some_and(|sa| sa.contains_key(arg_name));
        let in_base = base_args.contains_key(arg_name);

        if in_subset && !in_base {
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::ArgRemoved,
                description: format!(
                    "{type_name}.{field_name} arg {arg_name} missing from base schema.",
                ),
                schema_coordinate: SchemaCoordinate::Argument {
                    parent_name: type_name,
                    member_name: field_name,
                    argument_name: *arg_name,
                }
                .to_string(),
                base: Some(arg_name.lookup().to_string()),
                subset: None,
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        } else if !in_subset && in_base {
            let is_required = rem_arg.type_.is_non_null() && rem_arg.default_value.is_none();
            if is_required {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::RequiredArgAdded,
                    description: format!(
                        "A required arg {arg_name} on {type_name}.{field_name} is in base but missing from subset.",
                    ),
                    schema_coordinate: SchemaCoordinate::Member {
                        parent_name: type_name,
                        member_name: field_name,
                    }
                    .to_string(),
                    base: None,
                    subset: Some(arg_name.lookup().to_string()),
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
        } else if in_subset && in_base && rem_arg.coordinate.is_some() {
            let base_arg = base_args.get(arg_name).expect("already checked in_base");
            let base_type = format_type_ref(&base_arg.type_);
            let subset_type = format_type_ref(&rem_arg.type_);
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::ArgChangedKind,
                description: format!(
                    "{type_name}.{field_name} arg {arg_name} has changed type from {base_type} in base to {subset_type} in subset.",
                ),
                schema_coordinate: SchemaCoordinate::Argument {
                    parent_name: type_name,
                    member_name: field_name,
                    argument_name: *arg_name,
                }
                .to_string(),
                base: Some(base_type),
                subset: Some(subset_type),
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        }
    }
}

fn walk_input_field_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    rem_fields: &StringKeyIndexMap<SetArgument>,
    base_fields: &StringKeyIndexMap<SetArgument>,
    subset_fields: Option<&StringKeyIndexMap<SetArgument>>,
) {
    for (field_name, rem_field) in rem_fields {
        let in_subset = subset_fields.is_some_and(|sf| sf.contains_key(field_name));
        let in_base = base_fields.contains_key(field_name);

        if in_subset && !in_base {
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::FieldRemoved,
                description: format!("{type_name}.{field_name} missing from base schema.",),
                schema_coordinate: SchemaCoordinate::Member {
                    parent_name: type_name,
                    member_name: *field_name,
                }
                .to_string(),
                base: None,
                subset: None,
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        } else if !in_subset && in_base {
            let is_required = rem_field.type_.is_non_null() && rem_field.default_value.is_none();
            if is_required {
                violations.push(SubsetViolation {
                    violation_type: SubsetViolationType::RequiredInputFieldAdded,
                    description: format!(
                        "A required field {field_name} on input type {type_name} is in base but missing from subset.",
                    ),
                    schema_coordinate: SchemaCoordinate::Type { name: type_name }.to_string(),
                    base: None,
                    subset: Some(field_name.lookup().to_string()),
                    base_locations: Vec::new(),
                    subset_locations: Vec::new(),
                });
            }
        } else if in_subset && in_base && rem_field.coordinate.is_some() {
            let base_field = base_fields
                .get(field_name)
                .expect("already checked in_base");
            let base_type = format_type_ref(&base_field.type_);
            let subset_type = format_type_ref(&rem_field.type_);
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::FieldChangedKind,
                description: format!(
                    "{type_name}.{field_name} changed type from {base_type} in base to {subset_type} in subset.",
                ),
                schema_coordinate: SchemaCoordinate::Member {
                    parent_name: type_name,
                    member_name: *field_name,
                }
                .to_string(),
                base: Some(base_type),
                subset: Some(subset_type),
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        }
    }
}

fn walk_directive_def_violations(
    violations: &mut Vec<SubsetViolation>,
    rem_dir: &SetDirective,
    base: &SchemaSet,
    subset: &SchemaSet,
) {
    let directive_name = rem_dir.name.0;

    match base.directives.get(&directive_name) {
        None => {
            violations.push(SubsetViolation {
                violation_type: SubsetViolationType::DirectiveRemoved,
                description: format!("@{directive_name} missing from base schema."),
                schema_coordinate: SchemaCoordinate::Directive {
                    name: directive_name,
                }
                .to_string(),
                base: None,
                subset: None,
                base_locations: Vec::new(),
                subset_locations: Vec::new(),
            });
        }
        Some(base_directive) => {
            let subset_dir = subset.directives.get(&directive_name);

            for (arg_name, rem_arg) in &rem_dir.arguments {
                let in_subset = subset_dir.is_some_and(|sd| sd.arguments.contains_key(arg_name));
                let in_base = base_directive.arguments.contains_key(arg_name);

                if in_subset && !in_base {
                    violations.push(SubsetViolation {
                        violation_type: SubsetViolationType::DirectiveArgRemoved,
                        description: format!(
                            "{arg_name} missing from base schema for @{directive_name}.",
                        ),
                        schema_coordinate: SchemaCoordinate::DirectiveArgument {
                            directive_name,
                            argument_name: *arg_name,
                        }
                        .to_string(),
                        base: Some(arg_name.lookup().to_string()),
                        subset: None,
                        base_locations: Vec::new(),
                        subset_locations: Vec::new(),
                    });
                } else if !in_subset && in_base {
                    let is_required =
                        rem_arg.type_.is_non_null() && rem_arg.default_value.is_none();
                    if is_required {
                        violations.push(SubsetViolation {
                            violation_type: SubsetViolationType::RequiredDirectiveArgAdded,
                            description: format!(
                                "A required arg {arg_name} on directive @{directive_name} is in base but missing from subset.",
                            ),
                            schema_coordinate: SchemaCoordinate::Directive { name: directive_name }
                                .to_string(),
                            base: None,
                            subset: Some(arg_name.lookup().to_string()),
                            base_locations: Vec::new(),
                            subset_locations: Vec::new(),
                        });
                    }
                }
            }

            if let Some(subset_dir) = subset_dir {
                for location in &subset_dir.locations {
                    if !base_directive.locations.iter().any(|bl| bl == location) {
                        violations.push(SubsetViolation {
                            violation_type: SubsetViolationType::DirectiveLocationRemoved,
                            description: format!(
                                "Directive location {location} missing from base schema for @{directive_name}.",
                            ),
                            schema_coordinate: SchemaCoordinate::Directive { name: directive_name }
                                .to_string(),
                            base: Some(format!("{:?}", location)),
                            subset: None,
                            base_locations: Vec::new(),
                            subset_locations: Vec::new(),
                        });
                    }
                }
            }
        }
    }
}

fn walk_type_directive_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    rem_type: &SetType,
    base_type: &SetType,
    subset_type: Option<&SetType>,
    directive_policies: &DirectivePolicies,
) {
    let coordinate = SchemaCoordinate::Type { name: type_name }.to_string();
    let subset_directives = subset_type
        .map(|t| t.directives().as_slice())
        .unwrap_or(&[]);

    for directive in rem_type.directives() {
        let name = missing_required_directive_name(directive).unwrap_or(directive.name);
        let policy = directive_policies.policy_for(&name);
        violations.push(directive_violation(
            type_name.to_string(),
            coordinate.clone(),
            directive,
            base_type.directives(),
            subset_directives,
            &policy,
        ));
    }
}

fn walk_field_directive_violations(
    violations: &mut Vec<SubsetViolation>,
    type_name: StringKey,
    field_name: StringKey,
    rem_field: &SetField,
    base_field: &SetField,
    subset_field: Option<&SetField>,
    directive_policies: &DirectivePolicies,
) {
    let coordinate = SchemaCoordinate::Member {
        parent_name: type_name,
        member_name: field_name,
    }
    .to_string();
    let subset_directives = subset_field.map(|f| f.directives.as_slice()).unwrap_or(&[]);

    for directive in &rem_field.directives {
        let name = missing_required_directive_name(directive).unwrap_or(directive.name);
        let policy = directive_policies.policy_for(&name);
        violations.push(directive_violation(
            format!("{type_name}.{field_name}"),
            coordinate.clone(),
            directive,
            &base_field.directives,
            subset_directives,
            &policy,
        ));
    }
}

fn directive_violation(
    subject: String,
    coordinate: String,
    violating_directive: &SetDirectiveValue,
    base_directives: &[SetDirectiveValue],
    subset_directives: &[SetDirectiveValue],
    policy: &DirectivePolicy,
) -> SubsetViolation {
    let (violation_type, name) = match missing_required_directive_name(violating_directive) {
        Some(name) => (SubsetViolationType::BaseDirectiveNotInSubset, name),
        None => (
            SubsetViolationType::InconsistentDirectiveUse,
            violating_directive.name,
        ),
    };

    let base = applied_directives(base_directives, name);
    let subset = applied_directives(subset_directives, name);

    let description = format!(
        "{subject}: {rule} Base has {base_side}; subset has {subset_side}.",
        rule = directive_rule_sentence(name, policy),
        base_side = render_directive_side(&base, name),
        subset_side = render_directive_side(&subset, name),
    );

    SubsetViolation {
        violation_type,
        description,
        schema_coordinate: coordinate,
        base: (!base.is_empty()).then(|| base.join(", ")),
        subset: (!subset.is_empty()).then(|| subset.join(", ")),
        base_locations: Vec::new(),
        subset_locations: Vec::new(),
    }
}

// Return *all* directives with the given name (used instead of `named()` for
// repeatable directives).
fn applied_directives(directives: &[SetDirectiveValue], name: DirectiveName) -> Vec<String> {
    directives
        .iter()
        .filter(|directive| directive.name == name)
        .map(print_set_directive_value)
        .collect()
}

fn render_directive_side(applied: &[String], name: DirectiveName) -> String {
    if applied.is_empty() {
        format!("no @{name}")
    } else {
        applied.join(", ")
    }
}

fn directive_rule_sentence(name: DirectiveName, policy: &DirectivePolicy) -> String {
    let application_rule = match (policy.service_only_ok, policy.client_only_ok) {
        (false, false) => "must be applied in both schemas",
        (false, true) => "in the base schema must also be applied in the subset schema",
        (true, false) => "in the subset schema must also be applied in the base schema",
        // Never flagged: either side may carry the directive alone.
        (true, true) => "must agree between the base and subset schemas",
    };

    let argument_rule = match &policy.divergent_args {
        None => " with all arguments matching".to_string(),
        Some(DivergentArgs::All) => String::new(),
        Some(DivergentArgs::Only(divergent)) if divergent.is_empty() => {
            " with all arguments matching".to_string()
        }
        Some(DivergentArgs::Only(divergent)) => format!(
            " with all arguments except {} matching",
            divergent
                .iter()
                .map(ToString::to_string)
                .collect::<Vec<_>>()
                .join(", "),
        ),
    };

    format!("@{name} {application_rule}{argument_rule}.")
}

fn missing_required_directive_name(directive: &SetDirectiveValue) -> Option<DirectiveName> {
    if directive.name != *MISSING_REQUIRED_DIRECTIVE {
        return None;
    }

    let name = directive
        .arguments
        .named(*MISSING_REQUIRED_DIRECTIVE_NAME)
        .and_then(|a| a.value.get_string_literal())
        .expect("missing_required_directive marker should always have a name argument");

    Some(DirectiveName(name))
}

fn format_output_type_ref(type_ref: &OutputTypeReference<StringKey>) -> String {
    match type_ref {
        OutputTypeReference::Named(name) => name.lookup().to_string(),
        OutputTypeReference::NonNull(OutputNonNull::KillsParent(inner)) => {
            format!("{}!", format_output_type_ref(inner))
        }
        OutputTypeReference::NonNull(OutputNonNull::Semantic(inner)) => {
            format!("{} @semanticNonNull", format_output_type_ref(inner))
        }
        OutputTypeReference::List(inner) => {
            format!("[{}]", format_output_type_ref(inner))
        }
    }
}

fn format_type_ref(type_ref: &TypeReference<StringKey>) -> String {
    match type_ref {
        TypeReference::Named(name) => name.lookup().to_string(),
        TypeReference::NonNull(inner) => format!("{}!", format_type_ref(inner)),
        TypeReference::List(inner) => format!("[{}]", format_type_ref(inner)),
    }
}

fn type_kind_name(set_type: &SetType) -> &'static str {
    match set_type {
        SetType::Scalar(_) => "Scalar",
        SetType::Enum(_) => "Enum",
        SetType::Object(_) => "Object",
        SetType::Interface(_) => "Interface",
        SetType::Union(_) => "Union",
        SetType::InputObject(_) => "Input",
    }
}

fn format_kind_name(kind_name: &str) -> String {
    let article = match kind_name {
        "Object" | "Interface" | "Input" | "Enum" => "an",
        _ => "a",
    };
    format!("{} {} type", article, kind_name)
}

fn same_type_kind(a: &SetType, b: &SetType) -> bool {
    std::mem::discriminant(a) == std::mem::discriminant(b)
}

#[cfg(test)]
mod tests {
    use common::ArgumentName;
    use common::SourceLocationKey;
    use graphql_syntax::parse_schema_document;
    use intern::string_key::Intern;

    use super::*;
    use crate::DirectivePolicy;
    use crate::DivergentArgs;

    fn set_from_str(sdl: &str) -> SchemaSet {
        SchemaSet::from_base_schema_documents(&[parse_schema_document(
            sdl,
            SourceLocationKey::generated(),
        )
        .unwrap()])
        .unwrap()
    }

    fn violations(base: &str, subset: &str) -> Vec<SubsetViolation> {
        let base_set = set_from_str(base);
        let subset_set = set_from_str(subset);
        find_subset_violations(&base_set, &subset_set, &DirectivePolicies::default())
    }

    fn violations_with_subset_directives(
        base: &str,
        subset: &str,
        subset_directives: &[&str],
    ) -> Vec<SubsetViolation> {
        let base_set = set_from_str(base);
        let subset_set = set_from_str(subset);
        let bidirectional = DirectivePolicy {
            service_only_ok: true,
            client_only_ok: true,
            divergent_args: Some(DivergentArgs::All),
            service_owns_divergent_args: false,
        };
        let policies = DirectivePolicies::from_iter(
            subset_directives
                .iter()
                .map(|name| (*name, bidirectional.clone())),
        );
        find_subset_violations(&base_set, &subset_set, &policies)
    }

    fn violations_with_base_restricted_directives(
        base: &str,
        subset: &str,
        base_restricted: &[&str],
    ) -> Vec<SubsetViolation> {
        let base_set = set_from_str(base);
        let subset_set = set_from_str(subset);
        let policies = DirectivePolicies::from_iter(
            base_restricted
                .iter()
                .map(|name| (*name, DirectivePolicy::EXACT_MATCH)),
        );
        find_subset_violations(&base_set, &subset_set, &policies)
    }

    #[allow(dead_code)]
    fn violation_types(base: &str, subset: &str) -> Vec<SubsetViolationType> {
        violations(base, subset)
            .into_iter()
            .map(|v| v.violation_type)
            .collect()
    }

    fn assert_no_violations(base: &str, subset: &str) {
        let v = violations(base, subset);
        assert!(
            v.is_empty(),
            "Expected no violations, got: {:?}",
            v.iter()
                .map(|v| format!("{}: {}", v.schema_coordinate, v.description))
                .collect::<Vec<_>>()
        );
    }

    fn assert_has_violations(base: &str, subset: &str) {
        let v = violations(base, subset);
        assert!(!v.is_empty(), "Expected violations, but got none");
    }

    // ───────────────────────────────────────────────────────────────
    // Unchanged / valid subset (no violations expected)
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_unchanged() {
        assert_no_violations(
            "type Topt { afield: String } type Query { myQ: Topt }",
            "type Topt { afield: String } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_unchanged_nonnull() {
        assert_no_violations(
            "type Topt { afield: String! } type Query { myQ: Topt }",
            "type Topt { afield: String! } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_input_unchanged() {
        assert_no_violations(
            "input X { field: String } type Query { myQ(arg: X): String }",
            "input X { field: String } type Query { myQ(arg: X): String }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Field additions/removals
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_field_added_to_base_is_valid() {
        assert_no_violations(
            "type root1 {f: String} type root2 {f: Int} type Query { q1: root1, q2: root2 }",
            "type root1 {f: String} type Query { q1: root1 }",
        );
    }

    #[test]
    fn test_field_removed() {
        let v = violations(
            "type root1 {f: String} type Query { q1: root1 }",
            "type root1 {f: String} type root2 {f: Int} type Query { q1: root1, q2: root2 }",
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::FieldRemoved)
        );
    }

    #[test]
    fn test_field_removed_simple() {
        let v = violations(
            "type root1 {f: String} type Query { q1: root1 }",
            "type root1 {f: String} type Query { q1: root1, q2: String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::FieldRemoved);
        assert_eq!(v[0].schema_coordinate, "Query.q2");
    }

    #[test]
    fn test_field_typechange() {
        let v = violations(
            "type Topt { afield: Int } type Query { myQ: Topt }",
            "type Topt { afield: String } type Query { myQ: Topt }",
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::FieldChangedKind)
        );
    }

    #[test]
    fn test_field_renamed() {
        let v = violations(
            "type T { name1: String } type Query { myQ: T }",
            "type T { name2: String } type Query { myQ: T }",
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::FieldRemoved
                    && v.schema_coordinate == "T.name2")
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Output nullability
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_nullable_subset_with_nonnull_base_is_valid() {
        assert_no_violations(
            "type Topt { afield: String! } type Query { myQ: Topt }",
            "type Topt { afield: String } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_nonnull_subset_with_nullable_base_is_violation() {
        assert_has_violations(
            "type Topt { afield: String } type Query { myQ: Topt }",
            "type Topt { afield: String! } type Query { myQ: Topt }",
        );
    }

    #[test]
    fn test_field_nonnull_to_null() {
        assert_has_violations("type Query { myQ: String }", "type Query { myQ: String! }");
    }

    #[test]
    fn test_field_null_to_nonnull() {
        assert_no_violations("type Query { myQ: String! }", "type Query { myQ: String }");
    }

    #[test]
    fn test_field_semantic_nonnull_to_null() {
        assert_has_violations(
            "type Query { myQ: String }",
            "type Query { myQ: String @semanticNonNull }",
        );
    }

    #[test]
    fn test_field_null_to_semantic_nonnull() {
        assert_no_violations(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String }",
        );
    }

    #[test]
    fn test_field_nonnull_to_semantic_non_null() {
        assert_has_violations(
            "type Query { myQ: String @semanticNonNull }",
            "type Query { myQ: String! }",
        );
    }

    #[test]
    fn test_field_semantic_non_null_to_nonnull() {
        assert_no_violations(
            "type Query { myQ: String! }",
            "type Query { myQ: String @semanticNonNull }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Argument changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_arg_removed() {
        let v = violations(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int!): String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::ArgRemoved);
        assert_eq!(v[0].schema_coordinate, "Query.myQ(a:)");
    }

    #[test]
    fn test_arg_typechange() {
        let v = violations(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: String!): String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::ArgChangedKind);
    }

    #[test]
    fn test_required_arg_added() {
        let v = violations(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ: String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::RequiredArgAdded);
    }

    #[test]
    fn test_optional_arg_added_is_valid() {
        assert_no_violations(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ: String }",
        );
    }

    #[test]
    fn test_optional_arg_in_base_only_with_restricted_directive_is_valid() {
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ(a: Int @source(name: "x")): String }"#,
            "type Query { myQ: String }",
            &["source"],
        );
        assert!(
            !v.iter()
                .any(|v| matches!(v.violation_type, SubsetViolationType::RequiredArgAdded)),
            "Nullable base-only arg should not be flagged as RequiredArgAdded, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_required_arg_with_default_added_is_valid() {
        assert_no_violations(
            "type Query { myQ(a: Int! = 3): String }",
            "type Query { myQ: String }",
        );
    }

    #[test]
    fn test_optional_arg_removed() {
        let v = violations(
            "type Query { myQ: String }",
            "type Query { myQ(a: Int): String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::ArgRemoved);
    }

    #[test]
    fn test_optional_to_required_arg() {
        assert_has_violations(
            "type Query { myQ(a: Int!): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_optional_to_required_with_default_arg() {
        assert_has_violations(
            "type Query { myQ(a: Int! = 7): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    #[test]
    fn test_required_to_optional_arg() {
        assert_no_violations(
            "type Query { myQ(a: Int): String }",
            "type Query { myQ(a: Int!): String }",
        );
    }

    #[test]
    fn test_singular_to_list_arg() {
        assert_no_violations(
            "type Query { myQ(a: [Int]): String }",
            "type Query { myQ(a: Int): String }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Input object changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_required_input_field_added() {
        let v = violations(
            "input InType { a: Int!, b: Int! } type Query { myQ(a: InType): String }",
            "input InType { a: Int! } type Query { myQ(a: InType): String }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::RequiredInputFieldAdded
        );
    }

    #[test]
    fn test_optional_input_field_added_is_valid() {
        assert_no_violations(
            "input InType { a: Int!, b: Int } type Query { myQ(a: InType): String }",
            "input InType { a: Int! } type Query { myQ(a: InType): String }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Type-level changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_type_removed() {
        let v = violations(
            "type Query { myQ: Int }",
            "type T { afield: String } type Query { myQ: Int }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::TypeRemoved);
        assert_eq!(v[0].schema_coordinate, "T");
    }

    #[test]
    fn test_type_kind_change() {
        let v = violations(
            "type T { a: String } type Query { myQ: T }",
            "enum T { One, Two, Three } type Query { myQ: T }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::TypeChangedKind);
    }

    #[test]
    fn test_type_kind_changed_enum_to_object() {
        assert_has_violations(
            "enum T { One, Two, Three } type Query { myQ: T }",
            "type T { a: String } type Query { myQ: T }",
        );
    }

    #[test]
    fn test_type_renamed() {
        let v = violations(
            "type T2 { afield: String } type Query { myQ: T2 }",
            "type Topt { afield: String } type Query { myQ: Topt }",
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::TypeRemoved
                    && v.schema_coordinate == "Topt")
        );
    }

    #[test]
    fn test_empty_type_not_in_base() {
        let v = violations(
            "scalar String\nscalar Int",
            "scalar String\nscalar Int\ntype EmptyType",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::TypeRemoved);
        assert_eq!(v[0].schema_coordinate, "EmptyType");
    }

    // ───────────────────────────────────────────────────────────────
    // Enum changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_enum_value_removed() {
        let v = violations(
            "enum T { One, Two } type Query { myQ: T }",
            "enum T { One, Two, Three } type Query { myQ: T }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::ValueRemovedFromEnum
        );
        assert_eq!(v[0].schema_coordinate, "T.Three");
    }

    #[test]
    fn test_enum_value_added_is_valid() {
        assert_no_violations(
            "enum T { One, Two, Three } type Query { myQ: T }",
            "enum T { One, Two } type Query { myQ: T }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Union changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_union_member_removed() {
        let v = violations(
            "type T { a: String } type T2 { b: String } union U = T type Query { myQ: U }",
            "type T { a: String } type T2 { b: String } union U = T | T2 type Query { myQ: U }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::TypeRemovedFromUnion
        );
    }

    #[test]
    fn test_union_item_removed() {
        let v = violations("union U = T", "union U = T | T2");
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::TypeRemovedFromUnion
        );
    }

    #[test]
    fn test_union_item_added() {
        assert_no_violations("union U = T | T2", "union U = T");
    }

    // ───────────────────────────────────────────────────────────────
    // Interface changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_type_interface_removed() {
        let v = violations(
            "type Concrete { n: String! } type Query { myQ: Concrete }",
            "interface Inf { n: String! } type Concrete implements Inf { n: String! } type Query { myQ: Concrete }",
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::ImplementedInterfaceRemoved)
        );
    }

    #[test]
    fn test_type_interface_added_is_valid() {
        assert_no_violations(
            "interface Inf { n: String! } type Concrete implements Inf { n: String! } type Query { myQ: Concrete }",
            "type Concrete { n: String! } type Query { myQ: Concrete }",
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Type-level directive changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_type_strengthened_is_valid() {
        let base =
            set_from_str("type T @strong(field: \"id\") { afield: String } type Query { myQ: T }");
        let subset = set_from_str("type T { afield: String } type Query { myQ: T }");
        let policies = DirectivePolicies::from_iter([(
            "strong",
            DirectivePolicy {
                service_only_ok: true,
                client_only_ok: false,
                divergent_args: None,
                service_owns_divergent_args: false,
            },
        )]);
        let v = find_subset_violations(&base, &subset, &policies);
        assert!(
            v.is_empty(),
            "Expected no violations under @strong service_only_ok=true policy, got: {:?}",
            v.iter()
                .map(|v| format!("{}: {}", v.schema_coordinate, v.description))
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_type_weakened() {
        assert_has_violations(
            "type T { afield: String } type Query { myQ: T }",
            "type T @strong(field: \"id\") { afield: String } type Query { myQ: T }",
        );
    }

    #[test]
    fn test_type_directive_violation_includes_full_definition() {
        let v = violations(
            "type T { afield: String } type Query { myQ: T }",
            "type T @strong(field: \"id\") { afield: String } type Query { myQ: T }",
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::InconsistentDirectiveUse
        );
        assert!(
            v[0].description.contains("@strong(field: \"id\")"),
            "Expected description to contain full directive definition, got: {}",
            v[0].description
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Field-level directive changes
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_field_directive_in_subset_not_in_base() {
        let v = violations(
            "type Query { myQ: String }",
            r#"type Query { myQ: String @directive }"#,
        );
        assert!(
            v.iter().any(
                |v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse
                    && v.schema_coordinate == "Query.myQ"
            ),
            "Subset-only @directive on field should be flagged, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_field_directive_on_both_is_valid() {
        let v = violations(
            r#"type Query { myQ: String @directive }"#,
            r#"type Query { myQ: String @directive }"#,
        );
        let directive_violations: Vec<_> = v
            .iter()
            .filter(|v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse)
            .collect();
        assert!(
            directive_violations.is_empty(),
            "Both having @directive on field should not flag, got: {:?}",
            directive_violations
                .iter()
                .map(|v| &v.description)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_field_directive_in_base_not_in_subset_is_valid() {
        let v = violations(
            r#"type Query { myQ: String @directive }"#,
            "type Query { myQ: String }",
        );
        let directive_violations: Vec<_> = v
            .iter()
            .filter(|v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse)
            .collect();
        assert!(
            directive_violations.is_empty(),
            "Base-only @directive on field should not flag InconsistentDirectiveUse, got: {:?}",
            directive_violations
                .iter()
                .map(|v| &v.description)
                .collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_field_directive_violation_includes_full_definition() {
        let v = violations(
            "type Query { myQ: String }",
            r#"type Query { myQ: String @directive(arg: "val") }"#,
        );
        let directive_violations: Vec<_> = v
            .iter()
            .filter(|v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse)
            .collect();
        assert_eq!(directive_violations.len(), 1);
        assert!(
            directive_violations[0]
                .description
                .contains(r#"@directive(arg: "val")"#),
            "Expected description to contain full directive definition, got: {}",
            directive_violations[0].description
        );
    }

    #[test]
    fn test_interface_field_directive_in_subset_not_in_base() {
        let v = violations(
            "interface I { f: String } type Query { myQ: I }",
            r#"interface I { f: String @directive } type Query { myQ: I }"#,
        );
        assert!(
            v.iter().any(
                |v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse
                    && v.schema_coordinate == "I.f"
            ),
            "Subset-only @directive on interface field should be flagged"
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Directive value semantic equality
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_directive_value_comparison_ignores_span() {
        let v = violations(
            r#"type B @strong(field: "id") { id: ID, name: String }"#,
            r#"type A { id: ID } type B @strong(field: "id") { id: ID, name: String }"#,
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].violation_type, SubsetViolationType::TypeRemoved);
        assert_eq!(v[0].schema_coordinate, "A");
    }

    #[test]
    fn test_directive_value_comparison_detects_real_differences() {
        assert_has_violations(
            r#"type MyType @strong(field: "name") { field: String }"#,
            r#"type MyType @strong(field: "id") { field: String }"#,
        );
    }

    #[test]
    fn test_directive_value_comparison_ignores_span_multiple_args() {
        let v = violations(
            r#"type MyType @fb_owner(oncall: "my_oncall") { field: String }"#,
            r#"type Padding { id: ID } type MyType @fb_owner(oncall: "my_oncall") { field: String }"#,
        );
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].schema_coordinate, "Padding");
    }

    // ───────────────────────────────────────────────────────────────
    // Complex multi-type scenario
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_multi_type_violations() {
        let base = r#"
            type A { name: String, deprecated_base: B }
            type B implements Y { id: ID! }
            interface Y { id: ID! }
        "#;
        let subset = r#"
            type A implements Y { id: ID!, name: String, deprecated_base: B @deprecated }
            type B implements Y @strong(field: "id") { id: ID! }
            interface Y { id: ID! }
        "#;
        let v = violations(base, subset);
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::ImplementedInterfaceRemoved)
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::FieldRemoved
                    && v.schema_coordinate == "A.id")
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Schema coordinate format and old/new verification
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_schema_coordinate_format_argument() {
        let v = violations(
            "type Query { myQ: String }",
            "type Query { myQ(myArg: Int): String }",
        );
        assert_eq!(v[0].schema_coordinate, "Query.myQ(myArg:)");
    }

    #[test]
    fn test_field_changed_kind_old_new() {
        let v = violations("type Query { myQ: String }", "type Query { myQ: Int }");
        assert_eq!(v[0].base.as_deref(), Some("String"));
        assert_eq!(v[0].subset.as_deref(), Some("Int"));
    }

    #[test]
    fn test_type_changed_kind_old_new() {
        let v = violations(
            "type T { a: String } type Query { q: T }",
            "enum T { A, B } type Query { q: T }",
        );
        assert_eq!(v[0].base.as_deref(), Some("Object"));
        assert_eq!(v[0].subset.as_deref(), Some("Enum"));
    }

    #[test]
    fn test_violations_sorted() {
        let v = violations(
            "type Query { q: Int }",
            "type B { f: Int } type A { f: Int } type Query { q: Int }",
        );
        assert_eq!(v.len(), 2);
        assert_eq!(v[0].schema_coordinate, "A");
        assert_eq!(v[1].schema_coordinate, "B");
    }

    // ───────────────────────────────────────────────────────────────
    // @deprecated: subset can have it without base (subset_directives)
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_deprecated_on_subset_field_not_in_base_is_valid() {
        let v = violations_with_subset_directives(
            "type Query { myQ: String }",
            "type Query { myQ: String @deprecated }",
            &["deprecated"],
        );
        assert!(
            v.is_empty(),
            "Subset-only @deprecated should be allowed, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_deprecated_on_subset_type_not_in_base_is_valid() {
        let v = violations_with_subset_directives(
            "type T { afield: String } type Query { myQ: T }",
            "type T @deprecated { afield: String } type Query { myQ: T }",
            &["deprecated"],
        );
        assert!(
            v.is_empty(),
            "Subset-only @deprecated on type should be allowed, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_deprecated_on_both_field_is_valid() {
        let v = violations_with_subset_directives(
            "type Query { myQ: String @deprecated }",
            "type Query { myQ: String @deprecated }",
            &["deprecated"],
        );
        assert!(
            v.is_empty(),
            "Both having @deprecated should be valid, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_deprecated_on_both_type_is_valid() {
        let v = violations_with_subset_directives(
            "type T @deprecated { afield: String } type Query { myQ: T }",
            "type T @deprecated { afield: String } type Query { myQ: T }",
            &["deprecated"],
        );
        assert!(
            v.is_empty(),
            "Both having @deprecated on type should be valid, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_deprecated_with_different_reason_args() {
        let v = violations_with_subset_directives(
            r#"type Query { myQ: String @deprecated(reason: "use newQ") }"#,
            r#"type Query { myQ: String @deprecated(reason: "old reason") }"#,
            &["deprecated"],
        );
        assert!(
            v.is_empty(),
            "Both having @deprecated with different args should be valid, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    // ───────────────────────────────────────────────────────────────
    // divergent_args: which directive args may differ between base and subset
    // ───────────────────────────────────────────────────────────────

    fn violations_with_policy(
        base: &str,
        subset: &str,
        name: &str,
        policy: DirectivePolicy,
    ) -> Vec<SubsetViolation> {
        let base_set = set_from_str(base);
        let subset_set = set_from_str(subset);
        let policies = DirectivePolicies::from_iter([(name, policy)]);
        find_subset_violations(&base_set, &subset_set, &policies)
    }

    // A directive present on both sides that must match exactly except for the
    // args allowed by `divergent_args`.
    fn exact_except(divergent_args: Option<DivergentArgs>) -> DirectivePolicy {
        DirectivePolicy {
            service_only_ok: false,
            client_only_ok: false,
            divergent_args,
            service_owns_divergent_args: false,
        }
    }

    #[test]
    fn test_divergent_only_named_arg_may_differ() {
        let v = violations_with_policy(
            r#"type Query { myQ: String @mydir(a: "base", b: "same") }"#,
            r#"type Query { myQ: String @mydir(a: "subset", b: "same") }"#,
            "mydir",
            exact_except(Some(DivergentArgs::Only(vec![ArgumentName("a".intern())]))),
        );
        assert!(
            v.is_empty(),
            "divergent arg `a` may differ, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_divergent_non_named_arg_must_match() {
        let v = violations_with_policy(
            r#"type Query { myQ: String @mydir(a: "same", b: "base") }"#,
            r#"type Query { myQ: String @mydir(a: "same", b: "subset") }"#,
            "mydir",
            exact_except(Some(DivergentArgs::Only(vec![ArgumentName("a".intern())]))),
        );
        assert!(
            !v.is_empty(),
            "non-divergent arg `b` must match, but no violation was reported"
        );
    }

    #[test]
    fn test_divergent_all_lets_any_arg_differ() {
        let v = violations_with_policy(
            r#"type Query { myQ: String @mydir(a: "base", b: "base") }"#,
            r#"type Query { myQ: String @mydir(a: "subset", b: "subset") }"#,
            "mydir",
            exact_except(Some(DivergentArgs::All)),
        );
        assert!(
            v.is_empty(),
            "DivergentArgs::All lets every arg differ, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_divergent_none_requires_all_args_match() {
        let v = violations_with_policy(
            r#"type Query { myQ: String @mydir(a: "base") }"#,
            r#"type Query { myQ: String @mydir(a: "subset") }"#,
            "mydir",
            exact_except(None),
        );
        assert!(
            !v.is_empty(),
            "`None` requires all args to match, but no violation was reported"
        );
    }

    // ───────────────────────────────────────────────────────────────
    // @source: must match between base and subset (base_restricted)
    // ───────────────────────────────────────────────────────────────

    #[test]
    fn test_source_on_base_type_not_in_subset() {
        let v = violations_with_base_restricted_directives(
            r#"type T @source(name: "x") { afield: String } type Query { myQ: T }"#,
            "type T { afield: String } type Query { myQ: T }",
            &["source"],
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::BaseDirectiveNotInSubset
        );
        assert_eq!(v[0].schema_coordinate, "T");
        assert!(v[0].description.contains("@source"));
    }

    #[test]
    fn test_source_on_base_field_not_in_subset() {
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ: String @source(name: "x") }"#,
            "type Query { myQ: String }",
            &["source"],
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::BaseDirectiveNotInSubset
        );
        assert_eq!(v[0].schema_coordinate, "Query.myQ");
    }

    #[test]
    fn test_source_on_subset_type_not_in_base() {
        let v = violations_with_base_restricted_directives(
            "type T { afield: String } type Query { myQ: T }",
            r#"type T @source(name: "x") { afield: String } type Query { myQ: T }"#,
            &["source"],
        );
        assert!(
            v.iter()
                .any(|v| v.violation_type == SubsetViolationType::InconsistentDirectiveUse),
            "Subset-only @source should be flagged as InconsistentDirectiveUse"
        );
    }

    #[test]
    fn test_source_on_both_type_is_valid() {
        let v = violations_with_base_restricted_directives(
            r#"type T @source(name: "x") { afield: String } type Query { myQ: T }"#,
            r#"type T @source(name: "x") { afield: String } type Query { myQ: T }"#,
            &["source"],
        );
        assert!(
            v.is_empty(),
            "Expected no violations when both have @source, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_source_on_both_field_is_valid() {
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ: String @source(name: "x") }"#,
            r#"type Query { myQ: String @source(name: "x") }"#,
            &["source"],
        );
        assert!(
            v.is_empty(),
            "Expected no violations when both have @source on field, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    #[test]
    fn test_source_on_base_interface_field_not_in_subset() {
        let v = violations_with_base_restricted_directives(
            r#"interface I { f: String @source(name: "x") } type Query { myQ: I }"#,
            "interface I { f: String } type Query { myQ: I }",
            &["source"],
        );
        assert_eq!(v.len(), 1);
        assert_eq!(
            v[0].violation_type,
            SubsetViolationType::BaseDirectiveNotInSubset
        );
        assert_eq!(v[0].schema_coordinate, "I.f");
    }

    #[test]
    fn test_source_on_base_type_missing_from_subset() {
        let v = violations_with_base_restricted_directives(
            r#"type T @source(name: "x") { afield: String } type Query { myQ: T }"#,
            "type Query { myQ: String }",
            &["source"],
        );
        assert!(
            !v.iter()
                .any(|v| v.violation_type == SubsetViolationType::BaseDirectiveNotInSubset),
            "Should not flag base_restricted directives for types missing entirely from subset"
        );
    }

    #[test]
    fn test_source_partial_field_overlap() {
        let v = violations_with_base_restricted_directives(
            r#"type T { a: String @source(name: "x"), b: Int @source(name: "y") } type Query { myQ: T }"#,
            r#"type T { a: String @source(name: "x"), b: Int } type Query { myQ: T }"#,
            &["source"],
        );
        let base_directive_violations: Vec<_> = v
            .iter()
            .filter(|v| v.violation_type == SubsetViolationType::BaseDirectiveNotInSubset)
            .collect();
        assert_eq!(
            base_directive_violations.len(),
            1,
            "Only field b should be flagged"
        );
        assert_eq!(base_directive_violations[0].schema_coordinate, "T.b");
    }

    #[test]
    fn test_source_on_both_enum_is_valid() {
        let v = violations_with_base_restricted_directives(
            r#"enum E @source(name: "x") { A, B } type Query { myQ: E }"#,
            r#"enum E @source(name: "x") { A, B } type Query { myQ: E }"#,
            &["source"],
        );
        assert!(
            v.is_empty(),
            "Expected no violations when both have @source on enum, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }

    // ───────────────────────────────────────────────────────────────
    // Directive messages
    // ───────────────────────────────────────────────────────────────

    fn description_of(violations: &[SubsetViolation], kind: SubsetViolationType) -> &str {
        let matching: Vec<_> = violations
            .iter()
            .filter(|v| v.violation_type == kind)
            .collect();
        assert_eq!(
            matching.len(),
            1,
            "Expected exactly one {kind:?}, got: {:?}",
            violations
                .iter()
                .map(|v| format!("{:?}: {}", v.violation_type, v.description))
                .collect::<Vec<_>>()
        );
        &matching[0].description
    }

    #[test]
    fn test_rule_sentence_per_policy() {
        let divergent = |names: &[&str]| {
            Some(DivergentArgs::Only(
                names.iter().map(|n| ArgumentName(n.intern())).collect(),
            ))
        };
        let cases = [
            (
                DirectivePolicy::EXACT_MATCH,
                "@mydir must be applied in both schemas with all arguments matching.",
            ),
            (
                DirectivePolicy::SERVICE_FIRST,
                "@mydir in the subset schema must also be applied in the base schema with all arguments matching.",
            ),
            (
                DirectivePolicy {
                    client_only_ok: true,
                    ..DirectivePolicy::EXACT_MATCH
                },
                "@mydir in the base schema must also be applied in the subset schema with all arguments matching.",
            ),
            (
                DirectivePolicy::ANY_DIVERGENCE,
                "@mydir must agree between the base and subset schemas.",
            ),
            (
                DirectivePolicy {
                    divergent_args: divergent(&["schemas"]),
                    ..DirectivePolicy::EXACT_MATCH
                },
                "@mydir must be applied in both schemas with all arguments except schemas matching.",
            ),
            (
                DirectivePolicy {
                    divergent_args: divergent(&["a", "c"]),
                    ..DirectivePolicy::EXACT_MATCH
                },
                "@mydir must be applied in both schemas with all arguments except a, c matching.",
            ),
            (
                DirectivePolicy {
                    divergent_args: Some(DivergentArgs::All),
                    ..DirectivePolicy::EXACT_MATCH
                },
                "@mydir must be applied in both schemas.",
            ),
            (
                // An empty list exempts nothing, so it must not read
                // "all arguments except  matching".
                DirectivePolicy {
                    divergent_args: Some(DivergentArgs::Only(Vec::new())),
                    ..DirectivePolicy::EXACT_MATCH
                },
                "@mydir must be applied in both schemas with all arguments matching.",
            ),
        ];

        for (policy, expected) in cases {
            assert_eq!(
                directive_rule_sentence(DirectiveName("mydir".intern()), &policy),
                expected,
                "wrong rule for {policy:?}",
            );
        }
    }

    #[test]
    fn test_subset_only_directive() {
        let v = violations(
            "type Query { myQ: String }",
            r#"type Query { myQ: String @mydir(a: "x") }"#,
        );
        assert_eq!(
            description_of(&v, SubsetViolationType::InconsistentDirectiveUse),
            concat!(
                "Query.myQ: @mydir must be applied in both schemas with all arguments matching. ",
                r#"Base has no @mydir; subset has @mydir(a: "x")."#,
            ),
        );
        assert_eq!(v[0].base, None);
        assert_eq!(v[0].subset.as_deref(), Some(r#"@mydir(a: "x")"#));
    }

    #[test]
    fn test_base_only_directive() {
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ: String @source(name: "x") }"#,
            "type Query { myQ: String }",
            &["source"],
        );
        assert_eq!(
            description_of(&v, SubsetViolationType::BaseDirectiveNotInSubset),
            concat!(
                "Query.myQ: @source must be applied in both schemas with all arguments matching. ",
                r#"Base has @source(name: "x"); subset has no @source."#,
            ),
        );
        assert_eq!(v[0].base.as_deref(), Some(r#"@source(name: "x")"#));
        assert_eq!(v[0].subset, None);
    }

    #[test]
    fn test_directive_on_both_sides_with_differing_args() {
        let v = violations_with_policy(
            r#"type Query { myQ: String @mydir(a: "base") }"#,
            r#"type Query { myQ: String @mydir(a: "subset") }"#,
            "mydir",
            DirectivePolicy::EXACT_MATCH,
        );
        assert_eq!(
            description_of(&v, SubsetViolationType::InconsistentDirectiveUse),
            concat!(
                "Query.myQ: @mydir must be applied in both schemas with all arguments matching. ",
                r#"Base has @mydir(a: "base"); subset has @mydir(a: "subset")."#,
            ),
            "A directive present on both sides must not be reported as missing from the base",
        );
    }

    #[test]
    fn test_repeatable_directive_lists_every_application() {
        // The subset mirrors @tag(a: 1) but not @tag(a: 2). Reporting only the
        // first application would print the same value on both sides.
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ: String @tag(a: 1) @tag(a: 2) }"#,
            r#"type Query { myQ: String @tag(a: 1) }"#,
            &["tag"],
        );
        assert_eq!(
            description_of(&v, SubsetViolationType::BaseDirectiveNotInSubset),
            concat!(
                "Query.myQ: @tag must be applied in both schemas with all arguments matching. ",
                "Base has @tag(a: 1), @tag(a: 2); subset has @tag(a: 1).",
            ),
        );
    }

    #[test]
    fn test_every_unmirrored_application_is_reported() {
        // Both base applications are unmirrored, so `exclude_directives` emits a
        // marker per application. Each violation must name both, rather than
        // every marker resolving to the first application.
        let v = violations_with_base_restricted_directives(
            r#"type Query { myQ: String @tag(a: 1) @tag(a: 2) }"#,
            r#"type Query { myQ: String }"#,
            &["tag"],
        );
        let reported: Vec<&str> = v
            .iter()
            .filter(|v| v.violation_type == SubsetViolationType::BaseDirectiveNotInSubset)
            .map(|v| v.description.as_str())
            .collect();
        assert!(!reported.is_empty(), "base-only @tag should be flagged");
        for description in reported {
            assert_eq!(
                description,
                concat!(
                    "Query.myQ: @tag must be applied in both schemas with all arguments matching. ",
                    "Base has @tag(a: 1), @tag(a: 2); subset has no @tag.",
                ),
            );
        }
    }

    #[test]
    fn test_source_on_both_input_is_valid() {
        let v = violations_with_base_restricted_directives(
            r#"input I @source(name: "x") { f: String } type Query { myQ(i: I): String }"#,
            r#"input I @source(name: "x") { f: String } type Query { myQ(i: I): String }"#,
            &["source"],
        );
        assert!(
            v.is_empty(),
            "Expected no violations when both have @source on input type, got: {:?}",
            v.iter().map(|v| &v.description).collect::<Vec<_>>()
        );
    }
}
