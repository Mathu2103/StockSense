import pandas as pd
import numpy as np
from datetime import date

class SeasonalNaiveModel:
    def __init__(self):
        self.daily_val = 0.0

    def fit(self, history_df: pd.DataFrame, target_month: int) -> "SeasonalNaiveModel":
        """
        Fits by taking the average daily sales of the same month across previous years.
        """
        same_month = history_df[history_df["month"] == target_month]
        if not same_month.empty:
            # Group by year to get monthly totals, then average them
            yearly_totals = same_month.groupby("year")["net_qty_sold"].sum()
            avg_monthly = yearly_totals.mean()
            # 31 days in target month (e.g. January)
            self.daily_val = float(avg_monthly / 31.0)
        else:
            # Fallback to recent overall daily average
            self.daily_val = float(history_df["net_qty_sold"].mean())
        return self

    def predict(self, future_dates: pd.DataFrame) -> np.ndarray:
        return np.full(len(future_dates), self.daily_val)
