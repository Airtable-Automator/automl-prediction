import { BaseClient } from './base';
import { DEFAULT_CRM_ENDPOINT, UseSettingsHook } from '../settings';

type Project = {
  createdTime: string,
  lifecycleState: string,
  name: string,
  projectId: string,
  projectNumber: string
}
type ListProjectsResponse = {
  projects: Array<Project>
}

export class CloudResourceManagerClient extends BaseClient {

  constructor(settings: UseSettingsHook, endpoint?: string) {
    super(settings, endpoint || DEFAULT_CRM_ENDPOINT);
  }

  async listProjects(): Promise<ListProjectsResponse> {
    return await this._makeRequestGet('/v1/projects');
  }
}