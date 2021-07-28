import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./containers/HomePage";
import Room from "./containers/RoomPage";
import DashBoard from "./containers/DashBoard";
import RoomControl from "./containers/RoomControl";
import SurveyPage from "./containers/SurveyPage";
import NotFound from "./components/NotFound";
import DataMonitor from "./containers/DataMonitor";

import styles from "./app.css";
import ProjectionPage from "./containers/ProjectionPage";

render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/r/:room" component={Room} />
        {/* <Route path="*" component={NotFound} /> */}
        <Route exact path="/control/:room" component={RoomControl} />
        <Route exact path="/s/:room/:user" component={SurveyPage} />
        <Route
          exact
          path="/projection/:room/:user"
          component={ProjectionPage}
        />
        <Route exact path="/data" component={DataMonitor} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById("app")
);

if (module.hot) module.hot.accept();

// DashBoard:{
//   RoomControl,
//   xxx...
// }
// RoomControl:{
//   Survey,
//   Compete,
//   xxx...
// }
