from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

import models, schemas
from database import get_db

router = APIRouter(
    prefix="/api/experiments",
    tags=["experiments"],
)

@router.post("/", response_model=schemas.Experiment)
def create_experiment(experiment: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    exp_id = f"EXP-{str(uuid.uuid4())[:8].upper()}"
    db_exp = models.Experiment(
        id=exp_id,
        scheme=experiment.scheme,
        seed=experiment.seed,
        trials=experiment.trials,
        status="created"
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/{experiment_id}", response_model=schemas.Experiment)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    db_exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if db_exp is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return db_exp

@router.post("/{experiment_id}/run", response_model=schemas.Experiment)
def run_experiment(experiment_id: str, db: Session = Depends(get_db)):
    db_exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if db_exp is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # In a real scenario, this would trigger a background Celery task.
    # For now, we simulate the execution by changing status.
    db_exp.status = "running"
    db.commit()
    db.refresh(db_exp)
    return db_exp
