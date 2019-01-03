import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ParseXMLPage from './containers/ParseXMLPage';

export default () => (
  <App>
    <Switch>
      <Route path={routes.PARSE} component={ParseXMLPage} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
