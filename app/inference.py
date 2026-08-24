from pathlib import Path
import os
import torch
from fastapi import HTTPException, status
from app.model import TemporalGNN

# Path resolution for artifacts
BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(os.getenv("ARTIFACTS_DIR", BASE_DIR / "artifacts"))

INFERENCE_ARTIFACTS_PATH = ARTIFACTS_DIR / "tgnn_inference_artifacts.pt"
STATE_DICT_PATH = ARTIFACTS_DIR / "tgnn_state_dict.pt"

if not INFERENCE_ARTIFACTS_PATH.exists():
    raise FileNotFoundError(f"Inference artifacts not found at: {INFERENCE_ARTIFACTS_PATH}")

if not STATE_DICT_PATH.exists():
    raise FileNotFoundError(f"State dict not found at: {STATE_DICT_PATH}")

# Load artifacts on import
artifacts = torch.load(INFERENCE_ARTIFACTS_PATH, map_location="cpu")
node2idx: dict[str, int] = artifacts["node2idx"]
rel2idx: dict[str, int] = artifacts["rel2idx"]
time_values: torch.Tensor = artifacts["time_values"]
mean_t: torch.Tensor = artifacts["mean_t"]
std_t: torch.Tensor = artifacts["std_t"]
num_nodes: int = int(artifacts["num_nodes"])
num_relations: int = int(artifacts["num_relations"])

# Invert mappings
idx2node: dict[int, str] = {idx: node for node, idx in node2idx.items()}
idx2rel: dict[int, str] = {idx: rel for rel, idx in rel2idx.items()}

# Instantiate and load model
model = TemporalGNN(num_nodes=num_nodes, num_relations=num_relations)
state_dict = torch.load(STATE_DICT_PATH, map_location="cpu")
model.load_state_dict(state_dict)
model.eval()


def predict(src_id: str, dst_id: str, relation: str) -> float:
    """Predict link existence probability between two known disaster nodes for a relation."""
    if src_id not in node2idx or dst_id not in node2idx:
        missing = []
        if src_id not in node2idx:
            missing.append(f"src_id '{src_id}'")
        if dst_id not in node2idx:
            missing.append(f"dst_id '{dst_id}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"unknown node ({', '.join(missing)}) — model only supports nodes seen during training",
        )

    if relation not in rel2idx:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"unknown relation '{relation}' — model only supports relations seen during training",
        )

    src_idx = torch.tensor([node2idx[src_id]], dtype=torch.long)
    dst_idx = torch.tensor([node2idx[dst_id]], dtype=torch.long)
    rel_idx = torch.tensor([rel2idx[relation]], dtype=torch.long)

    time_diff = time_values[dst_idx] - time_values[src_idx]
    time_diff_norm = (time_diff - mean_t) / std_t

    with torch.no_grad():
        logit = model(src_idx, dst_idx, time_diff_norm, rel_idx)
        prob = torch.sigmoid(logit).item()

    return float(prob)
