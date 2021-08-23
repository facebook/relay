/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, DiagnosticsResult, Location, NamedItem, WithLocation};
mod requireable_field;

use super::FeatureFlags;
use fnv::FnvHashMap;
use graphql_ir::{
    Argument, ConstantValue, Directive, FragmentDefinition, InlineFragment, LinkedField,
    OperationDefinition, Program, ScalarField, Selection, Transformed, TransformedValue,
    Transformer, ValidationMessage, Value,
};
use interner::Intern;
use interner::StringKey;
use lazy_static::lazy_static;
use requireable_field::{RequireableField, RequiredMetadata};
use std::mem;
use std::sync::Arc;

lazy_static! {
    pub static ref REQUIRED_DIRECTIVE_NAME: StringKey = "required".intern();
    pub static ref ACTION_ARGUMENT: StringKey = "action".intern();
    pub static ref REQUIRED_METADATA_KEY: StringKey = "__required".intern();
    pub static ref CHILDREN_CAN_BUBBLE_METADATA_KEY: StringKey = "__childrenCanBubbleNull".intern();
    pub static ref PATH_METADATA_ARGUMENT: StringKey = "path".intern();
    static ref THROW_ACTION: StringKey = "THROW".intern();
    static ref LOG_ACTION: StringKey = "LOG".intern();
    static ref NONE_ACTION: StringKey = "NONE".intern();
    static ref INLINE_DIRECTIVE_NAME: StringKey = "inline".intern();
}

pub fn required_directive(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    let mut transform = RequiredDirective::new(program, feature_flags.enable_required_transform);

    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());

    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

// #[derive(Clone)]
struct MaybeRequiredField {
    required: Option<RequiredMetadata>,
    field_name: WithLocation<StringKey>,
}

struct RequiredField {
    required: RequiredMetadata,
    field_name: WithLocation<StringKey>,
}

struct RequiredDirective<'s> {
    program: &'s Program,
    errors: Vec<Diagnostic>,
    path: Vec<&'s str>,
    within_abstract_inline_fragment: bool,
    parent_inline_fragment_directive: Option<Location>,
    path_required_map: FnvHashMap<StringKey, MaybeRequiredField>,
    current_node_required_children: FnvHashMap<StringKey, RequiredField>,
    required_children_map: FnvHashMap<StringKey, FnvHashMap<StringKey, RequiredField>>,
    enabled: bool,
}

impl<'program> RequiredDirective<'program> {
    fn new(program: &'program Program, enabled: bool) -> Self {
        Self {
            program,
            errors: Default::default(),
            path: vec![],
            within_abstract_inline_fragment: false,
            parent_inline_fragment_directive: None,
            path_required_map: Default::default(),
            current_node_required_children: Default::default(),
            required_children_map: Default::default(),
            enabled,
        }
    }

    fn reset_state(&mut self) {
        self.path_required_map = Default::default();
        self.current_node_required_children = Default::default();
        self.parent_inline_fragment_directive = None;
        self.required_children_map = Default::default();
    }

    fn assert_not_within_abstract_inline_fragment(&mut self, directive_location: &Location) {
        if self.within_abstract_inline_fragment {
            self.errors.push(Diagnostic::error(
                ValidationMessage::RequiredWithinAbstractInlineFragment,
                // TODO(T70172661): Also referece the location of the inline fragment, once they have a location.
                *directive_location,
            ))
        }
    }

    fn assert_not_within_inline_directive(&mut self, directive_location: &Location) {
        if let Some(location) = self.parent_inline_fragment_directive {
            self.errors.push(
                Diagnostic::error(
                    ValidationMessage::RequiredWithinInlineDirective,
                    *directive_location,
                )
                .annotate("The fragment is annotated as @inline here.", location),
            )
        }
    }

    fn assert_compatible_nullability(&mut self, path: StringKey, current: MaybeRequiredField) {
        if let Some(previous) = self.path_required_map.get(&path) {
            if let Some(previous_metadata) = &previous.required {
                if let Some(current_metadata) = current.required {
                    if previous_metadata.action != current_metadata.action {
                        self.errors.push(
                            Diagnostic::error(
                                ValidationMessage::RequiredActionMismatch {
                                    field_name: current.field_name.item,
                                },
                                previous_metadata.action_location,
                            )
                            .annotate(
                                "should be the same as the `action` declared here",
                                current_metadata.action_location,
                            ),
                        )
                    }
                } else {
                    self.errors.push(
                        Diagnostic::error(
                            ValidationMessage::RequiredFieldMismatch {
                                field_name: current.field_name.item,
                            },
                            previous.field_name.location,
                        )
                        .annotate("but not @required here", current.field_name.location),
                    );
                }
            } else if current.required.is_some() {
                self.errors.push(
                    Diagnostic::error(
                        ValidationMessage::RequiredFieldMismatch {
                            field_name: current.field_name.item,
                        },
                        current.field_name.location,
                    )
                    .annotate("but not @required here", previous.field_name.location),
                )
            }
        } else {
            self.path_required_map.insert(path, current);
        }
    }

