/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Basic.css';
import Button from '@material-ui/core/Button';
import ReactTable from 'react-table';
import moment from 'moment';
import { Pie } from 'react-chartjs-2';
import tuLogo from './TU-Signet.png';
import ReactJson from 'react-json-view';

const { dialog } = require('electron').remote;
const fs = require('fs');

export default class ViewParsed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parsedContent: ''
    };
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
              <ReactJson
                name="env"
                src={content.metadata.env}
                collapsed={true}
              />
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
      });
    }
  }
}
