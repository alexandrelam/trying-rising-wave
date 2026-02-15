import psycopg2


def get_conn():
    conn = psycopg2.connect(host="localhost", port=4566, user="root", dbname="dev")
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
