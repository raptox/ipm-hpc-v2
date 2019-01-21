/* eslint-disable */

const fs = require('fs');
const parseString = require('xml2js').parseString;

const ROOT_ITEM = 'ipm_job_profile';

export const parseData = (filename, callback) => {
  parseXml(filename, result => {
    console.log(`${filename}:`);
    let taskdata = result[ROOT_ITEM].task;
    let data = {};
    data.metadata = getMetadata(taskdata[0]);
    data.hosts = getHosts(taskdata);
    data.mpiData = getMpiData(taskdata);
    let totalWallTime = (data.metadata.stop - data.metadata.start) * 1000;
    data.mpiPies = getMpiPieCharts(data.mpiData, totalWallTime);
    callback(JSON.stringify(data, null, 2));
  });
};

const getMpiPieCharts = (mpiData, totalWallTime) => {
  let mpiPieCharts = {
    mpiPercent: {
      datasets: [
        {
          data: [], // here comes the numeric data
          backgroundColor: [],
          hoverBackgroundColor: []
        }
      ],
      labels: [] // labels
    },
    mpiWall: {
      datasets: [
        {
          data: [], // here comes the numeric data
          backgroundColor: [],
          hoverBackgroundColor: []
        }
      ],
      labels: [] // labels
    }
  };

  for (let mpiCallKey in mpiData.mpiCalls) {
    let mpiCall = mpiData.mpiCalls[mpiCallKey];

    // mpi percent pie
    let value = ((mpiCall.ttot / mpiData.mpiAnalysis.totalTime) * 100).toFixed(
      2
    );
    mpiPieCharts.mpiPercent.datasets[0].data.push(value);
    mpiPieCharts.mpiPercent.labels.push(mpiCall.call);
    let colors = getRandomColors();
    mpiPieCharts.mpiPercent.datasets[0].backgroundColor.push(colors.color);
    mpiPieCharts.mpiPercent.datasets[0].hoverBackgroundColor.push(colors.hover);

    // mpi wall time pie
    let value2 = ((mpiCall.ttot / totalWallTime) * 100).toFixed(2);
    mpiPieCharts.mpiWall.datasets[0].data.push(value2);
    mpiPieCharts.mpiWall.labels.push(mpiCall.call);
    mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(colors.color);
    mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(colors.hover);
  }

  // also add rest of app time at mpi wall time pie
  let appTimeValue = (
    ((totalWallTime - mpiData.mpiAnalysis.totalTime) / totalWallTime) *
    100
  ).toFixed(2);
  let colors = getRandomColors();
  mpiPieCharts.mpiWall.datasets[0].data.push(appTimeValue);
  mpiPieCharts.mpiWall.labels.push('Apllication');
  mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(colors.color);
  mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(colors.hover);

  return mpiPieCharts;
};

const getRandomColors = () => {
  // set random colors
  let r = Math.floor(Math.random() * 200);
  let g = Math.floor(Math.random() * 200);
  let b = Math.floor(Math.random() * 200);
  let color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
  let hover = 'rgb(' + (r + 20) + ', ' + (g + 20) + ', ' + (b + 20) + ')';
  return { color, hover };
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
  metadata.start = parseFloat(firstTask.$.stamp_init);
  metadata.stop = parseFloat(firstTask.$.stamp_final);
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
