const { exit } = require('process');

const execSync = require('child_process').execSync;
const incident = process.argv[2];
if (!incident)
  console.error("ERROR: Specify a model to simulate when using `npm run model` For example, `npm run model 1-buildkite`");
else
  execSync(`ts-node ${incident}/incident.ts`, { stdio: [0, 1, 2] });