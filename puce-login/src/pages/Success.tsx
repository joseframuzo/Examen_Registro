import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButton,
} from "@ionic/react";
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Success() {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro exitoso</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonText>
          <h1>¡Registro exitoso!</h1>
          <p>
            {user ? `Gracias, ${user.names} ${user.lastnames}.` : "Gracias."}
          </p>
        </IonText>
        <IonButton expand="block" onClick={logout}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
