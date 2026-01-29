/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

mod requireable_field;
mod validation_message;

use std::borrow::Cow;
use std::mem;
use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::FeatureFlags;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::Directive;
use graphql_ir::Field;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionNameMap;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::ScalarField;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use graphql_ir::associated_data_impl;
use intern::Lookup;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use intern::string_key::StringKeyMap;
use lazy_static::lazy_static;
use requireable_field::RequireableField;
use requireable_field::RequiredMetadata;
use schema::Schema;

use self::validation_message::RequiredDirectiveValidationMessage;
use self::validation_message::RequiredDirectiveValidationMessageWithData;
use crate::DirectiveFinder;
use crate::FragmentAliasMetadata;

lazy_static! {
    pub static ref REQUIRED_DIRECTIVE_NAME: DirectiveName = DirectiveName("required".intern());
    pub static ref ACTION_ARGUMENT: ArgumentName = ArgumentName("action".intern());
    pub static ref CHILDREN_CAN_BUBBLE_METADATA_KEY: DirectiveName =
        DirectiveName("__childrenCanBubbleNull".intern());
    pub static ref THROW_ACTION: StringKey = "THROW".intern();
    static ref LOG_ACTION: StringKey = "LOG".intern();
    static ref NONE_ACTION: StringKey = "NONE".intern();
    static ref DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD_ACTION: StringKey =
        "DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD".intern();
    static ref INLINE_DIRECTIVE_NAME: DirectiveName = DirectiveName("inline".intern());
    static ref SEMANTIC_NON_NULL_DIRECTIVE: DirectiveName =
        DirectiveName("semanticNonNull".intern());
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RequiredMetadataDirective {
    pub action: RequiredAction,
    pub path: StringKey,
}
associated_data_impl!(RequiredMetadataDirective);

pub fn required_directive(
    program: &Program,
    feature_flags: &FeatureFlags,
) -> DiagnosticsResult<Program> {
    let mut transform = RequiredDirective::new(program, feature_flags);

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
    feature_flags: &'s FeatureFlags,
    errors: Vec<Diagnostic>,
    path: Vec<&'s str>,
    within_abstract_inline_fragment: bool,
    parent_inline_fragment_directive: Option<Location>,
    path_required_map: StringKeyMap<MaybeRequiredField>,
    current_node_required_children: StringKeyMap<RequiredField>,
    required_children_map: StringKeyMap<StringKeyMap<RequiredField>>,
    required_directive_visitor: RequiredDirectiveVisitor<'s>,
    current_document_name: Option<StringKey>,
}

impl<'program> RequiredDirective<'program> {
    fn new(program: &'program Program, feature_flags: &'program FeatureFlags) -> Self {
        Self {
            program,
            feature_flags,
            errors: Default::default(),
            path: vec![],
            within_abstract_inline_fragment: false,
            parent_inline_fragment_directive: None,
            path_required_map: Default::default(),
            current_node_required_children: Default::default(),
            required_children_map: Default::default(),
            required_directive_visitor: RequiredDirectiveVisitor {
                program,
                visited_fragments: Default::default(),
            },
            current_document_name: None,
        }
    }

    fn reset_state(&mut self, document_name: StringKey) {
        self.path_required_map = Default::default();
        self.current_node_required_children = Default::default();
        self.parent_inline_fragment_directive = None;
        self.required_children_map = Default::default();
        self.current_document_name = Some(document_name);
    }

    fn assert_not_within_abstract_inline_fragment(&mut self, directive_location: Location) {
        if self.within_abstract_inline_fragment {
            self.errors.push(Diagnostic::error(
                RequiredDirectiveValidationMessage::WithinAbstractInlineFragment,
                // TODO(T70172661): Also reference the location of the inline fragment, once they have a location.
                directive_location,
            ))
        }
    }

    fn assert_not_within_inline_directive(&mut self, directive_location: Location) {
        if let Some(location) = self.parent_inline_fragment_directive {
            self.errors.push(
                Diagnostic::error(
                    RequiredDirectiveValidationMessage::WithinInlineDirective,
                    directive_location,
                )
                .annotate("The fragment is annotated as @inline here.", location),
            )
        }
    }

    fn assert_compatible_nullability(&mut self, path: StringKey, current: MaybeRequiredField) {
        if let Some(previous) = self.path_required_map.get(&path) {
            if let Some(previous_metadata) = &previous.required {
                if let Some(current_metadata) = current.required {
                    if previous_metadata.action.to_metadata_action()
                        != current_metadata.action.to_metadata_action()
                    {
                        self.errors.push(
                            Diagnostic::error(
                                RequiredDirectiveValidationMessage::ActionMismatch {
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
                            RequiredDirectiveValidationMessage::FieldMismatch {
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
                        RequiredDirectiveValidationMessage::FieldMismatch {
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
            self.assert_not_within_abstract_inline_fragment(metadata.directive_location);
            self.assert_not_within_inline_directive(metadata.directive_location);
            self.validate_semantic_non_null_for_field(
                self.program.schema.field(field.field_id()),
                metadata,
            );

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
        let parent_action = required_metadata.action;
        for required_child in self.current_node_required_children.values() {
            if required_child.required.action.to_metadata_action()
                < parent_action.to_metadata_action()
            {
                self.errors.push(
                    Diagnostic::error(
                        RequiredDirectiveValidationMessage::FieldInvalidNesting {
                            suggested_action: required_child.required.action.into(),
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
    fn validate_semantic_non_null_for_field(
        &mut self,
        field: &schema::definitions::Field,
        metadata: RequiredMetadata,
    ) {
        let enforce_no_throw_on_nullable = self
            .feature_flags
            .disallow_required_action_throw_on_semantically_nullable_fields
            .is_enabled_for(
                self.current_document_name
                    .expect("Expect to have a document while transforming linked field"),
            );

        if field.semantic_type().is_non_null() {
            if metadata.action == RequiredAction::DangerouslyThrowOnSemanticallyNullableField {
                self.errors.push(Diagnostic::error_with_data(
                    RequiredDirectiveValidationMessageWithData::DangerousThrowActionOnNonNullableFieldWithFix,
                    metadata.action_location,
                ));
            }
        } else if metadata.action == RequiredAction::Throw && enforce_no_throw_on_nullable {
            self.errors.push(Diagnostic::error_with_data(
                    RequiredDirectiveValidationMessageWithData::ThrowActionOnSemanticNullableFieldWithFix,
                    metadata.action_location,
                ));
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
                // We haven't seen any other instances of this field, so there's no validation to perform.
                return;
            }
        };

        // Check if this field has a required child field which was omitted in a previously encountered parent.
        for (path, required_child) in self.current_node_required_children.iter() {
            if !previous_required_children.contains_key(path) {
                if let Some(other_parent) = self.path_required_map.get(&field_path) {
                    let other_location = other_parent.field_name.location;
                    // We only care about conflicts with values that are
                    // actually requested by the user, so conflicts with
                    // generated fields are ignored.
                    if !other_location.source_location().is_generated() {
                        self.errors.push(
                            Diagnostic::error(
                                RequiredDirectiveValidationMessage::FieldMissing {
                                    field_name: required_child.field_name.item,
                                },
                                required_child.field_name.location,
                            )
                            .annotate("but is missing from", other_location),
                        )
                    }
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
                let other_location = field.name_with_location(&self.program.schema).location;
                // We only care about conflicts with values that are actually
                // requested by the user, so conflicts with generated fields are
                // ignored.
                if !other_location.source_location().is_generated() {
                    self.errors.push(
                        Diagnostic::error(
                            RequiredDirectiveValidationMessage::FieldMissing {
                                field_name: required_child.field_name.item,
                            },
                            required_child.field_name.location,
                        )
                        .annotate("but is missing from", other_location),
                    )
                }
            }
        }
    }
}

impl Transformer<'_> for RequiredDirective<'_> {
    const NAME: &'static str = "RequiredDirectiveTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if !self.required_directive_visitor.visit_fragment(fragment) {
            return Transformed::Keep;
        }
        self.reset_state(fragment.name.item.into());
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
        if !self
            .required_directive_visitor
            .find(operation.selections.iter().collect())
        {
            return Transformed::Keep;
        }
        self.reset_state(operation.name.item.into());
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
                        required_metadata.action.to_metadata_action(),
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

        let next_directives = match maybe_required_metadata {
            Some(required_metadata) => Cow::from(add_metadata_directive(
                &field.directives,
                path_name,
                required_metadata.action.to_metadata_action(),
            )),
            None => Cow::from(&field.directives),
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

        let next_directives_with_metadata = maybe_add_children_can_bubble_metadata_directive(
            &next_directives,
            &self.current_node_required_children,
        );

        self.within_abstract_inline_fragment = previous_abstract_fragment;

        let required_children = mem::replace(
            &mut self.current_node_required_children,
            parent_node_required_children,
        );

        self.required_children_map
            .insert(path_name, required_children);

        self.path.pop();

        if selections.should_keep()
            && next_directives_with_metadata.should_keep()
            && maybe_required_metadata.is_none()
        {
            Transformed::Keep
        } else {
            Transformed::Replace(Selection::LinkedField(Arc::new(LinkedField {
                directives: next_directives_with_metadata
                    .replace_or_else(|| next_directives.into()),
                selections: selections.replace_or_else(|| field.selections.clone()),
                ..field.clone()
            })))
        }
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let previous = self.within_abstract_inline_fragment;

        let maybe_alias =
            FragmentAliasMetadata::find(&fragment.directives).map(|metadata| metadata.alias.item);

        let next_fragment = if let Some(alias) = maybe_alias {
            self.within_abstract_inline_fragment = false;
            self.path.push(alias.lookup());
            let path_name = self.path.join(".").intern();

            // Once we've handled our own directive, take the parent's required
            // children map, leaving behind an empty/default map which our children
            // can populate.
            let parent_node_required_children = mem::take(&mut self.current_node_required_children);
            let next_selections = self.transform_selections(&fragment.selections);

            let next_directives_with_metadata = maybe_add_children_can_bubble_metadata_directive(
                &fragment.directives,
                &self.current_node_required_children,
            );
            let required_children = mem::replace(
                &mut self.current_node_required_children,
                parent_node_required_children,
            );

            self.required_children_map
                .insert(path_name, required_children);
            self.path.pop();

            if next_selections.should_keep() && next_directives_with_metadata.should_keep() {
                Transformed::Keep
            } else {
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    directives: next_directives_with_metadata
                        .replace_or_else(|| fragment.directives.clone()),
                    selections: next_selections.replace_or_else(|| fragment.selections.clone()),
                    ..fragment.clone()
                })))
            }
        } else {
            if let Some(type_) = fragment.type_condition
                && type_.is_abstract_type()
            {
                self.within_abstract_inline_fragment = true;
            }
            self.default_transform_inline_fragment(fragment)
        };

        self.within_abstract_inline_fragment = previous;
        next_fragment
    }
}

fn add_metadata_directive(
    directives: &[Directive],
    path_name: StringKey,
    action: RequiredAction,
) -> Vec<Directive> {
    let mut next_directives: Vec<Directive> = Vec::with_capacity(directives.len() + 1);
    next_directives.extend(directives.iter().cloned());
    next_directives.push(
        RequiredMetadataDirective {
            action,
            path: path_name,
        }
        .into(),
    );
    next_directives
}

fn maybe_add_children_can_bubble_metadata_directive(
    directives: &[Directive],
    current_node_required_children: &StringKeyMap<RequiredField>,
) -> TransformedValue<Vec<Directive>> {
    let children_can_bubble = current_node_required_children
        .values()
        .any(|child| !child.required.action.is_throw_action());

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
        data: None,
        location: Location::generated(),
    });
    TransformedValue::Replace(next_directives)
}

// Possible @required `action` enum values ordered by severity.
#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Debug, Hash)]
pub enum RequiredAction {
    None,
    Log,
    Throw,
    DangerouslyThrowOnSemanticallyNullableField,
}

impl RequiredAction {
    /// Returns true if this action should be treated as a throw action
    /// (i.e., THROW or DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD)
    pub fn is_throw_action(&self) -> bool {
        matches!(
            self,
            RequiredAction::Throw | RequiredAction::DangerouslyThrowOnSemanticallyNullableField
        )
    }

    /// Returns the action that should be used for metadata generation.
    /// DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD maps to THROW.
    pub fn to_metadata_action(&self) -> RequiredAction {
        match self {
            RequiredAction::DangerouslyThrowOnSemanticallyNullableField => RequiredAction::Throw,
            _ => *self,
        }
    }
}

impl From<RequiredAction> for StringKey {
    fn from(val: RequiredAction) -> Self {
        match val {
            RequiredAction::None => *NONE_ACTION,
            RequiredAction::Log => *LOG_ACTION,
            RequiredAction::Throw => *THROW_ACTION,
            RequiredAction::DangerouslyThrowOnSemanticallyNullableField => {
                *DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD_ACTION
            }
        }
    }
}

impl From<StringKey> for RequiredAction {
    fn from(action: StringKey) -> Self {
        match action {
            _ if action == *THROW_ACTION => Self::Throw,
            _ if action == *LOG_ACTION => Self::Log,
            _ if action == *NONE_ACTION => Self::None,
            _ if action == *DANGEROUSLY_THROW_ON_SEMANTICALLY_NULLABLE_FIELD_ACTION => {
                Self::DangerouslyThrowOnSemanticallyNullableField
            }
            // Actions that don't conform to the GraphQL schema should have been filtered out in IR validation.
            _ => unreachable!(),
        }
    }
}

struct RequiredDirectiveVisitor<'s> {
    program: &'s Program,
    visited_fragments: FragmentDefinitionNameMap<bool>,
}

impl DirectiveFinder for RequiredDirectiveVisitor<'_> {
    fn visit_directive(&self, directive: &Directive) -> bool {
        directive.name.item == *REQUIRED_DIRECTIVE_NAME
    }

    fn visit_fragment_spread(&mut self, fragment_spread: &graphql_ir::FragmentSpread) -> bool {
        let fragment = self.program.fragment(fragment_spread.fragment.item);
        if let Some(frag) = fragment {
            self.visit_fragment(frag)
        } else {
            // Could not find fragment spread. This can happen if we are running
            // this transform via LSP validation where we only validate a single
            // tagged template literal in isolation.
            false
        }
    }
}

impl RequiredDirectiveVisitor<'_> {
    fn visit_fragment(&mut self, fragment: &FragmentDefinition) -> bool {
        if let Some(val) = self.visited_fragments.get(&fragment.name.item) {
            return *val;
        }
        // Avoid dead loop in self-referencing fragments
        self.visited_fragments.insert(fragment.name.item, false);
        let result = self.find(fragment.selections.iter().collect());
        self.visited_fragments.insert(fragment.name.item, result);
        result
    }
}
