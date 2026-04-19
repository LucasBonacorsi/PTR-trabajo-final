import axios from 'axios';
import cron from 'node-cron';
import { Subscriber } from '../models/Subscriber';
import { sendCameraAlertEmail } from './email.service';

const BASE_URL = 'https://open.ezvizlife.com';

interface EzvizToken {
  accessToken: string;
  expireTime: number;
  obtainedAt: number;
}

export interface DeviceStatus {
  deviceSerial: string;
  deviceName: string;
  status: number;
  online: boolean;
  lastCheckTime: string;
  signalStatus?: number;
  defence?: number;
}

let cachedToken: EzvizToken | null = null;
let lastOnlineState: boolean | null = null;

async function getAccessToken(): Promise<string> {
  const isValid =
    cachedToken &&
    Date.now() < cachedToken.obtainedAt + cachedToken.expireTime - 60_000;

  if (isValid && cachedToken) return cachedToken.accessToken;

  const appKey = process.env.EZVIZ_APP_KEY;
  const appSecret = process.env.EZVIZ_APP_SECRET;

  if (!appKey || !appSecret) {
    throw new Error('EZVIZ_APP_KEY and EZVIZ_APP_SECRET must be set in .env');
  }

  const params = new URLSearchParams({ appKey, appSecret });
  const { data } = await axios.post(`${BASE_URL}/api/lapp/token/get`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.code !== '200') {
    throw new Error(`Ezviz auth failed: ${data.msg}`);
  }

  cachedToken = {
    accessToken: data.data.accessToken,
    expireTime: data.data.expireTime,
    obtainedAt: Date.now(),
  };

  return cachedToken.accessToken;
}

export async function getDeviceList(): Promise<DeviceStatus[]> {
  const accessToken = await getAccessToken();
  const params = new URLSearchParams({ accessToken, pageStart: '0', pageSize: '50' });

  const { data } = await axios.post(`${BASE_URL}/api/lapp/device/list`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.code !== '200') {
    throw new Error(`Failed to get device list: ${data.msg}`);
  }

  const devices: DeviceStatus[] = (data.data?.deviceInfos ?? []).map(
    (d: Record<string, unknown>) => ({
      deviceSerial: d.deviceSerial,
      deviceName: d.deviceName,
      status: d.status,
      online: d.status === 1,
      lastCheckTime: new Date().toISOString(),
      signalStatus: d.signalStatus,
      defence: d.defence,
    })
  );

  return devices;
}

export async function getDeviceStatus(deviceSerial: string): Promise<DeviceStatus> {
  if (!deviceSerial) {
    const list = await getDeviceList();
    if (list.length === 0) throw new Error('No devices found on this account.');
    return list[0];
  }

  const accessToken = await getAccessToken();
  const params = new URLSearchParams({ accessToken, deviceSerial });

  const { data } = await axios.post(`${BASE_URL}/api/lapp/device/info`, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (data.code !== '200') {
    throw new Error(`Failed to get device info: ${data.msg}`);
  }

  const d = data.data as Record<string, unknown>;
  return {
    deviceSerial: (d.deviceSerial as string) || deviceSerial,
    deviceName: (d.deviceName as string) || 'Unknown Device',
    status: d.status as number,
    online: d.status === 1,
    lastCheckTime: new Date().toISOString(),
    signalStatus: d.signalStatus as number | undefined,
    defence: d.defence as number | undefined,
  };
}

async function checkAndNotify(): Promise<void> {
  try {
    const serial = process.env.EZVIZ_DEFAULT_DEVICE_SERIAL || '';
    const status = await getDeviceStatus(serial);
    const isOnline = status.online;

    if (lastOnlineState !== null && lastOnlineState !== isOnline) {
      const alertType = isOnline ? 'online' : 'offline';
      const subscribers = await Subscriber.find({ active: true });

      await Promise.allSettled(
        subscribers.map((sub) => sendCameraAlertEmail(sub, alertType, status.deviceName))
      );

      console.log(
        `[Monitor] ${status.deviceName} went ${alertType}. Notified ${subscribers.length} subscriber(s).`
      );
    }

    lastOnlineState = isOnline;
  } catch (err) {
    console.error('[Monitor] Error checking camera status:', err);
  }
}

export function startCameraMonitoring(): void {
  cron.schedule('*/5 * * * *', checkAndNotify);
  console.log('[Monitor] Camera monitoring started — checking every 5 minutes.');
  checkAndNotify();
}
