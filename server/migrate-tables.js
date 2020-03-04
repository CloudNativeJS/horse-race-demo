"use strict";
require("events").EventEmitter.defaultMaxListeners = 100;
let app = require("./server");

let datasources = Object.keys(app.dataSources);

console.log(`DataSources: ${datasources}`);

async function migrate() {
  for (let dsName of datasources) {
    let ds = app.dataSources[dsName];
    try {
      await ds.automigrate();
      await ds.disconnect();
      console.log(`'${dsName}' is migrated.\n`);
    } catch (e) {
      throw e;
    }
  }
}

migrate();
