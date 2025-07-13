
NFT Photo Server<br>ローカル開発環境 README
===================================

1. プロジェクト概要
-----------

本プロジェクトは、Instagram写真をThingsTokenとしてNFT化するローカル開発環境です。Docker Composeを使用してマイクロサービス構成を実現し、チーム開発に最適化されたセットアップを提供します。

### 1.1 主要機能

* 写真ハッシュからユーザーアドレスの取得
* ブロックチェーン上でのNFTミント処理
* トークンURIの設定とメタデータ管理
* RESTful API によるフロントエンド連携

### 1.2 技術スタック

* <span class="emphasis">バックエンド:</span> Node.js + Express.js
* <span class="emphasis">ブロックチェーン:</span> Web3.js + Ganache (ローカルテストネットワーク)
* <span class="emphasis">データベース:</span> MongoDB
* <span class="emphasis">コンテナ化:</span> Docker + Docker Compose
* <span class="emphasis">開発環境:</span> VS Code + 拡張機能

<div class="section-break"></div>

2. システム構成
---------

### 2.1 アーキテクチャ図

<pre>
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose 環境                         │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   NFT Server    │    MongoDB      │         Ganache             │
│   (Port 3000)   │  (Port 27017)   │       (Port 8545)           │
│                 │                 │                             │
│ • Express API   │ • Users Collection│ • ローカルブロックチェーン      │
│ • Web3.js       │ • Photos Collection│ • 決定論的アカウント生成      │
│ • ミドルウェア    │ • インデックス管理 │ • 高速トランザクション処理     │
└─────────────────┴─────────────────┴─────────────────────────────┘
          │                 │                         │
          └─────────────────┼─────────────────────────┘
                            │
                    ┌───────────────┐
                    │   開発者環境    │
                    │   VS Code      │
                    │   デバッグ環境   │
                    └───────────────┘

</pre>

### 2.2 データフロー

1.  事務局がハッシュ、Instagram写真URL、いいね数を送信
2.  サーバーがハッシュからユーザーアドレスを取得（MongoDB検索）
3.  Ganacheブロックチェーン上でNFTをmint（slot: 2, value: いいね数）
4.  取得したトークンIDにInstagram写真URLを設定
5.  生成されたトークンIDを事務局に返却

<div class="section-break"></div>

3. 前提条件と環境要件
------------

### 3.1 必要なソフトウェア

ソフトウェア         | バージョン    | 用途            | 必須度
-------------- | -------- | ------------- | ---
Docker Desktop | 最新版      | コンテナ実行環境      | 必須
Node.js        | 18.x LTS | ローカル開発（オプション） | 推奨
Git            | 最新版      | バージョン管理       | 必須
VS Code        | 最新版      | 統合開発環境        | 推奨

### 3.2 システム要件

* <span class="emphasis">OS:</span> Windows 11, macOS, Linux
* <span class="emphasis">メモリ:</span> 8GB以上推奨
* <span class="emphasis">ディスク:</span> 10GB以上の空き容量
* <span class="emphasis">ネットワーク:</span> インターネット接続（初回セットアップ時）

<div class="section-break"></div>

4. セットアップ手順
-----------

### 4.1 初回セットアップ（新メンバー向け）

#### ステップ1: リポジトリのクローン

<pre>
git clone [repository-url]
cd nft-photo-server-local

</pre>

#### ステップ2: 環境変数の設定

<pre>
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env

</pre>

<div class="note">
    <span class="emphasis">注意:</span> .envファイルは機密情報を含むため、Gitにコミットしないでください。プライベートキーなどの実際の値は、チームリーダーから個別に取得してください。
</div>

#### ステップ3: Docker環境の起動

<pre>
docker-compose up -d

</pre>

#### ステップ4: 動作確認

<pre>
# ヘルスチェック
curl http://localhost:3000/health

# 期待される応答
{"status":"OK","timestamp":"...","environment":"development"}

</pre>

### 4.2 VS Code開発環境のセットアップ

#### 推奨拡張機能（自動インストール）

* Docker
* MongoDB for VS Code
* REST Client
* JavaScript (ES6) code snippets
* Node.js Extension Pack

#### デバッグ設定

F5キーでデバッグモードを開始できます。ブレークポイントの設定とステップ実行が可能です。

<div class="section-break"></div>

5. API仕様書
---------

### 5.1 メインAPI: 写真NFT登録

#### エンドポイント

<pre>
POST /api/register-photo
</pre>

