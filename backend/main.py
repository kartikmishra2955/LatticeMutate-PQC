from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import experiments

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LatticeMutate-PQC API", version="0.1.0-alpha")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(experiments.router)

@app.get("/")
def read_root():
    return {"status": "ok", "app": "LatticeMutate-PQC"}

@app.get("/api/status")
def read_status():
    return {"status": "ok", "message": "Connected to LatticeMutate-PQC Backend"}
