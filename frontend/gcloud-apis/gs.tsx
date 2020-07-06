import { BaseClient } from './base';
import { UseSettingsHook, DEFAULT_GS_ENDPOINT } from '../settings';

type Bucket = {
  defaultEventBasedHold: boolean,
  etag: string,
  id: string,
  kind: string,
  name: string,
  location: string,
  locationType: string,
}

type ListBucketsResponse = {
  items: Array<Bucket>,
  kind: string,
}

type GS_Object = {
  kind: string,
  id: string,
  selfLink: string,
  name: string,
  metadata: object,
  bucket: string,
  // and so much more
}

type ListObjectResponse = {
  kind: string,
  prefixes: Array<string>,
  items: Array<GS_Object>,
}
export class GsClient extends BaseClient {

  constructor(settings: UseSettingsHook, endpoint?: string) {
    super(settings, endpoint || DEFAULT_GS_ENDPOINT);
  }

  async listBuckets(project: string): Promise<ListBucketsResponse> {
    return await this._makeRequestGet('/storage/v1/b?maxResults=1000&project=' + project);
  }

  async listObjects(bucket: string, prefix: string = ''): Promise<ListObjectResponse> {
    return await this._makeRequestGet(`/storage/v1/b/${bucket}/o?maxResults=1000&prefix=${prefix}`);
  }

  async patch(bucket: string, name: string, metadata: object) {
    return await this._patch(`/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`, metadata);
  }

  protected async _patch(resource: string, metadata: object) {
    const accessToken = await this.accessToken();

    const body = JSON.stringify({
      metadata: metadata,
    });
    console.log("Body during _patch -- " + body);

    const response = await fetch(`${this.endpoint}${resource}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': "application/json",
        'Authorization': `Bearer ${accessToken}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: body,
    });

    return this.handleResponse(response);
  }


  async objectExist(bucket, name: string) {
    try {
      const response = await this._makeRequestGet(`/storage/v1/b/${bucket}/o/${encodeURIComponent(name)}`);
      return "storage#object" === response.kind;
    } catch (err) {
      return false;
    }
  }

  async upload(bucket: string, name: string, contentType: string, blobData: Blob) {
    return await this._upload(`/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(name)}`, blobData, contentType);
  }

  protected async _upload(resource: string, blob: Blob, contentType: string) {
    const accessToken = await this.accessToken();

    const response = await fetch(`${this.endpoint}${resource}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': contentType,
        'Authorization': `Bearer ${accessToken}`
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: blob,
    });

    return this.handleResponse(response);
  }

}