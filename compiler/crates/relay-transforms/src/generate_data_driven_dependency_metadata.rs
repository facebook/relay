/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_ir::Directive;
use graphql_ir::FragmentDefinition;
use graphql_ir::OperationDefinition;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::Transformer;
use graphql_ir::associated_data_impl;
use intern::string_key::StringKey;
use intern::string_key::StringKeyMap;
use itertools::Itertools;
use schema::Schema;
use schema::Type;
use schema::TypeReference;

use crate::ModuleMetadata;
use crate::util::get_normalization_fragment_filename;

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub struct RelayDataDrivenDependencyMetadata {
    pub direct_dependencies: Option<Vec<(StringKey, String)>>,
    // always None for fragments
    pub indirect_dependencies: Option<Vec<(StringKey, String)>>,
}
associated_data_impl!(RelayDataDrivenDependencyMetadata);

pub fn generate_data_driven_dependency_metadata(program: &Program) -> Program {
    let mut transformer = GenerateDataDrivenDependencyMetadata::new(program);
    transformer
        .transform_program(program)
        .replace_or_else(|| program.clone())
}

struct GenerateDataDrivenDependencyMetadata<'s> {
    pub program: &'s Program,
    cache: StringKeyMap<Option<ModuleEntries>>,
}

impl<'s> GenerateDataDrivenDependencyMetadata<'s> {
    fn new(program: &'s Program) -> Self {
        GenerateDataDrivenDependencyMetadata {
            program,
            cache: Default::default(),
        }
    }

    fn get_direct_module_entries_for_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Option<&ModuleEntries> {
        let cache_key = fragment.name.item.0;
        #[allow(clippy::map_entry)]
        if !self.cache.contains_key(&cache_key) {
            let entries = self.extract_module_entries_from_selections(
                TypeReference::Named(fragment.type_condition),
                &fragment.selections,
                ModuleEntriesKind::Direct,
            );
            self.cache.insert(cache_key, entries);
        }
        self.cache.get(&cache_key).and_then(|v| v.as_ref())
    }

    fn extract_module_entries_from_selections(
        &mut self,
        type_: TypeReference<Type>,
        selections: &[Selection],
        kind: ModuleEntriesKind,
    ) -> Option<ModuleEntries> {
        let mut processing_queue: Vec<ProcessingItem<'_>> = vec![ProcessingItem {
            plural: false,
            parent_type: type_,
            selections,
        }];

        let mut module_entries: ModuleEntries = Default::default();

        while let Some(processing_item) = processing_queue.pop() {
            for selection in processing_item.selections {
                match selection {
                    Selection::ScalarField(_) => {}
                    Selection::FragmentSpread(spread) => {
                        if kind == ModuleEntriesKind::Direct {
                            continue;
                        }
                        let fragment = self.program.fragment(spread.fragment.item)?;
                        if let Some(fragment_module_entries) =
                            self.get_direct_module_entries_for_fragment(fragment)
                        {
                            for (id, entry) in fragment_module_entries {
                                module_entries
                                    .entry(*id)
                                    .and_modify(|module_entry| {
                                        module_entry.branches.extend(entry.branches.iter())
                                    })
                                    .or_insert_with(|| entry.clone());
                            }
                        }
                    }
                    Selection::LinkedField(linked_filed) => {
                        let field_type = &self
                            .program
                            .schema
                            .field(linked_filed.definition.item)
                            .type_;
                        processing_queue.push(ProcessingItem {
                            plural: processing_item.plural || field_type.is_list(),
                            parent_type: field_type.clone(),
                            selections: &linked_filed.selections,
                        });
                    }
                    Selection::InlineFragment(inline_fragment) => {
                        let parent_type = match inline_fragment.type_condition {
                            Some(type_) => TypeReference::Named(type_),
                            None => processing_item.parent_type.clone(),
                        };
                        processing_queue.push(ProcessingItem {
                            plural: processing_item.plural,
                            parent_type,
                            selections: &inline_fragment.selections,
                        });
                        if kind == ModuleEntriesKind::Indirect {
                            continue;
                        }
                        if let Some(module_metadata) =
                            ModuleMetadata::find(&inline_fragment.directives)
                        {
                            let id = module_metadata.module_id;
                            let component = module_metadata.module_name;

                            let fragment_spread = inline_fragment
                                .selections
                                .iter()
                                .find(|item| matches!(item, Selection::FragmentSpread(_)));
                            // This is expected to be a fragment spread
                            let fragment_name = match fragment_spread {
                                Some(Selection::FragmentSpread(spread)) => spread.fragment.item,
                                _ => panic!("Expected to have a fragment spread"),
                            };

                            let type_name = self
                                .program
                                .schema
                                .get_type_name(processing_item.parent_type.inner());
                            module_entries
                                .entry(id)
                                .and_modify(|module_entry| {
                                    module_entry.branches.insert(
                                        type_name,
                                        Branch {
                                            component,
                                            fragment: get_normalization_fragment_filename(
                                                fragment_name,
                                            ),
                                        },
                                    );
                                })
                                .or_insert(ModuleEntry {
                                    branches: {
                                        let mut map = StringKeyMap::default();
                                        map.insert(
                                            type_name,
                                            Branch {
                                                component,
                                                fragment: get_normalization_fragment_filename(
                                                    fragment_name,
                                                ),
                                            },
                                        );
                                        map
                                    },
                                    plural: processing_item.plural,
                                });
                        }
                    }
                    Selection::Condition(condition) => {
                        processing_queue.push(ProcessingItem {
                            plural: processing_item.plural,
                            parent_type: processing_item.parent_type.clone(),
                            selections: &condition.selections,
                        });
                    }
                }
            }
        }

        if !module_entries.is_empty() {
            Some(module_entries)
        } else {
            None
        }
    }
}

