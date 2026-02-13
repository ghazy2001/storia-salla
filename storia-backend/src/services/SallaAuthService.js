const axios = require("axios");
const Configuration = require("../models/Configuration");

class SallaAuthService {
  constructor() {
    this.clientId = process.env.SALLA_CLIENT_ID;
    this.clientSecret = process.env.SALLA_CLIENT_SECRET;
    this.baseUrl = "https://accounts.salla.sa/oauth2";
    this.tokenKey = "salla_auth_tokens";
  }

  /**
   * Get valid access token. Refreshes if expired.
   */
  async getAccessToken() {
    const tokens = await this.getTokens();
    if (!tokens) return null;

    // Check if expired (with 1 min buffer)
    const now = Math.floor(Date.now() / 1000);
    if (tokens.expires_at < now + 60) {
      console.log("[SallaAuth] Access token expired, refreshing...");
      return await this.refreshTokens(tokens.refresh_token);
    }

    return tokens.access_token;
  }

  /**
   * Save tokens from OAuth response
   */
  async saveTokens(tokenResponse) {
    const now = Math.floor(Date.now() / 1000);
    const tokens = {
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      expires_at: now + tokenResponse.expires_in,
      scope: tokenResponse.scope,
    };

    await Configuration.findOneAndUpdate(
      { key: this.tokenKey },
      { value: tokens, description: "Salla API Auth Tokens" },
      { upsert: true, new: true },
    );

    return tokens.access_token;
  }

  /**
   * Get tokens from database
   */
  async getTokens() {
    const config = await Configuration.findOne({ key: this.tokenKey });
    return config ? config.value : null;
  }

  /**
   * Exchange code for access token
   */
  async exchangeCode(code) {
    try {
      const response = await axios.post(`${this.baseUrl}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri:
          process.env.SALLA_REDIRECT_URI ||
          "https://storia-salla.fly.dev/api/salla/callback",
      });

      return await this.saveTokens(response.data);
    } catch (error) {
      console.error(
        "[SallaAuth] Error exchanging code:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken) {
    try {
      const response = await axios.post(`${this.baseUrl}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      return await this.saveTokens(response.data);
    } catch (error) {
      console.error(
        "[SallaAuth] Error refreshing tokens:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}

module.exports = new SallaAuthService();
