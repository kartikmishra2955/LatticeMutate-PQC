from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
import datetime
from database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(String, primary_key=True, index=True) # e.g. EXP-8473
    scheme = Column(String) # e.g. ML-KEM-768
    seed = Column(String)
    trials = Column(Integer)
    parameters_to_mutate = Column(JSON, nullable=True) # JSON array of strings
    mutation_ranges = Column(JSON, nullable=True) # JSON array of strings
    created_at = Column(DateTime, default=utc_now)
    status = Column(String, default="created")

    mutations = relationship("Mutation", back_populates="experiment")

class Mutation(Base):
    __tablename__ = "mutations"

    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    parameter = Column(String)
    original_value = Column(Float)
    mutated_value = Column(Float)
    mutation_percent = Column(String)
    status = Column(String) # Valid, Warning, Invalid
    seed = Column(String)

    experiment = relationship("Experiment", back_populates="mutations")
    result = relationship("Result", back_populates="mutation", uselist=False)

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    mutation_id = Column(String, ForeignKey("mutations.id"))
    security_estimate = Column(Float) # in bits
    correctness = Column(Float) # percentage 0-100
    keygen_time = Column(Float)
    encap_time = Column(Float)
    decap_time = Column(Float)
    regression = Column(Boolean, default=False)

    mutation = relationship("Mutation", back_populates="result")
