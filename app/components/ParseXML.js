/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import ReactJson from 'react-json-view';
import { ClipLoader } from 'react-spinners';
import styles from './Basic.css';

const { dialog } = require('electron').remote;
const fs = require('fs');
import { parseData } from '../utils/parser';

const buttonStyle = {
  marginRight: '10px'
};

export default class ParseXML extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: '',
      parseLog: '',
      parsing: false
    };
  }

  render() {
    let data = this.state.parseLog;

    return (
      <div>
        <div className={styles.backButton} data-tid="backButton">
          <Link to={routes.HOME}>
            <i className="fa fa-arrow-left fa-2x" />
          </Link>
        </div>
        <h2>Parse XML</h2>
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.openFile()}
          style={buttonStyle}
        >
          Select File
        </Button>
        {data && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.saveFile()}
            style={buttonStyle}
          >
            Save Parsed Data
          </Button>
        )}
        <div>
          {this.state.selectedFile && (
            <h3>Selected File: {this.state.selectedFile}</h3>
          )}
          <div>
            <ClipLoader loading={this.state.parsing} />
          </div>
        </div>
        {data && (
          <div>
            View Parsed Data: <br />
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
    let file = dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'XML Files', extensions: ['xml'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    if (file) {
      this.setState({});
      this.setState({ parsing: true, selectedFile: file, parseLog: '' });
      parseData(file[0], data => {
        this.setState({ parseLog: data, parsing: false });
      });
    }
  }

  saveFile() {
    const options = {
      title: 'Where to save?',
      message: 'Where to save?',
      defaultPath: 'parsed.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    };
    let file = dialog.showSaveDialog(options);
    if (file) {
      fs.writeFile(file, this.state.parseLog, err => {
        console.log(err);
      });
    }
  }
}
