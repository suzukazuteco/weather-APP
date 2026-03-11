# 天気予報アプリ

このステップでは、気象庁APIを利用して ある都道府県名が入力されたら、その地域に関する情報をユーザーに提供するプログラムを作成します。

## セットアップ

### 必要なパッケージのインストール

```bash
pip install -r requirements.txt
```

### データベース初期化

アプリケーション起動時に自動的にSQLiteデータベース（`users.db`）が作成されます。

### サーバー起動

```bash
uvicorn main:app --reload
```

サーバーは http://localhost:8000 で起動します。

---

## 認証機能

このアプリケーションには、ユーザー認証機能が実装されています。

### セッション管理について

**最もシンプルな方法**として、**署名付きCookie**を使用したセッション管理を採用しています。

#### なぜこの方法が簡単か
1. **追加のストレージ不要**: Redisなどのセッションストアが不要
2. **FastAPI標準機能**: 特別なライブラリの追加が最小限
3. **ステートレス**: サーバー側でセッション情報を管理する必要がない

#### セキュリティ
- SECRET_KEYで署名されたCookieを使用（改ざん検知）
- パスワードはbcryptでハッシュ化して保存
- HTTPOnly Cookieを使用してXSS攻撃を防止
- SameSite=Laxを設定してCSRF攻撃を緩和

---

## 認証API仕様

### 1. ユーザー登録

**エンドポイント**: `POST /api/register`

**リクエストボディ**:
```json
{
  "username": "tanaka",
  "password": "mypassword123"
}
```

**レスポンス** (201 Created):
```json
{
  "message": "ユーザー登録が完了しました",
  "username": "tanaka"
}
```

**エラーレスポンス**:
- 400 Bad Request: ユーザー名が既に存在する場合
  ```json
  {
    "detail": "このユーザー名は既に使用されています"
  }
  ```
- 400 Bad Request: パスワードが短すぎる場合
  ```json
  {
    "detail": "パスワードは6文字以上である必要があります"
  }
  ```

---

### 2. ログイン

**エンドポイント**: `POST /api/login`

**リクエストボディ**:
```json
{
  "username": "tanaka",
  "password": "mypassword123"
}
```

**レスポンス** (200 OK):
```json
{
  "message": "ログインしました",
  "username": "tanaka"
}
```

セッションCookieがレスポンスヘッダーに設定されます（有効期限: 7日間）。

**エラーレスポンス** (401 Unauthorized):
```json
{
  "detail": "ユーザー名またはパスワードが正しくありません"
}
```

---

### 3. ログアウト

**エンドポイント**: `POST /api/logout`

**レスポンス** (200 OK):
```json
{
  "message": "ログアウトしました"
}
```

セッションCookieが削除されます。

---

### 4. 現在のユーザー情報取得

**エンドポイント**: `GET /api/me`

**レスポンス** (200 OK):
```json
{
  "username": "tanaka"
}
```

**エラーレスポンス** (401 Unauthorized):
```json
{
  "detail": "ログインが必要です"
}
```

---

## 使用例（curl）

### ユーザー登録
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"tanaka","password":"mypassword123"}'
```

### ログイン
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"tanaka","password":"mypassword123"}' \
  -c cookies.txt
```

### 現在のユーザー情報取得
```bash
curl -X GET http://localhost:8000/api/me \
  -b cookies.txt
```

