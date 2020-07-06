import {
  useGlobalConfig,
} from '@airtable/blocks/ui';
import { isEmpty } from './utils';

export const GCLOUD_SVC_EMAIL = "gcloudServiceEmail";
export const GCLOUD_SVC_PRIVATE_KEY = "gcloudServicePrivateKey";
export const GCLOUD_AUTOML_ENDPOINT = "gcloudAutomlProxy";
export const GCLOUD_GS_ENDPOINT = "gcloudGsProxy";
export const GCLOUD_CRM_ENDPOINT = "gcloudCrmProxy";

export const DEFAULT_AUTOML_ENDPOINT = 'https://automl2.ashwanthkumar.in';
export const DEFAULT_GS_ENDPOINT = 'https://gs.ashwanthkumar.in';
export const DEFAULT_CRM_ENDPOINT = 'https://cloudresourcemanager.ashwanthkumar.in';

export type Settings = {
  svcEmail: string,
  svcKey: string,
  automlEndpoint: string,
  gsEndpoint: string,
  crmEndpoint: string,
}

export type UseSettingsHook = {
  isValid: boolean,
  // this is available when isValid is false
  message?: string,
  settings: Settings,
}

export function useSettings(): UseSettingsHook {
  const globalConfig = useGlobalConfig();

  const svcEmail = globalConfig.get(GCLOUD_SVC_EMAIL) as string;
  const svcKey = globalConfig.get(GCLOUD_SVC_PRIVATE_KEY) as string;
  const automlEndpoint = globalConfig.get(GCLOUD_AUTOML_ENDPOINT) as string;
  const gsEndpoint = globalConfig.get(GCLOUD_GS_ENDPOINT) as string;
  const crmEndpoint = globalConfig.get(GCLOUD_CRM_ENDPOINT) as string;

  const settings = {
    svcEmail,
    svcKey,
    automlEndpoint,
    gsEndpoint,
    crmEndpoint,
  };

  if (isEmpty(svcEmail) || isEmpty(svcKey) || isEmpty(automlEndpoint) || isEmpty(gsEndpoint) || isEmpty(crmEndpoint)) {
    return {
      isValid: false,
      message: 'Settings are invalid, please configure them once again',
      settings,
    };
  }
  return {
    isValid: true,
    settings,
  };
}

declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function () {
  var hash = 0;
  if (this.length == 0) {
    return hash;
  }
  for (var i = 0; i < this.length; i++) {
    var char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
