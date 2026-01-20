/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::sync::Arc;

use graphql_ir::ExecutableDefinition;
use graphql_ir::FragmentDefinition;
use graphql_ir::FragmentDefinitionName;
use graphql_ir::FragmentDefinitionNameMap;
use graphql_ir::FragmentSignature;
use graphql_ir::FragmentSignatures;
use graphql_ir::FragmentSpread;
use graphql_ir::OperationDefinition;
use graphql_ir::OperationDefinitionName;
use graphql_ir::Program;
use graphql_ir::Selection;
use graphql_ir::Transformed;
use graphql_ir::TransformedValue;
use graphql_ir::Transformer;
use graphql_ir::transform_list;
use schema::SDLSchema;

/// A collection of all documents that are being compiled.
/// A replacement for the graphql_ir::Program, which does not enable us to
/// differentiate between definitions within some scope (like a library),
/// and fragments that the scope depends on.
///
/// ProgramWithDependencies allows you to look up *fragments* across both the scope
/// and dependencies, but when asking for a list of fragments or operations, only
/// supplies the in-scope definitions.
#[derive(Debug, Clone)]
pub struct ProgramWithDependencies {
    pub schema: Arc<SDLSchema>,
    pub fragment_signatures: FragmentSignatures,
    pub scoped_fragments: FragmentDefinitionNameMap<Arc<FragmentDefinition>>,
    pub scoped_operations: Vec<Arc<OperationDefinition>>,
}

impl ProgramWithDependencies {
    pub fn new(schema: Arc<SDLSchema>) -> Self {
        Self {
            schema,
            fragment_signatures: Default::default(),
            scoped_fragments: Default::default(),
            scoped_operations: Default::default(),
        }
    }

    pub fn transform<F>(&self, transformation: F) -> TransformedValue<ProgramWithDependencies>
    where
        F: FnOnce(Program) -> TransformedValue<Program>,
    {
        let program_to_transform: Program = self.into();

        transformation(program_to_transform).map(|updated_program| {
            // We will never add fragments to any of the deps.
            let updated_scoped_fragments = updated_program.fragments;

            // Update and add new signatures.
            // We won't *delete* a fragment signature if the parent fragment was deleted,
            // but that's probably OK.
            let mut updated_signatures = self.fragment_signatures.clone();
            for fragment in updated_scoped_fragments.values() {
                updated_signatures.insert(fragment.name.item.clone(), fragment.as_ref().into());
            }

            ProgramWithDependencies {
                schema: updated_program.schema,
                scoped_operations: updated_program.operations,
                scoped_fragments: updated_scoped_fragments,
                fragment_signatures: updated_signatures,
            }
        })
    }

    pub fn from_full_program(schema: &Arc<SDLSchema>, program: &Program) -> Self {
        Self {
            schema: schema.clone(),
            scoped_operations: program.operations.clone(),
            scoped_fragments: program.fragments.clone(),
            fragment_signatures: program
                .fragments
                .iter()
                .map(|(name, fragment)| (name.clone(), fragment.as_ref().into()))
                .collect(),
        }
    }

