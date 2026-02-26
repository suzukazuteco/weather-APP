import requests
import AreaCodeData

#area = input("地域名を入力してください:")

# response = requests.get("https://www.jma.go.jp/bosai/common/const/area.json")
# data = response.json()

def weatherResult(area_code):
    # area_code = None

    # for name, code in AreaCodeData.codeData.items():
    #     if name == area:
    #         area_code = code
    #         break

    # if area_code == None:
    #     print("地域が見つかりません")
    #     exit()
    
    areaname = None

    for name, code in AreaCodeData.codeData.items():
        if code == area_code:
            areaname = name
            break

    areaData = requests.get(f"https://www.jma.go.jp/bosai/forecast/data/forecast/{area_code}.json").json()

    weather = areaData[0]["timeSeries"][0]["areas"][0]["weathers"][1]

    maxtemps = areaData[1]["timeSeries"][1]["areas"][0]["tempsMax"][1]

    return {"areaname":areaname,"weather":weather,"maxtemps":maxtemps}
