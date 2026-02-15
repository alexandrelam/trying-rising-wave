import psycopg2


def query():
    conn = psycopg2.connect(host="localhost", port=4566, user="root", dbname="dev")
    cur = conn.cursor()

    cur.execute("SELECT id, name, email, specialities FROM practitioners_with_specialities ORDER BY id")
    rows = cur.fetchall()

    if not rows:
        print("No results yet — materialized view may still be processing.")
        cur.close()
        conn.close()
        return

    print(f"\n{'ID':<5} {'Name':<15} {'Email':<25} {'Specialities':<30}")
    print("-" * 75)
    for row in rows:
        print(f"{row[0]:<5} {row[1]:<15} {row[2]:<25} {row[3]}")

    print(f"\nTotal rows: {len(rows)}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    query()
