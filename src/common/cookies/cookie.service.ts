import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  private readonly defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    path: '/',
  };

  setCookie(
    res: Response,
    name: string,
    value: string,
    options: {
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      path?: string;
    } = {},
  ) {
    res.cookie(name, value, { ...this.defaultOptions, ...options });
  }

  clearCookie(res: Response, name: string) {
    res.clearCookie(name,this.defaultOptions);
  }

  // Pro tip: hàm chuyên dụng cho deviceId
  setDeviceId(res: Response, deviceId: string) {
    this.setCookie(res, 'device_id', deviceId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 năm
      httpOnly: true,
    });
  }

  setDevice(res : Response, deviceId: string): void {
    this.setCookie(res, 'device_id', deviceId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 năm
      httpOnly: true,
    });


  }
  setRefreshCookie(res: Response, token: string): void {
    this.setCookie(res, 'refresh_token', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      path: '/auth/refresh', // Browser: kiểm tra xem URL của request có bắt đầu bằng /auth/refresh không
    });
  }
}
