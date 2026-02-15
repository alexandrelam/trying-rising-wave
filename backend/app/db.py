import os

import psycopg2

RW_HOST = os.environ.get("RW_HOST", "localhost")
RW_PORT = int(os.environ.get("RW_PORT", "4566"))


def get_conn():
    conn = psycopg2.connect(host=RW_HOST, port=RW_PORT, user="root", dbname="dev")
    conn.autocommit = True
    return conn


def query_rows(sql: str) -> list[dict]:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql)
    cols = [desc[0] for desc in cur.description]
    rows = [dict(zip(cols, row)) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return rows


def execute(sql: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(sql)
    cur.close()
    conn.close()
