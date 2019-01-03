/* eslint-disable */

// libs
const fs = require('fs');
const util = require('util');
const parseString = require('xml2js').parseString;

// files
const ipmRawPath = '../../ipm_raw/';
const ipmRawFiles = [
  'pin1008.xml',
  'sin1008.xml',
  'MDFT_03.ipm.xml',
  'MDFT_04.ipm.xml',
  'MDFT_05.ipm.xml'
];

// constants
const ROOT_ITEM = 'ipm_job_profile';

// functions
function parseXml(file, callback) {
  fs.readFile(file, (err, data) => {
    parseString(data, (err, result) => callback(result));
  });
}

function saveJSONtoFile(file, json) {
  fs.writeFile(file, JSON.stringify(json), err => {
    if (err) console.log(err);
  });
}

// main
ipmRawFiles.forEach(fileName => {
  let file = ipmRawPath + fileName;
  parseXml(file, result => {
    console.log(`${file}:`);
    let taskdata = result[ROOT_ITEM].task[0];
    var metadata = {};
    metadata.id = taskdata.job[0]._;
    metadata.cmd = taskdata.cmdline[0]._;
    metadata.codename = '';
    metadata.username = taskdata.$.username;
    metadata.host =
      taskdata.host[0]._ + ' (' + taskdata.host[0].$.mach_info + ')';
    metadata.start = taskdata.$.stamp_init;
    metadata.stop = taskdata.$.stamp_final;
    metadata.totalMemory = '';
    metadata.switchSend = '';
    metadata.state = '';
    metadata.group = taskdata.$.groupname;
    metadata.mpiTasks = '';
    metadata.wallClock = '';
    metadata.comm = '';
    metadata.totalGflopSec = '';
    metadata.switchRecv = '';
    console.dir(metadata);
  });
});
