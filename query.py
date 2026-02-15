import psycopg2


def query():
    conn = psycopg2.connect(host="localhost", port=4566, user="root", dbname="dev")
    cur = conn.cursor()

    cur.execute("SELECT id, name, email, speciality FROM practitioners_with_specialities ORDER BY id, speciality")
    rows = cur.fetchall()

    if not rows:
        print("No results yet — materialized view may still be processing.")
        cur.close()
        conn.close()
        return

    print(f"\n{'ID':<5} {'Name':<15} {'Email':<25} {'Speciality':<20}")
    print("-" * 65)
    for row in rows:
        print(f"{row[0]:<5} {row[1]:<15} {row[2]:<25} {row[3]:<20}")

    print(f"\nTotal rows: {len(rows)}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    query()
