from fastapi import FastAPI

app = FastAPI(title="KotChomnol AI Service")

@app.get("/")
def read_root():
    return {"message": "Backend-ai service is running"}