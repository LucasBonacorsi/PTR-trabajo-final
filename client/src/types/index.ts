export interface CameraStatus {
  deviceSerial: string;
  deviceName: string;
  status: number;
  online: boolean;
  lastCheckTime: string;
  signalStatus?: number;
  defence?: number;
}

export interface Subscriber {
  _id: string;
  name: string;
  lastName: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface SubscribeFormData {
  name: string;
  lastName: string;
  email: string;
}
