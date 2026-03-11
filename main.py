from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, Request, HTTPException, status, Response, Depends
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import AreaCodeData
import Weather
import database
import auth

# データベース初期化
database.init_db()

app = FastAPI()
templates = Jinja2Templates(directory="Static")

# リクエスト/レスポンスモデル
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class MessageResponse(BaseModel):
    message: str

class UserResponse(BaseModel):
    username: str

class LoginResponse(BaseModel):
    message: str
    username: str

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


# 認証API
## 課題1
@app.post("/api/register", status_code=status.HTTP_201_CREATED, response_model=LoginResponse)
def register(request: RegisterRequest):
    """新規ユーザー登録"""
    existing_user = None
    success:bool = False

    # ユーザー名の重複チェック(ヒント:database.pyのget_user_by_usernameを使う)

    # 既にユーザーがいる場合、エラーを返す
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このユーザー名は既に使用されています"
        )
    
    # パスワードのバリデーション
    if len(request.password) < 6 and len(request.password) > 21:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="パスワードは6文字以上20文字以下である必要があります"
        )
    
    # パスワードをハッシュ化してユーザーを作成(auth.py, database.pyを使うcreate_userのSQLを作る)
    
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ユーザー登録に失敗しました"
        )
    
    return {"message": "ユーザー登録が完了しました", "username": request.username}


# 課題2
@app.post("/api/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response):
    """ログイン"""
    user = None
    # ユーザーを取得
    
    # ユーザーが存在しない、またはパスワードが一致しない場合
    
    # セッションCookieを設定
    session_token = auth.create_session_token(user["username"])
    response.set_cookie(
        key=auth.COOKIE_NAME,
        value=session_token,
        max_age=auth.COOKIE_MAX_AGE,
        httponly=True,
        samesite="lax"
    )
    
    return {"message": "ログインしました", "username": user["username"]}


@app.post("/api/logout", response_model=MessageResponse)
def logout(response: Response):
    """ログアウト"""
    # セッションCookieを削除
    response.set_cookie(
        key=auth.COOKIE_NAME,
        value="",
        max_age=0,
        httponly=True,
        samesite="lax"
    )
    
    return {"message": "ログアウトしました"}

@app.get("/api/me", response_model=UserResponse)
def get_me(username: str = Depends(auth.get_current_user)):
    """現在のユーザー情報を取得"""
    return {"username": username}