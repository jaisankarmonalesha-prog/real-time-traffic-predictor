import numpy as np
import pandas as pd
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import os

def generate_synthetic_data(num_samples=2500):
    np.random.seed(42)
    
    # Generate random features
    weather = np.random.choice([0, 1, 2], size=num_samples)      # 0: sunny, 1: rain, 2: snow
    time_of_day = np.random.choice([0, 1, 2, 3], size=num_samples) # 0: morning, 1: midday, 2: evening, 3: night
    event = np.random.choice([0, 1, 2, 3], size=num_samples)       # 0: none, 1: sports, 2: concert, 3: holiday
    active_policies = np.random.choice([0, 1, 2, 3], size=num_samples) # count of active mitigations
    incidents = np.random.choice([0, 1, 2], size=num_samples)      # count of active incidents
    
    # Calculate target: congestion index (0 to 100) using simulation-like logic
    base_congestion = 38.0
    
    # Weather impact
    weather_impact = np.where(weather == 1, 12.0, np.where(weather == 2, 28.0, 0.0))
    
    # Time impact
    time_impact = np.where(time_of_day == 0, 18.0, # Morning peak
                           np.where(time_of_day == 2, 22.0, # Evening peak
                                    np.where(time_of_day == 3, -15.0, 0.0))) # Night empty
    
    # Event impact
    event_impact = np.where(event == 1, 15.0, # Sports
                            np.where(event == 2, 10.0, # Concert
                                     np.where(event == 3, -6.0, 0.0))) # Holiday local traffic dip
    
    # Policies reduce congestion
    policy_reduction = -7.5 * active_policies
    
    # Incidents increase congestion
    incident_impact = 18.0 * incidents
    
    # Noise
    noise = np.random.normal(0, 3.5, size=num_samples)
    
    # Combine
    congestion = base_congestion + weather_impact + time_impact + event_impact + policy_reduction + incident_impact + noise
    congestion = np.clip(congestion, 10.0, 98.0) # bound between 10% and 98%
    
    df = pd.DataFrame({
        'weather': weather,
        'time_of_day': time_of_day,
        'event': event,
        'active_policies': active_policies,
        'incidents': incidents,
        'congestion_index': congestion
    })
    return df

def train_model():
    print("Generating synthetic traffic logs for training...")
    df = generate_synthetic_data()
    
    # Split features and target
    X = df[['weather', 'time_of_day', 'event', 'active_policies', 'incidents']]
    y = df['congestion_index']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Fitting Random Forest Regressor model...")
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    # Verify
    predictions = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    print(f"Model Training Complete. Test set RMSE: {rmse:.4f}% congestion")
    
    # Save model
    os.makedirs('server', exist_ok=True)
    model_path = os.path.join('server', 'model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model saved to {model_path}")

if __name__ == '__main__':
    train_model()
