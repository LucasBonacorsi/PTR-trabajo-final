import nodemailer from 'nodemailer';
import { ISubscriber } from '../models/Subscriber';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.SMTP_FROM_NAME || 'Security Camera Alerts'}" <${process.env.SMTP_USER}>`;

export async function sendWelcomeEmail(subscriber: ISubscriber): Promise<void> {
  const { name, lastName, email } = subscriber;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '✅ Suscripción confirmada — Alertas de cámara de seguridad',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:20px;border-radius:12px">
        <div style="background:#0a0f1e;border-radius:10px;padding:28px;text-align:center">
          <h1 style="color:#00d4ff;margin:0;font-size:22px">🔒 Security Camera Dashboard</h1>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px;margin-top:16px">
          <h2 style="color:#1a1a2e;margin-top:0">Hola, ${name} ${lastName}!</h2>
          <p style="color:#555;line-height:1.7">
            Te has suscrito exitosamente a las alertas por email de tu cámara de seguridad.
            Recibirás una notificación cuando la cámara pase a estado <strong>online</strong> u <strong>offline</strong>.
          </p>
          <div style="background:#eef9ff;border-left:4px solid #00d4ff;padding:14px;border-radius:6px;margin:20px 0">
            <p style="margin:0;color:#0369a1">📧 Email registrado: <strong>${email}</strong></p>
          </div>
          <p style="color:#999;font-size:13px">Si no realizaste esta suscripción, podés ignorar este mensaje.</p>
        </div>
      </div>
    `,
  });
}

export async function sendCameraAlertEmail(
  subscriber: ISubscriber,
  alertType: 'online' | 'offline',
  deviceName: string
): Promise<void> {
  const { name, lastName, email } = subscriber;
  const isOnline = alertType === 'online';

  const accent = isOnline ? '#22c55e' : '#ef4444';
  const bg = isOnline ? '#f0fdf4' : '#fef2f2';
  const icon = isOnline ? '🟢' : '🔴';
  const label = isOnline ? 'EN LÍNEA' : 'DESCONECTADA';
  const message = isOnline
    ? '✅ La cámara volvió a estar en línea y está monitoreando normalmente.'
    : '⚠️ La cámara se desconectó. Por favor verificá la conexión del dispositivo.';

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `${icon} Alerta de cámara: ${deviceName} está ${label}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6fb;padding:20px;border-radius:12px">
        <div style="background:#0a0f1e;border-radius:10px;padding:28px;text-align:center">
          <h1 style="color:#00d4ff;margin:0;font-size:22px">🔒 Alerta de Cámara de Seguridad</h1>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px;margin-top:16px">
          <h2 style="color:#1a1a2e;margin-top:0">Hola, ${name} ${lastName}</h2>
          <div style="text-align:center;padding:24px;background:${bg};border-radius:10px;margin:20px 0">
            <div style="font-size:52px">${icon}</div>
            <h3 style="color:${accent};font-size:22px;margin:10px 0">${deviceName}</h3>
            <p style="color:${accent};font-size:18px;font-weight:bold;margin:0">${label}</p>
          </div>
          <div style="background:${bg};border-left:4px solid ${accent};padding:14px;border-radius:6px">
            <p style="margin:0;color:#333">${message}</p>
          </div>
          <p style="color:#999;font-size:13px;margin-top:20px">
            Fecha y hora: <strong>${new Date().toLocaleString('es-AR')}</strong>
          </p>
        </div>
      </div>
    `,
  });
}
