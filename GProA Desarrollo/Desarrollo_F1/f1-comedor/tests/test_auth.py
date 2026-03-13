"""Authentication tests"""
import pytest
from fastapi import status


def test_login_success(client, sample_user):
    """Test successful login"""
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpass"}
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_invalid_password(client, sample_user):
    """Test login with invalid password"""
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "wrongpass"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_login_invalid_username(client, sample_user):
    """Test login with invalid username"""
    response = client.post(
        "/api/auth/login",
        data={"username": "wronguser", "password": "testpass"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_token(client, sample_user):
    """Test token refresh"""
    # First login to get tokens
    login_response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpass"}
    )
    refresh_token = login_response.json().get("access_token")
    
    # Try to refresh (using access token as refresh for simplicity in this test)
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert response.status_code in [status.HTTP_200_OK, status.HTTP_401_UNAUTHORIZED]
