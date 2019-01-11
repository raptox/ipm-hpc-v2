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
    data.mpiData = getMpiData(taskdata);
    callback(JSON.stringify(data, null, 2));
  });
};

const getMpiData = taskdata => {
  let mpiCalls = [];
  let mpiAnalysis = {
    totalTime: 0.0,
    totalCount: 0
  };
  for (let taskKey in taskdata) {
    let task = taskdata[taskKey];
    let hentdata = task.hash[0].hent;
    for (let hentKey in hentdata) {
      let hent = hentdata[hentKey];
      let mpiCallExists = mpiCalls.find(entry => entry.call === hent.$.call);
      if (mpiCallExists) {
        let values = hent._.match(/(.*) (.*) (.*)/);
        let ttot = parseFloat(values[1]);
        let tmin = parseFloat(values[2]);
        let tmax = parseFloat(values[3]);
        let bytes = parseInt(hent.$.bytes);
        let count = parseInt(hent.$.count);

        mpiCallExists.ttot += ttot;
        mpiCallExists.tmin += tmin;
        mpiCallExists.tmax += tmax;
        mpiCallExists.bytes += bytes;
        mpiCallExists.count += count;
        mpiAnalysis.totalTime += ttot;
        mpiAnalysis.totalCount += count;
      } else {
        let mpiCall = {};
        mpiCall.call = hent.$.call;
        mpiCall.ttot = 0.0;
        mpiCall.tmin = 0.0;
        mpiCall.tmax = 0.0;
        mpiCall.bytes = 0;
        mpiCall.count = 0;
        mpiCalls.push(mpiCall);
      }
    }
  }
  return { mpiCalls, mpiAnalysis };
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
