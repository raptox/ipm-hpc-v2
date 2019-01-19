// @flow
/* eslint-disable */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Basic.css';
import tuLogo from './TU-Signet.png';

type Props = {};
const remote = require('electron').remote;

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
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
        <h2>Interactive Visualization of MPI Performance Data</h2>
        <div className={styles.buttons}>
          <Link to={routes.PARSE}>Parse XML</Link> <br />
          <Link to={routes.VIEW}>View Parsed</Link>
        </div>
        <a href="#" onClick={() => remote.getCurrentWindow().close()}>
          Close Application
        </a>
      </div>
    );
  }
}
