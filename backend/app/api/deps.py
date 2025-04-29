from sqlalchemy.ext.asyncio import AsyncSession, async_session


async def get_db() -> AsyncSession:
    """获取异步数据库会话"""
    async with async_session() as session:
        yield session
