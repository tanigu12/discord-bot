# Discord Bot - AI Language Assistant

English学習をサポートするAI搭載のDiscord Bot。翻訳、文法チェック、語彙解説、コンテンツ分析など、多機能な言語学習支援を提供します。

## 🌟 主要機能

### スラッシュコマンド
Bot は以下のスラッシュコマンドをサポートしています：

#### `/search` - コンテンツ分析
- **機能**: テキストやURLを分析して詳細な説明を提供
- **使用方法**: `/search query:[分析したいテキストまたはURL]`
- **特徴**: 
  - URL自動検出・コンテンツ取得
  - 会話の文脈を考慮した分析
  - 長い分析結果の自動分割表示
- **例**: 
  - `/search query:https://example.com/article`
  - `/search query:機械学習について詳しく教えて`

#### `/random` - 日記トピック提案
- **機能**: 今日のニュースと個人的な質問を基にした日記のトピックを提案
- **使用方法**: `/random`
- **特徴**:
  - 最新ニュースベースのトピック
  - 個人的な振り返り質問
  - 英語学習のためのライティング支援

#### `/format` - スレッド整形
- **機能**: スレッドメッセージを日英両言語対応のObsidian向けブログ記事に整形
- **使用方法**: `/format` (スレッド内で実行)
- **オプション**: 
  - `include_all` - 全メッセージを含める (デフォルト: 会話関連のみ)
  - `title` - カスタムタイトルを指定
- **出力**: 日英両言語対応のMarkdownファイル

#### `/bsky` - Blueskyへの投稿
- **機能**: Bluesky Social (@taka1415.bsky.social) にメッセージを投稿
- **使用方法**: `/bsky message:[投稿メッセージ] image:[画像ファイル]`
- **制限**: 
  - メッセージは300文字以内
  - 画像は1MB以下 (JPEG, PNG, GIF, WebP対応)
- **例**: `/bsky message:Hello from Discord! image:photo.jpg`

#### `/asana` - Asanaタスク管理
- **機能**: Asanaプロジェクトのタスク管理（作成、一覧表示、完了）
- **使用方法**: 
  - `/asana action:create name:[タスク名] notes:[詳細]` - タスク作成
  - `/asana action:list` - タスク一覧表示
  - `/asana action:complete task_id:[タスクID]` - タスク完了
- **例**: `/asana action:create name:新機能実装 notes:ユーザー認証機能を追加`

### 絵文字リアクション機能

メッセージに特定の絵文字でリアクションするだけで、AIが自動で応答します。スラッシュコマンドよりも手軽に利用できます。


#### 相談機能
- 🧙‍♂️ - Larry相談（専門的アドバイス、Web検索対応）

#### アイデア管理（ideaチャンネル専用）
- 💡 - アイデアスレッド作成
- 🧙‍♂️ - Larry相談（最新情報を含む専門的アドバイス）

#### 単語・語彙学習機能
- 🧠 - Larryの日記フィードバックから日本語文と翻訳をObsidian Git Syncリポジトリに保存

**使用方法**: 任意のメッセージに上記の絵文字でリアクションするだけで、自動でAIが返答します。

## 🛠️ 技術仕様

- **Discord.js**: v14
- **TypeScript**: 5.x
- **AI Service**: OpenAI GPT-5-mini
- **Node.js**: 18.x以上推奨
- **タスク管理**: Asana API v1統合
- **SNS連携**: Bluesky API対応
- **記憶機能**: GitHub API経由でObsidian Git Syncリポジトリ連携

## 🔧 セットアップ

### 必要な環境変数

`.env`ファイルを作成し、以下の変数を設定：

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
OPENAI_API_KEY=your_openai_api_key
BLUESKY_USERNAME=your_bluesky_handle
BLUESKY_PASSWORD=your_bluesky_app_password
ASANA_PERSONAL_ACCESS_TOKEN=your_asana_pat
ASANA_DEFAULT_WORKSPACE_GID=your_workspace_gid
ASANA_DEFAULT_PROJECT_GID=your_project_gid
ASANA_DEFAULT_USER_GID=your_user_gid
GITHUB_PAT=your_github_personal_access_token
OBSIDIAN_REPO_OWNER=your_github_username
OBSIDIAN_REPO_NAME=your_obsidian_git_sync_repo
OBSIDIAN_VOCAB_PATH=notes/10_Vocabulary/
GUILD_ID=your_guild_id_for_development
```

### インストール手順

1. 依存関係のインストール:
```bash
npm install
```

2. TypeScriptのコンパイル:
```bash
npm run build
```

3. Discordスラッシュコマンドのデプロイ:
```bash
npm run deploy-commands
```

4. 開発サーバーの起動:
```bash
npm run dev
```

### 本番環境での実行

```bash
npm run start
```

## 🎯 Bot権限設定

Botが正常に動作するために必要な権限：

### 必須権限
- `View Channels` - チャンネル内容の読み取り
- `Send Messages` - メッセージの送信
- `Read Message History` - メッセージ履歴の読み取り
- `Use Slash Commands` - スラッシュコマンドの実行

### 追加機能用権限
- `Create Public Threads` - スレッド作成（/searchコマンド用）
- `Add Reactions` - 絵文字リアクション機能用
- `Manage Messages` - Botリアクションの管理
- `Attach Files` - ファイル添付機能
- `Embed Links` - リッチEmbed応答

### Bot招待URL

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=139586988096&scope=bot%20applications.commands
```

