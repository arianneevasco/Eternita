from fastapi import FastAPI, HTTPException

from app.firebase import db
from app.routers import account, entries

app = FastAPI(title="Eternita Backend")

app.include_router(account.router)
app.include_router(entries.router)

@app.get("/")
def health():
    return {"status": "running"}


@app.get("/health/database")
def database_health():
    try:
        db.collection("_health").document("connection").get()
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database unavailable",
        )

    return {"database": "reachable"}