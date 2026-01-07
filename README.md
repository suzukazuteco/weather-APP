天気予報アプリ

このステップでは、気象庁APIを利用して 「東京」と入力されたら、明日の天気と明日の最高気温を表示する」 プログラムを作成します。

課題内容

Python で以下を満たすプログラム main.py を作成してください。

◆ 入力

コンソールで次のようにユーザーから文字を受け取る：

東京

◆ 出力（例）
明日の東京の天気は「晴れ」、最高気温は 14℃ です。


※ 天気・気温は気象庁APIから取得してください。
※ 明日が何日かはプログラム側で自動判定してください。

やることの概要

ユーザーから地域名（今回は「東京」）を受け取る

地域名 → 地域コード（例：130000）を対応させる


気象庁APIから天気予報JSONを取得する

JSON の中から

明日の天気

明日の最高気温
を抽出する

指定のフォーマットで出力する

調査について

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