import requests

# area = input()

response = requests.get("https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json")

data = response.json()

weather = data[0]["timeSeries"][0]["areas"][0]["weathers"][1]

maxtemps = data[1]["timeSeries"][1]["areas"][0]["tempsMax"][1]

print("明日の天気は" + weather + "、最高気温は" + maxtemps + "℃です。")
