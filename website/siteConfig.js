/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  // {
  //   caption: "Some Site That Uses Relay",
  //   image: "/img/alogo.png",
  //   infoLink: "https://www.weloverelay.io",
  //   pinned: true
  // }
];

const siteConfig = {
  title: "Relay",
  tagline: "A JavaScript framework for building data-driven React applications",
  url: "https://facebook.github.io/relay",
  baseUrl: "/",
  projectName: "Relay",
  cname: "xxx.xxx",
  users,
  editUrl:
    "https://github.com/facebookexperimental/docusaurus/edit/master/docs/",
  headerLinks: [
    { doc: "getting-started", label: "Docs" },
    { page: "help", label: "Support" },
    {
      href: "https://github.com/facebook/relay",
      label: "GitHub"
    },
    { languages: false }
  ],
  headerIcon: "img/relay-white.svg",
  footerIcon: "img/relay.svg",
  favicon: "img/favicon.png",
  // See https://docusaurus.io/docs/search for more information about Aloglia
  // search
  algolia: {
    apiKey: "",
    indexName: ""
  },
  customCssFileName: "relay.css", //the name of your custom css file
  colors: {
    primaryColor: "#f26b00",
    secondaryColor: "#f26b00",
    prismColor: "rgba(242, 107, 0, 0.03)"
  }
};

module.exports = siteConfig;
