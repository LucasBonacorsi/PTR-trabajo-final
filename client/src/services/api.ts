import axios from 'axios';
import { CameraStatus, Subscriber, SubscribeFormData } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function getCameraStatus(deviceSerial?: string): Promise<CameraStatus> {
  const params = deviceSerial ? { deviceSerial } : {};
  const { data } = await api.get<CameraStatus>('/camera/status', { params });
  return data;
}

export async function getCameraList(): Promise<CameraStatus[]> {
  const { data } = await api.get<CameraStatus[]>('/camera/list');
  return data;
}

export async function subscribeToAlerts(
  payload: SubscribeFormData
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/subscribers', payload);
  return data;
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const { data } = await api.get<Subscriber[]>('/subscribers');
  return data;
}
