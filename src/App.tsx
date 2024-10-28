import { observer } from "mobx-react";
import React from "react";
import { HeaderBar } from "@dhis2/ui-widgets";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import HouseholdsAssessed from './components/HouseholdsAssessed';

export const App = observer(() => {
  return (
    <>
      <HeaderBar
        appName={"Households Assessed"}
        style={{
          left: 0,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
        }}
      />
      <Router>
        <Switch>
          <Route exact path="/" component={HouseholdsAssessed} />
        </Switch>
      </Router>
    </>
  );
});
