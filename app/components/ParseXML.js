/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ReactJson from 'react-json-view';

const { dialog } = require('electron').remote;
const fs = require('fs');
import { parseData } from '../utils/parser';

export default class ParseXML extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parseLog: ''
    };
  }

  render() {
    let data = this.state.parseLog;

    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-3x" />
          </Link>
        </div>
        <h2>Parse XML</h2>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.openFile()}
        >
          Select File
        </Button>
        {data && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.saveFile()}
          >
            Save Parsed
          </Button>
        )}
        {data && (
          <div className={styles.textfield}>
            Parse Log: <br />
            <ReactJson
              src={data ? JSON.parse(data) : { empty: true }}
              collapsed={true}
            />
          </div>
        )}
      </div>
    );
  }

  openFile() {
    let file = dialog.showOpenDialog({ properties: ['openFile'] });
    if (file) {
      parseData(file[0], data => {
        this.setState({ parseLog: data });
      });
    }
  }

  saveFile() {
    const options = {
      title: 'Where to save?',
      message: 'Where to save?'
    };
    let file = dialog.showSaveDialog(options);
    if (file) {
      fs.writeFile(file, this.state.parseLog, err => {
        console.log(err);
      });
    }
  }
}
