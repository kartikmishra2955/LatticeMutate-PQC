from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
import json
import csv
import io

import models, schemas
from database import get_db
from mlkem.baseline import get_baseline_parameters
from mutation.engine import generate_mutations_for_experiment
from security.estimator import estimate_security
from benchmarking.benchmark import evaluate_mutation_benchmark
from ai.assistant import interpret_experiment

router = APIRouter(
    prefix="/api/experiments",
    tags=["experiments"],
)

@router.get("/stats", response_model=schemas.ExperimentStats)
def get_experiment_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated metrics across all experiments in the database.
    """
    total_experiments = db.query(models.Experiment).count()
    total_mutations = db.query(models.Mutation).count()
    total_results = db.query(models.Result).count()
    flagged_regressions = db.query(models.Result).filter(models.Result.regression == True).count()
    
    # If database is fresh with few experiments, combine with baseline stats for display
    # or return exact counts
    return schemas.ExperimentStats(
        totalExperiments=total_experiments,
        mutationsTested=total_mutations,
        correctnessTests=total_results * 50 if total_results > 0 else 0,
        securityEstimates=total_mutations,
        flaggedRegressions=flagged_regressions
    )

@router.get("/", response_model=List[schemas.ExperimentSummary])
def list_experiments(db: Session = Depends(get_db)):
    """
    Returns a list of all experiments with summary counts.
    """
    exps = db.query(models.Experiment).order_by(models.Experiment.created_at.desc()).all()
    summaries = []
    for exp in exps:
        mut_count = len(exp.mutations)
        reg_count = sum(1 for m in exp.mutations if m.result and m.result.regression)
        summaries.append(
            schemas.ExperimentSummary(
                id=exp.id,
                scheme=exp.scheme,
                seed=exp.seed,
                trials=exp.trials,
                created_at=exp.created_at,
                status=exp.status,
                mutation_count=mut_count,
                regression_count=reg_count
            )
        )
    return summaries

@router.post("/", response_model=schemas.Experiment)
def create_experiment(experiment: schemas.ExperimentCreate, db: Session = Depends(get_db)):
    """
    Creates a new experiment record with parameters and ranges.
    """
    exp_id = f"EXP-{str(uuid.uuid4())[:8].upper()}"
    db_exp = models.Experiment(
        id=exp_id,
        scheme=experiment.scheme,
        seed=experiment.seed,
        trials=experiment.trials,
        parameters_to_mutate=experiment.parameters_to_mutate,
        mutation_ranges=experiment.mutation_ranges,
        status="created"
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/{experiment_id}", response_model=schemas.Experiment)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    """
    Returns a single experiment and its generated mutations and results.
    """
    db_exp = (
        db.query(models.Experiment)
        .options(joinedload(models.Experiment.mutations).joinedload(models.Mutation.result))
        .filter(models.Experiment.id == experiment_id)
        .first()
    )
    if db_exp is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return db_exp

@router.post("/{experiment_id}/run", response_model=schemas.Experiment)
def run_experiment(experiment_id: str, db: Session = Depends(get_db)):
    """
    Executes an experiment: generates parameter mutations, estimates security,
    benchmarks execution times, evaluates correctness, and saves results.
    """
    db_exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if db_exp is None:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # If already has mutations, remove them first to allow clean rerun
    if db_exp.mutations:
        for m in db_exp.mutations:
            if m.result:
                db.delete(m.result)
            db.delete(m)
        db.commit()

    db_exp.status = "running"
    db.commit()

    # Load baseline parameters
    baseline = get_baseline_parameters(db_exp.scheme)
    params_to_mutate = db_exp.parameters_to_mutate or [
        "Module Dimension (k)", "Modulus (q)", "Noise (η1)", "Compression (du)"
    ]
    mutation_ranges = db_exp.mutation_ranges or ["±5%"]

    # Generate mutation configs
    mutations_configs = generate_mutations_for_experiment(
        baseline_params=baseline,
        parameters_to_mutate=params_to_mutate,
        mutation_ranges=mutation_ranges,
        seed=db_exp.seed
    )

    base_sec = baseline.get("baseline_security", 195.0)

    # Evaluate each mutation
    exp_suffix = db_exp.id.split("-")[-1]
    for config in mutations_configs:
        mut_id = f"MUT-{exp_suffix}-{config['index']}"
        param_canonical = config["parameter"]
        mut_val = config["mutated_value"]
        orig_val = config["original_value"]

        # Security estimation
        sec_estimate = estimate_security(
            parameter=param_canonical,
            mutated_value=mut_val,
            baseline_value=orig_val,
            baseline_security=base_sec
        )

        # Benchmarks & correctness
        kg_time, enc_time, dec_time, correctness, is_regression = evaluate_mutation_benchmark(
            parameter=param_canonical,
            mutated_value=mut_val,
            original_value=orig_val,
            baseline_params=baseline,
            trials=db_exp.trials,
            seed=db_exp.seed
        )

        # Flag security regressions
        if sec_estimate < (base_sec - 4.9):
            is_regression = True

        db_mut = models.Mutation(
            id=mut_id,
            experiment_id=db_exp.id,
            parameter=config["display_parameter"],
            original_value=orig_val,
            mutated_value=mut_val,
            mutation_percent=config["mutation_percent"],
            status=config["status"],
            seed=db_exp.seed
        )
        db.add(db_mut)

        db_res = models.Result(
            mutation_id=mut_id,
            security_estimate=sec_estimate,
            correctness=correctness,
            keygen_time=kg_time,
            encap_time=enc_time,
            decap_time=dec_time,
            regression=is_regression
        )
        db.add(db_res)

    db_exp.status = "completed"
    db.commit()
    db.refresh(db_exp)
    return db_exp

@router.get("/{experiment_id}/export")
def export_experiment(experiment_id: str, format: str = Query("csv", pattern="^(csv|json)$"), db: Session = Depends(get_db)):
    """
    Exports experiment results in CSV or JSON format.
    """
    db_exp = (
        db.query(models.Experiment)
        .options(joinedload(models.Experiment.mutations).joinedload(models.Mutation.result))
        .filter(models.Experiment.id == experiment_id)
        .first()
    )
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    if format == "json":
        exp_dict = {
            "id": db_exp.id,
            "scheme": db_exp.scheme,
            "seed": db_exp.seed,
            "trials": db_exp.trials,
            "created_at": db_exp.created_at.isoformat(),
            "status": db_exp.status,
            "mutations": [
                {
                    "id": m.id,
                    "parameter": m.parameter,
                    "original_value": m.original_value,
                    "mutated_value": m.mutated_value,
                    "mutation_percent": m.mutation_percent,
                    "status": m.status,
                    "security_estimate": m.result.security_estimate if m.result else None,
                    "correctness": m.result.correctness if m.result else None,
                    "keygen_time_ms": m.result.keygen_time if m.result else None,
                    "encap_time_ms": m.result.encap_time if m.result else None,
                    "decap_time_ms": m.result.decap_time if m.result else None,
                    "regression": m.result.regression if m.result else False,
                }
                for m in db_exp.mutations
            ]
        }
        return Response(
            content=json.dumps(exp_dict, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={db_exp.id}_results.json"}
        )

    # Default CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "mutation_id", "experiment_id", "parameter", "original_value",
        "mutated_value", "mutation_percent", "status", "security_estimate_bits",
        "correctness_percent", "keygen_time_ms", "encap_time_ms", "decap_time_ms", "regression"
    ])
    for m in db_exp.mutations:
        res = m.result
        writer.writerow([
            m.id,
            db_exp.id,
            m.parameter,
            m.original_value,
            m.mutated_value,
            m.mutation_percent,
            m.status,
            res.security_estimate if res else "",
            res.correctness if res else "",
            res.keygen_time if res else "",
            res.encap_time if res else "",
            res.decap_time if res else "",
            res.regression if res else False,
        ])

    return PlainTextResponse(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={db_exp.id}_results.csv"}
    )

@router.post("/{experiment_id}/analyze", response_model=schemas.AssistantResponse)
def analyze_experiment(
    experiment_id: str,
    request: schemas.AssistantRequest,
    db: Session = Depends(get_db)
):
    """
    Performs AI research interpretation on an experiment.
    """
    db_exp = (
        db.query(models.Experiment)
        .options(joinedload(models.Experiment.mutations).joinedload(models.Mutation.result))
        .filter(models.Experiment.id == experiment_id)
        .first()
    )
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")

    baseline = get_baseline_parameters(db_exp.scheme)

    exp_data = {
        "scheme": db_exp.scheme,
        "seed": db_exp.seed,
        "trials": db_exp.trials,
        "mutations": [
            {
                "id": m.id,
                "parameter": m.parameter,
                "original_value": m.original_value,
                "mutated_value": m.mutated_value,
                "mutation_percent": m.mutation_percent,
                "status": m.status,
                "baseline_security": baseline.get("baseline_security", 195.0),
                "result": {
                    "security_estimate": m.result.security_estimate,
                    "correctness": m.result.correctness,
                    "keygen_time": m.result.keygen_time,
                    "encap_time": m.result.encap_time,
                    "decap_time": m.result.decap_time,
                    "regression": m.result.regression
                } if m.result else None
            }
            for m in db_exp.mutations
        ]
    }

    result = interpret_experiment(request.action, exp_data)
    return schemas.AssistantResponse(**result)

@router.delete("/{experiment_id}")
def delete_experiment(experiment_id: str, db: Session = Depends(get_db)):
    """
    Deletes an experiment and its related mutations and results.
    """
    db_exp = db.query(models.Experiment).filter(models.Experiment.id == experiment_id).first()
    if not db_exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    for m in db_exp.mutations:
        if m.result:
            db.delete(m.result)
        db.delete(m)
    db.delete(db_exp)
    db.commit()
    return {"status": "ok", "message": f"Deleted {experiment_id}"}

