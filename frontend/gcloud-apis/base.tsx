import { GoogleToken } from 'gtoken';
import { Settings, UseSettingsHook } from '../settings';

export type ErrorDetails = {
  code: number,
  message: string,
  status: string
}
export type ErrorResponse = {
  error: ErrorDetails,
}

export abstract class BaseClient {
  protected endpoint: string;
  protected gtoken: GoogleToken = undefined;

  private settings: UseSettingsHook;
  private existingSettingsHash = undefined;

  constructor(settings: UseSettingsHook, endpoint: string) {
    this.endpoint = endpoint;
    this.settings = settings;
  }

  protected async _makeRequestGet(resource) {
    const accessToken = await this.accessToken();
    console.log(accessToken);

    const response = await fetch(`${this.endpoint}${resource}`, {
      credentials: 'include',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${accessToken}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });

    return this.handleResponse(response);
  }

  protected async _makeRequestPost(resource, body) {
    const accessToken = await this.accessToken();

    const response = await fetch(`${this.endpoint}${resource}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${accessToken}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(body),
    });

    return this.handleResponse(response);
  }

  protected async handleResponse(response: Response): Promise<any> {
    console.log(response);
    const responseAsJson = await response.json() as any | ErrorResponse;
    console.log(responseAsJson);
    if (response.status !== 200) {
      // this is now an error
      throw responseAsJson;
    } else {
      return responseAsJson;
    }

  }

  protected async accessToken(): Promise<string> {
    const settings = this.settings;
    if (!settings.isValid) {
      throw new Error("Can't create gToken, settings are invalid. Error - " + settings.message);
    }

    const newSettingsHash = JSON.stringify(settings).hashCode();

    // Refresh the token when gToken is not defined or when settings change since the last time we created GoogleToken instance
    if (!this.gtoken || !this.existingSettingsHash || newSettingsHash !== this.existingSettingsHash) {
      this.gtoken = new GoogleToken({
        email: settings.settings.svcEmail,
        key: settings.settings.svcKey,
        scope: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const _ = await this.gtoken.getToken();
      this.existingSettingsHash = JSON.stringify(settings.settings).hashCode();
    }

    if (this.gtoken.hasExpired) {
      const _ = await this.gtoken.getToken();
    }

    return this.gtoken.accessToken;
  }
}