### ログアウト
```bash
curl -X POST http://localhost:8000/api/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## 課題
### 課題1
Python で以下を満たすプログラム main.py を作成してください。

◆ 入力

コンソールで次のようにユーザーから文字を受け取る：

東京

◆ 出力（例）
明日の東京都の天気は「晴れ」、最高気温は 14℃ です。


※ 天気・気温は気象庁APIから取得してください。
※ 明日が何日かはプログラム側で自動判定してください。

やることの概要

ユーザーから地域名（今回は「東京都」）を受け取る

地域名 → 地域コード（例：130000）を対応させる


気象庁APIから天気予報JSONを取得する

JSON の中から

明日の天気

明日の最高気温
を抽出する

指定のフォーマットで出力する

### 課題2
- 課題1に対して、東京以外の47都道府県について出力されるようにしてください。

例
◆ 入力
東京
◆ 出力
明日の東京の天気は「晴れ」、最高気温は 14℃ です。

◆ 入力
沖縄
◆ 出力
明日の東京の天気は「晴れ」、最高気温は 20℃ です。

### 課題3
- 課題2で作成した天気予報プログラムをWeb化してください。
- FastAPIを使い、ブラウザ上で操作できるようにしてください。

◆ 画面仕様（index.html）

1. 初期表示
   - ページ上部にタイトル「天気予報」を表示する
   - ドロップダウン（select要素）を1つ配置し、47都道府県を選択肢として表示する
     - 初期状態では「-- 地域を選択 --」のような未選択状態にする
     - 各選択肢の value にはエリアコード（例：130000）を設定する
     - 各選択肢のテキストには地域名（例：東京）を表示する
   - ドロップダウンの横に「送信」ボタンを配置する

2. 送信時の動作
   - 地域を選択して「送信」ボタンを押すと、選択されたエリアコードをサーバーに送信する
   - 地域が未選択の場合は送信しない

3. 結果表示
   - サーバーから返却された天気情報を、フォームの下に表示する
   - 表示する項目は以下の通り：
     - 地域名
     - 天気
     - 最高気温

◆ サーバー処理（FastAPI）
- サーバー側で受け取ったエリアコードを使い、気象庁APIから天気予報を取得する
- 取得した天気・最高気温を index.html に返して表示する

◆ 出力（例）
地域：東京
天気：晴れ
最高気温：14℃

やることの概要

index.html にドロップダウンと送信ボタンを作成する

FastAPIでサーバーを立て、フォームからエリアコードを受け取る

受け取ったエリアコードで気象庁APIを叩き、天気・最高気温を取得する

結果を index.html に返して表示する

### 課題4 ― API化（SSR → CSR への移行）
- 課題3ではサーバー側でHTMLを生成して返す方式（SSR）でしたが、今回はサーバーを **JSON を返す REST API** に変更してください。
- フロントエンドは **Vanilla JavaScript（フレームワーク不使用）** で `fetch` API を使い、API からデータを取得して画面を動的に描画する **CSR（クライアントサイドレンダリング）** 方式にしてください。
- 天気予報の機能（都道府県を選んで天気を表示する）は課題3と同じです。

◆ API 仕様（FastAPI）

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `s/api/area` | 都道府県一覧を返す |
| GET | `/api/weather/{area_code}` | 指定エリアコードの天気予報を返す |

1. `GET /api/areas`
   - 47都道府県の一覧を JSON 配列で返す
   - 各要素は `name`（地域名）と `code`（エリアコード）を持つ
   - レスポンス例：
     ```json
     [
       { "name": "北海道", "code": "016000" },
       { "name": "青森", "code": "020000" },
       ...
       { "name": "沖縄", "code": "471000" }
     ]
     ```

2. `GET /api/weather/{area_code}`
   - パスパラメータ `area_code`（例：`130000`）を受け取り、気象庁APIから天気予報を取得して JSON で返す
   - レスポンス例（正常時）：
     ```json
     {
       "area_name": "東京",
       "weather": "晴れ",
       "max_temp": "14"
     }
     ```
   - エリアコードが不正な場合は HTTP 404 を返す
     ```json
     { "detail": "指定された地域が見つかりません" }
     ```

◆ 画面仕様（index.html ― 静的HTML + JavaScript）

1. 初期表示
   - ページ上部にタイトル「天気予報」を表示する
   - ページ読み込み時に JavaScript で `GET /api/areas` を呼び出し、取得したデータでドロップダウン（select要素）の選択肢を **動的に生成** する
   - ドロップダウンの横に「取得」ボタンを配置する
   - **Jinja2 テンプレートは使わない**（HTMLファイルは純粋な静的ファイルとして配信する）

2. 取得ボタン押下時の動作
   - 選択中のエリアコードを使い、JavaScript で `GET /api/weather/{area_code}` を呼び出す
   - 地域が未選択の場合はリクエストを送らず、アラートまたはメッセージを表示する
   - ページ遷移（リロード）は発生しない

3. 結果表示
   - API から返却された JSON を JavaScript で解析し、フォームの下に以下を表示する：
     - 地域名
     - 天気
     - 最高気温
   - 表示例：
     ```
     地域：東京
     天気：晴れ
     最高気温：14℃
     ```

◆ ファイル構成（例）

```
weather-APP/
├── main.py            # FastAPI（APIエンドポイント定義）
├── weather.py         # 気象庁APIからデータを取得するロジック
├── AreaCodeData.py    # 都道府県コードデータ
└── static/
    ├── index.html     # 静的HTML（fetchで API を呼ぶ）
    ├── script.js      # fetch 処理・DOM 操作
    └── style.css      # スタイル
