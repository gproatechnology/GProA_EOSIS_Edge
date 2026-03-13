"""Audit logging configuration"""
import logging
import os
from datetime import datetime
from typing import Optional
from logging.handlers import RotatingFileHandler

# Configure audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
os.makedirs(logs_dir, exist_ok=True)

# File handler with rotation
file_handler = RotatingFileHandler(
    os.path.join(logs_dir, "audit.log"),
    maxBytes=10 * 1024 * 1024,  # 10MB
    backupCount=5
)
file_handler.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Format
formatter = logging.Formatter(
    "%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

audit_logger.addHandler(file_handler)
audit_logger.addHandler(console_handler)


def log_authentication(username: str, success: bool, ip_address: Optional[str] = None):
    """Log authentication attempt"""
    status = "SUCCESS" if success else "FAILED"
    ip = f" from {ip_address}" if ip_address else ""
    audit_logger.info(f"AUTH | {status} | User: {username}{ip}")


def log_action(
    user_id: int,
    username: str,
    action: str,
    resource: str,
    resource_id: Optional[int] = None,
    details: Optional[str] = None
):
    """Log user action"""
    res_id = f" (ID: {resource_id})" if resource_id else ""
    detail = f" | {details}" if details else ""
    audit_logger.info(
        f"ACTION | User: {username} (ID: {user_id}) | {action} | "
        f"{resource}{res_id}{detail}"
    )


def log_security_event(event_type: str, details: str):
    """Log security-related event"""
    audit_logger.warning(f"SECURITY | {event_type} | {details}")


def log_api_request(method: str, path: str, user_id: Optional[int] = None, status_code: Optional[int] = None):
    """Log API request"""
    user = f"User: {user_id}" if user_id else "Anonymous"
    status = f" | Status: {status_code}" if status_code else ""
    audit_logger.info(f"API | {method} {path} | {user}{status}")
