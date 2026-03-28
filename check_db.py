import sqlite3

conn = sqlite3.connect("engine.db")

cursor = conn.execute("PRAGMA table_info(fm_tickets)")

print("\n=== fm_tickets TABLE STRUCTURE ===\n")

for row in cursor:
    print(row)

conn.close()

