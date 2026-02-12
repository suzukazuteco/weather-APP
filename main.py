from typing import Union

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/{areacode}")
def read_item(areacode):
    return f"{arecode}の天気は～～です"