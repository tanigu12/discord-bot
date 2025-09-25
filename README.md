# Discord Bot - AI Language Assistant

English学習をサポートするAI搭載のDiscord Bot。翻訳、文法チェック、語彙解説、コンテンツ分析、面接練習など、多機能な言語学習・キャリア支援を提供します。

## 🌟 主要機能

### スラッシュコマンド
Bot は以下のスラッシュコマンドをサポートしています：

#### `/ping` - 接続確認
- **機能**: Botの動作確認
- **使用方法**: `/ping`
- **応答**: "Pong!" でBotが正常に動作していることを確認

#### `/help` - ヘルプ表示
- **機能**: 絵文字リアクション機能の使い方ガイドを表示
- **使用方法**: `/help`
- **内容**: 利用可能な絵文字リアクションとその機能の一覧

#### `/random` - 学習コンテンツ生成
- **機能**: 日記トピック、技術質問、英語フレーズ、ディベートトピックをランダム生成
- **使用方法**: `/random`
- **特徴**:
  - 最新ニュースベースの日記トピック
  - 個人的な振り返り質問
  - 技術面接練習問題
  - 英語学習フレーズ
  - ディベート練習用トピック

#### `/system-design` - システム設計面接練習
- **機能**: システム設計面接の構造化された模範回答を提供
- **使用方法**: `/system-design`
- **特徴**: "How would you design ~~ service?" 形式の質問に対する詳細回答

#### `/tech-interview` - 技術面接練習
- **機能**: 技術面接質問の構造化された模範回答を提供
- **使用方法**: `/tech-interview`
- **特徴**: 詳細な説明付きの技術的な回答例

#### `/debate-answer` - ディベート練習
- **機能**: ディベート練習用の4段階論理構造による模範回答
- **使用方法**: `/debate-answer`
- **特徴**: 
  - 意見の明確な表明
  - 根拠の提示
  - 反対意見の承認
  - バランスの取れた結論
  - 論理構造ガイド付き

#### `/pomodoro` - ポモドーロタイマー管理
- **機能**: AIコーチング機能付きポモドーロセッション管理
- **サブコマンド**:
  - `/pomodoro start` - 新しいセッション開始（作業時間・休憩時間カスタマイズ可能）
  - `/pomodoro pause` - セッション一時停止
  - `/pomodoro resume` - セッション再開
  - `/pomodoro stop` - セッション終了
  - `/pomodoro status` - 現在の状況確認
  - `/pomodoro config` - 設定確認
  - `/pomodoro coach` - AIコーチング（モチベーション・振り返り）
  - `/pomodoro insight` - パフォーマンス分析
  - `/pomodoro coaching-config` - コーチング設定（スタイル・目標・キーワード）

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


### 絵文字リアクション機能

メッセージに特定の絵文字でリアクションするだけで、AIが自動で応答します。スラッシュコマンドよりも手軽に利用できます。

#### 一般相談機能
- 🧙‍♂️ - Larry相談（専門的アドバイス、Web検索対応）
  - 任意のメッセージにリアクションでLarryが専門的なアドバイスを提供
  - Web検索機能により最新情報を含む回答

#### アイデア管理（ideaチャンネル専用）
- 💡 - アイデアスレッド作成
  - アイデア用のディスカッションスレッドを自動作成
  - チーム内でのアイデア共有と発展に最適
- 🧙‍♂️ - Larry相談（最新情報を含む専門的アドバイス）
  - ideaチャンネルでのより深い専門的アドバイス

#### ブログ作成機能
- 📝 - テキストファイルからブログ投稿作成
  - テキストファイル添付メッセージにリアクション
  - GitHub repositoryに自動でブログドラフト作成
  - `.txt`、`.md`、`.markdown`ファイル対応
  - 自動タイトル抽出とメタデータ生成

#### 記憶・語彙学習機能
- 🧠 - 語彙保存（Larryの日記フィードバック専用）
  - Larryの日記フィードバック（`message.txt`添付）にのみ反応
  - 日本語文と翻訳を自動でObsidian Git Syncリポジトリに保存
  - 後からの語彙復習に活用可能

**使用方法**: 任意のメッセージに上記の絵文字でリアクションするだけで、自動でAIが返答します。

## 🛠️ 技術仕様

- **Discord.js**: v14
- **TypeScript**: 5.x
- **AI Service**: OpenAI GPT-4o-mini (翻訳・分析・相談機能)
- **Node.js**: 18.x以上推奨
- **SNS連携**: Bluesky API対応
- **ブログ機能**: GitHub API経由でブログリポジトリ連携
- **記憶機能**: GitHub API経由でObsidian Git Syncリポジトリ連携
- **テスト**: Vitest（単体テスト・統合テスト）

