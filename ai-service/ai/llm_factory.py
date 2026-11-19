
import os
import json
import logging
import requests

from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.runnables import RunnableLambda
from langchain_ollama import ChatOllama

load_dotenv()
logger = logging.getLogger(__name__)


def get_llm() -> BaseChatModel:
    provider = os.getenv("LLM_PROVIDER", "ollama").strip().lower()

    if provider == "ollama":
        return ChatOllama(
            model=os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b"),
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            temperature=0,
        )

    if provider == "nvidia":
        raise RuntimeError(
            "For NVIDIA, use get_structured_llm() directly."
        )

    raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")


def get_structured_llm(schema):
    provider = os.getenv("LLM_PROVIDER", "ollama").strip().lower()

    if provider == "ollama":
        return get_llm().with_structured_output(
            schema, method="json_schema"
        )

    if provider == "nvidia":
        api_key = os.getenv("NVIDIA_API_KEY")
        model = os.getenv("NVIDIA_MODEL", "stepfun-ai/step-5-preview")

        if not api_key:
            raise ValueError("NVIDIA_API_KEY is missing.")

        def generate_structured(prompt):
            schema_json = json.dumps(schema.model_json_schema())

            response = requests.post(
                "https://integrate.api.nvidia.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{
                        "role": "user",
                        "content": (
                            f"{prompt}\n\n"
                            "Return only a valid JSON object. "
                            "Do not invent facts. Use null or empty "
                            "arrays for missing information.\n"
                            f"JSON schema: {schema_json}"
                        ),
                    }],
                    "temperature": 0,
                    "max_tokens": 4096,
                    "stream": False,
                },
                timeout=240,
            )
            response.raise_for_status()

            content = response.json()["choices"][0]["message"]["content"]

            if not content:
                raise ValueError("NVIDIA returned empty content.")

            content = content.strip()

            if content.startswith("```"):
                content = content.split("\n", 1)[-1]
                content = content.rsplit("```", 1)[0].strip()

            data = json.loads(content)
            return schema.model_validate(data)

        return RunnableLambda(generate_structured)

    raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")
