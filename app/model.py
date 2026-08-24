import math
import torch
import torch.nn as nn


class TimeEncoding(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, t):
        t = t.float().view(-1)
        device = t.device
        half_dim = self.dim // 2
        freqs = torch.exp(torch.arange(half_dim, device=device) * -(math.log(10000.0) / half_dim))
        angles = t.unsqueeze(1) * freqs
        return torch.cat([torch.sin(angles), torch.cos(angles)], dim=1)


class TemporalGNN(nn.Module):
    def __init__(self, num_nodes, num_relations, embed_dim=32, time_dim=16, rel_dim=8):
        super().__init__()
        self.node_emb = nn.Embedding(num_nodes, embed_dim)
        self.rel_emb = nn.Embedding(num_relations, rel_dim)
        self.time_enc = TimeEncoding(time_dim)
        self.msg_mlp = nn.Sequential(nn.Linear(embed_dim + time_dim + rel_dim, embed_dim), nn.ReLU())
        self.update_mlp = nn.Sequential(nn.Linear(embed_dim * 2, embed_dim), nn.ReLU())
        self.link_mlp = nn.Sequential(nn.Linear(embed_dim * 2, 64), nn.ReLU(), nn.Linear(64, 1))

    def forward(self, src, dst, time_diff, rel_idx):
        h_src = self.node_emb(src)
        h_dst = self.node_emb(dst)
        h_rel = self.rel_emb(rel_idx)
        t_enc = self.time_enc(time_diff)
        msg = self.msg_mlp(torch.cat([h_src, t_enc, h_rel], dim=1))
        h_dst_updated = self.update_mlp(torch.cat([h_dst, msg], dim=1))
        x = torch.cat([h_src, h_dst_updated], dim=1)
        return self.link_mlp(x).squeeze(-1)
