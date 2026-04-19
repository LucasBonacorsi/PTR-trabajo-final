import { NextFunction, Request, Response } from 'express';
import { getDeviceList, getDeviceStatus } from '../services/ezviz.service';

export async function getCameraStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const deviceSerial =
      (req.query.deviceSerial as string) ||
      process.env.EZVIZ_DEFAULT_DEVICE_SERIAL ||
      '';
    const status = await getDeviceStatus(deviceSerial);
    return res.json(status);
  } catch (err) {
    next(err);
  }
}

export async function getCameraList(req: Request, res: Response, next: NextFunction) {
  try {
    const devices = await getDeviceList();
    return res.json(devices);
  } catch (err) {
    next(err);
  }
}
