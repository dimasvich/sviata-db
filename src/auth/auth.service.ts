import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
  private config = {
    baseUrl: process.env.BASE_URL_KEYCLOAK,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    redirectUri: process.env.KEYCLOAK_REDIRECT_URI,
  };

  getLoginUrl() {
    return (
      `${this.config.baseUrl}/auth` +
      `?client_id=${this.config.clientId}` +
      `&redirect_uri=${this.config.redirectUri}` +
      `&response_type=code`
    );
  }

  async exchangeCodeForToken(code: string) {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await axios.post(`${this.config.baseUrl}/token`, data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return response.data;
  }

  async getUserInfo(accessToken: string) {
    const response = await axios.get(`${this.config.baseUrl}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
}