## 🔧 セットアップ

### 必要な環境変数

`.env`ファイルを作成し、以下の変数を設定：

```env
# Discord Bot基本設定
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
GUILD_ID=your_guild_id_for_development  # (開発時のみ)

# AI機能
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key  # Gemini AI動画分析用

# SNS連携
BLUESKY_USERNAME=your_bluesky_handle  # (例: taka1415.bsky.social)
BLUESKY_PASSWORD=your_bluesky_app_password  # Bluesky設定で作成

# GitHub連携（ブログ・記憶機能）
GITHUB_PAT=your_github_personal_access_token
OBSIDIAN_REPO_OWNER=your_github_username  # Obsidianリポジトリのオーナー
OBSIDIAN_REPO_NAME=your_obsidian_git_sync_repo  # リポジトリ名
OBSIDIAN_VOCAB_PATH=notes/10_Vocabulary/  # 語彙保存パス
```

### 環境変数の取得方法

- **DISCORD_TOKEN**: Discord Developer Portalでbot作成時に取得
- **CLIENT_ID**: Discord ApplicationのGeneral Information > Application ID
- **OPENAI_API_KEY**: OpenAI Platform (platform.openai.com) でAPI key作成
- **BLUESKY_PASSWORD**: Blueskyアプリの設定 > App passwords で作成
- **GITHUB_PAT**: GitHub Settings > Developer settings > Personal access tokens

### インストール手順

1. 依存関係のインストール:
```bash
npm install
```

2. 環境変数ファイルの作成:
```bash
cp .env.example .env
# .envファイルを編集して必要な値を設定
```

3. TypeScriptのコンパイル:
```bash
npm run build
```

4. Discordスラッシュコマンドのデプロイ:
```bash
npm run deploy-commands
```

5. 開発サーバーの起動（ホットリロード付き）:
```bash
npm run dev
```

### 本番環境での実行

```bash
npm run start
```

### 開発・テスト用コマンド

```bash
# テスト実行
npm test                    # 単体テスト実行
npm run test:watch         # テスト監視モード
npm run test:ui            # テストUI表示

# コード品質チェック
npm run type-check         # TypeScript型チェック
npm run lint               # ESLintによるコードチェック
npm run format:check       # Prettierフォーマットチェック
npm run check:all          # 全品質チェック実行

# その他
npm run clean              # dist/フォルダクリア
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

### Larry相談機能
```
ユーザー: 機械学習の最新トレンドについて教えて
→ 🧙‍♂️リアクション
Bot: 🧙‍♂️ Larry's Consultation: 
2024年の機械学習の最新トレンドとしては...（Web検索結果も含む専門的アドバイス）
```

### 学習コンテンツ生成
```
/random
→ 今日のニュース: "AI規制法案の最新動向について議論してください"
→ 技術質問: "分散システムにおけるCAP定理について説明してください" 
→ 英語フレーズ: "I'm confident that..."
→ ディベート: "リモートワークは生産性を向上させるか？"
```

### 面接練習機能
```
/system-design
→ "How would you design a URL shortener like bit.ly?" 
→ 詳細な設計回答とアーキテクチャ図付き解説

/tech-interview  
→ "Explain the difference between TCP and UDP"
→ 構造化された詳細説明と実用例

/debate-answer
→ Question: "Should social media platforms censor harmful content?"
→ 4段階論理構造による模範回答と論理ガイド
```

### ポモドーロセッション
```
/pomodoro start work:25 short-break:5
→ 25分作業セッション開始

/pomodoro coach type:motivation
→ 💪 AIコーチング: "今日も素晴らしいスタートを切っています！..."