`YOUR_BOT_CLIENT_ID`を実際のBotのクライアントIDに置き換えてください。

## 📖 使用例

### Larry相談
```
ユーザー: 機械学習の最新トレンドについて教えて
Bot (🧙‍♂️リアクション): Larry's Consultation: 最新の機械学習では...（Web検索結果も含む専門的アドバイス）
```

### コンテンツ分析
```
/search query:https://example.com/ai-article
→ 記事の内容を分析し、要点をまとめて日本語で説明
```

### 日記トピック
```
/random
→ 今日のニュースベースのトピック3つと個人的な振り返り質問を提案
```

### アイデア管理とLarry相談
```
ideaチャンネルでアイデアを投稿
→ 💡絵文字が自動追加される
→ 💡をクリックでスレッド作成
→ 🧙‍♂️をクリックでLarryの専門的アドバイス（Web検索付き）
```

### 語彙学習・記憶機能
```
Larryの日記フィードバックメッセージ（message.txt添付）
→ 🧠リアクションで日本語文と翻訳をObsidianリポジトリに自動保存
→ 後から語彙復習に活用可能
```

### Asanaタスク管理
```
/asana action:create name:新機能開発 notes:ユーザー認証システムの実装
→ Asanaプロジェクトにタスクを作成し、URLを返却
```

## 🎓 Bot活用方法

このBotは以下のような用途に最適です：

1. **専門的相談**: 🧙‍♂️リアクションでLarryに専門的アドバイスを求める
2. **ライティング練習**: /randomで日記トピックを取得し、定期的な英語ライティング
3. **情報収集とまとめ**: /searchでWebコンテンツを分析し、理解を深める
4. **語彙学習**: 🧠リアクションでLarryのフィードバック内容をObsidianに自動保存し、後から復習
5. **アイデア発展**: ideaチャンネルでのブレインストーミングとアイデア管理
6. **プロジェクト管理**: Asana連携による学習タスクの体系的管理
7. **コンテンツ作成**: ブログ記事の整形と出力

## 🔍 トラブルシューティング

### よくある問題

**"Cannot create thread in this channel"エラー**
- Botに`Create Public Threads`権限があることを確認
- チャンネルがスレッド作成に対応していることを確認
- チャンネルのスレッド数制限（1000個）に達していないか確認

**AI機能が動作しない**
- `OPENAI_API_KEY`が正しく設定されていることを確認
- OpenAI APIの使用量制限に達していないか確認

**Bluesky投稿エラー**
- `BLUESKY_USERNAME`と`BLUESKY_PASSWORD`が正しく設定されていることを確認
- Blueskyのアプリパスワードを使用していることを確認（通常パスワードではない）

**Asana連携エラー**
- `ASANA_PERSONAL_ACCESS_TOKEN`が有効であることを確認
- 適切なワークスペースとプロジェクトのGIDが設定されていることを確認

**Web検索機能が動作しない**
- OpenAI APIキーが`gpt-4o-search-preview`モデルへのアクセス権を持っていることを確認
- インターネット接続が正常であることを確認

**記憶機能（🧠）が動作しない**
- `GITHUB_PAT`が正しく設定されていることを確認
- Obsidianリポジトリのオーナーとリポジトリ名が正しいことを確認
- GitHub Personal Access Tokenがリポジトリへの書き込み権限を持っていることを確認
- 🧠リアクションはLarryの日記フィードバックメッセージ（message.txt添付）でのみ機能します

## 🧹 コードベースの整理

### 未使用/レガシーコンポーネント

以下のコンポーネントは現在使用されていないか、レガシーとなっています：

**削除可能なファイル:**
- `dist/` フォルダ全体（ビルド時に再生成されます）
- レガシーコマンドファイル（/translate、/grammar、/explain は絵文字リアクション機能に統合済み）

**検討が必要な機能:**
- AI Partner統合ファイル（`src/features/ai-partner/`）- 使用するか削除するかの判断が必要
- コンテンツ集約システム（`src/features/content-aggregation/`）- /randomコマンドでのみ使用
- 技術的質問・英語フレーズ機能 - シンプル化を検討
- 未使用のIdeaHandler機能（カテゴリ分け、承認、優先度設定、実装済みマーク、アーカイブ）

**注意:** READMEで言及されている国旗絵文字による翻訳機能（🇺🇸🇯🇵等）は実装されていません。翻訳機能は日記チャンネルでの自動翻訳に置き換えられています。

### youtube-dl-execのクッキー取得

YouTubeの動画を取得するためには、クッキーが必要。
```bash
wget --save-cookies cookies.txt --keep-session-cookies -O /dev/null https://www.youtube.com/
```

上記がうまくいかない場合（gitignoreしてます）


![ScreenRecording2025-09-05at7.53.28.mov](./ScreenRecording2025-09-05at7.53.28.mov)

もしくは、
Get cookies.txt LOCALLYという拡張機能を使用してください。
https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc?utm_source=chatgpt.com&pli=1

## 🤝 Contributing

プルリクエストやIssueの報告を歓迎します。バグ報告や機能提案がある場合は、GitHubのIssuesセクションをご利用ください。

## 📄 License

このプロジェクトはMITライセンスの下で公開されています。