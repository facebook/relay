/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::OperationKind;
use rand::seq::SliceRandom;
use relay_transforms::extract_module_name;
use std::{collections::HashSet, fmt};

#[derive(Clone, Copy, Debug)]
pub enum DefinitionNameSuffix {
    Query,
    Mutation,
    Subscription,
}

impl From<&OperationKind> for DefinitionNameSuffix {
    fn from(kind: &OperationKind) -> Self {
        match kind {
            OperationKind::Query => DefinitionNameSuffix::Query,
            OperationKind::Subscription => DefinitionNameSuffix::Subscription,
            OperationKind::Mutation => DefinitionNameSuffix::Mutation,
        }
    }
}

impl fmt::Display for DefinitionNameSuffix {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

/// This function will create a default name suggestion for operation/fragment in a file.
/// Default name is {prefix}{Query|Mutation|Subscription},
/// where {prefix} is a cameCased base file stem, without extension and suffix (like .react.js, .jsx, etc..)
pub fn create_default_name(file_name: &str, suffix: DefinitionNameSuffix) -> Option<String> {
    let module_name = extract_module_name(file_name)?;
    if module_name.ends_with(&suffix.to_string()) {
        Some(module_name)
    } else {
        Some(format!("{}{}", module_name, suffix))
    }
}

/// This function will create a name suggestion for operation/fragment
/// in a file adding an incremental index.
/// Suggested name is {prefix}{index}{Query|Mutation|Subscription},
/// We will keep incrementing the index,
/// while the suggested name is not in the already used names in the file.
pub fn create_default_name_with_index(
    file_name: &str,
    suffix: DefinitionNameSuffix,
    used_names: &HashSet<String>,
) -> Option<String> {
    let module_name = extract_module_name(file_name)?;
    let mut index = 1;
    loop {
        let new_name = format!("{}{}{}", module_name, index, suffix);
        if used_names.contains(&new_name) {
            index += 1;
        } else {
            return Some(new_name);
        }
    }
}

/// If you already have a name for your fragment/operation,
/// it doesn't start/end with correct prefixes/suffixes -
/// this function will return a correctly wrapped name.
pub fn create_name_wrapper(
    original_name: &str,
    file_name: &str,
    suffix: DefinitionNameSuffix,
) -> Option<String> {
    let module_name = extract_module_name(file_name)?;
    let new_prefix = if original_name.starts_with(&module_name) {
        None
    } else {
        Some(module_name)
    };
    let new_suffix = if original_name.ends_with(&suffix.to_string()) {
        None
    } else {
        Some(suffix)
    };
    // if the `original_name` already have correct prefix/suffix, we don't need to return anything
    if new_prefix.is_none() && new_suffix.is_none() {
        None
    } else {
        let new_name = format!(
            "{}{}{}",
            match new_prefix {
                Some(value) => value,
                None => "".to_string(),
            },
            original_name,
            match new_suffix {
                Some(value) => value.to_string(),
                None => "".to_string(),
            },
        );
        Some(new_name)
    }
}

/// This function will create a very impactful name for your query/fragment
pub fn create_impactful_name(file_name: &str, suffix: DefinitionNameSuffix) -> Option<String> {
    let module_name = extract_module_name(file_name)?;

    // This will make your query/fragment more impactful
    let impact = create_impactful_part();

    Some(format!("{}{}{}", module_name, impact, suffix))
}

fn create_impactful_part() -> String {
    let adjectives = vec![
        "Redefined",
        "Awesome",
        "Formidable",
        "Remarkable",
        "Outstanding",
        "Fantastic",
        "Striking",
        "Noticeable",
        "Perceptible",
        "Fast",
        "Brisk",
        "Super",
        "Cool",
        "Impactful",
        "Meaningful",
        "DoubleQuick",
        "Prominent",
        "Swift",
        "Successful",
        "Impressive",
        "Egregious",
        "HighQuality",
        "Redefining",
        "Unique",
        "Impossible",
        "Robust",
        "Comprehensive",
        "Bold",
        "Useful",
        "Disruptive",
        "TopNotch",
        "WorldClass",
        "Exceptional",
    ];
    let nouns = vec![
        "Expectation",
        "Impact",
        "Awesomeness",
        "Feature",
        "Fix",
        "Improvement",
        "Implementation",
        "Project",
        "Success",
        "Profit",
        "Product",
        "Goal",
        "Effort",
        "Performance",
        "Result",
        "Solution",
    ];
    let adjective: &str = adjectives
        .choose(&mut rand::thread_rng())
        .unwrap_or(&adjectives[0]);
    let noun: &str = nouns.choose(&mut rand::thread_rng()).unwrap_or(&nouns[0]);

    format!("{}{}", adjective, noun)
}

#[cfg(test)]
mod tests {
    use super::{
        create_default_name, create_default_name_with_index, create_name_wrapper,
        DefinitionNameSuffix,
    };
    use std::collections::HashSet;

