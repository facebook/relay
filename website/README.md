# Prerequisites

Install the supporting infrastructure.

```
# in relay/website
yarn install
```

# Developing

Launch a development server that you can use to preview edits.

```
yarn start
# Then open http://localhost:8080/relay/
```

Anytime you change the contents, just refresh the page to rebuild the site.

# Publish the website

## First time setup

The publish script expects you to have two sibling folders named `relay` and `relay-gh-pages`.

```
# From relay/website/
(
  cd ../../
  git clone git@github.com:facebook/relay.git relay-gh-pages
  cd relay-gh-pages
  git checkout gh-pages
)
```

## Building

It's important that you run the server and hit the site at least once before you build. See ‘Developing,’ above. After that's done, build the website.

```
# From relay/
./website/publish.sh
```

## Publishing

The build system has now built the website into `relay-gh-pages`. All that's left to do is to check it over, commit it, and push it to `origin/gh-pages`.

```
cd ../../relay-gh-pages
git status # Check it over to see if the changes look right
git diff --word-diff=color  # Or go over it in detail
git add --all && git commit -m "Updating the website"
git push
```
