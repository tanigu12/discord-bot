# Discord Bot - AI Language Assistant

English学習をサポートするAI搭載のDiscord Bot。翻訳、文法チェック、語彙解説、コンテンツ分析など、多機能な言語学習支援を提供します。

## 🌟 主要機能

### スラッシュコマンド
Bot は以下のスラッシュコマンドをサポートしています：

#### `/translate` - 翻訳
- **機能**: テキストを指定した言語に翻訳
- **使用方法**: `/translate text:[翻訳したいテキスト] language:[翻訳先言語]`
- **対応言語**: English, Japanese, Spanish, French, German, Chinese, Korean, Portuguese, Italian, Russian
- **例**: `/translate text:こんにちは language:English`

#### `/grammar` - 文法チェック
- **機能**: 文法をチェックして修正案を提供
- **使用方法**: `/grammar text:[チェックしたいテキスト]`
- **例**: `/grammar text:I are happy today`

#### `/explain` - 単語解説
- **機能**: 英単語の詳細な解説を提供
- **使用方法**: `/explain word:[解説したい単語]`
- **例**: `/explain word:serendipity`

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
- **機能**: ideaチャンネルのスレッドメッセージをObsidian対応のブログ記事に整形
- **使用方法**: `/format` (ideaチャンネルのスレッド内で実行)
- **出力**: Markdownファイルとして整形されたブログ記事

#### `/bsky` - Blueskyへの投稿
- **機能**: Bluesky Social (@taka1415.bsky.social) にメッセージを投稿
- **使用方法**: `/bsky message:[投稿メッセージ] image:[画像ファイル]`
- **制限**: 
  - メッセージは300文字以内
  - 画像は1MB以下 (JPEG, PNG, GIF, WebP対応)
- **例**: `/bsky message:Hello from Discord! image:photo.jpg`

### 絵文字リアクション機能

メッセージに特定の絵文字でリアクションするだけで、AIが自動で応答します。スラッシュコマンドよりも手軽に利用できます。

#### 翻訳系
- 🌐 - 自動翻訳（英語）
- 🇺🇸 - 英語に翻訳
- 🇯🇵 - 日本語に翻訳
- 🇪🇸 - スペイン語に翻訳
- 🇫🇷 - フランス語に翻訳
- 🇩🇪 - ドイツ語に翻訳
- 🇨🇳 - 中国語に翻訳
- 🇰🇷 - 韓国語に翻訳

#### English学習支援
- ✅ - 文法チェックと修正提案
- 📚 - 単語の詳細解説（単語1つのメッセージに使用）
- 💡 - テキストの分析と解説

#### コンテンツ分析
- 🔍 - URLやテキストの詳細分析（/searchコマンドと同じ機能）

**使用方法**: 任意のメッセージに上記の絵文字でリアクションするだけで、自動でAIが返答します。

## 🛠️ 技術仕様

- **Discord.js**: v14
- **TypeScript**: 5.x
- **AI Service**: OpenAI GPT-4o-mini
- **Node.js**: 18.x以上推奨

## 🔧 セットアップ

### 必要な環境変数

`.env`ファイルを作成し、以下の変数を設定：

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
OPENAI_API_KEY=your_openai_api_key
BLUESKY_USERNAME=your_bluesky_handle
BLUESKY_PASSWORD=your_bluesky_app_password
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

### 基本的な翻訳
```
ユーザー: 今日は良い天気ですね
Bot (🇺🇸リアクション): Translation → English: It's nice weather today.
```

### 文法チェック
```
/grammar text:I are going to store yesterday
→ Grammar Check: "I am going to the store yesterday" should be "I went to the store yesterday" or "I am going to the store today"
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

## 🎓 English学習への活用

このBotは特に以下のような学習スタイルに最適です：

1. **日常会話の練習**: メッセージに絵文字リアクションで即座に翻訳・文法チェック
2. **語彙力向上**: 知らない単語に📚リアクションで詳細解説
3. **ライティング練習**: /randomで日記トピックを取得し、定期的な英語ライティング
4. **情報収集とまとめ**: /searchでWebコンテンツを分析し、理解を深める

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

## 🤝 Contributing

プルリクエストやIssueの報告を歓迎します。バグ報告や機能提案がある場合は、GitHubのIssuesセクションをご利用ください。

## 📄 License

このプロジェクトはMITライセンスの下で公開されています。