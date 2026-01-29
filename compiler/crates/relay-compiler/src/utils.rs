/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;
use relay_config::ProjectConfig;

/// The get_parser_features function determines the parser features based on the project's
/// configuration.
///
/// It checks the feature flags within the provided `ProjectConfig` to determine the
/// `ParserFeatures` for the project. `ParserFeatures` is a struct that represents the
/// features and capabilities of a GraphQL parser. It is used to configure the behavior
/// of the parser and determine which syntax features are supported.
pub fn get_parser_features(project_config: &ProjectConfig) -> ParserFeatures {
    ParserFeatures {
        fragment_argument_capability: if project_config
            .feature_flags
            .enable_fragment_argument_transform
        {
            FragmentArgumentSyntaxKind::SpreadArgumentsAndFragmentVariableDefinitions
        } else {
            FragmentArgumentSyntaxKind::None
        },
        allow_string_literal_alias: false,
    }
}