    fn get_required_metadata<T: RequireableField>(
        &mut self,
        field: &T,
        path_name: StringKey,
    ) -> Option<RequiredMetadata> {
        let maybe_required = match field.required_metadata() {
            Err(err) => {
                self.errors.push(err);
                return None;
            }
            Ok(required) => required,
        };

        let field_name = field.name_with_location(&self.program.schema);

        if let Some(metadata) = maybe_required {
            if !self.enabled {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::RequiredNotSupported,
                    metadata.directive_location,
                ));
            }
            self.assert_not_within_abstract_inline_fragment(&metadata.directive_location);
            self.assert_not_within_inline_directive(&metadata.directive_location);
            self.current_node_required_children.insert(
                path_name,
                RequiredField {
                    field_name,
                    required: metadata,
                },
            );
        }

        self.assert_compatible_nullability(
            path_name,
            MaybeRequiredField {
                required: maybe_required,
                field_name,
            },
        );
        maybe_required
    }

    fn assert_compatible_required_children_severity(
        &mut self,
        required_metadata: RequiredMetadata,
    ) {
        let parent_action = RequiredAction::from(required_metadata.action);
        for required_child in self.current_node_required_children.values() {
            if RequiredAction::from(required_child.required.action) < parent_action {
                self.errors.push(
                    Diagnostic::error(
                        ValidationMessage::RequiredFieldInvalidNesting {
                            suggested_action: required_child.required.action,
                        },
                        required_metadata.action_location,
                    )
                    .annotate(
                        "so that it can match its parent",
                        required_child.required.action_location,
                    ),
                );
            }
        }
    }
    fn assert_compatible_required_children<T: RequireableField>(
        &mut self,
        field: &T,
        field_path: StringKey,
    ) {
        let previous_required_children = match self.required_children_map.get(&field_path) {
            Some(it) => it,
            _ => {
                // We haven't seen any other instances of this field, so there's no validaiton to perform.
                return;
            }
        };

        // Check if this field has a required child field which was omitted in a previously encountered parent.
        for (path, required_child) in self.current_node_required_children.iter() {
            if !previous_required_children.contains_key(path) {
                if let Some(other_parent) = self.path_required_map.get(&field_path) {
                    self.errors.push(
                        Diagnostic::error(
                            ValidationMessage::RequiredFieldMissing {
                                field_name: required_child.field_name.item,
                            },
                            required_child.field_name.location,
                        )
                        .annotate("but is missing from", other_parent.field_name.location),
                    )
                } else {
                    // We want to give a location of the other parent which is
                    // missing this field. We expect that we will be able to
                    // find it in `self.path_required_map` since it should
                    // contain data about every visited field in this program
                    // and the other parent _must_ have already been visited.
                    panic!("Could not find other parent node at path \"{}\".", {
                        field_path
                    });
                }
            }
        }

        // Check if a previous reference to this field had a required child field which we are missing.
        for (path, required_child) in previous_required_children.iter() {
            if !self.current_node_required_children.contains_key(path) {
                self.errors.push(
                    Diagnostic::error(
                        ValidationMessage::RequiredFieldMissing {
                            field_name: required_child.field_name.item,
                        },
                        required_child.field_name.location,
                    )
                    .annotate(
                        "but is missing from",
                        field.name_with_location(&self.program.schema).location,
                    ),
                )
            }
        }
    }
}

impl<'s> Transformer for RequiredDirective<'s> {
    const NAME: &'static str = "RequiredDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.reset_state();
        self.parent_inline_fragment_directive = fragment
            .directives
            .named(*INLINE_DIRECTIVE_NAME)
            .map(|inline_directive| inline_directive.name.location);

