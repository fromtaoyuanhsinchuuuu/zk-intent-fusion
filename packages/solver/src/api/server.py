"""
FastAPI server for ZK-Intent Fusion solver backend
Provides REST API endpoints for the frontend
"""
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.orchestration import (
    submit_intent_flow,
    authorize_execution,
    execute_intent,
    get_intent_status
)
from core.state import get_state

# Initialize FastAPI app
app = FastAPI(
    title="ZK-Intent Fusion Solver API",
    description="Backend API for ZK-Intent cross-chain optimization",
    version="0.1.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "service": "ZK-Intent Fusion Solver API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/submit-intent")
def submit_intent(
    nl: str = Query(..., description="Natural language intent"),
    user: str = Query(default="0xAlice", description="User wallet address")
):
    """
    Parse natural language intent and run solver auction
    
    This is the main entry point for the demo flow.
    Combines: Parse → Auction → Return winner
    
    Example:
        GET /submit-intent?nl=Use all my stablecoins for 3 months, highest APY
    """
    try:
        result = submit_intent_flow(nl, user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/authorize")
def authorize(
    commitment: str = Query(..., description="Intent commitment hash"),
    signature: str = Query(default="", description="User authorization signature (optional in MVP)")
):
    """
    Authorize the winning solver to execute the intent
    
    In production, this would integrate with Vincent/Lit Protocol
    for access control and authorization
    
    Example:
        GET /authorize?commitment=0xabc123...
    """
    try:
        result = authorize_execution(commitment, signature)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/execute")
def execute(
    commitment: str = Query(..., description="Intent commitment hash")
):
    """
    Execute the intent via Avail Nexus
    
    Performs: Bridge → Execute → Generate ZK proof → Record on-chain
    
    Example:
        GET /execute?commitment=0xabc123...
    """
    try:
        result = execute_intent(commitment)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/status/{commitment}")
def status(commitment: str):
    """
    Get the current status of an intent
    
    Shows progress through: parsed → auctioned → authorized → executed
    
    Example:
        GET /status/0xabc123...
    """
    try:
        result = get_intent_status(commitment)
        if result.get("status") == "not_found":
            raise HTTPException(status_code=404, detail="Intent not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {str(e)}")


@app.get("/intents")
def list_intents():
    """
    List all intents (for debugging/admin)
    
    Example:
        GET /intents
    """
    state = get_state()
    intents = state.get_all_intents()
    return {
        "count": len(intents),
        "intents": [
            {
                "commitment": k,
                "user": v.user if hasattr(v, 'user') else "unknown",
                "timestamp": v.timestamp if hasattr(v, 'timestamp') else 0
            }
            for k, v in intents.items()
        ]
    }


@app.post("/reset")
def reset_state():
    """
    Reset all state (for testing/demo)
    
    WARNING: This clears all intents, auctions, and executions
    """
    state = get_state()
    state.clear()
    return {"ok": True, "message": "State cleared"}


# For running directly: uvicorn server:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8787)
