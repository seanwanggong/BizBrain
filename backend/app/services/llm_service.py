from typing import Dict, Any, List, Optional
import httpx
from ..core.config import settings
import json


class LLMService:
    """LLM服务类"""
    
    def __init__(self):
        """初始化LLM服务"""
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_API_BASE or "https://api.openai.com/v1"
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
        )

    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """发送请求到OpenAI API"""
        response = await self.client.post(endpoint, json=data)
        response.raise_for_status()
        return response.json()

    async def completion(self, prompt: str, max_tokens: int = 100) -> str:
        """文本补全"""
        data = {
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens
        }
        response = await self._make_request("/chat/completions", data)
        return response["choices"][0]["message"]["content"]

    async def sentiment(self, text: str) -> Dict[str, float]:
        """情感分析"""
        prompt = f"分析以下文本的情感倾向，返回positive、negative和neutral的概率：\n\n{text}"
        response = await self.completion(prompt)
        # 解析响应并返回情感分析结果
        # 这里需要根据实际的响应格式进行调整
        return {"positive": 0.5, "negative": 0.3, "neutral": 0.2}

    async def entities(self, text: str) -> Dict[str, list]:
        """实体识别"""
        prompt = f"识别以下文本中的实体（人名、地名、组织名等）：\n\n{text}"
        response = await self.completion(prompt)
        # 解析响应并返回实体识别结果
        # 这里需要根据实际的响应格式进行调整
        return {"people": [], "locations": [], "organizations": []}

    async def summary(self, text: str, max_length: int = 100) -> str:
        """文本摘要"""
        prompt = f"用不超过{max_length}个字总结以下文本：\n\n{text}"
        return await self.completion(prompt)

    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()

    async def generate_completion(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        temperature: float = 0.7,
        max_tokens: int = 1000,
        stop: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """生成文本补全"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
            **kwargs
        }
        
        if stop:
            data["stop"] = stop
        
        try:
            response = await self.client.post("/chat/completions", headers=headers, json=data)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise ValueError(f"LLM API request failed: {str(e)}")
    
    async def generate_embeddings(
        self,
        text: str,
        model: str = "text-embedding-ada-002"
    ) -> List[float]:
        """生成文本嵌入"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "input": text
        }
        
        try:
            response = await self.client.post("/embeddings", headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            return result["data"][0]["embedding"]
        except Exception as e:
            raise ValueError(f"Embeddings API request failed: {str(e)}")
    
    async def analyze_sentiment(
        self,
        text: str,
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, Any]:
        """分析文本情感"""
        prompt = f"""请分析以下文本的情感倾向：
{text}

请以JSON格式返回分析结果，包含以下字段：
- sentiment: 情感倾向（positive/negative/neutral）
- confidence: 置信度（0-1）
- key_phrases: 关键短语列表
- summary: 简要总结"""
        
        response = await self.generate_completion(
            prompt=prompt,
            model=model,
            temperature=0.3
        )
        
        try:
            result = json.loads(response["choices"][0]["message"]["content"])
            return result
        except Exception as e:
            raise ValueError(f"Failed to parse sentiment analysis result: {str(e)}")
    
    async def extract_entities(
        self,
        text: str,
        model: str = "gpt-3.5-turbo"
    ) -> Dict[str, Any]:
        """提取文本中的实体"""
        prompt = f"""请从以下文本中提取实体：
{text}

请以JSON格式返回提取结果，包含以下字段：
- entities: 实体列表，每个实体包含：
  - text: 实体文本
  - type: 实体类型（PERSON/ORGANIZATION/LOCATION/DATE/OTHER）
  - start: 起始位置
  - end: 结束位置"""
        
        response = await self.generate_completion(
            prompt=prompt,
            model=model,
            temperature=0.3
        )
        
        try:
            result = json.loads(response["choices"][0]["message"]["content"])
            return result
        except Exception as e:
            raise ValueError(f"Failed to parse entity extraction result: {str(e)}")
    
    async def summarize_text(
        self,
        text: str,
        model: str = "gpt-3.5-turbo",
        max_length: int = 200
    ) -> Dict[str, Any]:
        """总结文本内容"""
        prompt = f"""请总结以下文本，限制在{max_length}字以内：
{text}

请以JSON格式返回总结结果，包含以下字段：
- summary: 总结内容
- key_points: 关键点列表
- length: 总结长度"""
        
        response = await self.generate_completion(
            prompt=prompt,
            model=model,
            temperature=0.3,
            max_tokens=max_length * 2
        )
        
        try:
            result = json.loads(response["choices"][0]["message"]["content"])
            return result
        except Exception as e:
            raise ValueError(f"Failed to parse summary result: {str(e)}") 