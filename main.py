import requests

area = input()

response = requests.get("https://www.jma.go.jp/bosai/common/const/area.json")
data = response.json()

# print(data)