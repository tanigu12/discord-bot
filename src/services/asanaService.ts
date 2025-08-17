import * as Asana from 'asana';

interface AsanaConfig {
  personalAccessToken: string;
  defaultWorkspaceGid?: string;
  defaultProjectGid?: string;
  defaultUserGid?: string;
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
  private config: AsanaConfig;

  constructor(config: AsanaConfig) {
    if (!config.personalAccessToken) {
      throw new Error('Personal Access Token is required for Asana service');
    }
    
    this.config = config;
    
    // Initialize client with proper Asana client
    this.client = Asana.Client.create().useAccessToken(config.personalAccessToken);
    
    // For backward compatibility, set these to the client
    this.usersApi = this.client.users;
    this.tasksApi = this.client.tasks;
    this.projectsApi = this.client.projects;
    this.workspacesApi = this.client.workspaces;
    
    this.isInitialized = true;
    console.log('✅ Asana service initialized with Personal Access Token (v1.x)');
    console.log(`🎯 Default workspace: ${config.defaultWorkspaceGid || 'not set'}`);
    console.log(`📁 Default project: ${config.defaultProjectGid || 'not set'}`);
  }

  // Static method to create service instance from environment
  public static createFromEnvironment(): AsanaService {
    const personalAccessToken = process.env.ASANA_PERSONAL_ACCESS_TOKEN;
    
    if (!personalAccessToken) {
      throw new Error('ASANA_PERSONAL_ACCESS_TOKEN environment variable is required');
    }
    
    return new AsanaService({ 
      personalAccessToken,
      defaultWorkspaceGid: process.env.ASANA_DEFAULT_WORKSPACE_GID,
      defaultProjectGid: process.env.ASANA_DEFAULT_PROJECT_GID,
      defaultUserGid: process.env.ASANA_DEFAULT_USER_GID
    });
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
      // Build task data object with only defined values
      const taskRequestData: any = {
        name: taskData.name  // Name is required
      };
      
      // Add optional fields only if they have values
      if (taskData.notes && taskData.notes.trim()) {
        taskRequestData.notes = taskData.notes.trim();
      }
      
      if (taskData.projects && taskData.projects.length > 0) {
        // Filter out empty strings and ensure valid GIDs
        const validProjects = taskData.projects.filter(p => p && p.trim());
        if (validProjects.length > 0) {
          taskRequestData.projects = validProjects;
        }
      } else if (this.config.defaultProjectGid) {
        // Use default project if no projects specified
        taskRequestData.projects = [this.config.defaultProjectGid];
        console.log(`📁 Using default project: ${this.config.defaultProjectGid}`);
      }
      
      if (taskData.assignee && taskData.assignee.trim()) {
        taskRequestData.assignee = taskData.assignee.trim();
      }
      
      if (taskData.due_on && taskData.due_on.trim()) {
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(taskData.due_on.trim())) {
          taskRequestData.due_on = taskData.due_on.trim();
        }
      }
      
      // Create task with clean data structure
      const taskRequest = {
        data: taskRequestData
      };
      
      console.log('Creating Asana task with data:', JSON.stringify(taskRequest, null, 2));
      
      const result = await this.tasksApi.createTask(taskRequest, {
        opt_fields: "gid,name,notes,permalink_url"
      });
      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = (error as any).response?.body;
      
      console.error('Asana createTask error:', errorMessage);
      console.error('Error response body:', errorDetails);
      
      if (errorDetails?.errors) {
        console.error('Detailed errors:', JSON.stringify(errorDetails.errors, null, 2));
        const detailedError = errorDetails.errors.map((e: any) => e.message).join('; ');
        throw new Error(`Failed to create task: ${detailedError}`);
      }
      
      throw new Error(`Failed to create task: ${errorMessage}`);
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
        let targetAssignee = assignee;
        
        // Use default user if no assignee specified
        if (!targetAssignee && this.config.defaultUserGid) {
          targetAssignee = this.config.defaultUserGid;
          console.log(`👤 Using default user: ${this.config.defaultUserGid}`);
        } else if (!targetAssignee) {
          targetAssignee = (await this.getCurrentUser()).gid;
        }
        
        // Use default workspace if available, otherwise get first workspace
        let workspaceGid = this.config.defaultWorkspaceGid;
        if (!workspaceGid) {
          const workspaces = await this.getWorkspaces();
          if (workspaces.length === 0) {
            throw new Error('No workspace available');
          }
          workspaceGid = workspaces[0].gid;
        } else {
          console.log(`🎯 Using default workspace: ${workspaceGid}`);
        }
        
        result = await this.tasksApi.getTasks({
          assignee: targetAssignee,
          workspace: workspaceGid,  // Required for assignee queries
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