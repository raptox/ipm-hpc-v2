/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Basic.css';
import Button from '@material-ui/core/Button';
import ReactTable from 'react-table';
import moment from 'moment';
import { Pie, Bar } from 'react-chartjs-2';
import tuLogo from './TU-Signet.png';
import ReactJson from 'react-json-view';

const { dialog } = require('electron').remote;
const fs = require('fs');

export default class ViewParsed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsedContent: '',
      balanceZoom: false,
      balanceZoomIndex: 0,
      balanceZoomPageSize: 30,
      balanceZoomData: {},
      balanceZoomEnd: false,
      balanceZoomStart: true
    };
  }

  toggleBalanceZoom() {
    this.setState({ balanceZoom: !this.state.balanceZoom }, () => {
      if (this.state.balanceZoom) {
        this.recalculateBalanceData(0, this.state.balanceZoomPageSize);
      } else {
        this.unZoomBalanceData();
      }
    });
    this.setState({
      balanceZoomIndex: 1,
      balanceZoomStart: true,
      balanceZoomEnd: false
    });
  }

  unZoomBalanceData() {
    if (this.state.parsedContent.balanceData.labels) {
      this.recalculateBalanceData(
        0,
        this.state.parsedContent.balanceData.labels.length
      );
    }
  }

  nextPageBalance() {
    if (this.state.balanceZoomEnd) {
      window.alert('already on the last page');
      return;
    }
    let newZoomIndex = this.state.balanceZoomIndex + 1;
    let newRange = newZoomIndex * this.state.balanceZoomPageSize;
    let dataSize = this.state.parsedContent.balanceData.labels.length;
    let start = this.state.balanceZoomIndex * this.state.balanceZoomPageSize;
    let end;
    if (newRange > dataSize) {
      end = dataSize;
      this.setState({ balanceZoomEnd: true });
    } else {
      end = newRange;
      this.setState({ balanceZoomIndex: newZoomIndex });
    }
    this.setState({ balanceZoomStart: false });
    this.recalculateBalanceData(start, end);
  }

  previousPageBalance() {
    if (this.state.balanceZoomStart) {
      window.alert('already on the first page');
      return;
    }
    if (this.state.balanceZoomIndex === 1) {
      this.recalculateBalanceData(0, this.state.balanceZoomPageSize);
      this.setState({ balanceZoomStart: true });
      return;
    }
    let newZoomIndex = this.state.balanceZoomIndex - 1;
    let start = newZoomIndex * this.state.balanceZoomPageSize;
    let end = this.state.balanceZoomIndex * this.state.balanceZoomPageSize;
    this.recalculateBalanceData(start, end);
    this.setState({
      balanceZoomIndex: newZoomIndex,
      balanceZoomEnd: false
    });
  }

  recalculateBalanceData(start, end) {
    let newBalanceData = {
      labels: this.state.parsedContent.balanceData.labels.slice(start, end),
      datasets: this.state.parsedContent.balanceData.datasets.map(dataset => {
        return {
          label: dataset.label,
          fill: dataset.fill,
          backgroundColor: dataset.backgroundColor,
          borderColor: dataset.borderColor,
          pointHoverBackgroundColor: dataset.pointHoverBackgroundColor,
          data: dataset.data.slice(start, end)
        };
      })
    };
    this.setState({ balanceZoomData: newBalanceData });
  }

  render() {
    let content = this.state.parsedContent;
    return (
      <div>
        <img
          alt="TU Logo"
          src={tuLogo}
          style={{
            position: 'fixed',
            width: '50px',
            height: '50px',
            right: '3px',
            top: '3px'
          }}
        />
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-2x" />
          </Link>
        </div>
        <h2>View Parsed</h2>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.openFile()}
        >
          Select File
        </Button>
        {content && (
          <div>
            <h3>Metadata</h3>
            <div>
              <strong>user:</strong> {content.metadata.username} <br />
              <strong>start:</strong>{' '}
              {moment
                .unix(content.metadata.start)
                .format('MMMM Do YYYY, h:mm:ss a')}{' '}
              <br />
              <strong>stop:</strong>{' '}
              {moment
                .unix(content.metadata.stop)
                .format('MMMM Do YYYY, h:mm:ss a')}{' '}
              <br />
              <strong>walltime:</strong> {content.metadata.walltime} seconds{' '}
              <br />
              <strong>mpi tasks:</strong>
              {' ' +
                content.metadata.ntasks +
                ' on ' +
                content.metadata.nhosts +
                ' hosts'}
              <br />
              <strong>%comm:</strong>
              {' ' +
                (
                  (content.mpiData.mpiAnalysis.totalTime /
                    content.metadata.totalWallTime) *
                  100
                ).toFixed(2)}
              {content.metadata.env && (
                <ReactJson
                  name="env"
                  src={content.metadata.env}
                  collapsed={true}
                />
              )}
            </div>
            <div className={styles.pieCharts}>
              <div className={styles.floatLeft}>
                <h3>Summarized MPI Time in %</h3>
                <div>
                  <Pie data={content.mpiPies.mpiPercent} />
                </div>
              </div>
              <div className={styles.floatRight}>
                <h3>MPI Time in % of total Wall Time</h3>
                <div>
                  <Pie data={content.mpiPies.mpiWall} />
                </div>
              </div>
            </div>

            {this.state.balanceZoomData && (
              <div>
                <h3>Communication balance by task (sorted by MPI time)</h3>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.toggleBalanceZoom()}
                >
                  Toggle Zoom
                </Button>
                {this.state.balanceZoom && (
                  <div>
                    <Button
                      variant="contained"
                      color="default"
                      onClick={() => this.previousPageBalance()}
                    >
                      Previous Page
                    </Button>{' '}
                    <Button
                      variant="contained"
                      color="default"
                      onClick={() => this.nextPageBalance()}
                    >
                      Next Page
                    </Button>
                  </div>
                )}
                <Bar
                  data={this.state.balanceZoomData}
                  options={{
                    scales: {
                      xAxes: [
                        {
                          stacked: true
                        }
                      ],
                      yAxes: [
                        {
                          stacked: true
                        }
                      ]
                    }
                  }}
                />
              </div>
            )}

            {content.mpiData &&
              Array.isArray(content.mpiData.mpiCalls) &&
              content.mpiData.mpiCalls !== 0 && (
                <div className={styles.tableInfo}>
                  <ReactTable
                    data={content.mpiData.mpiCalls}
                    columns={[
                      {
                        Header: 'All MPI Calls',
                        columns: [
                          {
                            Header: 'Call',
                            accessor: 'call'
                          },
                          {
                            Header: 'Buffer Size',
                            accessor: 'bytes'
                          },
                          {
                            Header: '# Calls',
                            accessor: 'count'
                          },
                          {
                            Header: 'Total Time',
                            accessor: 'ttot'
                          },
                          {
                            Header: 'Min Time',
                            accessor: 'tmin'
                          },
                          {
                            Header: 'Max Time',
                            accessor: 'tmax'
                          },
                          {
                            Header: '%MPI',
                            accessor: d =>
                              (d.ttot / content.mpiData.mpiAnalysis.totalTime) *
                              100,
                            id: 'percentMpi'
                          },
                          {
                            Header: '%Wall',
                            accessor: d =>
                              (d.ttot / content.metadata.totalWallTime) * 100,
                            id: 'percentWall'
                          }
                        ]
                      }
                    ]}
                    pageSizeOptions={[2, 5, 10, 20, 25, 50, 100]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                  />
                </div>
              )}

            {Array.isArray(content.hpmData) &&
              content.hpmData.length !== 0 && (
                <div className={styles.tableInfo}>
                  <ReactTable
                    data={content.hpmData}
                    columns={[
                      {
                        Header: 'HPM Counter Statistics',
                        columns: [
                          {
                            Header: 'Event',
                            accessor: 'name'
                          },
                          {
                            Header: 'Total Count',
                            accessor: 'counter'
                          },
                          {
                            Header: 'Avg',
                            accessor: d => (d.counter / d.ncalls).toFixed(2),
                            id: 'avg'
                          },
                          {
                            Header: 'Min',
                            accessor: 'min'
                          },
                          {
                            Header: 'Max',
                            accessor: 'max'
                          }
                        ]
                      }
                    ]}
                    pageSizeOptions={[2, 5, 10, 20, 25, 50, 100]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                  />
                </div>
              )}

            {Array.isArray(content.hosts) &&
              content.hosts.length !== 0 && (
                <div className={styles.tableInfo}>
                  <ReactTable
                    data={content.hosts}
                    columns={[
                      {
                        Header: 'All Hosts',
                        columns: [
                          {
                            Header: 'Name',
                            accessor: 'name'
                          },
                          {
                            Header: 'Mach Name',
                            accessor: 'mach_name'
                          },
                          {
                            Header: 'Mach Info',
                            accessor: 'mach_info'
                          },
                          {
                            Header: 'Tasks',
                            id: 'tasks',
                            accessor: d => d.tasks.join(', ')
                          }
                        ]
                      }
                    ]}
                    pageSizeOptions={[2, 5, 10, 20, 25, 50, 100]}
                    defaultPageSize={10}
                    className="-striped -highlight"
                  />
                </div>
              )}
          </div>
        )}
      </div>
    );
  }

  openFile() {
    let file = dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (file) {
      fs.readFile(file[0], (err, data) => {
        this.setState({ parsedContent: JSON.parse(data) });
        this.unZoomBalanceData();
      });
    }
  }
}
