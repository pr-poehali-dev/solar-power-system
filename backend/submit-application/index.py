import json
import os
from datetime import datetime

import psycopg2


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    """Обработчик заявок с лендинга. Сохраняет данные формы в таблицу applications."""

    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": "",
        }

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": "Invalid JSON"}),
        }

    name = body.get("name", "").strip()
    email = body.get("email", "").strip()
    phone = body.get("phone", "").strip()
    role = body.get("role", "").strip()
    comment = body.get("comment", "").strip()

    if not name or not email or not role:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": "Поля name, email и role обязательны"}),
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                role TEXT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
            """,
        )

        cur.execute(
            """
            INSERT INTO applications (name, email, phone, role, comment, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (name, email, phone or None, role, comment or None, datetime.utcnow()),
        )

        conn.commit()
        cur.close()

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": True, "message": "Заявка сохранена"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": str(e)}),
        }
    finally:
        if conn:
            conn.close()