#### リクエスト形式

<pre>
Content-Type: application/json

{
  "hash": "local_photo_hash_001",
  "instaPhotoUrl": "https://instagram.com/p/example",
  "likeCount": 150
}

</pre>

#### レスポンス形式

<pre>
{
  "success": true,
  "tokenId": 1752394266083,
  "userAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "slot": 2,
  "value": 150,
  "instaPhotoUrl": "https://instagram.com/p/example",
  "hash": "local_photo_hash_001",
  "network": "Local (Ganache)"
}

</pre>

### 5.2 管理・確認用API

エンドポイント      | メソッド | 説明               | 認証
------------ | ---- | ---------------- | --
/health      | GET  | サーバーのヘルスチェック     | 不要
/api/users   | GET  | 登録済みユーザー一覧       | 不要
/api/photos  | GET  | 写真一覧とステータス確認     | 不要
/api/network | GET  | ブロックチェーンネットワーク情報 | 不要

### 5.3 PowerShellでのAPIテスト例

<pre>
# 写真NFT登録のテスト
$body = @{
    hash = "local_photo_hash_001"
    instaPhotoUrl = "https://instagram.com/p/test_001"
    likeCount = 150
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/register-photo" `
  -Method POST -ContentType "application/json" -Body $body

# ユーザー一覧の取得
Invoke-RestMethod -Uri "http://localhost:3000/api/users"

</pre>

<div class="section-break"></div>

6. 開発ワークフロー
-----------

### 6.1 日常的な開発作業

#### 開発環境の起動

<pre>
# プロジェクトディレクトリに移動
cd nft-photo-server-local

# VS Codeでプロジェクトを開く
code .

# Docker環境起動
docker-compose up -d

# ログ監視（別ターミナル）
docker-compose logs -f app

</pre>

#### コード変更時の動作

* ファイル保存時に自動でサーバーが再起動（nodemon使用）
* ホットリロードによる高速開発サイクル
* VS Codeのデバッガーで即座にブレークポイント設定可能

### 6.2 よく使用するコマンド

操作       | コマンド                       | 説明
-------- | -------------------------- | ----------------
環境起動     | docker-compose up -d       | バックグラウンドで全サービス起動
環境停止     | docker-compose down        | 全サービス停止
ログ確認     | docker-compose logs app    | アプリケーションログ表示
リアルタイムログ | docker-compose logs -f app | ログのリアルタイム監視
サービス再起動  | docker-compose restart app | アプリケーションのみ再起動
データリセット  | docker-compose down -v     | ボリューム含めて完全リセット

<div class="section-break"></div>

7. トラブルシューティング
--------------

### 7.1 よくある問題と解決方法

#### ポート競合エラー

<div class="note">
    <span class="emphasis">症状:</span> "port is already allocated" エラー

    <span class="emphasis">解決方法:</span>

    <pre>
    # 既存コンテナの停止
    docker-compose down

    # ポート使用状況確認（Windows）
    netstat -ano | findstr ":3000"
    netstat -ano | findstr ":8545"
    netstat -ano | findstr ":27017"

    # 該当プロセスを終了後、再起動
    docker-compose up -d

    </pre>
</div>

#### MongoDB接続エラー

<div class="note">
    <span class="emphasis">症状:</span> "MongoDB connection failed"

    <span class="emphasis">解決方法:</span>

    <pre>
    # MongoDBコンテナの状況確認
    docker-compose logs mongodb

    # データベースの初期化
    docker-compose down -v
    docker-compose up -d mongodb
    # MongoDBの完全起動を待機後
    docker-compose up -d app

    </pre>
</div>

#### Ganache接続エラー

<div class="note">
    <span class="emphasis">症状:</span> "Network connection error"

    <span class="emphasis">解決方法:</span>

    <pre>
    # Ganacheログの確認
    docker-compose logs ganache

    # Ganacheの再起動
    docker-compose restart ganache

    </pre>
</div>

### 7.2 デバッグ手順

#### 段階的な問題切り分け

1.  Docker Desktopの起動状況確認
2.  各サービスのログ確認
3.  ネットワーク接続性の確認
4.  環境変数の設定確認
5.  コンテナ内部での動作確認

#### コンテナ内部での直接確認

<pre>
# アプリケーションコンテナに入る
docker-compose exec app sh

# コンテナ内でのファイル確認
ls -la
cat package.json

# 直接Node.jsを実行
node server.js

</pre>

<div class="section-break"></div>

8. チーム開発ガイドライン
--------------

### 8.1 Git運用ルール

#### ブランチ戦略

* <span class="emphasis">main:</span> 本番リリース用ブランチ
* <span class="emphasis">develop:</span> 開発統合ブランチ
* <span class="emphasis">feature/xxx:</span> 機能開発ブランチ
* <span class="emphasis">hotfix/xxx:</span> 緊急修正ブランチ

#### コミットメッセージ規約

<pre>
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: コードフォーマット変更
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・設定変更

例:
feat: 写真NFT登録APIにバリデーション機能を追加
fix: MongoDB接続エラーの修正
docs: API仕様書の更新

</pre>

### 8.2 コードレビュー基準

#### チェック項目

* APIエンドポイントの命名規則遵守
* エラーハンドリングの適切な実装
* ログ出力の適切性
* セキュリティ考慮事項の確認
* テストケースの網羅性

### 8.3 新機能開発フロー

1.  機能仕様の合意
2.  feature ブランチの作成
3.  ローカル環境での開発・テスト
4.  Pull Request作成
5.  コードレビュー
6.  develop ブランチへのマージ
7.  統合テスト

<div class="section-break"></div>

9. プロジェクト構造詳細
-------------

### 9.1 ディレクトリ構成

<pre>
nft-photo-server-local/
├── .vscode/                    # VS Code設定
│   ├── extensions.json         # 推奨拡張機能
│   ├── launch.json            # デバッグ設定
│   ├── settings.json          # ワークスペース設定
│   └── tasks.json             # タスク定義
├── contracts/                  # スマートコントラクト関連
│   └── ThingsToken.json       # ABIとバイトコード
├── models/                     # データベースモデル
│   ├── User.js                # ユーザーモデル
│   └── Photo.js               # 写真モデル
├── services/                   # ビジネスロジック
│   └── blockchainService.js   # ブロックチェーン操作
├── scripts/                    # 初期化・ユーティリティ
│   └── mongo-init.js          # MongoDB初期設定
├── .env.example               # 環境変数テンプレート
├── .gitignore                 # Git除外設定
├── docker-compose.yml         # Docker Compose設定
├── Dockerfile                 # コンテナビルド設定
├── package.json               # Node.js依存関係
├── server.js                  # メインアプリケーション
└── README.md                  # このドキュメント

</pre>

### 9.2 主要ファイルの役割

ファイル                          | 役割                   | 変更頻度
----------------------------- | -------------------- | ----
server.js                     | Express サーバーのメインファイル | 高
models/User.js                | ユーザーデータのスキーマ定義       | 中
models/Photo.js               | 写真データのスキーマ定義         | 中
services/blockchainService.js | ブロックチェーン操作の抽象化       | 中
docker-compose.yml            | マルチコンテナ構成定義          | 低

<div class="section-break"></div>

10. セキュリティとベストプラクティス
--------------------

### 10.1 環境変数管理

* .envファイルをGitにコミットしない
* プライベートキーの安全な管理
* 本番環境とは異なるテスト用キーの使用
* 環境変数の適切なバリデーション

### 10.2 API セキュリティ

* 入力データのバリデーション
* レート制限の実装
* 適切なHTTPステータスコードの使用
* エラーメッセージの情報漏洩対策

### 10.3 開発環境のセキュリティ

* ローカル環境でのみ使用する決定論的アカウント
* テスト用データと本番データの分離
* Dockerコンテナのセキュリティ設定
* 依存関係の脆弱性チェック

<div class="section-break"></div>

11. 付録
------

### 11.1 参考資料

* Docker Compose公式ドキュメント
* Web3.js公式ドキュメント
* Express.js公式ガイド
* MongoDB Node.js ドライバー
* Ganache CLI ドキュメント

### 11.2 更新履歴

日付         | バージョン | 変更内容        | 作成者
---------- | ----- | ----------- | -----
2025-07-13 | 1.0.0 | 初版作成・環境構築完了 | 開発チーム

### 11.3 サポート・問い合わせ

技術的な問題や質問がある場合は、以下の手順で対応してください：

1.  このREADMEのトラブルシューティングセクションを確認
2.  GitHubのIssueで既知の問題を検索
3.  新しい問題の場合はIssueを作成
4.  緊急の場合はチームリーダーに直接連絡

<div class="note">
    <span class="emphasis">重要:</span> このドキュメントは開発環境の変更に合わせて継続的に更新されます。最新版を必ず参照してください。
</div>
