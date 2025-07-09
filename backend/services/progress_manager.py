"""
Progress tracking service for real-time progress updates via WebSocket.
"""

import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket
from utils.logger import get_logger

logger = get_logger(__name__)


class ProgressManager:
    """Manages WebSocket connections and progress updates for validation tasks."""

    def __init__(self):
        # Store active WebSocket connections by session_id
        self.connections: Dict[str, WebSocket] = {}
        # Store progress data by session_id
        self.progress_data: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.connections[session_id] = websocket
        self.progress_data[session_id] = {
            "total_items": 0,
            "processed_items": 0,
            "current_item": "",
            "status": "idle",
            "message": "Connected",
        }
        logger.info(f"WebSocket connected for session: {session_id}")

        # Send initial connection message
        await self.send_progress_update(session_id, "Connected to progress tracker")

    def disconnect(self, session_id: str):
        """Remove a WebSocket connection."""
        if session_id in self.connections:
            del self.connections[session_id]
        if session_id in self.progress_data:
            del self.progress_data[session_id]
        logger.info(f"WebSocket disconnected for session: {session_id}")

    async def send_progress_update(self, session_id: str, message: str = None):
        """Send progress update to a specific session."""
        if session_id not in self.connections:
            return

        websocket = self.connections[session_id]
        progress = self.progress_data.get(session_id, {})

        # Calculate percentage
        total = progress.get("total_items", 0)
        processed = progress.get("processed_items", 0)
        percentage = (processed / total * 100) if total > 0 else 0

        update_data = {
            "type": "progress_update",
            "session_id": session_id,
            "total_items": total,
            "processed_items": processed,
            "current_item": progress.get("current_item", ""),
            "percentage": round(percentage, 1),
            "status": progress.get("status", "idle"),
            "message": message or progress.get("message", ""),
        }

        try:
            await websocket.send_text(json.dumps(update_data))
        except Exception as e:
            logger.error(f"Error sending progress update to {session_id}: {e}")
            # Remove the connection if it's broken
            self.disconnect(session_id)

    async def start_task(self, session_id: str, total_items: int, task_name: str):
        """Initialize a new task for progress tracking."""
        if session_id not in self.progress_data:
            self.progress_data[session_id] = {}

        self.progress_data[session_id].update(
            {
                "total_items": total_items,
                "processed_items": 0,
                "current_item": "",
                "status": "processing",
                "message": f"Starting {task_name} with {total_items} items",
            }
        )

        await self.send_progress_update(session_id, f"Starting {task_name}")

    async def update_progress(
        self, session_id: str, processed_items: int, current_item: str = ""
    ):
        """Update progress for a specific session."""
        if session_id not in self.progress_data:
            return

        self.progress_data[session_id].update(
            {
                "processed_items": processed_items,
                "current_item": current_item,
                "message": (
                    f"Processing: {current_item}" if current_item else "Processing..."
                ),
            }
        )

        await self.send_progress_update(session_id)

    async def complete_task(self, session_id: str, message: str = "Task completed"):
        """Mark a task as completed."""
        if session_id not in self.progress_data:
            return

        progress = self.progress_data[session_id]
        progress.update(
            {
                "processed_items": progress.get("total_items", 0),
                "status": "completed",
                "message": message,
            }
        )

        await self.send_progress_update(session_id, message)

    async def error_task(self, session_id: str, error_message: str):
        """Mark a task as failed with error."""
        if session_id not in self.progress_data:
            return

        self.progress_data[session_id].update(
            {"status": "error", "message": f"Error: {error_message}"}
        )

        await self.send_progress_update(session_id, f"Error: {error_message}")


# Global progress manager instance
progress_manager = ProgressManager()
