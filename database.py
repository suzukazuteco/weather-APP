import sqlite3
from typing import Optional, Dict
from datetime import datetime

DATABASE_NAME = "users.db"

def get_db_connection():
    """データベース接続を取得"""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """データベースとユーザーテーブルを初期化"""
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # テスト用の初期ユーザーを挿入（既に存在する場合はスキップ）
    conn.execute(
        "INSERT OR IGNORE INTO users (username, hashed_password) VALUES (?, ?)",
        ("tanaka", "$2b$12$wm/kP53vQXriFzR7cLP9l.e97cG5.MHGHTL4VT7uCgMiGYvYceNZ6")
    )

    conn.commit()
    conn.close()
    print("データベースが初期化されました")

def create_user(username: str, hashed_password: str) -> bool:
    """新規ユーザーを作成"""
    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
            (username, hashed_password)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        return False

def get_user_by_username(username: str) -> Optional[Dict]:
    """ユーザー名でユーザーを取得"""
    conn = get_db_connection()
    cursor = conn.execute(
        "SELECT id, username, hashed_password, created_at FROM users WHERE username = ?",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row["id"],
            "username": row["username"],
            "hashed_password": row["hashed_password"],
            "created_at": row["created_at"]
        }
    return None

if __name__ == "__main__":
    init_db()
