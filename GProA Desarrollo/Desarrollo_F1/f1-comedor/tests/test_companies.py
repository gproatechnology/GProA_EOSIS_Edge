"""Company tests"""
import pytest
from fastapi import status


def test_create_company(client, auth_headers):
    """Test creating a company"""
    response = client.post(
        "/api/companies",
        json={"name": "New Company", "code": "NEWCO"},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["name"] == "New Company"
    assert response.json()["code"] == "NEWCO"


def test_list_companies(client, auth_headers, sample_company):
    """Test listing companies"""
    response = client.get("/api/companies", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["total"] >= 1


def test_get_company(client, auth_headers, sample_company):
    """Test getting a company"""
    response = client.get(f"/api/companies/{sample_company.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == sample_company.name


def test_update_company(client, auth_headers, sample_company):
    """Test updating a company"""
    response = client.put(
        f"/api/companies/{sample_company.id}",
        json={"name": "Updated Company"},
        headers=auth_headers
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Updated Company"


def test_delete_company(client, auth_headers, sample_company):
    """Test deleting a company"""
    response = client.delete(f"/api/companies/{sample_company.id}", headers=auth_headers)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's deactivated
    response = client.get(f"/api/companies/{sample_company.id}", headers=auth_headers)
    assert response.json()["is_active"] is False
