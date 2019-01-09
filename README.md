# ipm-hpc-v2

Interactive Visualization of MPI Performance Data (Bachelor Thesis)

## Usage

//TODO

## Context

Profiling applications is an important method when analyzing and tuning the performance of computer programs. This is especially true in the domain of high performance computing (HPC), where scientific programmers need to find performance bottlenecks of large code bases. Many of these codes are run on a large number of compute nodes. In the context of the Message Passing Interface (MPI), several profiling tools exist such as [IPM](https://github.com/nerscadmin/IPM) or [mpiP](http://mpip.sourceforge.net/).

IPM is shipped with an XML parser, which converts IPM XML profiling data into an HTML table and associated performance plots presenting the perfomance data. This old parser is relatively stiff and the created images are low resolution png files.

Therefore, in this thesis we will improve the visualization component of IPM. First, only available information should be plotted. Before empty HTML tables were produced by the old IPM parser if data was not available. Second, all widgets/plots should be more interactive using standard plotting libraries (e.g. [Chart.js](https://www.chartjs.org/)). It is important that the new visualization component is extensible (easy to add new features later on) and portable (very few dependencies).

## Raw IPM Files Structure (XML)

Download [raw IPM examples](http://portal.nersc.gov/project/CAL/designforward.htm)

Have a look at the [XML IPM file structure](https://github.com/nerscadmin/IPM/blob/master/doc/ipm_xml.dtd) 
