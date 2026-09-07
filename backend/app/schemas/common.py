from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class CamelModel(BaseModel):
    """Response base: snake_case in Python, camelCase over the wire."""

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        alias_generator=lambda name: "".join(
            part if index == 0 else part.capitalize()
            for index, part in enumerate(name.split("_"))
        ),
    )


class Page(CamelModel, Generic[T]):
    items: list[T]
    total: int
    page: int = 1
    page_size: int = 20

    @property
    def pages(self) -> int:
        return max(1, -(-self.total // self.page_size))


class MessageResponse(CamelModel):
    message: str
    ok: bool = True


class ErrorDetail(CamelModel):
    code: str
    message: str
    details: object | None = None


class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size
