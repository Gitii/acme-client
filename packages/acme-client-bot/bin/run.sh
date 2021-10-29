#!/usr/bin/env node

require('source-map-support').install();

const { main } = require("../dist/index.js");

main().catch((e) => {
  console.log(e);
  process.exit(1);
});