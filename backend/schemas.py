from pydantic import BaseModel
from typing import List, Optional
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

    class Config:
        orm_mode = True
        from_attributes = True

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

    class Config:
        orm_mode = True
        from_attributes = True

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
    created_at: datetime
    status: str
    mutations: List[Mutation] = []

    class Config:
        orm_mode = True
        from_attributes = True
