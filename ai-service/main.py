from fastapi import FastAPI

app = FastAPI(title="StockSense AI Service")

@app.get('/')
def read_root():
    return {"message": "StockSense AI Service is running"}