```

◆ 出力（例）

ブラウザで `http://localhost:8000` にアクセスし、ドロップダウンで「東京」を選択して「取得」ボタンを押すと、ページ遷移なしで以下が表示される：

```
地域：東京
天気：晴れ
最高気温：14℃
```

※ 進め方がわからない場合は、ページ末尾の「ヒント」を参照してください。

### 課題5 ― ユーザー登録・ログイン機能（穴埋め問題）
- 課題4で作成した天気予報APIに、**ユーザー登録・ログイン機能** を追加します。
- `main.py`、`database.py` にはコードの骨組みが用意されています。**コメントのヒントを参考に、空欄部分を埋めて** 機能を完成させてください。
- `auth.py`（認証ヘルパー）は実装済みです。中身を読んで使い方を理解してください。

◆ 穴埋め箇所

**database.py**

| 関数 | 穴埋め内容 |
|------|-----------|
| `create_user()` | `conn.execute()` の中身が空。ユーザーをINSERTするSQLを書く |

**main.py**

| 課題 | 関数 | 穴埋め内容 |
|------|------|-----------|
| 課題5-1 | `register()` | (1) `existing_user` にユーザー重複チェックの結果を代入する（ヒント：`database.get_user_by_username` を使う） |
| | | (2) パスワードバリデーションの条件式にバグがある。正しく修正する |
| | | (3) パスワードをハッシュ化し、`success` にユーザー作成の結果を代入する（ヒント：`auth.hash_password`、`database.create_user` を使う） |
| 課題5-2 | `login()` | (1) `user` にユーザー取得の結果を代入する |
| | | (2) ユーザーが存在しない、またはパスワードが一致しない場合のエラー処理を追加する（ヒント：`auth.verify_password` を使う） |

◆ 進め方

1. まず `auth.py` と `database.py` を読み、どんな関数が用意されているか把握する
2. `database.py` の `create_user()` にINSERT文を書く
3. `main.py` の課題5-1（`register`）の穴埋めを行う
4. `main.py` の課題5-2（`login`）の穴埋めを行う
5. サーバーを起動し、Swagger UI（`http://localhost:8000/docs`）でテストする

◆ テスト方法

サーバー起動後、Swagger UI（`http://localhost:8000/docs`）から各APIを実行してテストできます。

```bash
uvicorn main:app --reload
```

1. `/api/register` でユーザー登録 → 201が返ればOK
2. 同じユーザー名で再度登録 → 400エラーが返ればOK
3. `/api/login` でログイン → 200が返ればOK
4. 間違ったパスワードでログイン → 401エラーが返ればOK

