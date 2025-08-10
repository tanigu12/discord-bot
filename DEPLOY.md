# Railway Deployment Guide

このDiscordボットをRailwayにデプロイするための手順です。

## 必要な環境変数

Railwayのダッシュボードで以下の環境変数を設定してください：

```
DISCORD_TOKEN=your_actual_discord_bot_token
CLIENT_ID=your_actual_discord_client_id  
OPENAI_API_KEY=your_actual_openai_api_key
NODE_ENV=production
```

オプション（開発時のみ）：
```
GUILD_ID=your_discord_server_id_for_faster_command_deployment
```

## デプロイ手順

### 1. Railwayアカウント作成
1. https://railway.app にアクセス
2. "Login" をクリック
3. GitHubアカウントで認証

### 2. プロジェクト作成
1. Railway ダッシュボードで "New Project" をクリック
2. "Deploy from GitHub repo" を選択
3. このリポジトリ（discord-bot）を選択
4. "Deploy Now" をクリック

### 3. 環境変数設定
1. デプロイされたプロジェクトの "Variables" タブをクリック
2. 上記の必要な環境変数を一つずつ追加
3. 値を入力して "Add" をクリック

### 4. デプロイ確認
1. "Deployments" タブでビルド状況を確認
2. ログでエラーがないことを確認
3. Discord でボットがオンラインになることを確認

## スラッシュコマンド登録

初回デプロイ後、スラッシュコマンドを登録する必要があります：

### オプション1: ローカルから実行
```bash
npm run deploy-commands
```

### オプション2: Railway環境で実行
1. Railway ダッシュボードで "Settings" タブ
2. "Deploy Command" を一時的に `npm run deploy-commands` に変更
3. 再デプロイして実行
4. 完了後、Deploy Command を `npm start` に戻す

## トラブルシューティング

### ボットがオフラインの場合
1. Railway のログを確認
2. 環境変数が正しく設定されているか確認
3. Discord Bot Token が有効か確認

### スラッシュコマンドが表示されない場合
1. コマンド登録が完了しているか確認
2. ボットがサーバーに正しい権限で招待されているか確認

### OpenAI機能が動かない場合
1. OpenAI API Keyが有効か確認
2. 使用量制限に達していないか確認

## Railway料金について

- **無料枠**: 月$5クレジットまたは500時間まで無料
- **Starter**: 月$5で無制限稼働
- 使用量はRailwayダッシュボードで確認可能

## モニタリング

- Railway ダッシュボードでリアルタイムログ確認
- メトリクス（CPU、メモリ使用量）の監視
- アラート設定（オプション）

---

デプロイが完了したら、Discordでボットをテストして、すべての機能（絵文字リアクション、diary自動翻訳、スラッシュコマンド）が動作することを確認してください。