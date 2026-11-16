from ai.llm_factory import get_llm

llm = get_llm()

response = llm.invoke(
    "Explain resume parsing in three sentences."
)

print(response.content)