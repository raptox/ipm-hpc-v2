import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import ParseXML from './components/ParseXML';
import ViewParsed from './components/ViewParsed';

export default () => (
  <App>
    <Switch>
      <Route path={routes.VIEW} component={ViewParsed} />
      <Route path={routes.PARSE} component={ParseXML} />
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
