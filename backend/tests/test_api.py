import pytest
from httpx import ASGITransport, AsyncClient

from app import app


@pytest.mark.anyio
async def test_health_check():
    """Test the health check or root endpoint if it exists"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/")
    # If root doesn't exist, it might be 404, which is fine for a basic test
    # Just checking that the app starts up
    assert response.status_code in [200, 404]


@pytest.mark.anyio
async def test_colleges_search():
    """Test college search endpoint"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/colleges/search?round=1&min_rank=1&max_rank=10000")

    assert response.status_code == 200
    data = response.json()
    assert "colleges" in data
    assert isinstance(data["colleges"], list)


@pytest.mark.anyio
async def test_colleges_by_rank():
    """Test colleges by rank endpoint"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/colleges/by-rank/5000?round=1&limit=5")

    assert response.status_code == 200
    data = response.json()
    assert "colleges" in data
    assert len(data["colleges"]) <= 5


@pytest.mark.anyio
async def test_college_details():
    """Test college details/branches endpoint"""
    # Assuming E001 is a valid college code
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/colleges/E001/branches")

    # If E001 doesn't exist, it might be 404 or 200 with empty list
    assert response.status_code in [200, 404]


@pytest.mark.anyio
async def test_branches():
    """Test branches list endpoint"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/branches/list")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.anyio
async def test_auth_me_unauthorized():
    """Test /auth/me without token"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/auth/me")

    assert response.status_code == 401


@pytest.mark.anyio
async def test_chat_health():
    """Test chat health endpoint"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/chat/health")

    assert response.json()["status"] == "healthy"


@pytest.mark.anyio
async def test_email_status():
    """Test email service status endpoint"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/api/email/status")

    assert response.status_code == 200
    data = response.json()
    assert "enabled" in data
