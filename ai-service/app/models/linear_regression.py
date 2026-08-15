import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

class LinearRegressionModel:
    def __init__(self, window_days: int = 180):
        self.window_days = window_days
        self.model = LinearRegression()
        self.last_t = 0
        self.fallback_val = 0.0

    def fit(self, history_df: pd.DataFrame) -> "LinearRegressionModel":
        history_df = history_df.sort_values("date")
        recent = history_df.tail(self.window_days).copy()
        
        if len(recent) >= 10:
            # Create a time index t
            recent["t"] = np.arange(len(recent))
            self.last_t = len(recent)
            
            X = recent[["t"]]
            y = recent["net_qty_sold"]
            self.model.fit(X, y)
            self.fallback_val = float(recent["net_qty_sold"].mean())
        else:
            self.fallback_val = float(history_df["net_qty_sold"].mean()) if not history_df.empty else 0.0
            self.last_t = 0
            
        return self

    def predict(self, future_dates: pd.DataFrame) -> np.ndarray:
        if self.last_t > 0:
            future_t = self.last_t + np.arange(len(future_dates))
            X_future = pd.DataFrame({"t": future_t})
            preds = self.model.predict(X_future)
            # Clip negative predictions to 0
            return np.clip(preds, 0, None)
        else:
            return np.full(len(future_dates), self.fallback_val)