/pomodoro insight
→ 📊 今週のパフォーマンス分析とおすすめのアクション
```

### ブログ作成
```
ユーザー: [テキストファイルをアップロード] 
→ 📝リアクション
Bot: ✅ Blog Post Created!
📍 Location: Repository: tanigu12/tanigu12.github.io Directory: _drafts/
📝 Next Steps: 1. Review the generated blog post...
```

### アイデア管理（ideaチャンネル）
```
ideaチャンネルでアイデアを投稿
→ 💡リアクションでアイデアスレッド作成
→ 🧙‍♂️リアクションでLarryの専門的アドバイス（Web検索付き）
```

### 語彙学習・記憶機能
```
Larryの日記フィードバックメッセージ（message.txt添付）
→ 🧠リアクションで日本語文と翻訳をObsidianリポジトリに自動保存
→ ファイル名: 2024-01-15-vocabulary-feedback.md として保存
→ 後から語彙復習に活用可能
```

### スレッド整形機能
```
[スレッド内で]
/format title:"今日の学習まとめ" include_all:true
→ スレッドの全会話を日英対応のObsidian記事として整形
→ ブログリアクション（📝 📄 ✍️ 📰）でGitHub投稿可能
```


## 🎓 Bot活用方法

このBotは以下のような用途に最適です：

### 📚 学習支援
1. **英語学習**: `/random`で日記トピック取得、定期的ライティング練習
2. **語彙強化**: 🧠リアクションでLarryのフィードバックをObsidian保存、復習活用
3. **専門相談**: 🧙‍♂️リアクションでLarryに最新情報付き専門アドバイス依頼

### 💼 キャリア開発
4. **面接対策**: `/system-design` `/tech-interview` `/debate-answer`で構造化回答練習
5. **技術スキル**: 技術質問・システム設計の模範回答で知識補強
6. **論理思考**: 4段階ディベート構造で論理的思考力向上

### 📝 コンテンツ作成
7. **ブログ執筆**: 📝リアクションでテキストファイルを自動ブログ化
8. **記事整形**: `/format`でスレッド会話をObsidian記事に構造化
9. **SNS投稿**: `/bsky`でBlueskyに画像付き投稿

### 🧠 生産性向上
10. **集中管理**: `/pomodoro`でAIコーチング付き作業セッション
11. **アイデア発展**: ideaチャンネルでブレインストーミング・スレッド管理
12. **学習分析**: AIによるパフォーマンス分析・改善提案

### 🔗 情報整理
13. **知識管理**: GitHub連携でブログ・語彙を自動リポジトリ保存
14. **コンテンツ分析**: 多様な学習コンテンツを一箇所で生成・管理

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


**Web検索機能が動作しない**
- OpenAI APIキーが最新のGPT-4oモデルへのアクセス権を持っていることを確認
- インターネット接続が正常であることを確認

**ブログ作成機能（📝）が動作しない**
- `GITHUB_PAT`が正しく設定されていることを確認
- ブログリポジトリ（tanigu12/tanigu12.github.io）への書き込み権限があることを確認
- テキストファイル（.txt, .md, .markdown）が添付されているメッセージにのみリアクション

**記憶機能（🧠）が動作しない**
- `GITHUB_PAT`が正しく設定されていることを確認
- Obsidianリポジトリのオーナーとリポジトリ名が正しいことを確認
- GitHub Personal Access Tokenがリポジトリへの書き込み権限を持っていることを確認
- 🧠リアクションはLarryの日記フィードバックメッセージ（message.txt添付）でのみ機能します

**ポモドーロ機能が動作しない**
- ユーザーごとにセッション管理されているため、他のユーザーのセッションは操作できません
- セッション状況は`/pomodoro status`で確認可能

**面接練習コマンドでエラーが発生**
- OpenAI API制限に達していないか確認
- 一時的にサービスが利用できない場合は、しばらく待ってから再試行

## 🧹 コードベースの整理

### アクティブ機能一覧

**現在利用可能な全機能:**

**スラッシュコマンド（8個）:**
- `/ping` `/help` `/random` `/format` `/bsky` - 基本機能
- `/system-design` `/tech-interview` `/debate-answer` - 面接練習
- `/pomodoro` - 生産性管理（8サブコマンド）

**絵文字リアクション（4種類）:**
- 🧙‍♂️ - Larry相談（全チャンネル）
- 💡 - アイデアスレッド作成（ideaチャンネル専用）
- 📝 - ブログ作成（テキストファイル添付必要）
- 🧠 - 語彙保存（Larry日記フィードバック専用）

**連携サービス:**
- OpenAI GPT-4o-mini（AI機能）
- Bluesky API（SNS投稿）
- GitHub API（ブログ・語彙保存）
- Google Gemini（動画分析・予約機能）

### 未使用/開発中の機能

**検討中の機能:**
- YouTube分析・字幕機能（`src/features/youtube-*`）
- AI Partner統合（`src/features/ai-partner/`）
- Bot メンション機能（`src/features/bot-mention/`）

**削除可能:**
- `dist/` フォルダ（ビルド時再生成）
- 一部の未使用export（knipで検出済み）

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