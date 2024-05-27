/* eslint-disable @typescript-eslint/no-var-requires */
const AppsyncSetup = require('./appsyncSetup');
const MergeSchema = require('./mergeSchema');

console.log('hook:before:offline:start');
AppsyncSetup();
MergeSchema();