import Asana from 'asana';

interface AsanaConfig {
  personalAccessToken: string;
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
  private client: Asana.Client;
  private isInitialized: boolean = false;

  constructor(config: AsanaConfig) {
    if (!config.personalAccessToken) {
      throw new Error('Personal Access Token is required for Asana service');
    }
    
    // Initialize client with Personal Access Token
    this.client = Asana.Client.create().useAccessToken(config.personalAccessToken);
    this.isInitialized = true;
    
    console.log('✅ Asana service initialized with Personal Access Token');
  }

  // Static method to create service instance from environment
  public static createFromEnvironment(): AsanaService {
    const personalAccessToken = process.env.ASANA_PERSONAL_ACCESS_TOKEN;
    
    if (!personalAccessToken) {
      throw new Error('ASANA_PERSONAL_ACCESS_TOKEN environment variable is required');
    }
    
    return new AsanaService({ personalAccessToken });
  }

  // Check if service is properly initialized
  public isReady(): boolean {
    return this.isInitialized && !!this.client;
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.client) {
      throw new Error('Asana service not initialized. Please check your Personal Access Token.');
    }
  }

  public async getCurrentUser(): Promise<User> {
    this.ensureInitialized();
    
    try {
      const user = await this.client.users.me();
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
    this.ensureInitialized();
    
    try {
      const workspacesList = await this.client.workspaces.findAll();
      // Convert ResourceList to array using spread operator
      return [...(workspacesList as any)];
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error}`);
    }
  }

  public async getProjects(workspaceGid: string): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      const projectsList = await this.client.projects.findByWorkspace(workspaceGid);
      // Convert ResourceList to array using spread operator
      return [...(projectsList as any)];
    } catch (error) {
      throw new Error(`Failed to get projects: ${error}`);
    }
  }

  public async createTask(taskData: TaskData): Promise<any> {
    this.ensureInitialized();
    
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
      
      return await this.client.tasks.create(taskDataWithWorkspace);
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  }

  public async getTasks(projectGid?: string, assignee?: string): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      const params: any = {
        opt_fields: 'name,notes,completed,due_on,assignee.name,projects.name'
      };
      
      let tasksList;
      if (projectGid) {
        tasksList = await this.client.tasks.findByProject(projectGid, params);
      } else {
        if (assignee) {
          params.assignee = assignee;
        } else {
          const user = await this.getCurrentUser();
          params.assignee = user.gid;
        }
        tasksList = await this.client.tasks.findAll(params);
      }
      
      // Convert ResourceList to array using spread operator
      return [...(tasksList as any)];
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error}`);
    }
  }

  public async updateTask(taskGid: string, updates: Partial<TaskData>): Promise<any> {
    this.ensureInitialized();
    
    try {
      return await this.client.tasks.update(taskGid, updates);
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  }

  public async completeTask(taskGid: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      return await this.client.tasks.update(taskGid, { completed: true });
    } catch (error) {
      throw new Error(`Failed to complete task: ${error}`);
    }
  }

  public async deleteTask(taskGid: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client.tasks.delete(taskGid);
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }
}