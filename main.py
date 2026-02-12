from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request
import AreaCodeData

app = FastAPI()
templates = Jinja2Templates(directory="templates")

@app.get("/")
def index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "areas": AreaCodeData.codeData}
    )


@app.get("/test")
def get_area(request: Request,area: str):
    return templates.TemplateResponse("index.html",{"request": request,"area": area,"areas": AreaCodeData.codeData})