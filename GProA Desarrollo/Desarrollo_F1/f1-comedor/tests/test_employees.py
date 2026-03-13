"""Employee tests"""
import pytest
from fastapi import status


def test_create_employee(client, auth_headers, sample_company, sample_category):
    """Test creating an employee with auto-generated QR"""
    response = client.post(
        "/api/employees",
        json={
            "employee_number": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "company_id": sample_company.id,
            "category_id": sample_category.id,
            "email": "john.doe@company.com"
        },
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["employee_number"] == "EMP001"
    assert "qr_code" in response.json()
    assert response.json()["qr_code"].startswith("EMP-")


def test_list_employees(client, auth_headers, sample_company, sample_category):
    """Test listing employees"""
    # Create an employee first
    client.post(
        "/api/employees",
        json={
            "employee_number": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "company_id": sample_company.id,
            "category_id": sample_category.id
        },
        headers=auth_headers
    )
    
    response = client.get("/api/employees", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total"] >= 1


def test_scan_employee_qr(client, auth_headers, sample_company, sample_category):
    """Test scanning employee QR code"""
    # Create employee
    create_response = client.post(
        "/api/employees",
        json={
            "employee_number": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "company_id": sample_company.id,
            "category_id": sample_category.id
        },
        headers=auth_headers
    )
    qr_code = create_response.json()["qr_code"]
    
    # Scan QR code
    response = client.post(
        "/api/employees/scan",
        json={"qr_code": qr_code},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["can_consume"] is True
    assert response.json()["employee_number"] == "EMP001"


def test_scan_invalid_qr(client, auth_headers):
    """Test scanning invalid QR code"""
    response = client.post(
        "/api/employees/scan",
        json={"qr_code": "INVALID-QR"},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_employee_qr_image(client, auth_headers, sample_company, sample_category):
    """Test getting employee QR image"""
    # Create employee
    create_response = client.post(
        "/api/employees",
        json={
            "employee_number": "EMP001",
            "first_name": "John",
            "last_name": "Doe",
            "company_id": sample_company.id,
            "category_id": sample_category.id
        },
        headers=auth_headers
    )
    employee_id = create_response.json()["id"]
    
    # Get QR image
    response = client.get(f"/api/employees/{employee_id}/qr", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert "qr_code" in response.json()
    assert response.json()["qr_code"].startswith("data:image/png;base64,")
