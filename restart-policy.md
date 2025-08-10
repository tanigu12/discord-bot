# Discord Bot Restart Policy

このDocumentは、Discordボットの障害対応と再起動ポリシーについて説明します。

## Railway.json再起動設定

```json
{
  "restart": {
    "policy": "on-failure",
    "maxRetries": 10,
    "delay": "5s",
    "backoffMultiplier": 2,
    "maxDelay": "60s"
  }
}
```

### パラメータ説明

- **policy**: `on-failure` - プロセスが異常終了時のみ再起動
- **maxRetries**: `10` - 最大10回まで再起動を試行
- **delay**: `5s` - 初回再起動まで5秒待機
- **backoffMultiplier**: `2` - 次回待機時間を2倍に増加（指数バックオフ）
- **maxDelay**: `60s` - 最大待機時間は60秒

## 再起動シナリオ

### 1. Discord API接続エラー
```
1回目: 5秒後に再起動
2回目: 10秒後に再起動  
3回目: 20秒後に再起動
4回目: 40秒後に再起動
5回目: 60秒後に再起動（maxDelay適用）
```

### 2. OpenAI API障害
- API呼び出し失敗はエラーハンドリング内で処理
- プロセス全体は継続動作
- 個別のリクエストのみ失敗応答

### 3. メモリ不足・リソース枯渇
- 異常終了時に自動再起動
- Railway側でコンテナ再作成

## アプリケーションレベルの対応

### エラーハンドリング強化

1. **Unhandled Rejection対応**
   ```typescript
   process.on('unhandledRejection', (reason, promise) => {
     console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
   });
   ```

2. **Uncaught Exception対応**
   ```typescript
   process.on('uncaughtException', (error) => {
     console.error('🚨 Uncaught Exception thrown:', error);
     process.exit(1); // Railwayが再起動
   });
   ```

3. **Discord接続エラー対応**
   ```typescript
   client.on(Events.Error, (error) => {
     console.error('🔴 Discord client error:', error);
   });
   ```

### Login リトライロジック

```typescript
const loginWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await client.login(process.env.DISCORD_TOKEN);
      break;
    } catch (error) {
      if (i === retries - 1) process.exit(1);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
```

## 監視とアラート

### ログ監視項目
- `🚨 Unhandled Rejection` - 予期しないエラー
- `🔴 Discord client error` - Discord API接続問題
- `❌ Login attempt failed` - 認証問題
- `🔌 Shard disconnected` - 一時的な接続断

### Railway ダッシュボード確認項目
1. **Deployments** タブ - 再起動回数と頻度
2. **Metrics** タブ - CPU/メモリ使用量
3. **Logs** タブ - リアルタイムエラーログ

## 緊急時対応手順

### 1. 頻繁な再起動の場合
```bash
# Railwayダッシュボードで確認
1. 最近10分間の再起動回数
2. エラーログの共通パターン
3. 必要に応じて環境変数確認
```

### 2. API制限到達の場合
```bash
# OpenAI API使用量確認
1. OpenAI ダッシュボードで使用量確認
2. 必要に応じて使用制限調整
3. Discord Rate Limit対応
```

### 3. 完全停止の場合
```bash
# Manual restart手順
1. Railway -> Deployments -> Restart
2. 環境変数の再確認
3. 最新コミットのデプロイ確認
```

## 最適化推奨事項

### 1. メモリ使用量削減
- 不要な変数のクリーンアップ
- 大きなメッセージ履歴の定期削除

### 2. API呼び出し最適化
- OpenAI APIコール回数の監視
- レスポンス時間の最適化

### 3. 接続安定性向上
- Discord WebSocket接続の監視
- 定期的なヘルスチェック実装

---

このポリシーにより、24/7安定稼働を目指したDiscordボットの運用が可能になります。