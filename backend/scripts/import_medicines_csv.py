#!/usr/bin/env python3
import argparse
import csv
import os
import sqlite3
from typing import Tuple


def resolve_db_path(user_db_path: str | None) -> str:
    if user_db_path:
        return user_db_path
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base_dir, "dev.db")


def parse_int(value: str, field: str, row_no: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError(f"Row {row_no}: invalid {field}='{value}'")


def parse_float(value: str, field: str, row_no: int) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        raise ValueError(f"Row {row_no}: invalid {field}='{value}'")


def parse_available(value: str, row_no: int) -> int:
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "yes", "y"}:
        return 1
    if normalized in {"0", "false", "no", "n"}:
        return 0
    raise ValueError(f"Row {row_no}: invalid available='{value}' (use 1/0 or true/false)")


def validate_pharmacy(cur: sqlite3.Cursor, pharmacy_id: int, row_no: int) -> None:
    cur.execute("SELECT id FROM pharmacies WHERE id = ?", (pharmacy_id,))
    if not cur.fetchone():
        raise ValueError(f"Row {row_no}: pharmacy_id={pharmacy_id} not found in pharmacies table")


def find_existing(cur: sqlite3.Cursor, pharmacy_id: int, name: str, strength: str) -> Tuple[int, ...] | None:
    cur.execute(
        """
        SELECT id
        FROM medicines
        WHERE pharmacy_id = ?
          AND LOWER(name) = LOWER(?)
          AND LOWER(COALESCE(strength, '')) = LOWER(COALESCE(?, ''))
        """,
        (pharmacy_id, name, strength),
    )
    row = cur.fetchone()
    return tuple(row) if row else None


def main() -> int:
    parser = argparse.ArgumentParser(description="Bulk import medicines from CSV into SQLite.")
    parser.add_argument("--csv", required=True, help="CSV file path")
    parser.add_argument("--db", help="SQLite DB path (default: backend/dev.db)")
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="insert: skip duplicates, upsert: update duplicates (default: upsert)",
    )
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"CSV file not found: {args.csv}")
        return 1

    db_path = resolve_db_path(args.db)
    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return 1

    inserted = 0
    updated = 0
    skipped = 0
    failed = 0

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    with open(args.csv, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        required_cols = {"pharmacy_id", "name", "strength", "unit", "price", "available", "stock_qty"}
        missing = required_cols - set(reader.fieldnames or [])
        if missing:
            print(f"Missing CSV columns: {', '.join(sorted(missing))}")
            return 1

        for row_no, row in enumerate(reader, start=2):
            try:
                pharmacy_id = parse_int(row.get("pharmacy_id", ""), "pharmacy_id", row_no)
                name = (row.get("name") or "").strip()
                strength = (row.get("strength") or "").strip()
                unit = (row.get("unit") or "").strip() or "strip"
                price = parse_float(row.get("price", ""), "price", row_no)
                available = parse_available(row.get("available", ""), row_no)
                stock_qty = parse_int(row.get("stock_qty", ""), "stock_qty", row_no)
                image_url = (row.get("image_url") or "").strip() or "/medicine-placeholder.svg"
                offer_text = (row.get("offer_text") or "").strip()
                mrp_raw = (row.get("mrp") or "").strip()
                mrp = parse_float(mrp_raw, "mrp", row_no) if mrp_raw else round(price * 1.2, 2)

                if not name:
                    raise ValueError(f"Row {row_no}: name is required")
                if price < 0:
                    raise ValueError(f"Row {row_no}: price cannot be negative")
                if mrp < price:
                    raise ValueError(f"Row {row_no}: mrp cannot be lower than price")
                if stock_qty < 0:
                    raise ValueError(f"Row {row_no}: stock_qty cannot be negative")
                if not offer_text:
                    offer_pct = int(round(((mrp - price) * 100.0) / mrp)) if mrp > price else 0
                    offer_text = f"{offer_pct}% OFF" if offer_pct > 0 else "Best Price"

                validate_pharmacy(cur, pharmacy_id, row_no)
                existing = find_existing(cur, pharmacy_id, name, strength)

                if existing and args.mode == "insert":
                    skipped += 1
                    continue

                if existing and args.mode == "upsert":
                    cur.execute(
                        """
                        UPDATE medicines
                        SET unit = ?, price = ?, mrp = ?, offer_text = ?, image_url = ?, available = ?, stock_qty = ?
                        WHERE id = ?
                        """,
                        (unit, price, mrp, offer_text, image_url, available, stock_qty, existing[0]),
                    )
                    updated += 1
                else:
                    cur.execute(
                        """
                        INSERT INTO medicines (pharmacy_id, name, strength, unit, price, mrp, offer_text, image_url, available, stock_qty)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (pharmacy_id, name, strength, unit, price, mrp, offer_text, image_url, available, stock_qty),
                    )
                    inserted += 1

            except ValueError as err:
                failed += 1
                print(f"[ERROR] {err}")

    cur.execute(
        "UPDATE pharmacies SET medicines_count = (SELECT COUNT(*) FROM medicines m WHERE m.pharmacy_id = pharmacies.id)"
    )
    conn.commit()
    conn.close()

    print("Import finished")
    print(f"Inserted: {inserted}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Failed : {failed}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
