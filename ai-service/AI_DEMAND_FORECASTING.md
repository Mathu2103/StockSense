# 🤖 AI Demand Forecasting — How It Works

> A plain-English, end-to-end explanation of what the AI service does, what data it looks at, how it thinks, and what it gives back.

---

## 🧩 What Is This?

The AI Demand Forecasting system looks at **3 years of past sales data** (January 2023 → December 2025) and predicts **how many units of each product will be sold next month** (e.g., January 2026).

It then tells you:
- How many units you need to **order / restock**
- Whether stock is **Critical**, **Sufficient**, or **Overstock Risk**
- A human-readable **explanation** of why it made that prediction

It runs **once per calendar month**, for all active products (220 SKUs).

---

## 📅 What Time Periods Does It Use?

| Period | Purpose |
|--------|---------|
| **Jan 2023 → Dec 2025** | Full historical window used for training |
| **Last 30 days** (Nov 2025 → Dec 2025) | Recent sales trend |
| **Days -60 to -30** (Oct → Nov 2025) | Previous 30-day period for comparing growth |
| **Last 90 days** (3 months) | Short-term monthly average |
| **Last 180 days** (6 months) | Medium-term monthly average |
| **Same month in past years** (Jan 2023, Jan 2024, Jan 2025) | Seasonal pattern for January |

> ⚠️ The AI **never looks at January 2026 data** — that would be "cheating." It only uses data up to 31 Dec 2025.

---

## 🗄️ What Data Does It Pull From the Database?

The AI reads from **5 database tables** for each product:

### 1. 🛒 Daily Sales (`sales_bill_items` + `sales_bills`)
- How many units were sold each day
- Whether a discount was applied on that sale
- The average selling price on that day

### 2. 🔄 Daily Refunds (`sales_refund_items` + `sales_refunds`)
- How many units were returned each day
- Subtracted from gross sales to get **net sales** (what actually left the store)

### 3. 📦 Daily GRN — Goods Received (`grn_items` + `goods_receiving_notes`)
- How many units were received into stock each day from suppliers

### 4. 📋 Stock Adjustments (`stock_adjustments`)
- Manual stock corrections (write-offs, damage, expiry removals)

### 5. 🏷️ Discount Campaigns (`discounts` + mapping tables)
- Which products had approved discount campaigns running on which dates

---

## ⚙️ Step-by-Step: What Happens When You Click "Generate Forecast"

### Step 1 — Load Raw Data
All 5 tables above are loaded from PostgreSQL into memory as Pandas DataFrames (tabular data).

---

### Step 2 — Clean & Assemble Daily Timeline
For each product, the AI creates a **single row for every calendar day** from Jan 2023 to Dec 2025, filling in:

| Column | Meaning |
|--------|---------|
| `date` | The calendar date |
| `net_qty_sold` | Gross sales − refunds for that day |
| `grn_qty_received` | Units received from suppliers |
| `adjustment_qty` | Manual corrections |
| `discount_applied` | Was there an active discount on this product that day? |

Days with no sales/movements are filled with zeros — so every product gets a complete, unbroken daily record.

---

### Step 3 — Reconstruct Stock History
Since the database only stores the **current stock level**, the AI works **backwards in time** to estimate what the stock was on each past day.

**Formula used:**
```
Stock[yesterday] = Stock[today] + units_sold_today − units_received_today − adjustments_today
```

This gives a `running_stock` column for every day — useful to detect when a product was out of stock.

---

### Step 4 — Calculate Features (Numbers the AI Will Use)
For each product, the AI computes these statistical values from the historical data:

| Feature | What It Means |
|---------|--------------|
| `recent_30_day_sales` | Total net units sold in last 30 days (Dec 2025) |
| `previous_30_day_sales` | Total net units sold in the 30 days before that (Nov 2025) |
| `recent_growth_percent` | Growth/decline between the two 30-day periods |
| `three_month_average` | Average monthly units sold over last 3 months |
| `six_month_average` | Average monthly units sold over last 6 months |
| `same_month_historical_average` | Average units sold in January across 2023, 2024, 2025 |
| `average_daily_sales` | `recent_30_day_sales / 30` |
| `discount_uplift_percent` | Extra % sales seen on discount days vs normal days |
| `refund_quantity` | Units returned in last 30 days |
| `stock_out_estimate` | Days in last 30 where stock was 0 (suppressed sales) |
| `demand_trend` | GROWING / STABLE / DECLINING |
| `data_quality` | HIGH / MEDIUM / POOR (based on how many days of history exist) |

---

### Step 5 — Classify Each Product's Demand Profile
Not every product behaves the same way. The AI puts each product into one of these **demand profiles** before choosing a forecasting model:

| Profile | What It Means |
|---------|--------------|
| `LIMITED_HISTORY` | Less than 90 days of sales data — not enough to learn patterns |
| `INTERMITTENT` | Sells rarely (less than 0.6 units/day, zero sales on 65%+ of days) |
| `DISCOUNT_SENSITIVE` | Sales spike heavily (40%+) when discounts run |
| `SEASONAL` | Sells very differently in January compared to other months |
| `TRENDING_UP` | Growing faster than 15% in recent weeks |
| `TRENDING_DOWN` | Declining faster than 15% in recent weeks |
| `HIGH_VARIABILITY` | Sales jump around a lot — no predictable pattern |
| `STABLE` | Consistent, predictable daily sales |

