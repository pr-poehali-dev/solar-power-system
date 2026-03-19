import json
import os
from datetime import datetime

import psycopg2


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def esc(value):
    if value is None:
        return "NULL"
    return "'" + value.replace("'", "''") + "'"


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
            "body": json.dumps({"success": False, "error": "Invalid JSON"}, ensure_ascii=False),
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
            "body": json.dumps({"success": False, "error": "Поля name, email и role обязательны"}, ensure_ascii=False),
        }

    conn = None
    try:
        conn = psycopg2.connect(os.environ["DATABASE_URL"])
        cur = conn.cursor()
        schema = os.environ.get("MAIN_DB_SCHEMA", "public")
        now = datetime.utcnow().isoformat()

        sql = "INSERT INTO {schema}.applications (name, email, phone, role, comment, created_at) VALUES ({name}, {email}, {phone}, {role}, {comment}, {created_at})".format(
            schema=schema,
            name=esc(name),
            email=esc(email),
            phone=esc(phone or None),
            role=esc(role),
            comment=esc(comment or None),
            created_at=esc(now),
        )

        cur.execute(sql)
        conn.commit()
        cur.close()

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": True, "message": "Заявка сохранена"}, ensure_ascii=False),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"success": False, "error": str(e)}, ensure_ascii=False),
        }
    finally:
        if conn:
            conn.close()