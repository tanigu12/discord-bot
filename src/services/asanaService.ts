import Asana from 'asana';

interface AsanaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface TaskData {
  name: string;
  notes?: string;
  projects: string[];
  assignee?: string;
  due_on?: string;
  workspace?: string;
}

interface User {
  gid: string;
  name: string;
  email: string;
}

export class AsanaService {
  private client: Asana.Client | null = null;
  private config: AsanaConfig;

  constructor(config: AsanaConfig) {
    this.config = config;
  }

  public getAuthorizationUrl(): string {
    const baseUrl = 'https://app.asana.com/-/oauth_authorize';
    const state = Math.random().toString(36).substring(7) || 'default-state';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  public async authenticateWithCode(code: string): Promise<string> {
    try {
      const client = Asana.Client.create({
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        redirectUri: this.config.redirectUri
      });

      const credentials = await client.app.accessTokenFromCode(code);
      const accessToken = credentials.access_token;
      
      if (!accessToken) {
        throw new Error('No access token received from Asana');
      }
      
      this.client = Asana.Client.create().useAccessToken(accessToken);
      
      return accessToken;
    } catch (error) {
      throw new Error(`Failed to authenticate with Asana: ${error}`);
    }
  }

  public async authenticateWithToken(accessToken: string): Promise<void> {
    this.client = Asana.Client.create().useAccessToken(accessToken);
  }

  private ensureAuthenticated(): void {
    if (!this.client) {
      throw new Error('Not authenticated with Asana. Please authenticate first.');
    }
  }

  public async getCurrentUser(): Promise<User> {
    this.ensureAuthenticated();
    
    try {
      const user = await this.client!.users.me();
      return {
        gid: user.gid,
        name: user.name,
        email: user.email
      };
    } catch (error) {
      throw new Error(`Failed to get current user: ${error}`);
    }
  }

  public async getWorkspaces(): Promise<any[]> {
    this.ensureAuthenticated();
    
    try {
      const workspacesList = await this.client!.workspaces.findAll();
      // Convert ResourceList to array using spread operator
      return [...(workspacesList as any)];
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error}`);
    }
  }

  public async getProjects(workspaceGid: string): Promise<any[]> {
    this.ensureAuthenticated();
    
    try {
      const projectsList = await this.client!.projects.findByWorkspace(workspaceGid);
      // Convert ResourceList to array using spread operator
      return [...(projectsList as any)];
    } catch (error) {
      throw new Error(`Failed to get projects: ${error}`);
    }
  }

  public async createTask(taskData: TaskData): Promise<any> {
    this.ensureAuthenticated();
    
    try {
      // Ensure workspace is set
      if (!taskData.workspace) {
        const workspaces = await this.getWorkspaces();
        if (workspaces.length > 0) {
          taskData.workspace = workspaces[0].gid;
        } else {
          throw new Error('No workspace available for task creation');
        }
      }
      
      // Ensure workspace is defined before creating task
      const taskDataWithWorkspace = {
        ...taskData,
        workspace: taskData.workspace as string
      };
      
      return await this.client!.tasks.create(taskDataWithWorkspace);
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  }

  public async getTasks(projectGid?: string, assignee?: string): Promise<any[]> {
    this.ensureAuthenticated();
    
    try {
      const params: any = {
        opt_fields: 'name,notes,completed,due_on,assignee.name,projects.name'
      };
      
      let tasksList;
      if (projectGid) {
        tasksList = await this.client!.tasks.findByProject(projectGid, params);
      } else {
        if (assignee) {
          params.assignee = assignee;
        } else {
          const user = await this.getCurrentUser();
          params.assignee = user.gid;
        }
        tasksList = await this.client!.tasks.findAll(params);
      }
      
      // Convert ResourceList to array using spread operator
      return [...(tasksList as any)];
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error}`);
    }
  }

  public async updateTask(taskGid: string, updates: Partial<TaskData>): Promise<any> {
    this.ensureAuthenticated();
    
    try {
      return await this.client!.tasks.update(taskGid, updates);
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  }

  public async completeTask(taskGid: string): Promise<any> {
    this.ensureAuthenticated();
    
    try {
      return await this.client!.tasks.update(taskGid, { completed: true });
    } catch (error) {
      throw new Error(`Failed to complete task: ${error}`);
    }
  }

  public async deleteTask(taskGid: string): Promise<void> {
    this.ensureAuthenticated();
    
    try {
      await this.client!.tasks.delete(taskGid);
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }
}