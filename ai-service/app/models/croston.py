import pandas as pd
import numpy as np

class CrostonModel:
    def __init__(self, alpha: float = 0.15):
        self.alpha = alpha
        self.forecast_val = 0.0

    def fit(self, history_df: pd.DataFrame) -> "CrostonModel":
        """
        Fits Croston's method for intermittent demand.
        Decomposes series into non-zero demand sizes and interval spacing between them.
        """
        y = history_df.sort_values("date")["net_qty_sold"].values
        n = len(y)
        if n == 0:
            self.forecast_val = 0.0
            return self

        # Find indices of non-zero demand
        nz_indices = np.where(y > 0)[0]
        if len(nz_indices) == 0:
            self.forecast_val = 0.0
            return self

        # Initialization
        curr_z = float(y[nz_indices[0]])  # smoothed size
        curr_p = float(nz_indices[0] + 1) if nz_indices[0] > 0 else 1.0  # smoothed interval
        
        q = 1.0  # time since last non-zero demand
        for t in range(1, n):
            if y[t] > 0:
                curr_z = self.alpha * y[t] + (1 - self.alpha) * curr_z
                curr_p = self.alpha * q + (1 - self.alpha) * curr_p
                q = 1.0
            else:
                q += 1.0
                
        self.forecast_val = float(curr_z / curr_p) if curr_p > 0 else 0.0
        return self

    def predict(self, future_dates: pd.DataFrame) -> np.ndarray:
        return np.full(len(future_dates), self.forecast_val)
