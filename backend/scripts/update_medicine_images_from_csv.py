#!/usr/bin/env python3
import argparse
import csv
import os
import sqlite3


def resolve_db_path(user_db_path: str | None) -> str:
    if user_db_path:
        return user_db_path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "dev.db")


def main() -> int:
    parser = argparse.ArgumentParser(description="Update medicine image URLs from CSV.")
    parser.add_argument("--csv", required=True, help="CSV file path")
    parser.add_argument("--db", help="SQLite DB path (default: backend/dev.db)")
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV not found: {args.csv}")
        return 1

    db_path = resolve_db_path(args.db)
    if not os.path.exists(db_path):
        print(f"DB not found: {db_path}")
        return 1

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    updated = 0
    skipped = 0
    missing = 0

    with open(args.csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required_cols = {"name", "strength", "image_url"}
        got_cols = set(reader.fieldnames or [])
        if not required_cols.issubset(got_cols):
            print("CSV must contain columns: name,strength,image_url")
            return 1

        for row in reader:
            name = (row.get("name") or "").strip()
            strength = (row.get("strength") or "").strip()
            image_url = (row.get("image_url") or "").strip()
            if not name or not image_url:
                skipped += 1
                continue

            cur.execute(
                """
                UPDATE medicines
                SET image_url = ?
                WHERE LOWER(name) = LOWER(?)
                  AND LOWER(COALESCE(strength, '')) = LOWER(COALESCE(?, ''))
                """,
                (image_url, name, strength),
            )
            if cur.rowcount == 0:
                missing += 1
            else:
                updated += cur.rowcount

    conn.commit()
    conn.close()

    print("Image update finished")
    print(f"Updated rows: {updated}")
    print(f"Skipped rows: {skipped}")
    print(f"No match rows: {missing}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
