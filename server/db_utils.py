import sys
import os
import argparse
import datetime
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add server directory to path to allow importing from main
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import TrafficLogModel, ActiveIncidentModel, SessionLocal, engine

def seed_database():
    """
    Seeds the database with 100 historical logs simulating the past 24 hours of traffic.
    This creates realistic morning and evening peak curves for the Recharts graph.
    """
    db = SessionLocal()
    try:
        # Clear existing logs first to prevent duplicate seeds
        db.query(TrafficLogModel).delete()
        db.commit()
        
        print("Seeding database with 100 historical records...")
        
        now = datetime.datetime.now()
        logs_to_add = []
        
        for i in range(100, 0, -1):
            # Step back in time in 15-minute intervals
            delta = datetime.timedelta(minutes=15 * i)
            log_time = now - delta
            
            # Format time label for frontend
            time_label = log_time.strftime("%I:%M %p")
            hour = log_time.hour
            
            # Simulate a realistic traffic curve over 24 hours
            # Base congestion
            base = 35.0
            
            # Morning peak (8:00 AM - 10:00 AM)
            morning_peak = 0.0
            if 8 <= hour <= 10:
                dist = abs(hour - 9)
                morning_peak = 35.0 * (1 - dist)
                
            # Evening peak (5:00 PM - 7:00 PM)
            evening_peak = 0.0
            if 17 <= hour <= 19:
                dist = abs(hour - 18)
                evening_peak = 40.0 * (1 - dist)
                
            # Night dip (11:00 PM - 5:00 AM)
            night_dip = 0.0
            if hour >= 23 or hour <= 5:
                night_dip = -20.0
                
            # Random fluctuations
            import random
            noise = random.uniform(-4, 4)
            
            # Calculate actual index
            actual_congestion = int(round(max(10, min(95, base + morning_peak + evening_peak + night_dip + noise))))
            
            # Calculate predicted index (representing baseline without AI mitigations)
            # Add a offset indicating what baseline would be (higher congestion)
            pred_offset = random.uniform(3, 8) if (morning_peak > 0 or evening_peak > 0) else random.uniform(-1, 3)
            predicted_congestion = int(round(max(10, min(98, actual_congestion + pred_offset))))
            
            db_log = TrafficLogModel(
                timestamp=time_label,
                actual=actual_congestion,
                predicted=predicted_congestion
            )
            logs_to_add.append(db_log)
            
        db.add_all(logs_to_add)
        db.commit()
        print(f"[OK] Successfully seeded {len(logs_to_add)} logs in the database.")
        
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to seed database: {e}")
    finally:
        db.close()

def export_to_csv():
    """
    Queries all traffic logs from SQLite and exports them to a CSV file.
    """
    db = SessionLocal()
    try:
        print("Querying traffic logs from SQLite database...")
        logs = db.query(TrafficLogModel).all()
        if not logs:
            print("No records found in database to export. Run --seed first.")
            return
            
        data = [{
            "id": log.id,
            "timestamp": log.timestamp,
            "actual_congestion_index": log.actual,
            "predicted_baseline_index": log.predicted
        } for log in logs]
        
        df = pd.DataFrame(data)
        export_path = os.path.join("server", "traffic_history_export.csv")
        df.to_csv(export_path, index=False)
        print(f"[OK] Export complete! File saved successfully to: {export_path}")
        
    except Exception as e:
        print(f"[ERROR] Failed to export data: {e}")
    finally:
        db.close()

def clear_database():
    """
    Clears all tables in the SQLite database.
    """
    db = SessionLocal()
    try:
        print("Clearing all tables in the database...")
        logs_deleted = db.query(TrafficLogModel).delete()
        incidents_deleted = db.query(ActiveIncidentModel).delete()
        db.commit()
        print(f"[OK] Deleted {logs_deleted} traffic logs.")
        print(f"[OK] Deleted {incidents_deleted} active incidents.")
        print("[OK] Database tables reset successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to clear database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MetroFlow AI Database Utility Tool")
    parser.add_argument("--seed", action="store_true", help="Seeds SQLite tables with 24-hour historical logs")
    parser.add_argument("--export-csv", action="store_true", help="Exports SQLite logs to server/traffic_history_export.csv")
    parser.add_argument("--clear", action="store_true", help="Clears and resets all database tables")
    
    args = parser.parse_args()
    
    if args.seed:
        seed_database()
    elif args.export_csv:
        export_to_csv()
    elif args.clear:
        clear_database()
    else:
        parser.print_help()
