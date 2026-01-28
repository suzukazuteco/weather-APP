import requests

# area = input()

response = requests.get("https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json")

data = response.json()

weather = data[0]["timeSeries"][0]["areas"][0]["weathers"][1]

maxtemps = data[1][]

print(weather)
