import {
  List,
  Button,
  Navigation,
  NavigationStack,
  Section,
  useMemo,
  useEffect,
  Editor,
  useState,
} from "scripting";
import { composeize } from "../utils/composerize";
import { load as yamlLoad } from "../module/js-yaml";

export function AddView({
  onChange,
}: {
  onChange?: (name: string, content: string) => void;
}) {
  const dismiss = Navigation.useDismiss();
  const [composeConfig, setComposeConfig] = useState("");

  return (
    <NavigationStack>
      <List
        navigationTitle="添加"
        toolbar={{
          topBarLeading: [
            <Button
              title="保存"
              action={async () => {
                if (composeConfig !== "") {
                  await Dialog.prompt({
                    title: "请输入堆栈名称",
                  }).then(async (name) => {
                    if (name) {
                      try {
                        const compose = yamlLoad(composeConfig);
                        if (compose) {
                          dismiss();
                          onChange?.(name, composeConfig);
                        }
                      } catch (e) {
                        await Dialog.alert({
                          title: "提示",
                          message: "compose 配置格式错误",
                        });
                      }
                    }
                  });
                } else {
                  await Dialog.alert({
                    title: "提示",
                    message: "请输入 compose 配置",
                  });
                }
              }}
            />,
          ],
          topBarTrailing: [
            <Button
              title="转换"
              systemImage="arrow.2.squarepath"
              action={async () => {
                await Dialog.prompt({
                  title: "转换 compose 配置",
                  placeholder: "输入 docker run 命令",
                }).then((result) => {
                  if (result) {
                    setComposeConfig(composeize(result));
                  }
                });
              }}
            />,
          ],
        }}>
        <Section title="编辑器">
          <AddEditor
            content={composeConfig}
            onChange={setComposeConfig}
            frame={{
              height: 350,
            }}
          />
        </Section>
      </List>
    </NavigationStack>
  );
}

export function AddEditor({
  content,
  onChange,
}: {
  content: string;
  onChange?: (val: string) => void;
}) {
  const controller = useMemo(() => {
    return new EditorController({
      content,
      ext: "txt",
      readOnly: false,
      onContentChanged: (newContent: string) => {
        onChange?.(newContent);
      },
    } as any);
  }, []);

  // 当外部 content 变化时更新编辑器
  useEffect(() => {
    if (controller.content !== content) {
      controller.content = content;
    }
  }, [content, controller]);

  // 卸载释放资源
  useEffect(() => {
    return () => controller.dispose();
  }, [controller]);

  return (
    <Editor
      controller={controller}
      scriptName="Compose 编辑器"
      clipShape={{
        type: "rect",
        cornerRadius: 7,
        style: "continuous",
      }}
    />
  );
}
