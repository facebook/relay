/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::*;

#[test]
fn test_sign_file() {
    let new_signing_result_1 = sign_file(&format!("# {}\ntest 1", SIGNING_TOKEN));
    assert_eq!(
        new_signing_result_1,
        "# \x40generated SignedSource<<d9b7b52f54978f54b84a0fd48145e470>>\ntest 1"
    );

    let new_signing_result_2 = sign_file(&format!("# {}\ntest 2", SIGNING_TOKEN));
    assert_eq!(
        new_signing_result_2,
        "# \x40generated SignedSource<<4c0c1ae4f5863c72731b2f543e830fd5>>\ntest 2"
    );
}

#[test]
fn test_sign_file_preexisting_token() {
    assert_eq!(
        try_sign_file(
            "# \x40generated SignedSource<<eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee>>\nalready signed test",
        ),
        None
    );
}

#[test]
fn test_sign_file_without_token() {
    assert_eq!(try_sign_file("# \x40generated no-token\nnot signed"), None);
}

#[test]
fn test_is_signed() {
    assert!(!is_signed("unsigned"));
    assert!(!is_signed("\x40generated unsigned"));
    assert!(!is_signed(SIGNING_TOKEN));
    assert!(is_signed(
        "\x40generated SignedSource<<4c0c1ae4f5863c72731b2f543e830fd5>>"
    ));
    let mut signed_string = sign_file(&format!("# {}\ntest", SIGNING_TOKEN));
    assert!(is_signed(&signed_string));
    signed_string.push_str("modified");
    assert!(is_signed(&signed_string));
}

#[test]
fn test_is_valid_signature() {
    let mut signed_string = sign_file(&format!("# {}\ntest", SIGNING_TOKEN));
    assert!(is_valid_signature(&signed_string));
    signed_string.push_str("modified");
    assert!(!is_valid_signature(&signed_string));
    assert!(!is_valid_signature("unsinged"));
}
