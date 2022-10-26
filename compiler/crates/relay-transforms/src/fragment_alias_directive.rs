/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::sync::Arc;

use common::ArgumentName;
use common::Diagnostic;
use common::DiagnosticsResult;
use common::DirectiveName;
use common::FeatureFlag;
use common::Location;
use common::NamedItem;
use common::WithLocation;
use graphql_ir::associated_data_impl;
use graphql_ir::transform_list;
use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentSpread;
use graphql_ir::InlineFragment;
use graphql_ir::LinkedField;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use intern::string_key::Intern;
use intern::string_key::StringKey;
use lazy_static::lazy_static;
use schema::Schema;
use schema::Type;

use crate::ValidationMessage;

lazy_static! {
    pub static ref FRAGMENT_ALIAS_DIRECTIVE_NAME: DirectiveName = DirectiveName("alias".intern());
    pub static ref FRAGMENT_ALIAS_ARGUMENT_NAME: ArgumentName = ArgumentName("as".intern());
}

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct FragmentAliasMetadata {
    pub alias: WithLocation<StringKey>,
    pub type_condition: Option<Type>,
    pub selection_type: Type,
}
associated_data_impl!(FragmentAliasMetadata);

pub fn fragment_alias_directive(
    program: &Program,
    feature_flag: &FeatureFlag,
) -> DiagnosticsResult<Program> {
    let mut transform = FragmentAliasTransform::new(program, feature_flag);
    let next_program = transform
        .transform_program(program)
        .replace_or_else(|| program.clone());
    if transform.errors.is_empty() {
        Ok(next_program)
    } else {
        Err(transform.errors)
    }
}

struct FragmentAliasTransform<'program> {
    program: &'program Program,
    feature_flag: &'program FeatureFlag,
    document_name: Option<StringKey>,
    parent_type: Option<Type>,
    errors: Vec<Diagnostic>,
}

impl<'program> FragmentAliasTransform<'program> {
    fn new(program: &'program Program, feature_flag: &'program FeatureFlag) -> Self {
        Self {
            program,
            feature_flag,
            document_name: None,
            parent_type: None,
            errors: Vec::new(),
        }
    }

    fn transform_alias_directives<N>(
        &mut self,
        directives: &[Directive],
        type_condition: Option<Type>,
        get_default_name: N,
    ) -> TransformedValue<Vec<Directive>>
    where
        N: Fn() -> Option<StringKey>,
    {
        transform_list(directives, |directive| {
            if directive.name.item != *FRAGMENT_ALIAS_DIRECTIVE_NAME {
                return Transformed::Keep;
            }

            let allowed = match self.document_name {
                Some(name) => self.feature_flag.is_enabled_for(name),
                None => false,
            };

            if !allowed {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::FragmentAliasDirectiveDisabled,
                    directive.name.location,
                ));
                return Transformed::Keep;
            }
            let alias = match directive.arguments.named(*FRAGMENT_ALIAS_ARGUMENT_NAME) {
                Some(arg) => match arg.value.item.get_string_literal() {
                    Some(name) => WithLocation::new(arg.name.location, name),
                    None => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::FragmentAliasDirectiveDynamicNameArg,
                            arg.value.location,
                        ));
                        return Transformed::Keep;
                    }
                },
                None => match get_default_name() {
                    None => {
                        self.errors.push(Diagnostic::error(
                            ValidationMessage::FragmentAliasDirectiveMissingAs,
                            directive.name.location,
                        ));
                        return Transformed::Keep;
                    }
                    Some(as_) => WithLocation::new(directive.name.location, as_),
                },
            };

            // In the future we might want to relax this restriction, but for now this allows us
            // to avoid having to consider how @alias would interact
            // with all other directives like @defer.
            if directives.len() > 1 {
                self.errors.push(Diagnostic::error(
                    ValidationMessage::FragmentAliasIncompatibleDirective,
                    directive.name.location,
                ));
                return Transformed::Keep;
            }
            Transformed::Replace(
                FragmentAliasMetadata {
                    alias,
                    type_condition,
                    selection_type: type_condition.unwrap_or(
                        self.parent_type
                            .expect("Selection should be within a parent type."),
                    ),
                }
                .into(),
            )
        })
    }
}

impl Transformer for FragmentAliasTransform<'_> {
    const NAME: &'static str = "NamedFragmentSpreadsTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        self.document_name = Some(fragment.name.item.0);
        self.parent_type = Some(fragment.type_condition);
        let transformed = self.default_transform_fragment(fragment);
        self.parent_type = None;
        self.document_name = None;
        transformed
    }

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        self.document_name = Some(operation.name.item.0);
        self.parent_type = Some(operation.type_);
        let transformed = self.default_transform_operation(operation);
        self.parent_type = None;
        self.document_name = None;
        transformed
    }

    fn transform_inline_fragment(&mut self, fragment: &InlineFragment) -> Transformed<Selection> {
        let get_default_name = || {
            fragment
                .type_condition
                .map(|type_| self.program.schema.get_type_name(type_))
        };
        let previous_parent_type = self.parent_type;

        if let Some(type_condition) = fragment.type_condition {
            self.parent_type = Some(type_condition);
        }

        let transformed = match self.transform_alias_directives(
            &fragment.directives,
            fragment.type_condition,
            get_default_name,
        ) {
            TransformedValue::Keep => self.default_transform_inline_fragment(fragment),
            TransformedValue::Replace(next_directives) => {
                Transformed::Replace(Selection::InlineFragment(Arc::new(InlineFragment {
                    directives: next_directives,
                    type_condition: fragment.type_condition,
                    selections: self
                        .transform_selections(&fragment.selections)
                        .replace_or_else(|| fragment.selections.clone()),
                    spread_location: Location::generated(),
                })))
            }
        };

        self.parent_type = previous_parent_type;

        transformed
    }

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        let type_condition = Some(
            self.program
                .fragment(spread.fragment.item)
                .expect("I believe we have already validated that all fragments exist")
                .type_condition,
        );
        let get_default_name = || Some(spread.fragment.item.0);
        self.transform_alias_directives(&spread.directives, type_condition, get_default_name)
            .map(|directives| {
                Selection::FragmentSpread(Arc::new(FragmentSpread {
                    fragment: spread.fragment,
                    arguments: spread.arguments.clone(),
                    directives,
                }))
            })
            .into()
    }

    fn transform_linked_field(&mut self, field: &LinkedField) -> Transformed<Selection> {
        let previous_parent_type = self.parent_type;

        self.parent_type = Some(
            self.program
                .schema
                .field(field.definition.item)
                .type_
                .inner(),
        );

        let transformed = self.default_transform_linked_field(field);

        self.parent_type = previous_parent_type;

        transformed
    }
}
