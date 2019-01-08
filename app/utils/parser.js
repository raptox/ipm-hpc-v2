/* eslint-disable */

const fs = require('fs');
const parseString = require('xml2js').parseString;

const ROOT_ITEM = 'ipm_job_profile';

export const parseData = (filename, callback) => {
  parseXml(filename, result => {
    console.log(`${filename}:`);
    let taskdata = result[ROOT_ITEM].task;
    let data = {};
    fs.writeFile('log.json', JSON.stringify(result, null, 2), err => {
      console.log(err);
    });
    // data.metadata = getMetadata(taskdata);
    data.hosts = getHosts(taskdata);
    callback(JSON.stringify(data, null, 2));
  });
};

const getHosts = taskdata => {
  let hosts = [];
  for (let taskKey in taskdata) {
    let task = taskdata[taskKey];
    let hostExists = hosts.find(host => host.name === task.host[0]._);
    if (hostExists) {
      hostExists.tasks.push(task.$.mpi_rank);
    } else {
      hosts.push(newHost(task));
    }
  }
  return hosts;
};

const newHost = task => {
  let host = {};
  host.name = task.host[0]._;
  host.mach_name = task.host[0].$.mach_name;
  host.mach_info = task.host[0].$.mach_info;
  host.tasks = [task.$.mpi_rank];
  return host;
};

// function getMetadata(taskdata) {
//     let metadata = {};
//     metadata.id = taskdata.job[0]._;
//     metadata.cmd = taskdata.cmdline[0]._;
//     metadata.codename = '';
//     metadata.username = taskdata.$.username;
//     metadata.host =
//       taskdata.host[0]._ + ' (' + taskdata.host[0].$.mach_info + ')';
//     metadata.start = taskdata.$.stamp_init;
//     metadata.stop = taskdata.$.stamp_final;
//     metadata.totalMemory = '';
//     metadata.switchSend = '';
//     metadata.state = '';
//     metadata.group = taskdata.$.groupname;
//     metadata.mpiTasks = '';
//     metadata.wallClock = '';
//     metadata.comm = '';
//     metadata.totalGflopSec = '';
//     metadata.switchRecv = '';
//     return metadata
// }

function parseXml(file, callback) {
  fs.readFile(file, (err, data) => {
    parseString(data, (err, result) => callback(result));
  });
}
