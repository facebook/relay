use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;
use relay_config::ProjectConfig;

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
    }
}
