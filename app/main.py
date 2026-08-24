from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.inference import node2idx, predict, rel2idx

app = FastAPI(
    title="TemporalGNN Disaster Cascade Prediction API",
    description=(
        "Inference-only microservice for predicting disaster cascade links using a "
        "trained Temporal Graph Neural Network (TemporalGNN)."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    src_id: str = Field(
        ...,
        description="Source disaster node ID seen during training",
        json_schema_extra={"example": "1960-0040"},
    )
    dst_id: str = Field(
        ...,
        description="Destination disaster node ID seen during training",
        json_schema_extra={"example": "1961-0030"},
    )
    relation: str = Field(
        ...,
        description="Relation type seen during training",
        json_schema_extra={"example": "CausalRelation"},
    )


class PredictResponse(BaseModel):
    probability: float = Field(
        ...,
        description="Link prediction probability between src_id and dst_id",
    )
    verdict: bool = Field(
        ...,
        description="True if probability >= 0.5, otherwise False",
    )


class HealthResponse(BaseModel):
    status: str


class NodesResponse(BaseModel):
    count: int
    nodes: list[str]


class RelationsResponse(BaseModel):
    count: int
    relations: list[str]


@app.get("/", summary="Root index")
def root() -> dict[str, Any]:
    return {
        "service": "TemporalGNN Disaster Cascade Prediction API",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "num_nodes": len(node2idx),
        "num_relations": len(rel2idx),
    }


@app.get("/health", response_model=HealthResponse, summary="Service health check")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.post("/predict", response_model=PredictResponse, summary="Predict disaster cascade link")
def predict_link(payload: PredictRequest) -> dict[str, Any]:
    prob = predict(
        src_id=payload.src_id.strip(),
        dst_id=payload.dst_id.strip(),
        relation=payload.relation.strip(),
    )
    return {
        "probability": prob,
        "verdict": bool(prob >= 0.5),
    }


@app.get("/nodes", response_model=NodesResponse, summary="List supported disaster node IDs")
def get_nodes() -> dict[str, Any]:
    return {
        "count": len(node2idx),
        "nodes": list(node2idx.keys()),
    }


@app.get("/relations", response_model=RelationsResponse, summary="List supported relation types")
def get_relations() -> dict[str, Any]:
    return {
        "count": len(rel2idx),
        "relations": list(rel2idx.keys()),
    }
