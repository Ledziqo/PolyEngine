import httpx

from app.core.config import get_settings


class PolymarketClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    async def get_markets(self, limit: int = 100) -> list[dict]:
        params = {"limit": limit, "active": "true", "closed": "false", "order": "volume", "ascending": "false"}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(f"{self.settings.gamma_url}/markets", params=params)
            response.raise_for_status()
            data = response.json()
            return data if isinstance(data, list) else data.get("markets", [])

    async def get_order_book(self, token_id: str) -> dict:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(f"{self.settings.clob_url}/book", params={"token_id": token_id})
            response.raise_for_status()
            return response.json()
