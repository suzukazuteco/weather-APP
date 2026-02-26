from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
import AreaCodeData
import Weather

app = FastAPI()
templates = Jinja2Templates(directory="Static")

@app.get("/")
def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "areas": AreaCodeData.codeData}
    )


@app.get("/test")
def get_area(request: Request,area: str):
    return templates.TemplateResponse("index.html",{"request": request,"area": area,"areas": AreaCodeData.codeData, "areaWeather" : Weather.weatherResult(area)})

@app.get("/api/areas")
def area_api():
    return [{"name": name, "code": code} for name, code in AreaCodeData.codeData.items()]

app.mount("/static", StaticFiles(directory="static", html=True), name="index")

@app.get("/api/weather/{area_code}")
def weather_api(area_code: str):
    return Weather.weatherResult(area_code)