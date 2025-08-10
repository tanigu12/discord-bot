# Discord Bot Deployment Plan

## 概要
このDiscord言語学習ボットを無料で継続的にホストするための計画書です。絵文字リアクション機能とdiary自動翻訳機能を含むボットを24/7稼働させます。

## 推奨デプロイメントオプション（無料枠）

### 🥇 Option 1: Railway（推奨）
**料金**: 月500時間まで無料（約20.8日）+ $5のスタータークレジット
**メリット**:
- Node.js/TypeScript完全サポート
- GitHub自動デプロイ
- 環境変数管理が簡単
- PostgreSQLなどのデータベースも追加可能
- 日本からのアクセス速度が良好

**制約**:
- 月500時間制限（24/7稼働なら約21日間）
- アイドル時のスリープなし（常時稼働）

### 🥈 Option 2: Render
**料金**: 完全無料
**メリット**:
- GitHub自動デプロイ
- 環境変数管理
- SSL証明書自動
- ログ管理

**制約**:
- 14分間非アクティブでスリープ
- スリープ解除に時間がかかる（Discordボットには不向き）
- 月750時間制限

### 🥉 Option 3: Heroku（非推奨）
**料金**: 月1000時間まで無料（廃止予定）
**状況**: 2022年11月で無料プラン終了

### 🆕 Option 4: Fly.io
**料金**: 月160時間まで無料
**メリット**:
- Dockerベース
- グローバル展開可能
- 高パフォーマンス

**制約**:
- 月160時間制限（約6.7日間のみ）
- Dockerfile設定が必要

## 推奨デプロイメント戦略

### Phase 1: Railway を使用（即座に開始）

#### 前提条件
- GitHubアカウント
- Railway アカウント（GitHub認証）
- Discord Bot Token
- OpenAI API Key

#### セットアップ手順

1. **GitHubリポジトリの準備**
   ```bash
   # 現在のブランチをmainにマージ
   git checkout main
   git merge feature/emoji-reaction-system
   git push origin main
   ```

2. **Railway プロジェクト作成**
   - https://railway.app/ でGitHub認証
   - "New Project" → "Deploy from GitHub repo"
   - このリポジトリを選択

3. **環境変数設定**
   Railway ダッシュボードで以下を設定:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   ```

4. **デプロイ設定**
   Railway が自動検出するが、必要に応じて設定:
   - Build Command: `npm run build`
   - Start Command: `npm start`

#### 必要なファイル追加

**package.json の scripts セクション確認**:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "nodemon --exec tsx src/index.ts"
  }
}
```

### Phase 2: 長期運用の検討

#### 月500時間制約の対策
1. **使用量監視**: Railway ダッシュボードで時間使用量をチェック
2. **月末リセット**: 必要に応じて月末に新プロジェクトを作成
3. **有料プラン検討**: 月$5でアップグレード可能

#### Alternative: 複数サービスのローテーション
```
Week 1-2: Railway (500時間の約25%使用)
Week 3-4: Fly.io (160時間使用)
残り時間: VPS or 有料サービス検討
```

## デプロイメント前のチェックリスト

### ✅ コード準備
- [ ] 全ての環境変数が process.env から読み込まれている
- [ ] エラーハンドリングが適切に実装されている
- [ ] ログ出力が本番環境向けに設定されている
- [ ] TypeScript ビルドが成功する

### ✅ Discord設定
- [ ] Bot tokenが有効
- [ ] 必要な権限が付与されている
- [ ] Guild ID設定（開発用）の本番用調整

### ✅ 外部API
- [ ] OpenAI API キーが有効
- [ ] API使用量制限の確認

## モニタリングとメンテナンス

### 監視項目
1. **Bot稼働状況**: Discord上でのオンライン状態
2. **リソース使用量**: Railway/Fly.io ダッシュボード
3. **エラーログ**: デプロイメントプラットフォームのログ
4. **API使用量**: OpenAI使用量ダッシュボード

### 定期メンテナンス
- 月1回: 使用量確認とプラットフォーム使用状況チェック
- 必要時: 依存関係アップデート
- 必要時: Discord.js バージョンアップデート

## コスト見積もり

### 完全無料運用（制約あり）
- Railway: 月500時間（約21日間稼働）
- 残り時間: サービス停止 or 他プラットフォーム

### 低コスト運用
- Railway Starter: 月$5（無制限稼働）
- OpenAI API: 使用量ベース（月$5-20程度想定）
- **合計: 月$10-25**

### 企業/本格運用
- VPS (Digital Ocean/Linode): 月$5-10
- Database: 必要に応じて
- Monitoring: 必要に応じて

## 次のステップ

1. [ ] Railway アカウント作成
2. [ ] GitHub リポジトリをパブリックにする（または Railway に権限付与）
3. [ ] 環境変数の準備
4. [ ] デプロイメント実行
5. [ ] 動作確認とモニタリング設定

## 緊急時対応

### ボットが停止した場合
1. デプロイメントプラットフォームのログを確認
2. 環境変数の有効性確認
3. Discord API / OpenAI API の状況確認
4. 必要に応じて再デプロイ

### 使用量超過の場合
1. 一時的なサービス停止
2. 別プラットフォームへの移行
3. 有料プランへのアップグレード検討

---

このプランにより、Discord言語学習ボットを低コストまたは無料で継続運用することが可能です。