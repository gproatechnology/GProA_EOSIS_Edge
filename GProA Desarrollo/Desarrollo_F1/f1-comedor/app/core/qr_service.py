"""
QR Code Service - Modular design for internal generation or external integration

This service provides a modular QR code generation system. By default, it uses the
internal qrcode library, but it's designed to be easily replaced with external
integrations like SoftMenu.

To switch to an external provider:
1. Implement the QRProviderInterface
2. Replace the provider in the QRService class
"""
import io
import base64
from abc import ABC, abstractmethod
from typing import Optional
import uuid
import qrcode


class QRProviderInterface(ABC):
    """Abstract interface for QR code providers"""
    
    @abstractmethod
    def generate_qr_code(self, data: str) -> str:
        """
        Generate QR code from data
        Returns: base64 encoded PNG image
        """
        pass
    
    @abstractmethod
    def generate_qr_bytes(self, data: str) -> bytes:
        """
        Generate QR code from data
        Returns: raw PNG bytes
        """
        pass


class InternalQRProvider(QRProviderInterface):
    """Internal QR code generator using qrcode library"""
    
    def __init__(self, box_size: int = 10, border: int = 4):
        self.box_size = box_size
        self.border = border
    
    def generate_qr_code(self, data: str) -> str:
        """Generate QR code and return as base64 string"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=self.box_size,
            border=self.border,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def generate_qr_bytes(self, data: str) -> bytes:
        """Generate QR code and return as raw bytes"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=self.box_size,
            border=self.border,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        
        return buffer.getvalue()


class QRService:
    """
    QR Code Service - Modular design for easy integration with external providers
    
    Usage:
        qr_service = QRService()
        
        # Generate QR code
        qr_image = qr_service.generate_qr_code("employee_data")
        
        # Or get raw bytes for file download
        qr_bytes = qr_service.generate_qr_bytes("employee_data")
    """
    
    def __init__(self, provider: Optional[QRProviderInterface] = None):
        """
        Initialize QR service with a provider
        
        Args:
            provider: QR provider implementation. If None, uses internal provider.
        """
        self.provider = provider or InternalQRProvider()
    
    def generate_unique_qr_data(self) -> str:
        """Generate a unique QR code data string"""
        return f"EMP-{uuid.uuid4().hex[:12].upper()}"
    
    def generate_qr_code(self, data: str) -> str:
        """Generate QR code from data string"""
        return self.provider.generate_qr_code(data)
    
    def generate_qr_bytes(self, data: str) -> bytes:
        """Generate QR code bytes from data string"""
        return self.provider.generate_qr_bytes(data)
    
    def validate_qr_data(self, qr_data: str) -> bool:
        """
        Validate QR code data format
        Can be extended to validate against external systems
        """
        if not qr_data:
            return False
        
        # Basic validation - could be extended for external validation
        if qr_data.startswith("EMP-"):
            return True
        
        return True  # Allow external formats


# Example of how to implement an external provider (e.g., SoftMenu):
"""
class SoftMenuQRProvider(QRProviderInterface):
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
    
    def generate_qr_code(self, data: str) -> str:
        # Call SoftMenu API to generate QR
        response = requests.post(
            f"{self.base_url}/api/qr/generate",
            json={"employee_id": data},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.json()["qr_image"]
    
    def generate_qr_bytes(self, data: str) -> bytes:
        # Call SoftMenu API to generate QR
        response = requests.post(
            f"{self.base_url}/api/qr/generate",
            json={"employee_id": data, "format": "bytes"},
            headers={"Authorization": f"Bearer {self.api_key}"}
        )
        return response.content
"""

# Default service instance
qr_service = QRService()