#[derive(Debug, Copy, Clone)]
struct Branch {
    component: StringKey,
    fragment: StringKey,
}

type ModuleEntries = StringKeyMap<ModuleEntry>;

#[derive(Debug, Clone)]
struct ModuleEntry {
    branches: StringKeyMap<Branch>,
    plural: bool,
}
#[derive(Debug, PartialEq, Eq)]

enum ModuleEntriesKind {
    Direct,
    Indirect,
}

#[derive(Debug)]
struct ProcessingItem<'a> {
    plural: bool,
    parent_type: TypeReference<Type>,
    selections: &'a [Selection],
}

impl Transformer<'_> for GenerateDataDrivenDependencyMetadata<'_> {
    const NAME: &'static str = "GenerateDataDrivenDependencyMetadata";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_operation(
        &mut self,
        operation: &OperationDefinition,
    ) -> Transformed<OperationDefinition> {
        let indirect_module_entries = self.extract_module_entries_from_selections(
            TypeReference::Named(operation.type_),
            &operation.selections,
            ModuleEntriesKind::Indirect,
        );
        let direct_module_entries = self.extract_module_entries_from_selections(
            TypeReference::Named(operation.type_),
            &operation.selections,
            ModuleEntriesKind::Direct,
        );
        if direct_module_entries.is_some() || indirect_module_entries.is_some() {
            let mut next_directives: Vec<Directive> =
                Vec::with_capacity(operation.directives.len() + 1);
            next_directives.extend(operation.directives.iter().cloned());
            next_directives.push(
                RelayDataDrivenDependencyMetadata {
                    direct_dependencies: direct_module_entries
                        .as_ref()
                        .map(get_metadata_from_module_entries),
                    indirect_dependencies: indirect_module_entries
                        .as_ref()
                        .map(get_metadata_from_module_entries),
                }
                .into(),
            );
            Transformed::Replace(OperationDefinition {
                directives: next_directives,
                ..operation.clone()
            })
        } else {
            Transformed::Keep
        }
    }

    fn transform_fragment(
        &mut self,
        fragment: &FragmentDefinition,
    ) -> Transformed<FragmentDefinition> {
        if let Some(module_entries) = self.get_direct_module_entries_for_fragment(fragment) {
            let mut next_directives: Vec<Directive> =
                Vec::with_capacity(fragment.directives.len() + 1);
            next_directives.extend(fragment.directives.iter().cloned());
            next_directives.push(
                RelayDataDrivenDependencyMetadata {
                    direct_dependencies: Some(get_metadata_from_module_entries(module_entries)),
                    indirect_dependencies: None,
                }
                .into(),
            );
            Transformed::Replace(FragmentDefinition {
                directives: next_directives,
                ..fragment.clone()
            })
        } else {
            Transformed::Keep
        }
    }
}

fn get_metadata_from_module_entries(module_entries: &ModuleEntries) -> Vec<(StringKey, String)> {
    module_entries
        .iter()
        .map(|(key, entry)| {
            (
                *key,
                format!(
                    "{{\"branches\":{{{}}},\"plural\":{}}}",
                    entry
                        .branches
                        .iter()
                        .sorted_unstable_by(|a, b| a.0.cmp(b.0))
                        .map(|(id, branch)| format!(
                            "\"{}\":{{\"component\":\"{}\",\"fragment\":\"{}\"}}",
                            id, branch.component, branch.fragment
                        ))
                        .join(","),
                    entry.plural,
                ),
            )
        })
        .sorted_unstable_by(|a, b| a.0.cmp(&b.0))
        .collect()
}
