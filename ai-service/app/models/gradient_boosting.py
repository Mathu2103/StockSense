import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

class GradientBoostingModel:
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=50, random_state=42, max_depth=4, learning_rate=0.1)
        self.feature_cols = ["dayOfWeek", "month", "weekendFlag", "average_unit_price", "discount_applied", "discount_percentage"]
        self.fallback_val = 0.0
        self.is_trained = False

    def fit(self, history_df: pd.DataFrame) -> "GradientBoostingModel":
        if len(history_df) >= 30:
            X = history_df[self.feature_cols].copy()
            X["discount_applied"] = X["discount_applied"].astype(int)
            y = history_df["net_qty_sold"]
            
            self.model.fit(X, y)
            self.fallback_val = float(history_df["net_qty_sold"].mean())
            self.is_trained = True
        else:
            self.fallback_val = float(history_df["net_qty_sold"].mean()) if not history_df.empty else 0.0
            self.is_trained = False
        return self

    def predict(self, future_dates: pd.DataFrame) -> np.ndarray:
        if self.is_trained:
            X_future = future_dates[self.feature_cols].copy()
            X_future["discount_applied"] = X_future["discount_applied"].astype(int)
            preds = self.model.predict(X_future)
            return np.clip(preds, 0, None)
        else:
            return np.full(len(future_dates), self.fallback_val)
