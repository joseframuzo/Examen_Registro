import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import React, { useMemo, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  personOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline,
} from "ionicons/icons";
import "./login.css";
// import logo from "../assets/logo.png"; // opcional: si tienes un logo

export default function Login() {
  const { login } = useAuth();
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // cédula/id
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const passRef = useRef<HTMLIonInputElement>(null);

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.trim().length > 0,
    [username, password]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await login(username, password);
      history.replace("/registrar"); // verificación de dígitos
    } catch (err: any) {
      setToast(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Iniciar sesión</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="login-bg">
        <div className="login-wrap">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-head">
              <div className="brand">
                {/* Si tienes logo, descomenta la línea de arriba y usa: <img src={logo} alt="Logo" /> */}
                <span>PU</span>
              </div>
              <h1 className="login-title">Accede a tu cuenta</h1>
              <p className="login-sub">Usuario y cédula (ID) para continuar</p>
            </div>

            <div className="login-body">
              <IonItem className="field-compact">
                <IonLabel position="floating">
                  <IonIcon icon={personOutline} style={{ marginRight: 6 }} />
                  Usuario
                </IonLabel>
                <IonInput
                  value={username}
                  onIonChange={(e) => setUsername(e.detail.value || "")}
                  onKeyUp={(e: any) => {
                    if (e.key === "Enter") passRef.current?.setFocus();
                  }}
                  autocomplete="username"
                  required
                />
              </IonItem>

              <IonItem className="field-compact" style={{ marginTop: 10 }}>
                <IonLabel position="floating">
                  <IonIcon
                    icon={lockClosedOutline}
                    style={{ marginRight: 6 }}
                  />
                  Cédula / ID
                </IonLabel>
                <IonInput
                  ref={passRef}
                  value={password}
                  type={showPass ? "text" : "password"}
                  onIonChange={(e) => setPassword(e.detail.value || "")}
                  autocomplete="current-password"
                  required
                />
                <IonButton
                  slot="end"
                  fill="clear"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={
                    showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  <IonIcon icon={showPass ? eyeOffOutline : eyeOutline} />
                </IonButton>
              </IonItem>

              <div className="actions">
                <IonButton
                  className="btn-primary"
                  type="submit"
                  expand="block"
                  disabled={!canSubmit || loading}
                >
                  {loading ? (
                    <IonSpinner name="dots" />
                  ) : (
                    <>
                      <IonIcon icon={logInOutline} slot="start" />
                      Ingresar
                    </>
                  )}
                </IonButton>
              </div>
            </div>

            <div className="footer">
              © {new Date().getFullYear()} PUCE — Control de Ingreso
            </div>
          </form>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast || ""}
          duration={2300}
          color="danger"
          onDidDismiss={() => setToast(null)}
        />
      </IonContent>
    </IonPage>
  );
}
