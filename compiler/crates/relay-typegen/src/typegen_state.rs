/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::writer::ExactObject;
use crate::writer::Writer;
use crate::writer::AST;
use crate::LIVE_RESOLVERS_EXPERIMENTAL_STORE_PATH;
use crate::LIVE_RESOLVERS_LIVE_STATE;
use crate::LOCAL_3D_PAYLOAD;
use crate::RELAY_RUNTIME;
use common::Location;
use fnv::FnvHashMap;
use fnv::FnvHashSet;
use graphql_ir::FragmentDefinition;
use indexmap::IndexMap;
use indexmap::IndexSet;
use intern::string_key::StringKey;
use schema::EnumID;
use schema::SDLSchema;
use schema::Schema;
use std::fmt::Result as FmtResult;
use std::sync::Arc;

/// A struct that is mutated as we iterate through an operation/fragment and
/// contains information about whether and how to write import types.
#[derive(Default)]
pub(crate) struct RuntimeImports {
    pub(crate) local_3d_payload_type_should_be_imported: bool,
    pub(crate) generic_fragment_type_should_be_imported: bool,
    pub(crate) import_relay_resolver_live_state_type: bool,
}

impl RuntimeImports {
    pub(crate) fn write_runtime_imports(&self, writer: &mut Box<dyn Writer>) -> FmtResult {
        if self.import_relay_resolver_live_state_type {
            writer.write_import_type(
                &[LIVE_RESOLVERS_LIVE_STATE],
                LIVE_RESOLVERS_EXPERIMENTAL_STORE_PATH,
            )?;
        }

        let mut runtime_import_types = vec![];
        if self.generic_fragment_type_should_be_imported {
            runtime_import_types.push(writer.get_runtime_fragment_import())
        }
        if self.local_3d_payload_type_should_be_imported {
            runtime_import_types.push(LOCAL_3D_PAYLOAD)
        }
        if !runtime_import_types.is_empty() {
            writer.write_import_type(&runtime_import_types, RELAY_RUNTIME)
        } else {
            Ok(())
        }
    }
}

/// An enum used to prevent redundantly processing input objects.
pub(crate) enum GeneratedInputObject {
    Pending,
    Resolved(ExactObject),
}

impl GeneratedInputObject {
    pub(crate) fn unwrap_resolved_type(self) -> ExactObject {
        match self {
            GeneratedInputObject::Pending => panic!("Unexpected pending type"),
            GeneratedInputObject::Resolved(exact_object) => exact_object,
        }
    }
}

pub(crate) type InputObjectTypes = IndexMap<StringKey, GeneratedInputObject>;

/// Because EncounteredEnums is passed around everywhere, we use a newtype
/// to make it easy to track.
#[derive(Default)]
pub(crate) struct EncounteredEnums(pub(crate) FnvHashSet<EnumID>);

impl EncounteredEnums {
    pub(crate) fn into_sorted_vec(self, schema: &SDLSchema) -> Vec<EnumID> {
        let mut sorted_vec_of_enum_ids: Vec<_> = self.0.into_iter().collect();
        sorted_vec_of_enum_ids.sort_by_key(|enum_id| schema.enum_(*enum_id).name);
        sorted_vec_of_enum_ids
    }
}

#[derive(Default)]
pub(crate) struct MatchFields(pub(crate) IndexMap<StringKey, AST>);

#[derive(PartialEq, Eq, Hash, PartialOrd, Ord)]
pub(crate) enum EncounteredFragment {
    Spread(StringKey),
    Key(StringKey),
}

/// This is a map FragmentName => Fragment Location
/// We use the location of the fragment to generate a correct
/// path to its generated artifact, in case we need to
/// reference it in another generated artifact.
/// This is used in non-haste setups that do not have a single
/// directory for generated artifacts.
pub struct FragmentLocations(pub FnvHashMap<StringKey, Location>);

impl FragmentLocations {
    pub fn new<'a>(fragments: impl Iterator<Item = &'a Arc<FragmentDefinition>>) -> Self {
        Self(
            fragments
                .map(|fragment| (fragment.name.item, fragment.name.location))
                .collect::<_>(),
        )
    }

    pub fn location(&self, fragment_name: &StringKey) -> Option<&Location> {
        self.0.get(fragment_name)
    }
}

#[derive(Default)]
pub(crate) struct EncounteredFragments(pub(crate) FnvHashSet<EncounteredFragment>);

pub(crate) struct ImportedResolver {
    pub resolver_name: StringKey,
    pub resolver_type: AST,
}

#[derive(Default)]
pub(crate) struct ImportedResolvers(pub(crate) IndexMap<StringKey, ImportedResolver>);

#[derive(Default)]
pub(crate) struct ImportedRawResponseTypes(pub(crate) IndexSet<StringKey>);

/// Have we encountered an actor change? Use an enum for bookkeeping, since it
/// will be passed around in many places.
pub(crate) enum ActorChangeStatus {
    HasActorChange,
    NoActorChange,
}
