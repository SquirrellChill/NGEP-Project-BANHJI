from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth
app=FastAPI(title="KotChomnol")

# Allow your frontend (e.g. Vite dev server) to call this API during development.
# Tighten this to your real frontend domain before deploying.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],

)

app.include_router(auth.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service":"KotChomnol API"}