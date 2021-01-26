/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// Escape graphql text
pub fn escape(text: &str, output: &mut String) {
    for char in text.chars() {
        match char {
            '\n' => output.push_str("\\n"),
            '"' => output.push_str("\\\""),
            '\\' => output.push_str("\\\\"),
            '\t' => output.push_str("\\t"),
            '\r' => output.push_str("\\r"),
            _ => output.push(char),
        }
    }
}

#[test]
fn test_escape() {
    let input = r#"query Query(
  $unixname: String!
  $passcode: String!
) @owner(oncall: "oncall") {
  auth_2fa {
    is_auth(unixname: $unixname, passcode: $passcode)
  }
}
"#;
    let expected = r#"query Query(\n  $unixname: String!\n  $passcode: String!\n) @owner(oncall: \"oncall\") {\n  auth_2fa {\n    is_auth(unixname: $unixname, passcode: $passcode)\n  }\n}\n"#;
    let mut output = String::new();
    escape(input, &mut output);
    assert_eq!(output, expected)
}
