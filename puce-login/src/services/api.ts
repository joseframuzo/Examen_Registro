// src/services/api.ts
import axios from "axios";
import { Capacitor, CapacitorHttp } from "@capacitor/core";

// ¿App nativa (Android/iOS) o web?
const isNative = Capacitor.isNativePlatform();

// En web seguimos usando el proxy de Vite
const WEB_BASE = "/api";
// En nativo llamamos directo al servidor (HTTP)
const NATIVE_BASE = "http://puce.estudioika.com/api";

// ---------- helpers comunes ----------
function extractRows(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    for (const v of Object.values(data))
      if (Array.isArray(v)) return v as any[];
    const vals = Object.values(data).filter(
      (v) => v && typeof v === "object" && !Array.isArray(v)
    );
    if (vals.length) return vals as any[];
  }
  return [];
}

function toArray<T>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (x && typeof x === "object") return [x as T];
  return [];
}

// ---------- tipos ----------
export type PuceRecord = {
  record: string;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
};

export type IngresoInfo = {
  record: number;
  date: string;
  time: string;
  join_date: string;
};

// ---------- capa HTTP ----------
const webApi = axios.create({
  baseURL: WEB_BASE,
  timeout: 15000,
});

// GET genérico
async function httpGet(path: string, params?: Record<string, any>) {
  if (!isNative) {
    const { data } = await webApi.get(path, { params });
    return data;
  }
  const resp = await CapacitorHttp.get({
    url: `${NATIVE_BASE}${path}`,
    params,
  });
  return resp.data;
}

// POST genérico
async function httpPost(path: string, data?: any) {
  if (!isNative) {
    const resp = await webApi.post(path, data);
    return resp.data;
  }
  const resp = await CapacitorHttp.post({
    url: `${NATIVE_BASE}${path}`,
    data,
    headers: { "Content-Type": "application/json" },
  });
  return resp.data;
}

// ---------- endpoints de tu API ----------
export async function fetchPuceList(): Promise<PuceRecord[]> {
  const data = await httpGet("/examen.php");
  const rows = extractRows(data);
  return rows.map((r: any) => ({
    record: String(r.record ?? ""),
    id: String(r.id ?? ""),
    lastnames: String(r.lastnames ?? ""),
    names: String(r.names ?? ""),
    mail: String(r.mail ?? ""),
    phone: String(r.phone ?? ""),
    user: String(r.user ?? ""),
  }));
}

export async function registerIngreso(record_user: number): Promise<void> {
  const now = new Date();
  // "YYYY-M-D " (espacio final como tu API)
  const join_user = `${now.getFullYear()}-${
    now.getMonth() + 1
  }-${now.getDate()} `;
  await httpPost("/examen.php", { record_user, join_user });
}

export async function fetchIngresosByRecord(
  record: number
): Promise<IngresoInfo[]> {
  const data = await httpGet("/examen.php", { record });
  const arr = toArray<IngresoInfo>(data);
  return arr.map((r: any) => ({
    record: Number(r.record),
    date: String(r.date ?? ""),
    time: String(r.time ?? ""),
    join_date: String(r.join_date ?? ""),
  }));
}

// Log útil
console.log(
  "[API] isNative =",
  isNative,
  "BASE =",
  isNative ? NATIVE_BASE : WEB_BASE
);
