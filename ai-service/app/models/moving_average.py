import pandas as pd
import numpy as np

class MovingAverageModel:
    def __init__(self, window_days: int = 90):
        self.window_days = window_days
        self.daily_val = 0.0

    def fit(self, history_df: pd.DataFrame) -> "MovingAverageModel":
        # Sort history chronologically
        history_df = history_df.sort_values("date")
        recent = history_df.tail(self.window_days)
        if not recent.empty:
            self.daily_val = float(recent["net_qty_sold"].mean())
        else:
            self.daily_val = 0.0
        return self

    def predict(self, future_dates: pd.DataFrame) -> np.ndarray:
        return np.full(len(future_dates), self.daily_val)