    #[test]
    fn test_create_default_name() {
        assert_eq!(
            create_default_name("/data/user/ReactFile.js", DefinitionNameSuffix::Query),
            Some("ReactFileQuery".to_string())
        );
        assert_eq!(
            create_default_name("/data/user/react-file.js", DefinitionNameSuffix::Query),
            Some("reactFileQuery".to_string())
        );
        assert_eq!(
            create_default_name("/data/user/My_react-file.js", DefinitionNameSuffix::Query),
            Some("MyReactFileQuery".to_string())
        );
        assert_eq!(
            create_default_name("/data/user/ReactFile.react.js", DefinitionNameSuffix::Query),
            Some("ReactFileQuery".to_string())
        );
        assert_eq!(
            create_default_name(
                "/data/user/ReactFile.android.js",
                DefinitionNameSuffix::Query
            ),
            Some("ReactFileAndroidQuery".to_string())
        );
        assert_eq!(
            create_default_name("/data/user/ReactFile.ios.js", DefinitionNameSuffix::Query),
            Some("ReactFileIosQuery".to_string())
        );
        assert_eq!(
            create_default_name("ReactFile", DefinitionNameSuffix::Query),
            Some("ReactFileQuery".to_string())
        );
        assert_eq!(
            create_default_name(
                "/data/users/project/EntityCreateMutation.js",
                DefinitionNameSuffix::Mutation
            ),
            Some("EntityCreateMutation".to_string())
        );
        assert_eq!(
            create_default_name("0001-----2-2-2", DefinitionNameSuffix::Query),
            Some("0001222Query".to_string())
        );
    }

    #[test]
    fn test_name_with_index1() {
        let mut used_names = HashSet::new();
        used_names.insert("ReactFileQuery".to_string());
        assert_eq!(
            create_default_name_with_index(
                "/data/user/ReactFile.js",
                DefinitionNameSuffix::Query,
                &used_names
            ),
            Some("ReactFile1Query".to_string())
        );
    }

    #[test]
    fn test_name_with_index_after_suffix() {
        let used_names = HashSet::new();
        assert_eq!(
            create_default_name_with_index(
                "/data/users/project/EntityCreateMutation.js",
                DefinitionNameSuffix::Mutation,
                &used_names
            ),
            Some("EntityCreateMutation1Mutation".to_string())
        );
    }

    #[test]
    fn test_name_with_index2() {
        let mut used_names = HashSet::new();
        used_names.insert("ReactFileQuery".to_string());
        used_names.insert("ReactFile1Query".to_string());
        assert_eq!(
            create_default_name_with_index(
                "/data/user/ReactFile.js",
                DefinitionNameSuffix::Query,
                &used_names
            ),
            Some("ReactFile2Query".to_string())
        );
    }

    #[test]
    fn test_create_name_wrapper() {
        assert_eq!(
            create_name_wrapper(
                "MyQuery",
                "/data/user/ReactFile.js",
                DefinitionNameSuffix::Query
            ),
            Some("ReactFileMyQuery".to_string())
        );
        assert_eq!(
            create_name_wrapper(
                "ReactFileMyQuery",
                "/data/user/ReactFile.js",
                DefinitionNameSuffix::Query
            ),
            None
        );
        assert_eq!(
            create_name_wrapper(
                "Test",
                "/data/user/ReactFile.js",
                DefinitionNameSuffix::Query
            ),
            Some("ReactFileTestQuery".to_string())
        );
    }
}
