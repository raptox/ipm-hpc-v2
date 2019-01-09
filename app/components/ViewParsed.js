/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
import Button from '@material-ui/core/Button';
import ReactTable from 'react-table';

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
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-3x" />
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
          <ReactTable
            data={content.hosts}
            columns={[
              {
                Header: 'Hosts',
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
            defaultPageSize={10}
            className="-striped -highlight"
          />
        )}
      </div>
    );
  }

  openFile() {
    let file = dialog.showOpenDialog({ properties: ['openFile'] });
    if (file) {
      fs.readFile(file[0], (err, data) => {
        this.setState({ parsedContent: JSON.parse(data) });
        console.log(this.state.parsedContent);
      });
    }
  }
}