◆ API 仕様（参考）

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| POST | `/api/register` | 不要 | ユーザー登録 |
| POST | `/api/login` | 不要 | ログイン |
| POST | `/api/logout` | 必要 | ログアウト |
| GET | `/api/me` | 必要 | ログイン中のユーザー情報を返す |

1. `POST /api/register`
   - リクエストボディ：
     ```json
     { "username": "tanaka", "password": "mypassword123" }
     ```
   - 登録成功時（201）：
     ```json
     { "message": "ユーザー登録が完了しました", "username": "tanaka" }
     ```
   - ユーザー名が既に存在する場合（400）：
     ```json
     { "detail": "このユーザー名は既に使用されています" }
     ```

2. `POST /api/login`
   - リクエストボディ：
     ```json
     { "username": "tanaka", "password": "mypassword123" }
     ```
   - ログイン成功時（200）：セッション Cookie を設定し、以下を返す
     ```json
     { "message": "ログインしました", "username": "tanaka" }
     ```
   - 認証失敗時（401）：
     ```json
     { "detail": "ユーザー名またはパスワードが正しくありません" }
     ```

3. `POST /api/logout`
   - セッション Cookie を削除し、以下を返す（200）：
     ```json
     { "message": "ログアウトしました" }
     ```

4. `GET /api/me`
   - ログイン中のユーザー情報を返す（200）：
     ```json
     { "username": "tanaka" }
     ```
   - 未ログインの場合（401）：
     ```json
     { "detail": "ログインが必要です" }
     ```

### 課題6 ― マイ地域登録・天気表示
- 課題5で作成したログイン機能付きアプリに、**マイ地域登録機能** を追加してください。
- ログインしたユーザーが、お気に入りの地域を **1つ以上登録** できるようにしてください。
- 登録した地域は SQLite に保存し、次回ログイン時にも保持されるようにしてください。
- ログイン後、登録済みの全地域の天気予報を **自動的にまとめて表示** してください。

◆ データベース仕様（追加テーブル）

テーブル名：`user_areas`

| カラム名 | 型 | 説明 |
|----------|------|------|
| id | INTEGER (PRIMARY KEY, AUTOINCREMENT) | レコードID |
| user_id | INTEGER (NOT NULL, FOREIGN KEY → users.id) | ユーザーID |
| area_code | TEXT (NOT NULL) | エリアコード（例：130000） |
| area_name | TEXT (NOT NULL) | 地域名（例：東京） |

- 同一ユーザーが同じ地域を重複登録できないようにする（`user_id` と `area_code` の組み合わせに UNIQUE 制約）

◆ API 仕様（追加分）

| メソッド | パス | 認証 | 説明 |
|----------|------|------|------|
| GET | `/api/my-areas` | 必要 | ログインユーザーの登録地域一覧を取得 |
| POST | `/api/my-areas` | 必要 | 地域を登録する |
| DELETE | `/api/my-areas/{area_code}` | 必要 | 登録した地域を削除する |
| GET | `/api/my-areas/weather` | 必要 | 登録地域すべての天気をまとめて取得 |

1. `GET /api/my-areas`
   - ログインユーザーの登録地域一覧を返す
   - レスポンス例（200）：
     ```json
     [
       { "area_code": "130000", "area_name": "東京" },
       { "area_code": "270000", "area_name": "大阪" }
     ]
     ```
   - 登録地域がない場合は空配列を返す：`[]`

2. `POST /api/my-areas`
   - リクエストボディ：
     ```json
     { "area_code": "130000", "area_name": "東京" }
     ```
   - 登録成功時（201）：
     ```json
     { "message": "東京 を登録しました" }
     ```
   - 既に登録済みの場合（409）：
     ```json
     { "detail": "この地域は既に登録されています" }
     ```

3. `DELETE /api/my-areas/{area_code}`
   - パスパラメータで指定した地域を削除する
   - 削除成功時（200）：
     ```json
     { "message": "地域を削除しました" }
     ```
   - 該当する登録が見つからない場合（404）：
     ```json
     { "detail": "登録されていない地域です" }
     ```

