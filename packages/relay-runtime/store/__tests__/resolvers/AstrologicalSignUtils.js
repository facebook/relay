/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

/**
 * Utility functions used to back our example of a client-only GraphQL types.
 */

export type AstrologicalSignID =
  | 'Aquarius'
  | 'Pisces'
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn';

// Data that we know about a given astrological sign on the client.
export type ClientAstrologicalSignData = {
  name: string,
  house: number,
  oppositeSignId: AstrologicalSignID,
};

const OPPOSITES = {
  Aries: 'Libra',
  Libra: 'Aries',
  Taurus: 'Scorpio',
  Scorpio: 'Taurus',
  Gemini: 'Sagittarius',
  Sagittarius: 'Gemini',
  Cancer: 'Capricorn',
  Capricorn: 'Cancer',
  Leo: 'Aquarius',
  Aquarius: 'Leo',
  Virgo: 'Pisces',
  Pisces: 'Virgo',
} as const;

const HOUSE_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

function findSign(month: number, day: number): AstrologicalSignID {
  const days = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22];
  const signs: AstrologicalSignID[] = [
    'Aquarius',
    'Pisces',
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
  ];

  const dayIndex = day - 1;
  const monthIndex = month - 1;
  let index = monthIndex;
  if (monthIndex === 0 && dayIndex <= 20) {
    index = 11;
  } else if (dayIndex < days[monthIndex]) {
    index = monthIndex - 1;
  }
  return signs[index];
}

function getOpposite(id: AstrologicalSignID): AstrologicalSignID {
  return OPPOSITES[id];
}

function getHouse(id: AstrologicalSignID): number {
  return HOUSE_ORDER.indexOf(id) + 1;
}

module.exports = {findSign, getOpposite, getHouse, HOUSE_ORDER};
