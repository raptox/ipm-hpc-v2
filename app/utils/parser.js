/* eslint-disable */

const fs = require('fs');
const parseString = require('xml2js').parseString;

const ROOT_ITEM = 'ipm_job_profile';
const colors = [
  [114, 147, 203],
  [225, 151, 76],
  [132, 186, 91],
  [211, 94, 96],
  [128, 133, 133],
  [144, 103, 167],
  [171, 104, 87],
  [204, 194, 16],
  [57, 106, 177],
  [218, 124, 48],
  [62, 150, 81],
  [204, 37, 41],
  [83, 81, 84],
  [107, 76, 154],
  [146, 36, 40],
  [148, 139, 61]
];
let colorsIndex = 0;

export const parseData = (filename, callback) => {
  parseXml(filename, result => {
    let colorsIndex = 0;
    //console.log(`${filename}:`);
    let taskdata = result[ROOT_ITEM].task;
    let data = {};
    data.metadata = getMetadata(taskdata[0]);
    data.hosts = getHosts(taskdata);
    data.mpiData = getMpiData(taskdata);
    data.mpiPies = getMpiPieCharts(data.mpiData, data.metadata.totalWallTime);
    data.hpmData = getHpmData(taskdata);
    // save raw parsed JSON to file
    //
    // fs.writeFile('log.json', JSON.stringify(result, null, 2), err => {
    //   if (err) {
    //     console.log(err);
    //     process.exit(1);
    //   }
    // });
    callback(JSON.stringify(data, null, 2));
  });
};

const getHpmData = taskdata => {
  let hpmData = [];
  for (let taskKey in taskdata) {
    let task = taskdata[taskKey];
    let hpm = task.regions[0].region[0].hpm[0].counter;
    for (let index in hpm) {
      let name = hpm[index].$.name;
      let counter = parseInt(hpm[index]._);
      let hpmFound = hpmData.find(data => data.name === name);
      if (hpmFound) {
        hpmFound.counter += counter;
        hpmFound.ncalls += 1;
        // get min
        if (counter < hpmFound.min) {
          hpmFound.min = counter;
        }
        // get max
        if (counter > hpmFound.max) {
          hpmFound.max = counter;
        }
      } else {
        let newHpmData = {
          name: name,
          counter: counter,
          min: counter,
          max: counter,
          ncalls: 1
        };
        hpmData.push(newHpmData);
      }
    }
  }

  hpmData.sort((a, b) => b.counter - a.counter);
  return hpmData;
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

  let othersData = 0.0;
  let othersSummarizedData = 0.0;
  let colors = null;

  for (let mpiCallKey in mpiData.mpiCallsSummarized) {
    let mpiCall = mpiData.mpiCallsSummarized[mpiCallKey];
    colors = null;

    // mpi percent pie
    let value = ((mpiCall.ttot / mpiData.mpiAnalysis.totalTime) * 100).toFixed(
      2
    );
    if (value >= 1) {
      if (!colors) {
        colors = getRandomColors();
      }
      mpiPieCharts.mpiPercent.datasets[0].data.push(value);
      mpiPieCharts.mpiPercent.labels.push(mpiCall.call);
      mpiPieCharts.mpiPercent.datasets[0].backgroundColor.push(colors.color);
      mpiPieCharts.mpiPercent.datasets[0].hoverBackgroundColor.push(
        colors.hover
      );
    } else {
      othersData += parseFloat(value);
    }

    // mpi wall time pie
    let value2 = ((mpiCall.ttot / totalWallTime) * 100).toFixed(2);
    if (value2 >= 1) {
      if (!colors) {
        colors = getRandomColors();
      }
      mpiPieCharts.mpiWall.datasets[0].data.push(value2);
      mpiPieCharts.mpiWall.labels.push(mpiCall.call);
      mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(colors.color);
      mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(colors.hover);
    } else {
      othersSummarizedData += parseFloat(value2);
    }
  }

  // add others to pie chart
  colors = null;

  if (othersData != 0) {
    if (!colors) {
      colors = getRandomColors();
    }
    mpiPieCharts.mpiPercent.datasets[0].data.push(othersData.toFixed(2));
    mpiPieCharts.mpiPercent.labels.push('others');
    mpiPieCharts.mpiPercent.datasets[0].backgroundColor.push(colors.color);
    mpiPieCharts.mpiPercent.datasets[0].hoverBackgroundColor.push(colors.hover);
  }

  if (othersSummarizedData != 0) {
    if (!colors) {
      colors = getRandomColors();
    }
    mpiPieCharts.mpiWall.datasets[0].data.push(othersSummarizedData.toFixed(2));
    mpiPieCharts.mpiWall.labels.push('others');
    mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(colors.color);
    mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(colors.hover);
  }

  // also add rest of app time at mpi wall time pie
  let appTimeValue = (
    ((totalWallTime - mpiData.mpiAnalysis.totalTime) / totalWallTime) *
    100
  ).toFixed(2);
  colors = getRandomColors();
  mpiPieCharts.mpiWall.datasets[0].data.push(appTimeValue);
  mpiPieCharts.mpiWall.labels.push('Apllication');
  mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(colors.color);
  mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(colors.hover);

  return mpiPieCharts;
};

