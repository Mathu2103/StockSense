from fastapi import FastAPI
from app.api.demand_forecast_routes import router as demand_router

app = FastAPI(title="StockSense AI Service")

# Include routers
app.include_router(demand_router)

@app.get('/')
def read_root():
    return {"message": "StockSense AI Service is running"}
