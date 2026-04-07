import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "running"


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_register():
    res = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "testpassword123"
    })
    assert res.status_code in [201, 400]  # 400 if already exists


def test_login_wrong_password():
    res = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_predictions_requires_auth():
    res = client.get("/api/predictions")
    assert res.status_code == 403


def test_stats_requires_auth():
    res = client.get("/api/stats")
    assert res.status_code == 403