        let selections = self.transform_selections(&fragment.selections);
        let directives = maybe_add_children_can_bubble_metadata_directive(
            &fragment.directives,
            &self.current_node_required_children,
        );
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(FragmentDefinition {
            directives: directives.replace_or_else(|| fragment.directives.clone()),
            selections: selections.replace_or_else(|| fragment.selections.clone()),
            ..fragment.clone()
        })
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.reset_state();
        let selections = self.transform_selections(&operation.selections);
        let directives = maybe_add_children_can_bubble_metadata_directive(
            &operation.directives,
            &self.current_node_required_children,
        );
        if selections.should_keep() && directives.should_keep() {
            return Transformed::Keep;
        }
        Transformed::Replace(OperationDefinition {
            directives: directives.replace_or_else(|| operation.directives.clone()),
            selections: selections.replace_or_else(|| operation.selections.clone()),
            ..operation.clone()
        })
    }

    fn transform_scalar_field(&mut self, field: &ScalarField) -> Transformed<Selection> {
        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);
        let path_name = self.path.join(".").intern();
        self.path.pop();

        match self.get_required_metadata(field, path_name) {
            None => Transformed::Keep,
            Some(required_metadata) => {
                Transformed::Replace(Selection::ScalarField(Arc::new(ScalarField {
                    directives: add_metadata_directive(
                        &field.directives,
                        path_name,
                        required_metadata.action,
                    ),
                    ..field.clone()
                })))
            }
        }
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let name = field.alias_or_name(&self.program.schema).lookup();
        self.path.push(name);
        let path_name = self.path.join(".").intern();

        let maybe_required_metadata = self.get_required_metadata(field, path_name);
        let mut next_directives = match maybe_required_metadata {
            Some(required_metadata) => {
                add_metadata_directive(&field.directives, path_name, required_metadata.action)
            }
            None => field.directives.clone(),
        };

        // Once we've handled our own directive, take the parent's required
        // children map, leaving behind an empty/default map which our children
        // can populate.
        let parent_node_required_children = mem::take(&mut self.current_node_required_children);

        let previous_abstract_fragment =
            mem::replace(&mut self.within_abstract_inline_fragment, false);

        let selections = self.transform_selections(&field.selections);

        self.assert_compatible_required_children(field, path_name);
        if let Some(required_metadata) = maybe_required_metadata {
            self.assert_compatible_required_children_severity(required_metadata);
        }

        next_directives = maybe_add_children_can_bubble_metadata_directive(
            &next_directives,
            &self.current_node_required_children,
        )
        .replace_or_else(|| next_directives.clone());

        self.within_abstract_inline_fragment = previous_abstract_fragment;

        let required_children = mem::replace(
            &mut self.current_node_required_children,
            parent_node_required_children,
        );

        self.required_children_map
            .insert(path_name, required_children);

        self.path.pop();
        Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
            directives: next_directives,
            selections: selections.replace_or_else(|| field.selections.clone()),
            ..field.clone()
        })))
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let previous = self.within_abstract_inline_fragment;

        if let Some(type_) = fragment.type_condition {
            if type_.is_abstract_type() {
                self.within_abstract_inline_fragment = true;
            }
        }
        let next_fragment = self.default_transform_inline_fragment(fragment);

        self.within_abstract_inline_fragment = previous;
        next_fragment
    }
}

fn add_metadata_directive(
    directives: &[Directive],
    path_name: StringKey,
    action: StringKey,
) -> Vec<Directive> {
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    for directive in directives.iter() {
        next_directives.push(directive.clone());
    }

    next_directives.push(Directive {
        name: WithLocation::generated(*REQUIRED_METADATA_KEY),
        arguments: vec![
            Argument {
                name: WithLocation::generated(*ACTION_ARGUMENT),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(action))),
            },
            Argument {
                name: WithLocation::generated(*PATH_METADATA_ARGUMENT),
                value: WithLocation::generated(Value::Constant(ConstantValue::String(path_name))),
            },
        ],
    });
    next_directives
}

fn maybe_add_children_can_bubble_metadata_directive(
    directives: &[Directive],
    current_node_required_children: &FnvHashMap<StringKey, RequiredField>,
) -> TransformedValue<Vec<Directive>> {
    let children_can_bubble = current_node_required_children
        .values()
        .any(|child| child.required.action != *THROW_ACTION);

    if !children_can_bubble {
        return TransformedValue::Keep;
    }
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    for directive in directives.iter() {
        next_directives.push(directive.clone());
    }

    next_directives.push(Directive {
        name: WithLocation::generated(*CHILDREN_CAN_BUBBLE_METADATA_KEY),
        arguments: vec![],
    });
    TransformedValue::Replace(next_directives)
}

// Possible @required `action` enum values ordered by severity.
#[derive(PartialEq, PartialOrd, Debug)]
pub enum RequiredAction {
    NONE,
    LOG,
    THROW,
}

impl RequiredAction {
    pub fn from_directives(directives: Vec<Directive>) -> Option<Self> {
        directives
            .named(*REQUIRED_METADATA_KEY)
            .map(|required_directive| {
                Self::from(
                    required_directive
                        .arguments
                        .named(*ACTION_ARGUMENT)
                        .unwrap()
                        .value
                        .item
                        .get_string_literal()
                        .unwrap(),
                )
            })
    }
}

impl From<StringKey> for RequiredAction {
    fn from(action: StringKey) -> Self {
        match action {
            _ if action == *THROW_ACTION => Self::THROW,
            _ if action == *LOG_ACTION => Self::LOG,
            _ if action == *NONE_ACTION => Self::NONE,
            // Actions that don't conform to the GraphQL schema should have been filtered out in IR validation.
            _ => unreachable!(),
        }
    }
}
