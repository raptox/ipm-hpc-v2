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
let associatedColors = [];
let othersColor;
let applicationColor;

export const parseData = (filename, callback) => {
  parseXml(filename, result => {
    let colorsIndex = 0;
    //console.log(`${filename}:`);
    let taskdata = result[ROOT_ITEM].task;
    let data = {};

    // get raw data first
    data.metadata = getMetadata(taskdata[0]);
    data.hosts = getHosts(taskdata);
    data.mpiData = getMpiData(taskdata);
    if (!othersColor) othersColor = getRandomColors();
    if (!applicationColor) applicationColor = getRandomColors();

    // evaluation
    data.mpiPies = getMpiPieCharts(data.mpiData, data.metadata.totalWallTime);
    data.hpmData = getHpmData(taskdata);
    data.balanceData = generateBalanceChartData(data.mpiData.mpiCallsByTask);
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

const generateBalanceChartData = mpiCallsByTask => {
  if (Array.isArray(mpiCallsByTask) && mpiCallsByTask.length !== 0) {
    let balanceData = {
      labels: mpiCallsByTask.map(task => task.nr),
      datasets: []
    };

    for (let mpiCallKey in mpiCallsByTask[0].mpiCalls) {
      let mpiCall = mpiCallsByTask[0].mpiCalls[mpiCallKey];
      let dataset = mpiCallsByTask.map(task => task.mpiCalls[mpiCallKey].ttot);
      //.sort((callA, callB) => callB - callA);
      balanceData.datasets.push({
        label: mpiCall.call,
        fill: false,
        backgroundColor: mpiCall.color,
        borderColor: mpiCall.color,
        pointHoverBackgroundColor: mpiCall.hoverColor,
        data: dataset
      });
    }

    return balanceData;
  } else {
    return {};
  }
};

const getHpmData = taskdata => {
  let hpmData = [];
  try {
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
  } catch (e) {
    // could not read hpm data
    console.log(e);
  }
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

  for (let mpiCallKey in mpiData.mpiCallsSummarized) {
    let mpiCall = mpiData.mpiCallsSummarized[mpiCallKey];

    // mpi percent pie
    let value = (mpiCall.ttot / mpiData.mpiAnalysis.totalTime) * 100;
    if (value >= 1) {
      mpiPieCharts.mpiPercent.datasets[0].data.push(value.toFixed(2));
      mpiPieCharts.mpiPercent.labels.push(mpiCall.call);
      mpiPieCharts.mpiPercent.datasets[0].backgroundColor.push(mpiCall.color);
      mpiPieCharts.mpiPercent.datasets[0].hoverBackgroundColor.push(
        mpiCall.hoverColor
      );
    } else {
      othersData += parseFloat(value);
    }

    // mpi wall time pie
    let value2 = (mpiCall.ttot / totalWallTime) * 100;
    if (value2 >= 1) {
      mpiPieCharts.mpiWall.datasets[0].data.push(value2.toFixed(2));
      mpiPieCharts.mpiWall.labels.push(mpiCall.call);
      mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(mpiCall.color);
      mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(
        mpiCall.hoverColor
      );
    } else {
      othersSummarizedData += parseFloat(value2);
    }
  }

  // add others to pie chart
  if (othersData != 0) {
    mpiPieCharts.mpiPercent.datasets[0].data.push(othersData.toFixed(2));
    mpiPieCharts.mpiPercent.labels.push('others');
    mpiPieCharts.mpiPercent.datasets[0].backgroundColor.push(othersColor.color);
    mpiPieCharts.mpiPercent.datasets[0].hoverBackgroundColor.push(
      othersColor.hover
    );
  }

  if (othersSummarizedData != 0) {
    mpiPieCharts.mpiWall.datasets[0].data.push(othersSummarizedData.toFixed(2));
    mpiPieCharts.mpiWall.labels.push('others');
    mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(othersColor.color);
    mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(
      othersColor.hover
    );
  }

  // also add rest of app time at mpi wall time pie
  let appTimeValue = (
    ((totalWallTime - mpiData.mpiAnalysis.totalTime) / totalWallTime) *
    100
  ).toFixed(2);
  mpiPieCharts.mpiWall.datasets[0].data.push(appTimeValue);
  mpiPieCharts.mpiWall.labels.push('Apllication');
  mpiPieCharts.mpiWall.datasets[0].backgroundColor.push(applicationColor.color);
  mpiPieCharts.mpiWall.datasets[0].hoverBackgroundColor.push(
    applicationColor.hover
  );

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
  let mpiCallsByTask = [];

  try {
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
          mpiCallsSummarized.push(newMpiCall(hent.$.call, ttot, count));
        }

        // MPI calls by task
        let mpiCallsByTaskExists = mpiCallsByTask.find(
          task => task.nr === taskKey
        );
        if (mpiCallsByTaskExists) {
          mpiCallsByTaskExists.ttot += ttot;

          // add mpi call to existing task
          let mpiCallExists = mpiCallsByTaskExists.mpiCalls.find(
            entry => entry.call === hent.$.call
          );
          if (mpiCallExists) {
            mpiCallExists.ttot += ttot;
            mpiCallExists.count += count;
          } else {
            mpiCallsByTaskExists.mpiCalls.push(
              newMpiCall(hent.$.call, ttot, count)
            );
          }
        } else {
          // create new task
          let newTask = {};
          newTask.nr = taskKey;
          newTask.ttot = ttot;
          newTask.mpiCalls = [];
          newTask.mpiCalls.push(newMpiCall(hent.$.call, ttot, count));
          mpiCallsByTask.push(newTask);
        }

        // add to general counter and time
        mpiAnalysis.totalTime += ttot;
        mpiAnalysis.totalCount += count;
      }
    }
    // sort descending after total time
    mpiCalls.sort((callA, callB) => callB.ttot - callA.ttot);
    mpiCallsSummarized.sort((callA, callB) => callB.ttot - callA.ttot);
    mpiCallsByTask.sort((taskA, taskB) => taskB.ttot - taskA.ttot);
  } catch (e) {
    console.log(e);
  }

  return {
    mpiCalls,
    mpiCallsSummarized,
    mpiAnalysis,
    mpiCallsByTask
  };
};

const newMpiCall = (call, ttot, count) => {
  let mpiCall = {};
  mpiCall.call = call;
  mpiCall.ttot = ttot;
  mpiCall.count = count;

  let associatedColor = associatedColors.find(mpiCall => mpiCall.call === call);
  if (!associatedColor) {
    // assign new color to this MPI call
    let colors = getRandomColors();
    associatedColor = {};
    associatedColor.call = call;
    associatedColor.color = colors.color;
    associatedColor.hover = colors.hover;
    associatedColors.push(associatedColor);
  }
  mpiCall.color = associatedColor.color;
  mpiCall.hoverColor = associatedColor.hover;

  return mpiCall;
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
