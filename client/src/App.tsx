import { Camera, Github, Shield } from 'lucide-react';
import { useState } from 'react';
import CameraStatus from './components/CameraStatus';
import SubscriberList from './components/SubscriberList';
import SubscribeForm from './components/SubscribeForm';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-dark-navy">
      <header className="border-b border-navy-border bg-navy/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
              <Camera className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">PTR-TF</span>
              <span className="hidden sm:inline text-gray-400 text-sm ml-2">
                Security Camera Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs text-gray-400">Ezviz Monitoring</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Panel de Control
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Monitoreá tu cámara de seguridad y gestioná las alertas por email.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <CameraStatus />
          </div>
          <div className="flex flex-col gap-6">
            <SubscribeForm onSuccess={() => setRefreshKey((k) => k + 1)} />
            <SubscriberList refreshKey={refreshKey} />
          </div>
        </div>
      </main>

      <footer className="border-t border-navy-border mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between text-xs text-gray-500">
          <span>PTR-TF &copy; {new Date().getFullYear()}</span>
          <a
            href="https://open.ezvizlife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-accent transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            Ezviz Open Platform
          </a>
        </div>
      </footer>
    </div>
  );
}
