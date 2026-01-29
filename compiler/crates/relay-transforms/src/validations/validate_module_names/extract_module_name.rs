/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::path::Path;
use std::path::PathBuf;

/// Extract the module name from a path. This is the required prefix for
/// query, fragment, subscription and mutation names.
pub fn extract_module_name(path: &str) -> Option<String> {
    let path = PathBuf::from(path);
    let final_segment = get_final_non_index_js_segment(&path)?;
    let mut iter = final_segment.split('.');
    let mut first_segment = to_camel_case(iter.next()?.to_string());
    let mobile_platform = iter.find_map(|item| {
        if item == "ios" {
            return Some("Ios");
        } else if item == "android" {
            return Some("Android");
        }
        None
    });
    if let Some(mobile_platform) = mobile_platform {
        first_segment.push_str(mobile_platform);
    }
    Some(first_segment)
}

fn get_final_non_index_js_segment(path: &Path) -> Option<&str> {
    let file_stem = path.file_stem()?.to_str();
    if file_stem.is_some_and(|f| f == "index" || f.starts_with("index.")) {
        let mut iter = path.iter();
        iter.next_back()?;
        iter.next_back().and_then(|os_str| os_str.to_str())
    } else {
        file_stem
    }
}

/// Converts a `String` to a camel case `String`
fn to_camel_case(non_camelized_string: String) -> String {
    // Emulate the following regex, from the Javascript implementation:
    // moduleName = moduleName.replace(/[^a-zA-Z0-9]+(\w?)/g, (match, next) =>
    //     next.toUpperCase(),
    // );

    let mut camelized_string = String::with_capacity(non_camelized_string.len());
    let mut last_character_was_not_alphanumeric = false;
    for ch in non_camelized_string.chars() {
        if !ch.is_alphanumeric() {
            last_character_was_not_alphanumeric = true;
        } else if last_character_was_not_alphanumeric {
            camelized_string.push(ch.to_ascii_uppercase());
            last_character_was_not_alphanumeric = false;
        } else {
            camelized_string.push(ch);
            last_character_was_not_alphanumeric = false;
        }
    }
    camelized_string
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(not(windows))]
    #[test]
    fn extract_module_names_test() {
        assert_eq!(
            extract_module_name("/path/Button.ios.js"),
            Some("ButtonIos".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.android.js"),
            Some("ButtonAndroid".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.hooks.android.js"),
            Some("ButtonAndroid".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.react.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.react-test.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.react-test.jsx"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.react.example.jsx"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.react-snapshot-test.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.kit.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.hooks.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.brands.react.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Button.my.custom.suffix.js"),
            Some("Button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/Slider.ios.js"),
            Some("SliderIos".to_string())
        );
        assert_eq!(
            extract_module_name("/path/TypeScript.ts"),
            Some("TypeScript".to_string())
        );
        assert_eq!(
            extract_module_name("/path/TypeScript.tsx"),
            Some("TypeScript".to_string())
        );
        assert_eq!(
            extract_module_name("/path/TypeScript/index.ts"),
            Some("TypeScript".to_string())
        );
        assert_eq!(
            extract_module_name("/path/TypeScript/index.tsx"),
            Some("TypeScript".to_string())
        );
        assert_eq!(
            extract_module_name("/path/button/index.js"),
            Some("button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/button/index.react.js"),
            Some("button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/button/index.jsx"),
            Some("button".to_string())
        );
        assert_eq!(
            extract_module_name("/path/foo-bar/index.js"),
            Some("fooBar".to_string())
        );
        assert_eq!(
            extract_module_name("/path/foo-bar-baz.js"),
            Some("fooBarBaz".to_string())
        );
        assert_eq!(
            extract_module_name("/path/non-numeric-end-.js"),
            Some("nonNumericEnd".to_string())
        );
        assert_eq!(
            extract_module_name("/path/__tests__/index.test.js"),
            Some("Tests".to_string())
        );
        assert_eq!(
            extract_module_name("/path/button/indexButton.js"),
            Some("indexButton".to_string())
        );
    }

    #[cfg(windows)]
    #[test]
    fn extract_module_names_test() {
        assert_eq!(
            extract_module_name("C:\\path\\Button.ios.js"),
            Some("ButtonIos".to_string())
        );
        assert_eq!(
            extract_module_name("\\path\\Button.android.js"),
            Some("ButtonAndroid".to_string())
        );
    }
}
