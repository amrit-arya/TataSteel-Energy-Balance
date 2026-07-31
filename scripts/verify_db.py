"""Quick database verification script."""
import sqlite3

db_path = "data/database/fuel_gas.db"
conn = sqlite3.connect(db_path)
c = conn.cursor()

print("=== DATABASE TABLES ===")
c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
for t in c.fetchall():
    c2 = conn.cursor()
    c2.execute(f"SELECT COUNT(*) FROM [{t[0]}]")
    count = c2.fetchone()[0]
    print(f"  {t[0]}: {count} records")

print("\n=== GENERATION TOTALS ===")
c.execute("SELECT gas_type_id, COUNT(*), SUM(generation_value) FROM generation_sources GROUP BY gas_type_id")
for r in c.fetchall():
    print(f"  {r[0]}: {r[1]} sources, total={r[2]:,.0f}")

print("\n=== CONSUMER TOTALS ===")
c.execute("SELECT gas_type_id, consumer_type, COUNT(*), SUM(consumption_value) FROM consumers GROUP BY gas_type_id, consumer_type")
for r in c.fetchall():
    total = f"{r[3]:,.0f}" if r[3] is not None else "NULL"
    print(f"  {r[0]} ({r[1]}): {r[2]} consumers, total={total}")

print("\n=== ALERTS ===")
c.execute("SELECT severity, title FROM alerts")
for r in c.fetchall():
    print(f"  [{r[0].upper()}] {r[1]}")

conn.close()
print("\nDatabase verification complete.")
