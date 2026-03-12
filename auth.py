import secrets
import bcrypt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from typing import Optional
from fastapi import Cookie, HTTPException, status

SECRET_KEY = secrets.token_hex(32)
COOKIE_NAME = "session"
COOKIE_MAX_AGE = 86400 * 7  # 7日間

# シリアライザー（Cookie署名用）
serializer = URLSafeTimedSerializer(SECRET_KEY)

def hash_password(password: str) -> str:
    """パスワードをハッシュ化"""
    
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_session_token(username: str) -> str:
    """セッショントークンを作成"""
    return serializer.dumps({"username": username})

def decode_session_token(token: str, max_age: int = COOKIE_MAX_AGE) -> Optional[str]:
    """セッショントークンをデコードしてユーザー名を取得"""
    try:
        data = serializer.loads(token, max_age=max_age)
        return data.get("username")
    except (BadSignature, SignatureExpired):
        return None

def get_current_user(session: Optional[str] = Cookie(None)) -> str: # Cookie(None):FastAPIの機能　Cookieの中のsession=xxxx を取り出す、なければNone
    """
    現在のユーザーを取得（依存関数として使用）
    ログインしていない場合は401エラー
    """
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ログインが必要です"
        )
    
    username = decode_session_token(session)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ログインが必要です"
        )
    
    return username
