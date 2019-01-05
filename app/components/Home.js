// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Interactive Visualization of MPI Performance Data</h2>
        <div className={styles.buttons}>
          <Link to={routes.PARSE}>Parse XML</Link> <br />
          <Link to={routes.VIEW}>View Parsed</Link>
        </div>
      </div>
    );
  }
}
