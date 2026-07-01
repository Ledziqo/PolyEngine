from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PolyEngine"
    app_secret_key: str = "change-this-before-live-trading"
    database_url: str = "postgresql+psycopg://polyengine:change-me@localhost:5432/polyengine"
    redis_url: str = "redis://localhost:6379/0"
    engine_cors_origins: str = "http://localhost:3000"
    gamma_url: str = "https://gamma-api.polymarket.com"
    clob_url: str = "https://clob.polymarket.com"
    data_url: str = "https://data-api.polymarket.com"
    bitquery_api_key: str | None = None
    bitquery_url: str = "https://streaming.bitquery.io/graphql"
    live_trading_enabled: bool = False
    polymarket_private_key: str | None = None
    polymarket_funder_address: str | None = None
    polymarket_api_key: str | None = None
    polymarket_api_secret: str | None = None
    polymarket_api_passphrase: str | None = None
    live_trading_dry_run: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.engine_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
