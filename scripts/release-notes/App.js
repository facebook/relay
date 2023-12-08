/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

/* eslint-disable react/react-in-jsx-scope*/

const {useEffect, useState} = React;

const CATEGORIES = [
  ['BUGFIX', 3],
  ['IMPROVEMENTS', 4],
  ['DOCS', 5],
  ['NEW_API', 2],
  ['BREAKING', 1],
  ['MISC', 6],
  ['EXPERIMENTAL', 7],
];

const CommitCard = ({
  message,
  summary,
  author,
  date,
  selectedCategory,
  onCategoryChange,
}) => {
  const handleClick = event => {
    const category = CATEGORIES.findIndex(cat => cat[0] === selectedCategory);
    let nextCategory;
    if (event.type === 'contextmenu') {
      event.preventDefault();
      nextCategory = -1;
    } else {
      nextCategory = category + 1;
      if (nextCategory == CATEGORIES.length) {
        nextCategory = -1; // Reset selected category
      }
    }
    onCategoryChange(nextCategory > -1 ? CATEGORIES[nextCategory][0] : null);
  };

  return (
    <button
      className={`commit ${selectedCategory}`}
      onClick={handleClick}
      onContextMenu={handleClick}>
      <p className="summary">{summary}</p>
      <p className="author">{author}</p>
    </button>
  );
};

// eslint-disable-next-line no-unused-vars
function App({commits, lastRelease}) {
  let initialState = localStorage.getItem('selectedCategories');
  if (initialState != null) {
    initialState = JSON.parse(initialState);
  } else {
    initialState = {};
  }
  const [selectedCategories, setSelectedCategories] = useState(initialState);
  useEffect(() => {
    localStorage.setItem(
      'selectedCategories',
      JSON.stringify(selectedCategories),
    );
  }, [selectedCategories]);

  return (
    <>
      <h1>Relay commits since {lastRelease}</h1>
      <div className="instructions">
        <p>
          Click on the commit card to change it's category. Possible categories
          are:{' '}
        </p>
        <Categories />
      </div>
      <div className="layout">
        <section className="commits">
          {commits.map((commit, index) => {
            return (
              <CommitCard
                key={index}
                message={commit.message}
                summary={commit.summary}
                author={commit.author}
                date={commit.date}
                selectedCategory={selectedCategories[commit.hash]}
                onCategoryChange={category => {
                  setSelectedCategories({
                    ...selectedCategories,
                    [commit.hash]: category,
                  });
                }}
              />
            );
          })}
        </section>
        <section className="release_notes">
          <GeneratedReleaseNotes
            lastRelease={lastRelease}
            commits={commits}
            selectedCategories={selectedCategories}
          />
        </section>
      </div>
    </>
  );
}

function Categories() {
  return (
    <ul className="categories">
      {CATEGORIES.map(([category]) => {
        return (
          <li className={`category ${category}`} key={category}>
            {category}
          </li>
        );
      })}
    </ul>
  );
}

function GeneratedReleaseNotes({commits, selectedCategories, lastRelease}) {
  const categorizedCommits = new Map();
  const categories = Array.from(CATEGORIES);
  categories
    .sort(([, orderA], [, orderB]) => orderA - orderB)
    .forEach(([category]) => {
      categorizedCommits.set(category, []);
    });

  let hasBreakingChanges = false;
  let hasNewApi = false;

  commits.forEach(commit => {
    const commitCategory = selectedCategories[commit.hash];
    if (commitCategory != null) {
      const categoryCommits = categorizedCommits.get(commitCategory);
      if (categoryCommits != null) {
        categoryCommits.push(commit);
        if (commitCategory === 'BREAKING') {
          hasBreakingChanges = true;
        }
        if (commitCategory === 'NEW_API') {
          hasNewApi = true;
        }
      }
    }
  });

  return (
    <div className="release_notes_content">
      <h1>
        Version {nextReleaseVersion(lastRelease, hasBreakingChanges, hasNewApi)}{' '}
        Release Notes
      </h1>
      <div>
        {Array.from(categorizedCommits).map(([category, commits]) => {
          if (commits.length) {
            return (
              <div key={category}>
                <h2>{category}</h2>
                <ul>
                  {commits.map(commit => {
                    return (
                      <li key={commit.hash}>
                        [{commit.hash}]: {commit.summary} by {commit.author}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
}

function nextReleaseVersion(lastRelease, hasBreakingChanges, hasNewApi) {
  const [major, minor, patch] = lastRelease.replace('v', '').split('.');
  if (hasBreakingChanges) {
    return `${next(major)}.0.0`;
  } else if (hasNewApi) {
    return `${major}.${next(minor)}.0`;
  } else {
    return `${major}.${minor}.${next(patch)}`;
  }
}

function next(versionStr) {
  return parseInt(versionStr, 10) + 1;
}
