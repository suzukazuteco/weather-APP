import requests

area = input("地域名を入力してください:")

response = requests.get("https://www.jma.go.jp/bosai/common/const/area.json")

data = response.json()
area_code = None

for code, areaname in data["offices"].items():
    if areaname["name"] == area:
        area_code = code
        break

if area_code == None:
    print("地域が見つかりません")
    exit()

areaData = requests.get(f"https://www.jma.go.jp/bosai/forecast/data/forecast/{area_code}.json").json()

weather = areaData[0]["timeSeries"][0]["areas"][0]["weathers"][1]

maxtemps = areaData[1]["timeSeries"][1]["areas"][0]["tempsMax"][1]

print("明日の天気は" + weather + "、最高気温は" + maxtemps + "℃です。")
