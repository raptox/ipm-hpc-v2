# ipm-hpc-v2

Interactive Visualization of MPI Performance Data (Bachelor Thesis)

## Usage

//TODO

## Context

Profiling applications is an important method when analyzing and tuning the performance of computer programs. This is especially true in the domain of high performance computing (HPC), where scientific programmers need to find performance bottlenecks of large code bases. Many of these codes are run on a large number of compute nodes. In the context of the Message Passing Interface (MPI), several profiling tools exist such as [IPM](https://github.com/nerscadmin/IPM) or [mpiP](http://mpip.sourceforge.net/).

IPM is shipped with an XML parser, which converts IPM XML profiling data into an HTML table and associated performance plots presenting the perfomance data. This old parser is relatively stiff and the created images are low resolution png files.

Therefore, in this thesis we will improve the visualization component of IPM. First, only available information should be plotted. Before empty HTML tables were produced by the old IPM parser if data was not available. Second, all widgets/plots should be more interactive using standard plotting libraries (e.g. [Chart.js](https://www.chartjs.org/)). It is important that the new visualization component is extensible (easy to add new features later on) and portable (very few dependencies).

## Raw IPM Files Structure (XML)

[raw IPM examples](http://portal.nersc.gov/project/CAL/designforward.htm)

**JOB:** $jobs is the top level, keyed by cookies, composed of tasks the parser may read in multiple jobs at once.

**TASK:** describes the unix process for each mpi rank and it, each task has regions (1 by default) and has gbyte, data_tx, data_rx outermost tag in the log since each task does it's own IPM and logging

**REGION:** each region has counters and funcs (region does not have gbyte), a region other than ipm_global corresponds to the programatic, context contained within a MPI_Pcontrol(1->-1) block

**HENT:** a hash entry is the most detailed default description of an MPI call or other event. A hent has call, size, rank, region

_all of the above have wtime, utime, stime, mtime, iotime_

**FUNC:** has a function label (name) and call count and wall time spent in field

**COUNTER:** has a label and a count. This is often a HPM counter

**TRACE:** is a func + counters + timestamp (not used by default)

**LABEL:** is an integer and a text string (call site or function name), labels avoid repeating text strings in the log

_a cookie uniquely identifies a job_

**a job:** $J = \%{$jobs{$cookie}}

**examples of info about a job:** $J->{wtime|utime|stime|mtime|iotime|pop|gflop|nhosts|ntasks|hostname}

**examples of info about a region in a job (aggregated across tasks):** $J->{region}{wtime|utime|stime|iotime|mtime|pop|gflop}

**a task:** $T = \%{$jobs{$cookie}{task}{$mpi_rank}} == $J->{task}{$mpi_rank}

**examples of info about a task:**

- $T->{hostname|cmdline|cmdline_base|exec|exec_bin|mach_info|gbyte|gflop}
- $T->{pid|wtime|utime|stime|mtime|iotime|mpi_size|pcomm|flags|switch}
- $T->{nregion|username|groupname}

**a region:** $R = \%{$jobs{$cookie}{task}{$mpi_rank}{region}{region_a}}; --> region_a of a task

**so e.g.:**

- $T->{mtime} is the MPI time for that task.
- $R->{mtime} is the MPI time in region_a for that task\*

_Aggregation tasks care of mapping the $R to $T to $J values_
