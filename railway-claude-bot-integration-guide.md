# Railway Discord Bot + Claude Code 統合ガイド

## 概要

このガイドでは、Railway上にホストされたDiscord Botを作成し、Claude Code APIを利用してプライベートGitHubリポジトリを検索・操作できるシステムの構築方法を詳しく説明します。

## 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [前提条件](#前提条件)
3. [Railwayセットアップ](#railwayセットアップ)
4. [Discord Bot設定](#discord-bot設定)
5. [Claude Code API統合](#claude-code-api統合)
6. [GitHub Actions統合](#github-actions統合)
7. [プライベートリポジトリアクセス](#プライベートリポジトリアクセス)
8. [セキュリティベストプラクティス](#セキュリティベストプラクティス)
9. [実装例](#実装例)
10. [デプロイ手順](#デプロイ手順)
11. [トラブルシューティング](#トラブルシューティング)

## アーキテクチャ概要

```
Discord User → Discord Bot (Railway) → GitHub Actions Trigger → Claude Code (GitHub Runner) → Private Repository
                      ↕                         ↕                           ↕                          ↕
              Environment Variables    workflow_dispatch API      Claude GitHub Action        GitHub API / MCP Server
                      ↓                         ↓                           ↓                          ↓
              Discord Webhook ← GitHub Actions Status ← Workflow Results ← AI Analysis Results
```

### 主要コンポーネント

1. **Railway Discord Bot**: 24/7稼働のDiscord Bot（TypeScript + Discord.js v14）
2. **GitHub Actions Workflow**: Claude Code統合によるAI処理実行環境
3. **Claude Code Action**: Anthropic公式GitHub Actionによる高度なAI処理
4. **Workflow Dispatch**: Discord BotからGitHub ActionsをプログラマティックにトリガーするAPI
5. **Discord Webhook**: GitHub Actions実行結果をDiscordにリアルタイム通知
6. **セキュリティレイヤー**: 環境変数、トークン管理、認証

## 前提条件

### 必要なアカウント・サービス

- **Discord Developer Portal**アカウント（Bot Token取得用）
- **Railway**アカウント（無料プランあり、月額$5または500時間の無料利用）
- **Anthropic API**アカウント（Claude API Key取得用、$5の無料クレジット）
- **GitHub**アカウント（プライベートリポジトリアクセス用）

### 技術スタック

- **Node.js 18+**
- **TypeScript 5.x**
- **Discord.js v14**
- **@anthropic-ai/sdk** または **Model Context Protocol (MCP)**
- **@octokit/rest** (GitHub API)

## Railwayセットアップ

### 1. Railway Template選択

Railway provides three main Discord bot templates for 2024:

```bash
# オプション1: 基本Discord.js Bot
https://railway.app/template/jX0xQo

# オプション2: TypeScript Discord Bot
https://railway.app/template/EWKFBX

# オプション3: ノーコード/ローコード Bot
https://railway.app/template/xyquaG
```

### 2. カスタムデプロイメント

既存のDiscord Botプロジェクトをデプロイする場合：

```bash
# Railway CLI インストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
railway init

# デプロイ
railway up
```

### 3. 環境変数設定

Railway Dashboard で以下の環境変数を設定：

```env
# Discord Bot
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_test_guild_id

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# GitHub Access
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_private_repo_name
```

## Discord Bot設定

### 1. Discord Developer Portalでの設定

```javascript
// 必要なBot Permissions (Permissions Integer: 139586988096)
const requiredPermissions = [
  'ViewChannels', // チャンネル閲覧
  'SendMessages', // メッセージ送信
  'ReadMessageHistory', // メッセージ履歴読み取り
  'UseSlashCommands', // スラッシュコマンド使用
  'CreatePublicThreads', // パブリックスレッド作成（重要）
  'AddReactions', // リアクション追加
  'AttachFiles', // ファイル添付
  'EmbedLinks', // リンク埋め込み
];
```

### 2. 招待URL生成

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=139586988096&scope=bot%20applications.commands
```

### 3. Gateway Intents設定

```javascript
const { GatewayIntentBits } = require('discord.js');

const requiredIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent, // 特権インテント
];
```

## Claude Code API統合

### アプローチ1: 直接API統合

```typescript
// src/services/claude.ts
import { Anthropic } from '@anthropic-ai/sdk';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async searchRepository(query: string, repoContent: string): Promise<string> {
    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `以下のリポジトリ内容から「${query}」に関する情報を検索してください:\n\n${repoContent}`,
          },
        ],
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }
}
```

### アプローチ2: Model Context Protocol (MCP)

```typescript
// src/services/mcp.ts
import { Client } from '@modelcontextprotocol/sdk/client/index';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio';

export class MCPService {
  private client: Client;

  async initializeGitHubMCP() {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['@modelcontextprotocol/server-github', process.env.GITHUB_TOKEN!],
    });

    this.client = new Client(
      { name: 'discord-bot-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await this.client.connect(transport);
  }

  async searchCode(query: string, repo: string): Promise<any> {
    const result = await this.client.callTool({
      name: 'search_code',
      arguments: {
        query,
        repo,
        owner: process.env.GITHUB_OWNER,
      },
    });

    return result;
  }
}
```

### アプローチ3: Claude GitHub Integration

2024年にAnthropicが展開したGitHub統合を活用：

```typescript
// Claude Projects API経由でのリポジトリアクセス
// 注意: Enterprise/Pro Plan限定機能の可能性あり

export class ClaudeGitHubService {
  async createProjectWithRepo(repoUrl: string) {
    // Claude Projects APIを使用してリポジトリを同期
    // 実装は公式ドキュメントに従う
  }
}
```

## GitHub Actions統合

**Discord BotからGitHub Actionsを起動してClaude Codeを実行する方法は可能で、2024年の推奨アプローチです。**

### なぜGitHub Actions統合を選ぶべきか

1. **公式サポート**: Anthropicが2024年に公式Claude Code GitHub Actionを提供
2. **リソース効率**: GitHub Runnersの強力なハードウェアでAI処理を実行
3. **セキュリティ**: GitHubの環境内で安全にプライベートリポジトリにアクセス
4. **コスト効率**: Claude API + GitHub Actionsの組み合わせで約$0.02/セッション
5. **並列処理**: 複数のClaude Codeエージェントが同時実行可能

### アーキテクチャフロー

```
1. Discord User → Discord Bot (Railway)
2. Discord Bot → GitHub API (workflow_dispatch trigger)
3. GitHub Actions → Claude Code Action (AI処理実行)
4. Claude Code → Private Repository Analysis
5. GitHub Actions → Discord Webhook (結果通知)
6. Discord → User (結果表示)
```

### 1. GitHub Actions Workflow設定

````yaml
# .github/workflows/claude-discord-bot.yml
name: Claude Discord Bot Integration

on:
  workflow_dispatch:
    inputs:
      discord_user_id:
        description: 'Discord User ID'
        required: true
        type: string
      discord_channel_id:
        description: 'Discord Channel ID'
        required: true
        type: string
      query:
        description: 'Search Query'
        required: true
        type: string
      task_type:
        description: 'Task Type'
        required: true
        type: choice
        options:
          - search
          - analyze
          - implement
          - debug
      repository_path:
        description: 'Repository Path (optional)'
        required: false
        type: string

jobs:
  claude-processing:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Claude Code Processing
        uses: anthropics/claude-code-action@v1
        with:
          anthropic-api-key: ${{ secrets.ANTHROPIC_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          task: |
            Discord User: ${{ github.event.inputs.discord_user_id }}
            Task Type: ${{ github.event.inputs.task_type }}
            Query: ${{ github.event.inputs.query }}
            Path: ${{ github.event.inputs.repository_path || '.' }}

            Please ${{ github.event.inputs.task_type }} the following:
            ${{ github.event.inputs.query }}

          # Claude Code設定
          model: 'claude-3-5-sonnet-20241022'
          max-tokens: 8000
          timeout: 1800 # 30分
        id: claude_result

      - name: Process Claude Results
        run: |
          echo "Processing Claude results..."
          # 結果をファイルに保存
          echo "${{ steps.claude_result.outputs.response }}" > claude_response.md

          # 長い結果を2000文字ずつに分割（Discord制限対応）
          split -b 1900 -d -a 3 claude_response.md chunk_

      - name: Upload Results as Artifact
        uses: actions/upload-artifact@v4
        with:
          name: claude-results-${{ github.run_number }}
          path: |
            claude_response.md
            chunk_*

      - name: Discord Success Notification
        if: success()
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
          status: 'success'
          title: '✅ Claude Code Processing Complete'
          description: |
            **Task**: ${{ github.event.inputs.task_type }}
            **Query**: ${{ github.event.inputs.query }}
            **User**: <@${{ github.event.inputs.discord_user_id }}>
            **Channel**: <#${{ github.event.inputs.discord_channel_id }}>

            Results are being sent to your channel...
          color: 0x00ff00
          username: 'Claude Code Bot'
          avatar_url: 'https://avatars.githubusercontent.com/u/anthropic'

      - name: Send Results to Discord
        if: success()
        run: |
          # Discord Webhook経由で結果を送信
          python3 << 'EOF'
          import requests
          import json
          import os
          import glob

          webhook_url = "${{ secrets.DISCORD_WEBHOOK_URL }}"
          channel_id = "${{ github.event.inputs.discord_channel_id }}"
          user_id = "${{ github.event.inputs.discord_user_id }}"

          # チャンク化された結果を送信
          chunk_files = sorted(glob.glob('chunk_*'))

          for i, chunk_file in enumerate(chunk_files):
              with open(chunk_file, 'r', encoding='utf-8') as f:
                  content = f.read()
              
              if i == 0:
                  # 最初のメッセージ
                  payload = {
                      "content": f"<@{user_id}> Claude Code処理結果 (Part {i+1}/{len(chunk_files)}):\n\n```\n{content}\n```"
                  }
              else:
                  # 続きのメッセージ
                  payload = {
                      "content": f"続き (Part {i+1}/{len(chunk_files)}):\n\n```\n{content}\n```"
                  }
              
              response = requests.post(webhook_url, json=payload)
              if response.status_code != 204:
                  print(f"Error sending chunk {i+1}: {response.status_code}")
              
              # Discord rate limit対応
              import time
              time.sleep(1)
          EOF

      - name: Discord Error Notification
        if: failure()
        uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK_URL }}
          status: 'failure'
          title: '❌ Claude Code Processing Failed'
          description: |
            **Task**: ${{ github.event.inputs.task_type }}
            **Query**: ${{ github.event.inputs.query }}
            **User**: <@${{ github.event.inputs.discord_user_id }}>

            Please check the workflow logs for details.
          color: 0xff0000
          username: 'Claude Code Bot'
          avatar_url: 'https://avatars.githubusercontent.com/u/anthropic'
````

### 2. Discord BotでのWorkflow Dispatch実装

```typescript
// src/services/githubActions.ts
import { Octokit } from '@octokit/rest';

export class GitHubActionsService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async triggerClaudeWorkflow(params: {
    discordUserId: string;
    discordChannelId: string;
    query: string;
    taskType: 'search' | 'analyze' | 'implement' | 'debug';
    repositoryPath?: string;
  }): Promise<{ runId: number; url: string }> {
    try {
      const response = await this.octokit.rest.actions.createWorkflowDispatch({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        workflow_id: 'claude-discord-bot.yml',
        ref: 'main',
        inputs: {
          discord_user_id: params.discordUserId,
          discord_channel_id: params.discordChannelId,
          query: params.query,
          task_type: params.taskType,
          repository_path: params.repositoryPath || '.',
        },
      });

      // ワークフロー実行URLを取得
      const runsResponse = await this.octokit.rest.actions.listWorkflowRuns({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        workflow_id: 'claude-discord-bot.yml',
        per_page: 1,
      });

      const latestRun = runsResponse.data.workflow_runs[0];

      return {
        runId: latestRun.id,
        url: latestRun.html_url,
      };
    } catch (error) {
      console.error('GitHub Actions trigger error:', error);
      throw error;
    }
  }

  async getWorkflowStatus(runId: number): Promise<{
    status: string;
    conclusion: string | null;
    url: string;
  }> {
    try {
      const response = await this.octokit.rest.actions.getWorkflowRun({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        run_id: runId,
      });

      return {
        status: response.data.status,
        conclusion: response.data.conclusion,
        url: response.data.html_url,
      };
    } catch (error) {
      console.error('GitHub Actions status check error:', error);
      throw error;
    }
  }
}
```

### 3. Discord BotでのSlashCommand実装

```typescript
// src/commands/claude-actions.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { GitHubActionsService } from '../services/githubActions';

const githubActions = new GitHubActionsService();

export const data = new SlashCommandBuilder()
  .setName('claude-run')
  .setDescription('GitHub Actions上でClaude Codeを実行します')
  .addStringOption(option =>
    option
      .setName('task')
      .setDescription('実行するタスクの種類')
      .setRequired(true)
      .addChoices(
        { name: '🔍 Search (検索)', value: 'search' },
        { name: '📊 Analyze (分析)', value: 'analyze' },
        { name: '🛠️ Implement (実装)', value: 'implement' },
        { name: '🐛 Debug (デバッグ)', value: 'debug' }
      )
  )
  .addStringOption(option =>
    option.setName('query').setDescription('Claude Codeへの指示内容').setRequired(true)
  )
  .addStringOption(option =>
    option.setName('path').setDescription('対象のファイルパス（省略可）').setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const task = interaction.options.getString('task')! as
      | 'search'
      | 'analyze'
      | 'implement'
      | 'debug';
    const query = interaction.options.getString('query')!;
    const path = interaction.options.getString('path');

    // GitHub Actionsワークフローをトリガー
    const result = await githubActions.triggerClaudeWorkflow({
      discordUserId: interaction.user.id,
      discordChannelId: interaction.channelId,
      query: query,
      taskType: task,
      repositoryPath: path,
    });

    // 実行開始の通知
    const embed = new EmbedBuilder()
      .setTitle('🚀 Claude Code処理を開始しました')
      .setColor(0x00ff00)
      .addFields(
        { name: 'タスク', value: `${getTaskEmoji(task)} ${task}`, inline: true },
        { name: 'クエリ', value: query.substring(0, 1000), inline: false },
        { name: 'パス', value: path || 'プロジェクト全体', inline: true },
        { name: 'ワークフロー', value: `[GitHub Actions](<${result.url}>)`, inline: true }
      )
      .setFooter({
        text: `処理完了時に結果を通知します • Run ID: ${result.runId}`,
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    // 定期的にステータスをチェック（オプション）
    setTimeout(async () => {
      try {
        const status = await githubActions.getWorkflowStatus(result.runId);

        if (status.conclusion) {
          const statusEmbed = new EmbedBuilder()
            .setTitle(status.conclusion === 'success' ? '✅ 処理完了' : '❌ 処理失敗')
            .setColor(status.conclusion === 'success' ? 0x00ff00 : 0xff0000)
            .addFields(
              { name: 'ステータス', value: status.status, inline: true },
              { name: '結果', value: status.conclusion, inline: true },
              { name: 'ワークフロー', value: `[詳細を見る](<${status.url}>)`, inline: true }
            );

          await interaction.followUp({ embeds: [statusEmbed] });
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 60000); // 1分後にステータスチェック
  } catch (error) {
    console.error('Claude Actions command error:', error);

    const errorEmbed = new EmbedBuilder()
      .setTitle('❌ エラーが発生しました')
      .setColor(0xff0000)
      .setDescription('GitHub Actionsの起動に失敗しました。しばらく待ってから再試行してください。');

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      await interaction.reply({ embeds: [errorEmbed] });
    }
  }
}

function getTaskEmoji(task: string): string {
  const emojis = {
    search: '🔍',
    analyze: '📊',
    implement: '🛠️',
    debug: '🐛',
  };
  return emojis[task as keyof typeof emojis] || '⚡';
}
```

### 4. 必要な環境変数とSecretsの設定

#### GitHub Repository Secrets

```
ANTHROPIC_API_KEY=your_anthropic_api_key
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

#### Railway Environment Variables

```
DISCORD_TOKEN=your_discord_token
CLIENT_ID=your_discord_client_id
GITHUB_TOKEN=your_github_token_with_actions_scope
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
```

### 5. Discord Webhookセットアップ

```typescript
// Discord Serverでのwebhook作成手順
// 1. Server Settings → Integrations → Webhooks
// 2. Create Webhook
// 3. URLをコピーしてGitHub Secretsに追加
```

### GitHub Actions統合の利点

1. **スケーラビリティ**: GitHub Runnersの高性能環境でClaude処理を実行
2. **セキュリティ**: プライベートリポジトリへの安全なアクセス
3. **並列処理**: 複数のDiscordユーザーからの同時リクエスト処理
4. **コスト効率**: 従量課金でリソースの無駄がない
5. **監査ログ**: GitHub Actionsの詳細な実行ログ
6. **結果の永続化**: Artifactとしての結果保存

この方法により、Discord BotからGitHub Actions経由でClaude Codeを実行し、結果をDiscordに自動通知する強力なシステムを構築できます。

## プライベートリポジトリアクセス

### 1. GitHub Personal Access Token方式

```typescript
// src/services/github.ts
import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async getRepositoryContent(path: string = ''): Promise<string> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path,
      });

      if (Array.isArray(data)) {
        // ディレクトリの場合
        return this.processDirectoryContent(data);
      } else if (data.type === 'file') {
        // ファイルの場合
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return content;
      }

      return '';
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  private async processDirectoryContent(items: any[]): Promise<string> {
    let allContent = '';

    for (const item of items) {
      if (item.type === 'file' && this.isTextFile(item.name)) {
        const fileContent = await this.getRepositoryContent(item.path);
        allContent += `\n\n--- ${item.path} ---\n${fileContent}`;
      }
    }

    return allContent;
  }

  private isTextFile(filename: string): boolean {
    const textExtensions = ['.js', '.ts', '.py', '.md', '.txt', '.json', '.yaml', '.yml'];
    return textExtensions.some(ext => filename.endsWith(ext));
  }
}
```

### 2. GitHub App方式（推奨）

```typescript
// より細かい権限制御とセキュリティのためのGitHub App使用
import { App } from '@octokit/app';

export class GitHubAppService {
  private app: App;

  constructor() {
    this.app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_PRIVATE_KEY!,
      installationId: process.env.GITHUB_INSTALLATION_ID!,
    });
  }

  async getInstallationOctokit() {
    return await this.app.getInstallationOctokit(parseInt(process.env.GITHUB_INSTALLATION_ID!));
  }
}
```

## セキュリティベストプラクティス

### 1. 環境変数管理

```typescript
// src/config/environment.ts
import { config } from 'dotenv';

config();

export const Environment = {
  // Discord
  DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
  CLIENT_ID: process.env.CLIENT_ID!,

  // Claude
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,

  // GitHub
  GITHUB_TOKEN: process.env.GITHUB_TOKEN!,

  // 検証関数
  validate() {
    const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'ANTHROPIC_API_KEY', 'GITHUB_TOKEN'];

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
    }
  },
};

// アプリケーション起動時に検証
Environment.validate();
```

### 2. レート制限・エラーハンドリング

```typescript
// src/utils/rateLimiter.ts
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1分
  ) {}

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // 古いリクエストを削除
    const validRequests = userRequests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(userId, validRequests);
    return true;
  }
}
```

### 3. セキュアなトークン管理

```typescript
// Railway環境変数での暗号化
// 本番環境では以下のような追加セキュリティを実装

export class SecureTokenManager {
  private static decrypt(encryptedToken: string): string {
    // 実際の実装では適切な暗号化ライブラリを使用
    // 例: crypto-js, node:crypto 等
    return encryptedToken; // プレースホルダー
  }

  static getSecureToken(tokenName: string): string {
    const encrypted = process.env[tokenName];
    if (!encrypted) {
      throw new Error(`Token ${tokenName} not found`);
    }

    return this.decrypt(encrypted);
  }
}
```

## 実装例

### Discord Bot メインファイル

```typescript
// src/index.ts
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { ClaudeService } from './services/claude';
import { GitHubService } from './services/github';
import { RateLimiter } from './utils/rateLimiter';
import { Environment } from './config/environment';

class DiscordClaudeBot {
  private client: Client;
  private claude: ClaudeService;
  private github: GitHubService;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.claude = new ClaudeService();
    this.github = new GitHubService();
    this.rateLimiter = new RateLimiter(5, 60000); // 1分に5回まで

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.once(Events.ClientReady, () => {
      console.log(`✅ Bot ready! Logged in as ${this.client.user?.tag}`);
    });

    this.client.on(Events.InteractionCreate, async interaction => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'search-repo') {
        await this.handleRepoSearch(interaction);
      }
    });
  }

  private async handleRepoSearch(interaction: any) {
    try {
      // レート制限チェック
      if (!this.rateLimiter.isAllowed(interaction.user.id)) {
        await interaction.reply({
          content: '⚠️ レート制限に達しています。しばらく待ってから再試行してください。',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      const query = interaction.options.getString('query');
      const searchPath = interaction.options.getString('path') || '';

      // GitHubからリポジトリ内容取得
      const repoContent = await this.github.getRepositoryContent(searchPath);

      // Claudeで検索・解析
      const result = await this.claude.searchRepository(query, repoContent);

      // Discord thread作成（長い回答用）
      const thread = await interaction.followUp({
        content: `🔍 **検索結果: "${query}"**`,
      });

      if (interaction.channel?.isThread()) {
        // すでにスレッド内の場合
        await interaction.editReply(result);
      } else {
        // 新しいスレッド作成
        const createdThread = await interaction.followUp({
          content: result.substring(0, 2000), // Discord文字制限対応
        });

        // 長い結果の場合は分割送信
        if (result.length > 2000) {
          const chunks = this.splitMessage(result.substring(2000));
          for (const chunk of chunks) {
            await createdThread.reply(chunk);
          }
        }
      }
    } catch (error) {
      console.error('Repository search error:', error);
      await interaction.editReply({
        content: '❌ エラーが発生しました。しばらく待ってから再試行してください。',
      });
    }
  }

  private splitMessage(text: string): string[] {
    const chunks = [];
    let current = '';

    for (const line of text.split('\n')) {
      if ((current + line + '\n').length > 2000) {
        if (current) chunks.push(current);
        current = line + '\n';
      } else {
        current += line + '\n';
      }
    }

    if (current) chunks.push(current);
    return chunks;
  }

  async start() {
    await this.client.login(Environment.DISCORD_TOKEN);
  }
}

// アプリケーション開始
const bot = new DiscordClaudeBot();
bot.start().catch(console.error);
```

### Slash Command 定義

```typescript
// src/commands/search-repo.ts
import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('search-repo')
  .setDescription('プライベートリポジトリ内を検索します')
  .addStringOption(option => option.setName('query').setDescription('検索クエリ').setRequired(true))
  .addStringOption(option =>
    option.setName('path').setDescription('検索対象のパス (省略可)').setRequired(false)
  );
```

## デプロイ手順

### 1. プロジェクト準備

```bash
# プロジェクト構造
discord-claude-bot/
├── src/
│   ├── index.ts
│   ├── commands/
│   ├── services/
│   └── utils/
├── package.json
├── tsconfig.json
├── .gitignore
└── railway.json
```

### 2. package.json設定

```json
{
  "name": "discord-claude-bot",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec tsx src/index.ts",
    "deploy-commands": "tsx src/deploy-commands.ts"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "@anthropic-ai/sdk": "^0.17.1",
    "@octokit/rest": "^20.0.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tsx": "^4.6.2",
    "nodemon": "^3.0.2",
    "@types/node": "^20.10.6"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. Railway Configuration

```json
// railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 4. デプロイコマンド

```bash
# ローカル開発
npm install
npm run dev

# Railway デプロイ
railway login
railway init
railway add
railway up

# 環境変数設定（Railway Dashboard推奨）
railway variables set DISCORD_TOKEN=your_token
railway variables set ANTHROPIC_API_KEY=your_key
railway variables set GITHUB_TOKEN=your_github_token
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. "Missing Access" エラー

```
Error: Missing Access
```

**解決方法**:

- Bot権限確認（`Create Public Threads`権限が重要）
- 招待URLで正しい権限を付与
- サーバー管理者権限確認

#### 2. Claude API レート制限

```
Error: Rate limit exceeded
```

**解決方法**:

```typescript
// 指数バックオフ実装
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

#### 3. GitHub API認証エラー

```
Error: Bad credentials
```

**解決方法**:

- Personal Access Tokenの権限確認
- トークンの有効期限確認
- リポジトリアクセス権限確認

#### 4. Railway環境変数未設定

```
Error: Required environment variable X is not set
```

**解決方法**:

- Railway Dashboardで環境変数確認
- `.env.example`と実際の設定比較
- アプリケーション再起動

#### 5. メモリ不足エラー

```
Error: Process out of memory
```

**解決方法**:

- リポジトリ内容取得時のファイルサイズ制限
- チャンク処理実装
- Railway Pro Plan検討

### ログとモニタリング

```typescript
// src/utils/logger.ts
export class Logger {
  static info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, meta);
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  }

  static warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, meta);
  }
}
```

## まとめ

このガイドでは、Railway上でDisord BotとClaude Code APIを統合し、プライベートGitHubリポジトリを検索するシステムの構築方法を詳しく解説しました。

### 主要なポイント

- **Railway**: 簡単で費用効率の良いDiscord Botホスティング
- **Claude API**: 強力なコード理解・検索機能
- **セキュリティ**: 適切なトークン管理と権限設定
- **GitHub統合**: プライベートリポジトリへの安全なアクセス

### 次のステップ

- 追加のClaude機能実装（コード生成、リファクタリング提案等）
- Webhookを使用したリアルタイム更新
- Dashboard UIの追加
- チーム利用のための権限管理強化

このシステムにより、Discord上からプライベートリポジトリを効率的に検索・分析し、開発生産性を大幅に向上させることができます。
