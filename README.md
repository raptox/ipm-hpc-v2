# ipm-hpc-v2

Interactive Visualization of MPI Performance Data (Bachelor Thesis).

This project contains the standalone multiplatform desktop app, which can parse and display parsed data.

If you just need the standalone web viewer for displaying already parsed data, then have a look at this project: [Standalone WebViewer](https://github.com/raptox/ipm-hpc-v2-webviewer).

## Developer Information

To setup your dev environment, or build the app yourself, you first need to install [NodeJS](https://nodejs.org/en/download/) and [Yarn](https://yarnpkg.com/en/docs/install).

Run `yarn` to install all dependencies and `yarn dev`to launch the app in dev mode. (hot reload on code changes)

To build the app for your OS, run `yarn package`.

For more information, check out the boilerplate project on top of which this app is built. [Electron + ReactJS Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)

## Context

Profiling applications is an important method when analyzing and tuning the performance of computer programs. This is especially true in the domain of high performance computing (HPC), where scientific programmers need to find performance bottlenecks of large code bases. Many of these codes are run on a large number of compute nodes. In the context of the Message Passing Interface (MPI), several profiling tools exist such as [IPM](https://github.com/nerscadmin/IPM) or [mpiP](http://mpip.sourceforge.net/).

IPM is shipped with an XML parser, which converts IPM XML profiling data into an HTML table and associated performance plots presenting the perfomance data. This old parser is relatively stiff and the created images are low resolution png files.

Therefore, in this thesis we will improve the visualization component of IPM. First, only available information should be plotted. Before empty HTML tables were produced by the old IPM parser if data was not available. Second, all widgets/plots should be more interactive using standard plotting libraries (e.g. [Chart.js](https://www.chartjs.org/)). It is important that the new visualization component is extensible (easy to add new features later on) and portable (very few dependencies).

## Raw IPM Files Structure (XML)

Download [raw IPM examples](http://portal.nersc.gov/project/CAL/designforward.htm)

Have a look at the [XML IPM file structure](https://github.com/nerscadmin/IPM/blob/master/doc/ipm_xml.dtd) 
