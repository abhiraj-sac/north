
import os
import logging

from dotenv import load_dotenv
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_nvidia_ai_endpoints import ChatNVIDIA

load_dotenv()

logger = logging.getLogger(__name__)


def get_llm() -> BaseChatModel:

    provider = os.getenv(
        "LLM_PROVIDER", "ollama"
    ).strip().lower()

    if provider == "ollama":

        model = os.getenv(
            "OLLAMA_MODEL", "qwen2.5:1.5b"
        )

        logger.info("Initializing Ollama: %s", model)

        return ChatOllama(
            model=model,
            base_url=os.getenv(
                "OLLAMA_BASE_URL",
                "http://localhost:11434"
            ),
            temperature=0,
        )

    elif provider == "nvidia":

        api_key = os.getenv("NVIDIA_API_KEY")

        if not api_key:
            raise ValueError(
                "NVIDIA_API_KEY is missing."
            )

        model = os.getenv(
            "NVIDIA_MODEL", "openai/gpt-oss-20b"
        )

        logger.info("Initializing NVIDIA: %s", model)

        return ChatNVIDIA(
            model=model,
            api_key=api_key,
            temperature=0,
            top_p=1,
            max_tokens=4096,
            timeout=240,
        )

    else:
        raise ValueError(
            f"Unsupported LLM_PROVIDER: {provider}"
        )


def get_structured_llm(schema):

    provider = os.getenv(
        "LLM_PROVIDER", "ollama"
    ).strip().lower()

    llm = get_llm()

    if provider == "ollama":
        return llm.with_structured_output(
            schema,
            method="json_schema",
        )

    elif provider == "nvidia":
        return llm.with_structured_output(
            schema
        )
