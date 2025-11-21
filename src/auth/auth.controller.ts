import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get('login')
  login(@Res() res: Response) {
    const url = this.authService.getLoginUrl();
    return res.redirect(url);
  }
  @Public()
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return res.redirect('/');
  }

  @Public()
  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('No code provided');
    }

    const tokens = await this.authService.exchangeCodeForToken(code);
    const url = process.env.FRONT_URL || 'http://localhost:9000';

    return res.redirect(
      `${url}/login?access=${tokens.access_token}&refresh=${tokens.refresh_token}`,
    );
  }
  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refresh: string) {
    const data = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh,
      client_id: process.env.KEYCLOAK_CLIENT_ID,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
    });

    const response = await axios.post(
      `${process.env.BASE_URL_KEYCLOAK}/token`,
      data,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    };
  }
  @Public()
  @Post('check-refresh')
  async checkRefresh(
    @Body('refreshToken') refresh: string,
    @Res() res: Response,
  ) {
    if (!refresh) {
      return res.status(200).json({
        ok: false,
        reason: 'no-refresh',
        message: 'User has no refresh token',
      });
    }

    try {
      const data = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh,
        client_id: process.env.KEYCLOAK_CLIENT_ID,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET,
      });

      const response = await axios.post(
        `${process.env.BASE_URL_KEYCLOAK}/token`,
        data,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return res.json({
        ok: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? refresh,
      });
    } catch (err) {
      return res.status(200).json({
        ok: false,
        reason: 'expired',
        message: 'Refresh token expired',
      });
    }
  }

  @Public()
  @Get('me')
  async me(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) return null;
    return this.authService.getUserInfo(token);
  }

}