---

### Step 6 — Pick the Best Forecasting Model (via Backtesting)
The AI doesn't just use one model. It **tests 5–6 different models** on each product using a technique called **backtesting**:

> Backtesting = "Pretend we are in November 2025. Now predict December 2025 using only data up to November. Compare that prediction to what actually happened in December."

The error metric used is **WAPE** (Weighted Absolute Percentage Error — lower is better).

| Model | Best For |
|-------|---------|
| **Moving Average** | Stable products, baseline model |
| **Seasonal Naive** | Products with strong seasonal patterns |
| **Linear Regression** | Products with a clear upward/downward trend |
| **Random Forest** | Complex patterns with multiple influencing factors |
| **Gradient Boosting** | Same as Random Forest but often more accurate |
| **Croston** | Intermittent demand (products that sell rarely) |

**Rules applied:**
1. If data is less than 45 days → automatically uses **Moving Average**
2. If a complex model (Random Forest / Gradient Boosting) doesn't beat Moving Average by at least 5% → stick with **Moving Average** (simpler is more reliable)
3. The model with the **lowest WAPE** wins and is fitted on all 3 years of data

---

### Step 7 — Generate the Prediction
The winning model predicts the **total units expected to be sold in January 2026**.

The AI also applies a **discount uplift adjustment** if:
- There is an active approved discount campaign running in January 2026
- That product has historically responded well to discounts

---

### Step 8 — Calculate Recommended Restock Quantity
```
safety_stock    = predicted_demand × 15%
recommended_qty = predicted_demand + safety_stock − current_stock
```

This tells the manager exactly how many units to order so that:
- The predicted demand is covered
- An extra 15% safety buffer is maintained for uncertainty

---

### Step 9 — Classify Status

| Status | Condition |
|--------|----------|
| 🔴 **CRITICAL ACTION** | Stock will run out in < 12 days, OR current stock < predicted demand, OR recommended_qty > 0 |
| 🟡 **OVERSTOCK RISK** | Stock > 150% of predicted demand AND will last > 45 days |
| 🟢 **SUFFICIENT** | Everything is fine — no action needed |

---

### Step 10 — Generate a Human-Readable Explanation
The system writes a short paragraph in plain English explaining the forecast:

- "Net sales increased by 18.3% in the most recent 30 days compared to the previous 30 days."
- "Historically, January demand is seasonal, averaging 22% above normal months."
- "Current stock covers approximately 8 days. An immediate restock of 45 units is required."

---

### Step 11 — Save to Database
All results are saved into 3 PostgreSQL tables:
- `demand_forecast_runs` — one row per forecast run (which month, when it ran)
- `demand_analysis` — detailed metrics per product (features, model, accuracy)
- `demand_forecasts` — final output per product (predicted demand, recommended qty, status)

---

## 📊 What Does the Dashboard Show?

| Card / Column | Where It Comes From |
|--------------|-------------------|
| **Products Forecasted** | Count of all rows in `demand_forecasts` for the run |
| **Critical Action** | Products where `status = CRITICAL_ACTION` (full run total) |
| **Sufficient Stock** | Products where `status = SUFFICIENT` (full run total) |
| **Overstock Risk** | Products where `status = OVERSTOCK_RISK` (full run total) |
| **Current Stock** | Snapshot of stock at the time of forecast |
| **Stock Will Last** | `current_stock ÷ average_daily_sales` |
| **Next Month Demand** | The model's prediction |
| **Recommended Qty** | How many units to order |
| **Prediction Reason** | Auto-generated plain-English explanation |

Clicking any row opens a **detail popup** showing all the underlying metrics (growth %, 3-month avg, 6-month avg, same-month historical, discount uplift, refund volume, model used, WAPE accuracy score).

---

## 🧠 Accuracy Score

The accuracy score shown in the popup is calculated as:
```
Accuracy = 1 − WAPE
```
For example, a WAPE of 0.18 → Accuracy = 82.0%

A higher score means the chosen model predicted the validation month (December 2025) very accurately.

---

## 🔁 When Should You Run It?

- **Once at the start of each month**
- Always run it **after the previous month's sales data is complete**
- You can use the "Force" option to regenerate if you want to update an existing month's forecast

---

## 📁 Key Files

| File | What It Does |
|------|-------------|
| `app/services/data_loader.py` | Loads all raw data from PostgreSQL |
| `app/services/data_cleaner.py` | Builds the complete daily timeline per product |
| `app/services/feature_engineering.py` | Computes all statistical features |
| `app/services/product_profiler.py` | Classifies each product's demand type |
| `app/services/model_selector.py` | Runs backtesting and picks the best model |
| `app/services/recommendation_engine.py` | Computes recommended qty, coverage days, status |
| `app/services/explanation_engine.py` | Generates the plain-English explanation text |
| `app/services/db_operations.py` | Saves everything back to PostgreSQL |
| `app/api/demand_forecast_routes.py` | FastAPI HTTP endpoints (generate, fetch, details) |

