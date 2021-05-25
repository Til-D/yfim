import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Home from "./containers/HomePage";
import Room from "./containers/RoomPage";
import DashBoard from "./containers/DashBoard";
import RoomControl from "./containers/RoomControl";
import SurveyPage from "./components/SurveyPage";
import NotFound from "./components/NotFound";

import styles from "./app.css";

render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/r/:room" component={Room} />
        {/* <Route path="*" component={NotFound} /> */}
        <Route exact path="/dashboard" component={DashBoard} />
        <Route exact path="/control/:room" component={RoomControl} />
        {/* <Route exact path="/survey/:room" component={SurveyPage} /> */}
        {/* <Route path="/survey/:room"/>  */}
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
