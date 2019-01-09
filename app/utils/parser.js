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
    data.metadata = getMetadata(taskdata[0]);
    data.hosts = getHosts(taskdata);
    callback(JSON.stringify(data, null, 2));
  });
};

const getMetadata = firstTask => {
  let metadata = {};
  metadata.username = firstTask.$.username;
  metadata.start = firstTask.$.stamp_init;
  metadata.stop = firstTask.$.stamp_final;
  return metadata;
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

function parseXml(file, callback) {
  fs.readFile(file, (err, data) => {
    parseString(data, (err, result) => callback(result));
  });
}
