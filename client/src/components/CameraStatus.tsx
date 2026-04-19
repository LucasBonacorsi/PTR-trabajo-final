import {
  Activity,
  Camera,
  RefreshCw,
  Shield,
  ShieldOff,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getCameraStatus } from '../services/api';
import { CameraStatus as CameraStatusType } from '../types';

const POLL_INTERVAL_MS = 30_000;

function SignalBars({ level }: { level?: number }) {
  const bars = [1, 2, 3, 4];
  const strength = level ?? 0;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((b) => (
        <div
          key={b}
          style={{ height: `${b * 25}%` }}
          className={`w-1.5 rounded-sm ${
            b <= strength ? 'bg-accent' : 'bg-navy-border'
          }`}
        />
      ))}
    </div>
  );
}

export default function CameraStatus() {
  const [status, setStatus] = useState<CameraStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const data = await getCameraStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener estado';
      setError(msg);
    } finally {
      setLoading(false);
      if (manual) setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(() => fetchStatus(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchStatus]);

  const isOnline = status?.online ?? false;

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Estado de la Cámara</h2>
            <p className="text-xs text-gray-400">Actualización automática cada 30s</p>
          </div>
        </div>
        <button
          onClick={() => fetchStatus(true)}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-navy-border transition-colors text-gray-400 hover:text-white"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Conectando con Ezviz...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center py-10 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-danger" />
          </div>
          <div>
            <p className="text-white font-medium">Sin conexión a la API</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && status && (
        <>
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                  isOnline
                    ? 'border-success bg-success/10'
                    : 'border-danger bg-danger/10'
                }`}
              >
                {isOnline ? (
                  <Wifi className="w-10 h-10 text-success" />
                ) : (
                  <WifiOff className="w-10 h-10 text-danger" />
                )}
              </div>
              {isOnline && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-success rounded-full border-2 border-navy-card animate-pulse-slow" />
              )}
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{status.deviceName}</h3>
              <span
                className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                  isOnline
                    ? 'bg-success/15 text-success'
                    : 'bg-danger/15 text-danger'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-success' : 'bg-danger'}`}
                />
                {isOnline ? 'EN LÍNEA' : 'DESCONECTADA'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <InfoTile label="Serial" value={status.deviceSerial} mono />
            <InfoTile
              label="Señal"
              value={<SignalBars level={status.signalStatus} />}
            />
            <InfoTile
              label="Defensa"
              value={
                status.defence !== undefined ? (
                  <span className="flex items-center gap-1">
                    {status.defence === 1 ? (
                      <>
                        <Shield className="w-3.5 h-3.5 text-success" />
                        <span className="text-success">Activa</span>
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-400">Inactiva</span>
                      </>
                    )}
                  </span>
                ) : (
                  '—'
                )
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-navy-border text-xs text-gray-500">
            <Activity className="w-3.5 h-3.5" />
            <span>
              Última consulta:{' '}
              {new Date(status.lastCheckTime).toLocaleString('es-AR')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function InfoTile({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="bg-dark-navy rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className={`text-sm text-white truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </div>
    </div>
  );
}
