export async function translate(text: string) {
  return await Assistant.requestStreaming({
    systemPrompt:
      "你是个专业的中文翻译,负责将其他文本翻译为中文,若文本为中文则不作任何修改直接返回",
    messages: [{ role: "user", content: text }],
  });
}
