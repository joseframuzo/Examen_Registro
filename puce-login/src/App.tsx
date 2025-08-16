import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Login from "./pages/Login";
import Success from "./pages/Success";
import RegistroIngreso from "./pages/RegistroIngreso";
import { useAuth } from "./context/AuthContext";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

setupIonicReact();

function PrivateRoute(props: any) {
  const { isAuthenticated } = useAuth();
  const { component: Comp, ...rest } = props;
  return (
    <Route
      {...rest}
      render={(p) =>
        isAuthenticated ? <Comp {...p} /> : <Redirect to="/login" />
      }
    />
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/login" component={Login} exact />
          <PrivateRoute path="/registrar" component={RegistroIngreso} exact />
          <PrivateRoute path="/exito" component={Success} exact />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}
