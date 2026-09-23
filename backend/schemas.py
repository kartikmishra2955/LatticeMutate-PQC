from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime

class ResultBase(BaseModel):
    security_estimate: float
    correctness: float
    keygen_time: float
    encap_time: float
    decap_time: float
    regression: bool

class Result(ResultBase):
    id: int
    mutation_id: str

    model_config = ConfigDict(from_attributes=True)

class MutationBase(BaseModel):
    id: str
    parameter: str
    original_value: float
    mutated_value: float
    mutation_percent: str
    status: str
    seed: str

class Mutation(MutationBase):
    experiment_id: str
    result: Optional[Result] = None

    model_config = ConfigDict(from_attributes=True)

class ExperimentCreate(BaseModel):
    scheme: str
    seed: str
    trials: int
    parameters_to_mutate: List[str]
    mutation_ranges: List[str]

class Experiment(BaseModel):
    id: str
    scheme: str
    seed: str
    trials: int
    parameters_to_mutate: Optional[List[str]] = None
    mutation_ranges: Optional[List[str]] = None
    created_at: datetime
    status: str
    mutations: List[Mutation] = []

    model_config = ConfigDict(from_attributes=True)

class ExperimentSummary(BaseModel):
    id: str
    scheme: str
    seed: str
    trials: int
    created_at: datetime
    status: str
    mutation_count: int = 0
    regression_count: int = 0

    model_config = ConfigDict(from_attributes=True)

class ExperimentStats(BaseModel):
    totalExperiments: int
    mutationsTested: int
    correctnessTests: int
    securityEstimates: int
    flaggedRegressions: int

class AssistantRequest(BaseModel):
    action: str # "explain" | "anomalies" | "followup" | "discussion"
    custom_query: Optional[str] = None

class AssistantResponse(BaseModel):
    title: str
    summary: str
    details: List[str]
    latex_draft: Optional[str] = None