4. `GET /api/my-areas/weather`
   - ログインユーザーの登録地域すべてについて天気予報を取得し、まとめて返す
   - レスポンス例（200）：
     ```json
     [
       {
         "area_code": "130000",
         "area_name": "東京",
         "weather": "晴れ",
         "max_temp": "14"
       },
       {
         "area_code": "270000",
         "area_name": "大阪",
         "weather": "曇り",
         "max_temp": "12"
       }
     ]
     ```
   - 登録地域がない場合は空配列を返す：`[]`

◆ 画面仕様（ログイン後の天気予報画面を拡張）

1. マイ地域の天気（ログイン直後に自動表示）
   - ログイン直後に `GET /api/my-areas/weather` を呼び出し、登録済みの全地域の天気を **一覧で自動表示** する
   - 各地域の横に削除ボタン（[✕]）を表示する
   - 削除ボタンを押すと `DELETE /api/my-areas/{area_code}` を呼び、一覧から即座に消える
   - 登録地域がない場合は「マイ地域が登録されていません」と表示する

2. 地域の追加
   - 既存のドロップダウン（都道府県選択）の横に「マイ地域に追加」ボタンを配置する
   - ボタン押下時に `POST /api/my-areas` を呼び出し、登録する
   - 登録成功後、マイ地域の天気一覧を自動更新する
   - 既に登録済みの場合はエラーメッセージを表示する

3. 天気の個別検索（課題4から継続）
   - ドロップダウン + 「取得」ボタンによる天気検索は引き続き使用できる

◆ ファイル構成（例）

```
weather-APP/
├── main.py            # FastAPI（全APIエンドポイント定義）
├── weather.py         # 気象庁APIからデータ取得
├── AreaCodeData.py    # 都道府県コードデータ
├── database.py        # SQLite 接続・テーブル作成（user_areas追加）
├── weather.db         # SQLite データベースファイル
└── static/
    ├── index.html     # ログイン + 天気予報 + マイ地域管理画面
    ├── script.js      # fetch処理・DOM操作・認証制御・マイ地域管理
    └── style.css      # スタイル
```

◆ 出力（例 ― ブラウザでの操作フロー）

1. ログイン → マイ地域が登録されていないため「マイ地域が登録されていません」と表示
2. ドロップダウンで「東京」を選択 →「マイ地域に追加」ボタンを押す →「東京 を登録しました」
3. ドロップダウンで「大阪」を選択 →「マイ地域に追加」ボタンを押す →「大阪 を登録しました」
4. マイ地域の天気一覧に以下が表示される：
   ```
   ■ マイ地域の天気
   東京：晴れ / 最高気温 14℃  [✕]
   大阪：曇り / 最高気温 12℃  [✕]
   ```
5. 東京の [✕] を押す → 東京が一覧から消える
6. ログアウト → 再ログイン → 大阪の天気だけが自動表示される

※ 進め方がわからない場合は、ページ末尾の「ヒント」を参照してください。

## フロントエンド実装方針（課題5・6共通）

課題5・6のフロントエンドは **React 等のフレームワークは使わず、Vanilla JS（素の JavaScript）** で実装する。
現在の `static/script.js` + `fetch` API + DOM操作の構成をそのまま拡張する形で対応できる。

### 画面切り替え方式

- `index.html` 内に **ログイン画面用の `div`** と **天気予報画面用の `div`** を用意する
- `display: none` / `display: block` の切り替えで画面遷移を表現する（ページリロードなし）
- ログイン状態の判定は、ページ読み込み時に `GET /api/me` を呼び出して行う

```html
<!-- 例 -->
<div id="loginSection">  <!-- ログイン画面 --></div>
<div id="weatherSection" style="display: none;">  <!-- 天気予報画面 --></div>
```

