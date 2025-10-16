"""
In-memory state management for the solver backend (MVP)
In production, this would be replaced with a proper database
"""
from typing import Dict, Any, Optional


class State:
    """Simple in-memory state store"""
    
    def __init__(self):
        self._store: Dict[str, Any] = {}
    
    def set_intent(self, key: str, value: Any) -> None:
        """Store intent data"""
        self._store[f"intent:{key}"] = value
    
    def get_intent(self, key: str) -> Optional[Any]:
        """Retrieve intent data"""
        return self._store.get(f"intent:{key}")
    
    def set_auction(self, key: str, value: Any) -> None:
        """Store auction result"""
        self._store[f"auction:{key}"] = value
    
    def get_auction(self, key: str) -> Optional[Any]:
        """Retrieve auction result"""
        return self._store.get(f"auction:{key}")
    
    def set_execution(self, key: str, value: Any) -> None:
        """Store execution log"""
        self._store[f"exec:{key}"] = value
    
    def get_execution(self, key: str) -> Optional[Any]:
        """Retrieve execution log"""
        return self._store.get(f"exec:{key}")
    
    def set_authorization(self, key: str, value: Any) -> None:
        """Store authorization status"""
        self._store[f"auth:{key}"] = value
    
    def get_authorization(self, key: str) -> Optional[Any]:
        """Retrieve authorization status"""
        return self._store.get(f"auth:{key}")
    
    def has_key(self, key: str) -> bool:
        """Check if key exists"""
        return key in self._store
    
    def delete(self, key: str) -> None:
        """Delete a key"""
        if key in self._store:
            del self._store[key]
    
    def clear(self) -> None:
        """Clear all state (useful for testing)"""
        self._store.clear()
    
    def get_all_intents(self) -> Dict[str, Any]:
        """Get all intents (for debugging/admin)"""
        return {k.replace("intent:", ""): v for k, v in self._store.items() if k.startswith("intent:")}


# Global state instance (singleton pattern for MVP)
_state_instance = None


def get_state() -> State:
    """Get the global state instance"""
    global _state_instance
    if _state_instance is None:
        _state_instance = State()
    return _state_instance
