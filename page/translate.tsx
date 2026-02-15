import { useObservable, useEffect, ProgressView, Text, Button, Section } from "scripting";
import { translate } from "../util/translate";

export function TranslateSection({ content }: { content: string }) {
  const text = useObservable("");

  async function translateContent() {
    text.setValue("");
    if (!content) return;
    const reader = (await translate(content)).getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.type === "text") text.setValue(text.value + value.content);
    }
  }

  useEffect(() => {
    translateContent();
  }, [content]);

  if (!text.value) return <ProgressView />;

  return (
    <Text
      contextMenu={{
        menuItems: (
          <>
            <Section>
              <Button title="重新翻译" action={translateContent} />
            </Section>
            <Section>
              <Button title="复制译文" action={() => Pasteboard.setString(text.value!)} />
              <Button title="复制原文" action={() => Pasteboard.setString(content)} />
            </Section>
          </>
        ),
      }}>
      {text.value}
    </Text>
  );
}
