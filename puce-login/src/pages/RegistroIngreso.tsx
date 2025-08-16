import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  IonButtons,
  IonIcon,
  IonNote,
} from "@ionic/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  registerIngreso,
  fetchIngresosByRecord,
  IngresoInfo,
} from "../services/api";
import {
  logOutOutline,
  checkmarkCircleOutline,
  refreshOutline,
  keyOutline,
} from "ionicons/icons";
import "./registroIngreso.css";

function randomDistinctPositions(len: number): [number, number] {
  if (len < 2) return [1, 1];
  const a = Math.floor(Math.random() * len) + 1;
  let b = Math.floor(Math.random() * len) + 1;
  if (b === a) b = (b % len) + 1;
  return a < b ? [a, b] : [b, a];
}

export default function RegistroIngreso() {
  const { user, logout } = useAuth();
  const history = useHistory();

  const [p1, p2] = useMemo(() => {
    const len = user?.cedulaIngresada?.length ?? 10;
    return randomDistinctPositions(len);
  }, [user?.cedulaIngresada]);

  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const [ingresos, setIngresos] = useState<IngresoInfo[]>([]);
  const [loadingTabla, setLoadingTabla] = useState(false);

  useEffect(() => {
    if (!user) history.replace("/login");
  }, [user, history]);

  const cargarTabla = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingTabla(true);
      const recordNum = Number(user.record);
      if (!Number.isFinite(recordNum)) throw new Error("record inválido");
      const data = await fetchIngresosByRecord(recordNum);
      const sorted = [...data].sort((a, b) => {
        const ax = a.join_date || `${a.date} ${a.time}`;
        const bx = b.join_date || `${b.date} ${b.time}`;
        return bx.localeCompare(ax);
      });
      setIngresos(sorted);
    } catch (e: any) {
      setToast(e?.message || "No se pudo cargar la tabla.");
    } finally {
      setLoadingTabla(false);
    }
  }, [user]);

  useEffect(() => {
    cargarTabla();
  }, [cargarTabla]);

  async function handleConfirm() {
    if (!user) return;
    const ced = (user.cedulaIngresada || "").trim();
    if (!ced || ced.length < Math.max(p1, p2)) {
      setToast("Cédula inválida en sesión.");
      return;
    }
    const realD1 = ced.charAt(p1 - 1);
    const realD2 = ced.charAt(p2 - 1);
    if (realD1 !== d1 || realD2 !== d2) {
      setToast("Los dígitos no coinciden.");
      return;
    }
    try {
      setLoading(true);
      const recordNum = Number(user.record);
      if (!Number.isFinite(recordNum)) throw new Error("record inválido");
      await registerIngreso(recordNum);
      setShowAlert(true);
      setD1("");
      setD2("");
      await cargarTabla();
    } catch (e: any) {
      setToast(e?.message || "No se pudo registrar el ingreso.");
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh(ev: CustomEvent) {
    await cargarTabla();
    (ev.detail as any).complete();
  }

  function handleLogout() {
    logout();
    history.replace("/login");
  }

  // Iniciales para el avatar
  const initials = (user?.names || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Control de Ingreso</IonTitle>
          <IonButtons slot="end">
            <IonButton color="danger" onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Cerrar sesión
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent
            pullingText="Desliza para actualizar"
            refreshingSpinner="dots"
          />
        </IonRefresher>

        <div className="registro-wrap">
          {/* HERO */}
          <div className="hero">
            <div className="hero-top">
              <div className="avatar">{initials}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  Bienvenido{user ? `, ${user.names} ${user.lastnames}` : ""}
                </div>
              </div>
            </div>
          </div>

          {/* VERIFICACIÓN */}
          <IonCard className="card">
            <IonCardHeader>
              <span className="kicker">
                <IonIcon icon={keyOutline} /> Verificación
              </span>
              <IonCardTitle>
                <h3>Confirma dos dígitos de tu cédula</h3>
              </IonCardTitle>
              <IonNote>
                Posiciones solicitadas: <b>{p1}</b> y <b>{p2}</b>
              </IonNote>
            </IonCardHeader>
            <IonCardContent>
              <div className="compact" style={{ display: "grid", gap: 10 }}>
                <IonItem className="compact">
                  <IonLabel position="floating">Dígito posición {p1}</IonLabel>
                  <IonInput
                    value={d1}
                    inputmode="numeric"
                    maxlength={1}
                    onIonChange={(e) =>
                      setD1(
                        (e.detail.value || "").replace(/\D/g, "").slice(0, 1)
                      )
                    }
                  />
                </IonItem>

                <IonItem className="compact">
                  <IonLabel position="floating">Dígito posición {p2}</IonLabel>
                  <IonInput
                    value={d2}
                    inputmode="numeric"
                    maxlength={1}
                    onIonChange={(e) =>
                      setD2(
                        (e.detail.value || "").replace(/\D/g, "").slice(0, 1)
                      )
                    }
                  />
                </IonItem>

                <div className="btn-row">
                  <IonButton
                    className="btn-stretch"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <>
                        <IonIcon icon={checkmarkCircleOutline} slot="start" />
                        Confirmar y Registrar
                      </>
                    )}
                  </IonButton>
                  <IonButton fill="outline" onClick={cargarTabla}>
                    <IonIcon icon={refreshOutline} slot="start" />
                    Actualizar
                  </IonButton>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* TABLA */}
          <IonCard className="card">
            <IonCardHeader>
              <span className="kicker">Historial</span>
              <IonCardTitle>
                <h3>Registros recientes</h3>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loadingTabla ? (
                <div
                  style={{ display: "grid", placeItems: "center", padding: 12 }}
                >
                  <IonSpinner name="dots" />
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="pretty-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ingresos.length === 0 ? (
                        <tr>
                          <td colSpan={2} style={{ padding: "12px" }}>
                            <IonNote color="medium">
                              No hay registros aún.
                            </IonNote>
                          </td>
                        </tr>
                      ) : (
                        ingresos.map((r, idx) => (
                          <tr key={idx}>
                            <td>{r.date}</td>
                            <td>{r.time}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast || ""}
          duration={2300}
          color="danger"
          onDidDismiss={() => setToast(null)}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Registro exitoso"
          message="Tu ingreso ha sido registrado correctamente."
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
}
