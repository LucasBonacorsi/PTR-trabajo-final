import { Bell, CheckCircle, Loader2, Mail, User, XCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { subscribeToAlerts } from '../services/api';
import { SubscribeFormData } from '../types';

const EMPTY: SubscribeFormData = { name: '', lastName: '', email: '' };

type AlertState = { type: 'success' | 'error'; message: string } | null;

export default function SubscribeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<SubscribeFormData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const { message } = await subscribeToAlerts(form);
      setAlert({ type: 'success', message });
      setForm(EMPTY);
      onSuccess?.();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Ocurrió un error. Intentá de nuevo.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold text-white">Suscribirse a Alertas</h2>
          <p className="text-xs text-gray-400">Recibí notificaciones por email</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 ml-1">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan"
                required
                className="input-field pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 ml-1">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Pérez"
                required
                className="input-field pl-9"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5 ml-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="juan@ejemplo.com"
              required
              className="input-field pl-9"
            />
          </div>
        </div>

        {alert && (
          <div
            className={`flex items-start gap-3 p-3 rounded-lg text-sm animate-fade-in ${
              alert.type === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-danger/10 text-danger border border-danger/20'
            }`}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{alert.message}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {loading ? 'Suscribiendo...' : 'Suscribirse a alertas'}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        Recibirás un email de confirmación y alertas cuando el estado de la cámara
        cambie.
      </p>
    </div>
  );
}