    pub fn from_definitions(
        schema: Arc<SDLSchema>,
        scoped_definitions: Vec<ExecutableDefinition>,
        dependencies: FragmentSignatures,
    ) -> Self {
        let mut scoped_operations = Vec::new();
        let mut scoped_fragments = FragmentDefinitionNameMap::default();

        let mut fragment_signatures = dependencies.clone();

        fragment_signatures.extend(scoped_definitions.iter().filter_map(|def| {
            if let ExecutableDefinition::Fragment(fragment) = def {
                Some((fragment.name.item.clone(), fragment.into()))
            } else {
                None
            }
        }));
        let transformed_scoped_definitions =
            add_signatures_to_spreads(&fragment_signatures, scoped_definitions);

        let mut seen_operation_loc = HashMap::new();
        let mut seen_fragments_loc = HashMap::new();
        for definition in transformed_scoped_definitions {
            match definition {
                ExecutableDefinition::Operation(operation) => {
                    let loc = operation.name.location;
                    let name = operation.name.item;
                    if let Some(another) = seen_operation_loc.insert(name, loc) {
                        panic!(
                            "\nDuplicate operation definitions named {}: \nfirst one: {:?}\nsecond one: {:?}\n",
                            name, loc, another
                        );
                    }
                    scoped_operations.push(Arc::new(operation)); // Keep the order the operations same as inputs.
                }
                ExecutableDefinition::Fragment(fragment) => {
                    let loc = fragment.name.location;
                    let name = fragment.name.item;
                    let fragment_ref = Arc::new(fragment);
                    if let Some(another) =
                        seen_fragments_loc.insert(name, fragment_ref.name.location)
                    {
                        panic!(
                            "\nDuplicate fragment definitions named {}: \nfirst one: {:?}\nsecond one: {:?}\n",
                            name, loc, &another
                        );
                    }
                    scoped_fragments.insert(name, fragment_ref.clone()); // Keep the order the fragments same as inputs.
                }
            }
        }

        // Ensure there are no duplicate fragments referenced in the dependencies.
        for (fragment_name, signature) in &dependencies {
            let loc = signature.name.location;
            if let Some(another) = seen_fragments_loc.insert(*fragment_name, loc)
                && another != loc
            {
                panic!(
                    "\nDuplicate fragment definitions named {}: \nfirst one: {:?}\nsecond one: {:?}\n",
                    fragment_name, loc, &another
                );
            }
        }
        Self {
            schema,
            fragment_signatures,
            scoped_fragments,
            scoped_operations,
        }
    }

    // Fragment *signatures* can be accessed for both in-scope and dependent fragments.
    pub fn fragment_signature(&self, name: FragmentDefinitionName) -> Option<&FragmentSignature> {
        self.fragment_signatures.get(&name)
    }

    /// Searches for an operation by name.
    ///
    /// NOTE: This is a linear search, we currently don't frequently search
    ///       for operations by name, so this might be overall faster than
    ///       using a map internally.
    pub fn operation(&self, name: OperationDefinitionName) -> Option<&Arc<OperationDefinition>> {
        self.operations()
            .find(|operation| operation.name.item == name)
    }

    pub fn operations(&self) -> impl Iterator<Item = &Arc<OperationDefinition>> {
        self.scoped_operations.iter()
    }

    pub fn fragments(&self) -> impl Iterator<Item = &Arc<FragmentDefinition>> {
        self.scoped_fragments.values()
    }
}

impl From<&ProgramWithDependencies> for Program {
    fn from(value: &ProgramWithDependencies) -> Self {
        Self {
            schema: value.schema.clone(),
            fragments: value
                .scoped_fragments
                .iter()
                .map(|(name, f)| (name.clone(), f.clone()))
                .collect(),
            operations: value.scoped_operations.to_vec(),
        }
    }
}

pub fn add_signatures_to_spreads(
    signatures: &FragmentSignatures,
    definitions: Vec<ExecutableDefinition>,
) -> Vec<ExecutableDefinition> {
    let mut signature_adding_transform = AddSpreadSignaturesTransform {
        fragment_signatures: signatures,
    };

    transform_list(&definitions, |def| match def {
        ExecutableDefinition::Operation(operation) => signature_adding_transform
            .transform_operation(operation)
            .map(ExecutableDefinition::Operation),
        ExecutableDefinition::Fragment(fragment) => signature_adding_transform
            .transform_fragment(fragment)
            .map(ExecutableDefinition::Fragment),
    })
    .replace_or_else(|| definitions)
}

struct AddSpreadSignaturesTransform<'a> {
    pub fragment_signatures: &'a FragmentSignatures,
}

impl<'a> Transformer<'a> for AddSpreadSignaturesTransform<'a> {
    const NAME: &'static str = "AddSpreadSignaturesTransform";
    const VISIT_ARGUMENTS: bool = false;
    const VISIT_DIRECTIVES: bool = false;

    fn transform_fragment_spread(&mut self, spread: &FragmentSpread) -> Transformed<Selection> {
        if spread.signature.is_none() {
            self.fragment_signatures.get(&spread.fragment.item).map_or(
                Transformed::Keep,
                |fragment_signature: &FragmentSignature| {
                    Transformed::Replace(Selection::FragmentSpread(Arc::new(FragmentSpread {
                        signature: Some(fragment_signature.clone()),
                        ..spread.clone()
                    })))
                },
            )
        } else {
            Transformed::Keep
        }
    }
}