```javascript
// 画面切り替えの例
function showWeatherSection() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('weatherSection').style.display = 'block';
}
```

### API 呼び出し

- `fetch` で各エンドポイント（`/api/login`, `/api/register`, `/api/logout` 等）を呼ぶ
- レスポンスの JSON を元に DOM を更新する
- Cookie ベースのセッションなので、`fetch` の `credentials` 設定に注意する（同一オリジンなら既定で送信される）

### 課題6 のマイ地域管理(余裕があったら)

- `/api/my-areas` 系の API を `fetch` で呼び出し、レスポンスをもとに DOM を動的に生成・更新する
- ログイン直後に `GET /api/my-areas/weather` を呼んで一覧表示する
- 追加・削除後は一覧を再取得して画面を更新する

---

## (備考)調査について

調査は 適宜自身で行ってください。
ただし、最低限必要と思われる参考サイトのURLを以下にまとめます。

参考サイト（必要に応じて参照）
◆ 地域コード一覧

https://www.jma.go.jp/bosai/common/const/area.json

◆ 東京エリアの天気予報API

※ 東京（130000）の例
https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json

◆ requests（Pythonライブラリ）

https://requests.readthedocs.io/en/latest/

◆ Python公式ドキュメント（JSON操作）

https://docs.python.org/ja/3/library/json.html

◆ サンプルアプリ

https://anko.education/apps/weather_api

◆ FastAPI StaticFiles（課題4〜）

https://fastapi.tiangolo.com/tutorial/static-files/

◆ Fetch API（課題4〜）

https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch

◆ SQLite3 Python公式ドキュメント（課題5〜）

https://docs.python.org/ja/3/library/sqlite3.html

◆ bcrypt（課題5〜）

https://pypi.org/project/bcrypt/

---

<details>
<summary>ヒント（課題4〜6）― 進め方がわからないときだけ開いてください</summary>

### 課題4のヒント

1. FastAPI のルーティングを変更し、HTMLを返すエンドポイントを削除して、JSON を返す API エンドポイントを作成する
2. `static/` フォルダを作成し、FastAPI で静的ファイルを配信できるよう `StaticFiles` を設定する
3. `index.html` を Jinja2 テンプレートから純粋な静的 HTML に書き換える（`{% %}` や `{{ }}` を使わない）
4. `script.js` を作成し、`fetch` API でドロップダウンを動的に生成する
5. ボタン押下時に `fetch` API で天気データを取得し、レスポンス JSON を DOM に反映する
6. ページリロードが発生しないことを確認する

### 課題5のヒント

1. `database.py` を作成し、SQLite に `users` テーブルを作成する処理を実装する
2. ユーザー登録 API を実装する（パスワードはハッシュ化して保存）
3. ログイン API を実装する（パスワード照合、セッション Cookie 発行）
4. ログアウト API を実装する（セッション Cookie 削除）
5. セッション管理の仕組みを実装する（Cookie にセッションIDを保存し、サーバー側で管理する）
6. 認証チェック用の依存関数（Dependency）を作成し、天気系APIに適用する
7. フロントエンドがログイン状態を確認できるエンドポイントを追加する
8. `index.html` と `script.js` を修正し、ログイン画面と天気予報画面を切り替えられるようにする
9. ページ読み込み時にログイン済みかどうかを判定し、適切な画面を表示する

### 課題6のヒント

1. `database.py` に `user_areas` テーブルの作成処理を追加する
2. マイ地域の一覧取得・登録・削除の各APIを実装する（重複チェック付き）
3. 登録済み全地域の天気をまとめて返すAPIを実装する（内部で気象庁APIを複数回呼び出す）
4. `index.html` にマイ地域の天気一覧エリアを追加する
5. `script.js` にマイ地域の表示・追加・削除の処理を追加する
6. ログイン直後にマイ地域の天気を自動取得して一覧表示する

</details>