const getRandomColors = () => {
  let r = colors[colorsIndex][0];
  let g = colors[colorsIndex][1];
  let b = colors[colorsIndex][2];
  // set random colors
  // let r = Math.floor(Math.random() * 200);
  // let g = Math.floor(Math.random() * 200);
  // let b = Math.floor(Math.random() * 200);
  let color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
  let hover = 'rgb(' + (r + 20) + ', ' + (g + 20) + ', ' + (b + 20) + ')';
  colorsIndex = (colorsIndex + 1) % colors.length;
  return {
    color,
    hover
  };
};

const getMpiData = taskdata => {
  let mpiCalls = [];
  let mpiAnalysis = {
    totalTime: 0.0,
    totalCount: 0
  };
  let mpiCallsSummarized = [];

  for (let taskKey in taskdata) {
    let task = taskdata[taskKey];
    let hentdata = task.hash[0].hent;
    for (let hentKey in hentdata) {
      // extract values
      let hent = hentdata[hentKey];
      let values = hent._.match(/(.*) (.*) (.*)/);
      let ttot = parseFloat(values[1]);
      let tmin = parseFloat(values[2]);
      let tmax = parseFloat(values[3]);
      let bytes = parseInt(hent.$.bytes);
      let count = parseInt(hent.$.count);

      // MPI calls separated by bytes size
      let mpiCallExists = mpiCalls.find(
        entry =>
          entry.call === hent.$.call && entry.bytes === parseInt(hent.$.bytes)
      );
      if (mpiCallExists) {
        // add to existing call
        mpiCallExists.ttot += ttot;
        mpiCallExists.count += count;
      } else {
        // create new mpi call
        let mpiCall = {};
        mpiCall.call = hent.$.call;
        mpiCall.ttot = ttot;
        mpiCall.tmin = tmin;
        mpiCall.tmax = tmax;
        mpiCall.bytes = bytes;
        mpiCall.count = count;
        mpiCalls.push(mpiCall);
      }

      // MPI calls summarized
      let mpiCallSummarizedExists = mpiCallsSummarized.find(
        entry => entry.call === hent.$.call
      );
      if (mpiCallSummarizedExists) {
        // add to existing call
        mpiCallSummarizedExists.ttot += ttot;
        mpiCallSummarizedExists.count += count;
      } else {
        // create new mpi call
        let mpiCall = {};
        mpiCall.call = hent.$.call;
        mpiCall.ttot = ttot;
        mpiCall.count = count;
        mpiCallsSummarized.push(mpiCall);
      }

      // add to general counter and time
      mpiAnalysis.totalTime += ttot;
      mpiAnalysis.totalCount += count;
    }
  }

  // sort descending after total time
  mpiCalls.sort((callA, callB) => callB.ttot - callA.ttot);
  mpiCallsSummarized.sort((callA, callB) => callB.ttot - callA.ttot);

  return {
    mpiCalls,
    mpiCallsSummarized,
    mpiAnalysis
  };
};

const getMetadata = firstTask => {
  let metadata = {};
  metadata.username = firstTask.$.username;
  metadata.start = parseFloat(firstTask.$.stamp_init);
  metadata.stop = parseFloat(firstTask.$.stamp_final);
  metadata.walltime = (metadata.stop - metadata.start).toFixed(6);
  metadata.ntasks = parseInt(firstTask.job[0].$.ntasks);
  metadata.nhosts = parseInt(firstTask.job[0].$.nhosts);
  metadata.totalWallTime = metadata.walltime * metadata.ntasks;
  metadata.env = firstTask.env;
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
