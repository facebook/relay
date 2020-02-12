/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#![deny(warnings)]
#![deny(rust_2018_idioms)]
#![deny(clippy::all)]

use crypto::digest::Digest;
use crypto::md5::Md5;
use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref RE: Regex = Regex::new("\x40generated (?:SignedSource<<([a-f0-9]{32})>>)").unwrap();
}

fn hash(data: &str) -> String {
    let mut md5 = Md5::new();
    md5.input_str(data);
    md5.result_str()
}
fn sign(data: &str) -> String {
    data.replace(NEWTOKEN, &format!("SignedSource<<{}>>", hash(data)))
}

pub const NEWTOKEN: &str = "<<SignedSource::*O*zOeWoEQle#+L!plEphiEmie\x40IsG>>";
/// The signing token to be embedded in the file you wish to be signed.
pub const SIGNING_TOKEN: &str = "\x40generated <<SignedSource::*O*zOeWoEQle#+L!plEphiEmie\x40IsG>>";

/// Checks whether a file is signed *without* verifying the signature.
pub fn is_signed(data: &str) -> bool {
    RE.is_match(data)
}

/// Signs a source file which contains a signing token. Signing modifies only
/// the signing token, so the token should be placed inside a comment in order
/// for signing to not change code semantics.
pub fn sign_file(data: &str) -> String {
    assert!(
        data.contains(NEWTOKEN),
        "sign_file(...): Cannot sign file without token {}",
        NEWTOKEN
    );
    sign(data)
}

/// Verifies the signature in a signed file.
pub fn is_valid_signature(data: &str) -> bool {
    if let Some(mat) = RE.find(data) {
        let actual = &data[mat.start() + 25..mat.end() - 2];
        let unsigned = RE.replace(data, SIGNING_TOKEN);
        return hash(&unsigned) == actual;
    }
    false
}

#[cfg(test)]
mod tests;
