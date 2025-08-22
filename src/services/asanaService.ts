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

interface AsanaWorkspace {
  gid: string;
  name: string;
}

interface AsanaProject {
  gid: string;
  name: string;
}

interface AsanaTask {
  gid: string;
  name: string;
  notes?: string;
  completed?: boolean;
  assignee?: {
    gid: string;
    name: string;
  };
  projects?: AsanaProject[];
  due_on?: string;
  created_at?: string;
  modified_at?: string;
  permalink_url?: string;
}

interface AsanaError {
  message: string;
  phrase?: string;
}

interface AsanaErrorResponse {
  errors: AsanaError[];
}

interface TaskRequestData {
  name: string;
  workspace: string;
  notes?: string;
  projects?: string[];
  assignee?: string;
  due_on?: string;
}

export class AsanaService {
  private client: Asana.Client;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private usersApi: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tasksApi: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private projectsApi: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      defaultUserGid: process.env.ASANA_DEFAULT_USER_GID,
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
      const result = await this.usersApi.getUser('me', {
        opt_fields: 'gid,name,email',
      });
      const user = result;
      return {
        gid: user.gid,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      throw new Error(`Failed to get current user: ${error}`);
    }
  }

  public async getWorkspaces(): Promise<AsanaWorkspace[]> {
    this.ensureInitialized();

    try {
      const result = await this.workspacesApi.getWorkspaces({
        opt_fields: 'gid,name',
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get workspaces: ${error}`);
    }
  }

  public async getProjects(workspaceGid: string): Promise<AsanaProject[]> {
    this.ensureInitialized();

    try {
      const result = await this.projectsApi.getProjects({
        workspace: workspaceGid,
        opt_fields: 'gid,name',
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to get projects: ${error}`);
    }
  }

  public async createTask(taskData: TaskData): Promise<AsanaTask> {
    this.ensureInitialized();

    try {
      // Determine workspace - required for task creation
      let workspaceGid = taskData.workspace;
      if (!workspaceGid) {
        if (this.config.defaultWorkspaceGid) {
          workspaceGid = this.config.defaultWorkspaceGid;
          console.log(`🎯 Using default workspace: ${workspaceGid}`);
        } else {
          // Get first available workspace if no default is set
          const workspaces = await this.getWorkspaces();
          if (workspaces.length === 0) {
            throw new Error('No workspace available for task creation');
          }
          workspaceGid = workspaces[0].gid;
          console.log(`🎯 Using first available workspace: ${workspaceGid}`);
        }
      }

      // Build task data object with required parameters
      const taskRequestData: TaskRequestData = {
        name: taskData.name, // Name is required
        workspace: workspaceGid, // Workspace is required for API v1
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

      // Create task with required data structure - API v1 requires data wrapper
      const requestPayload = {
        data: taskRequestData,
      };

      console.log('Creating Asana task with payload:', JSON.stringify(requestPayload, null, 2));

      const result = await this.tasksApi.createTask(requestPayload, {
        opt_fields: 'gid,name,notes,permalink_url',
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = (error as { response?: { body: AsanaErrorResponse } }).response?.body;

      console.error('Asana createTask error:', errorMessage);
      console.error('Error response body:', errorDetails);

      if (errorDetails?.errors) {
        console.error('Detailed errors:', JSON.stringify(errorDetails.errors, null, 2));
        const detailedError = errorDetails.errors.map((e: AsanaError) => e.message).join('; ');
        throw new Error(`Failed to create task: ${detailedError}`);
      }

      throw new Error(`Failed to create task: ${errorMessage}`);
    }
  }

  public async getTasks(projectGid?: string, assignee?: string): Promise<AsanaTask[]> {
    this.ensureInitialized();

    try {
      let result;

      if (projectGid) {
        // Get tasks from specific project
        result = await this.tasksApi.getTasks({
          project: projectGid,
          opt_fields: 'gid,name,notes,completed,due_on,assignee.name,projects.name',
          limit: 50, // Add limit to prevent large dataset issues
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
          workspace: workspaceGid, // Required for assignee queries
          opt_fields: 'gid,name,notes,completed,due_on,assignee.name,projects.name',
          limit: 50, // Add limit to prevent large dataset issues
          completed_since: 'now', // Only get incomplete tasks by default
        });
      }

      return result || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        'Asana getTasks error details:',
        (error as { response?: { body: unknown } }).response?.body || errorMessage
      );
      throw new Error(`Failed to get tasks: ${errorMessage}`);
    }
  }

  public async completeTask(taskGid: string): Promise<AsanaTask> {
    this.ensureInitialized();

    try {
      const result = await this.tasksApi.updateTask(
        taskGid,
        { completed: true },
        {
          opt_fields: 'gid,name,completed',
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Failed to complete task: ${error}`);
    }
  }
}
