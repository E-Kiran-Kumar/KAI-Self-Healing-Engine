"""
app/data/store.py
─────────────────
Thread-safe in-memory data store for Phase 2.

Decouples API routes and business logic from the underlying storage mechanism.
In Phase 3, this class will be replaced with async SQLAlchemy repositories
without modifying the service interface contracts.
"""

from __future__ import annotations

import copy
from typing import Optional

from app.models.client import Client
from app.models.bot import Bot
from app.models.failure import FailureIncident
from app.models.recovery import RecoveryAttempt
from app.models.approval import HumanApprovalItem
from app.models.workflow import WorkflowDefinition, WorkflowExecutionRun
from app.data.seed import (
    INITIAL_CLIENTS,
    INITIAL_BOTS,
    INITIAL_FAILURES,
    INITIAL_RECOVERIES,
    INITIAL_APPROVALS,
    INITIAL_WORKFLOWS,
    INITIAL_WORKFLOW_RUNS,
)


class DataStore:
    """In-memory key-value store keyed by domain item IDs."""

    def __init__(self) -> None:
        self.clients: dict[str, Client] = {}
        self.bots: dict[str, Bot] = {}
        self.failures: dict[str, FailureIncident] = {}
        self.recoveries: dict[str, RecoveryAttempt] = {}
        self.approvals: dict[str, HumanApprovalItem] = {}
        self.workflows: dict[str, WorkflowDefinition] = {}
        self.workflow_runs: dict[str, WorkflowExecutionRun] = {}
        self.reset()

    def reset(self) -> None:
        """Reset all collections to their initial seed state."""
        self.clients.clear()
        for item in INITIAL_CLIENTS:
            c = Client.model_validate(copy.deepcopy(item))
            self.clients[c.id] = c

        self.bots.clear()
        for item in INITIAL_BOTS:
            b = Bot.model_validate(copy.deepcopy(item))
            self.bots[b.id] = b

        self.failures.clear()
        for item in INITIAL_FAILURES:
            f = FailureIncident.model_validate(copy.deepcopy(item))
            self.failures[f.id] = f

        self.recoveries.clear()
        for item in INITIAL_RECOVERIES:
            r = RecoveryAttempt.model_validate(copy.deepcopy(item))
            self.recoveries[r.id] = r

        self.approvals.clear()
        for item in INITIAL_APPROVALS:
            a = HumanApprovalItem.model_validate(copy.deepcopy(item))
            self.approvals[a.id] = a

        self.workflows.clear()
        for item in INITIAL_WORKFLOWS:
            w = WorkflowDefinition.model_validate(copy.deepcopy(item))
            self.workflows[w.id] = w

        self.workflow_runs.clear()
        for item in INITIAL_WORKFLOW_RUNS:
            wr = WorkflowExecutionRun.model_validate(copy.deepcopy(item))
            self.workflow_runs[wr.run_id] = wr


# Global singleton instance
store = DataStore()
