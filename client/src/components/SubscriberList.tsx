import { ChevronDown, ChevronUp, Mail, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSubscribers } from '../services/api';
import { Subscriber } from '../types';

export default function SubscriberList({ refreshKey }: { refreshKey: number }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getSubscribers()
      .then(setSubscribers)
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="card animate-fade-in">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div className="text-left">
            <h2 className="font-semibold text-white">Suscriptores</h2>
            <p className="text-xs text-gray-400">
              {loading ? '...' : `${subscribers.length} activo${subscribers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-5 space-y-2 animate-fade-in">
          {loading && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          {!loading && subscribers.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              Sin suscriptores aún.
            </p>
          )}
          {!loading &&
            subscribers.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-3 p-3 bg-dark-navy rounded-xl"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <span className="text-accent text-xs font-bold">
                    {s.name[0]}{s.lastName[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {s.name} {s.lastName}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    {s.email}
                  </p>
                </div>
                <span className="ml-auto text-xs text-gray-500 shrink-0">
                  {new Date(s.subscribedAt).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
