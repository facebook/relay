/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use md5::Digest;
use md5::Md5;
use schemars::JsonSchema;
use serde::Deserialize;
use serde::Serialize;
use thiserror::Error;

/// A utility to enable gradual rollout of large codegen changes.
/// Can be constructed as the Default which passes or a percentage between 0 and
/// 100. Percentages may be fractional with up to two decimal places (e.g.
/// `12.5`), which allows rolling out a change to very large projects in steps
/// smaller than 1%.
#[derive(
    Default,
    Debug,
    Serialize,
    Deserialize,
    Clone,
    Copy,
    PartialEq,
    JsonSchema
)]
#[serde(try_from = "Option<f32>")]
#[schemars(extend("minimum" = 0, "maximum" = 100))]
pub struct Rollout(pub Option<f32>);

/// A rollout percentage outside 0 to 100 (or NaN).
#[derive(Debug, Error)]
#[error("Expected a rollout percentage between 0 and 100, inclusive, but got {0}")]
pub struct InvalidRolloutPercentage(f32);

impl TryFrom<Option<f32>> for Rollout {
    type Error = InvalidRolloutPercentage;

    fn try_from(percentage: Option<f32>) -> Result<Self, Self::Error> {
        match percentage {
            Some(p) if !(0.0..=100.0).contains(&p) => Err(InvalidRolloutPercentage(p)),
            _ => Ok(Self(percentage)),
        }
    }
}

impl Rollout {
    /// Checks some key deterministically and passes on average the given
    /// percentage of the rollout.
    /// A typical key to pass in could be the fragment or operation name.
    pub fn check(&self, key: impl AsRef<[u8]>) -> bool {
        let Some(percentage) = self.0 else {
            return true;
        };
        let hash = Md5::digest(key.as_ref());
        // The whole-percent bucket comes first, so a whole-number percentage
        // selects exactly the keys it did when rollouts were integers.
        let bucket = u32::from(u16::from_le_bytes([hash[0], hash[1]]) % 100) * 100
            + u32::from(u16::from_le_bytes([hash[2], hash[3]]) % 100);
        bucket < (percentage * 100.0).round() as u32
    }
}

/// A utility to enable gradual rollout of large codegen changes. Allows you to
/// specify a range of percentages to rollout.
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, JsonSchema)]
pub struct RolloutRange {
    pub start: u8,
    pub end: u8,
}

impl RolloutRange {
    /// Checks some key deterministically and passes on average the given
    /// percentage of the rollout.
    /// A typical key to pass in could be the fragment or operation name.
    pub fn check(&self, key: impl AsRef<[u8]>) -> bool {
        let hash = Md5::digest(key.as_ref());
        let hash: u16 = ((hash[1] as u16) << 8) | (hash[0] as u16);
        let percent = hash % 100;
        (percent) <= (self.end as u16) && (percent) >= (self.start as u16)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn keys() -> impl Iterator<Item = String> {
        (0..20_000).map(|i| format!("Key{i}"))
    }

    /// The bucketing used before fractional percentages were supported.
    fn legacy_check(percentage: u8, key: &str) -> bool {
        let hash = Md5::digest(key.as_bytes());
        let hash: u16 = ((hash[1] as u16) << 8) | (hash[0] as u16);
        (hash % 100) < (percentage as u16)
    }

    #[test]
    fn whole_percentages_select_the_same_keys_as_before() {
        for percentage in [0u8, 1, 37, 50, 99, 100] {
            let rollout = Rollout(Some(percentage as f32));
            for key in keys() {
                assert_eq!(
                    rollout.check(&key),
                    legacy_check(percentage, &key),
                    "{percentage}% should select {key} exactly as the integer rollout did",
                );
            }
        }
    }

    #[test]
    fn fractional_percentage_is_between_its_neighbors() {
        let lower = Rollout(Some(37.0));
        let fractional = Rollout(Some(37.5));
        let upper = Rollout(Some(38.0));
        for key in keys() {
            // A key in 37% is also in 37.5%, and a key in 37.5% is also in 38%.
            assert!(!lower.check(&key) || fractional.check(&key), "{key}");
            assert!(!fractional.check(&key) || upper.check(&key), "{key}");
        }
    }

    #[test]
    fn fractional_percentage_selects_roughly_that_share() {
        let count = keys().filter(|key| Rollout(Some(37.5)).check(key)).count();
        // 37.5% of 20,000 keys is 7,500.
        assert!((7_200..=7_800).contains(&count), "selected {count}");
    }

    #[test]
    fn half_percent_selects_part_of_the_first_bucket() {
        let half = keys().filter(|key| Rollout(Some(0.5)).check(key)).count();
        let one = keys().filter(|key| Rollout(Some(1.0)).check(key)).count();
        // 0.5% of 20,000 keys is 100; 1% is 200.
        assert!(
            half > 0 && half < one,
            "0.5% selected {half}, 1% selected {one}"
        );
    }

    #[test]
    fn config_accepts_percentages_from_0_to_100() {
        for json in ["0", "0.5", "100", "null"] {
            assert!(
                serde_json::from_str::<Rollout>(json).is_ok(),
                "{json} should parse"
            );
        }
    }

    #[test]
    fn config_rejects_percentages_outside_0_to_100() {
        // A missed decimal point (`1000` for `10.00`) must not silently enable the feature everywhere.
        for json in ["-1", "100.5", "1000"] {
            assert!(
                serde_json::from_str::<Rollout>(json).is_err(),
                "{json} should be rejected"
            );
        }
        assert!(
            Rollout::try_from(Some(f32::NAN)).is_err(),
            "NaN should be rejected"
        );
    }

    #[test]
    fn default_rollout_passes_every_key() {
        assert!(keys().all(|key| Rollout(None).check(key)));
    }
}
