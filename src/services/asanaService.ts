const Asana = require('asana');

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
  private client: any;
  private usersApi: any;
  private tasksApi: any;
  private projectsApi: any;
  private workspacesApi: any;
  private isInitialized: boolean = false;

  constructor(config: AsanaConfig) {
    if (!config.personalAccessToken) {
      throw new Error('Personal Access Token is required for Asana service');
    }
    
    // Initialize client with v3.x syntax
    this.client = Asana.ApiClient.instance;
    const token = this.client.authentications['token'];
    token.accessToken = config.personalAccessToken;
    
    // Initialize API instances
    this.usersApi = new Asana.UsersApi();
    this.tasksApi = new Asana.TasksApi();
    this.projectsApi = new Asana.ProjectsApi();
    this.workspacesApi = new Asana.WorkspacesApi();
    
    this.isInitialized = true;
    console.log('✅ Asana service initialized with Personal Access Token (v3.x)');
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
      const result = await this.usersApi.getUser("me", {
        opt_fields: "gid,name,email"
      });
      const user = result.data;
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
      const result = await this.workspacesApi.getWorkspaces({
        opt_fields: "gid,name"
      });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error}`);
    }
  }

  public async getProjects(workspaceGid: string): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      const result = await this.projectsApi.getProjects({
        workspace: workspaceGid,
        opt_fields: "gid,name"
      });
      return result.data;
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
      
      // Create task with v3.x API
      const taskRequest = {
        data: {
          name: taskData.name,
          notes: taskData.notes,
          projects: taskData.projects,
          assignee: taskData.assignee,
          due_on: taskData.due_on
        }
      };
      
      const result = await this.tasksApi.createTask(taskRequest, {
        opt_fields: "gid,name,notes,permalink_url"
      });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  }

  public async getTasks(projectGid?: string, assignee?: string): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      let result;
      
      if (projectGid) {
        // Get tasks from specific project
        result = await this.tasksApi.getTasks({
          project: projectGid,
          opt_fields: 'gid,name,notes,completed,due_on,assignee.name,projects.name',
          limit: 50  // Add limit to prevent large dataset issues
        });
      } else {
        // Get tasks by assignee - need workspace parameter
        const targetAssignee = assignee || (await this.getCurrentUser()).gid;
        const workspaces = await this.getWorkspaces();
        
        if (workspaces.length === 0) {
          throw new Error('No workspace available');
        }
        
        result = await this.tasksApi.getTasks({
          assignee: targetAssignee,
          workspace: workspaces[0].gid,  // Required for assignee queries
          opt_fields: 'gid,name,notes,completed,due_on,assignee.name,projects.name',
          limit: 50,  // Add limit to prevent large dataset issues
          completed_since: 'now'  // Only get incomplete tasks by default
        });
      }
      
      return result.data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Asana getTasks error details:', (error as any).response?.body || errorMessage);
      throw new Error(`Failed to get tasks: ${errorMessage}`);
    }
  }

  public async updateTask(taskGid: string, updates: Partial<TaskData>): Promise<any> {
    this.ensureInitialized();
    
    try {
      const updateRequest = {
        data: updates
      };
      const result = await this.tasksApi.updateTask(updateRequest, taskGid, {
        opt_fields: "gid,name,notes,completed"
      });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  }

  public async completeTask(taskGid: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      const updateRequest = {
        data: { completed: true }
      };
      const result = await this.tasksApi.updateTask(updateRequest, taskGid, {
        opt_fields: "gid,name,completed"
      });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to complete task: ${error}`);
    }
  }

  public async deleteTask(taskGid: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.tasksApi.deleteTask(taskGid);
    } catch (error) {
      throw new Error(`Failed to delete task: ${error}`);
    }
  }
}