import {
  Button,
  List,
  Section,
  Script,
  Navigation,
  NavigationStack,
  useEffect,
  useObservable,
} from "scripting";
import { InfoSection } from "./info";
import { TranslateSection } from "./translate";
import { getAppInfo } from "../util/itunes";

export function View({ url }: { url: string }) {
  const dismiss = Navigation.useDismiss();

  return (
    <NavigationStack>
      <StackView
        url={url}
        navigationTitle={Script.name}
        toolbar={{
          topBarLeading: [<Button title="关闭" systemImage={"xmark"} action={dismiss} />],
          topBarTrailing: [
            <Button
              title="分享"
              systemImage={"square.and.arrow.up"}
              action={async () => ShareSheet.present([url])}
            />,
          ],
        }}
      />
    </NavigationStack>
  );
}

function StackView({ url }: { url: string }) {
  const data = useObservable<any>();

  // 从 URL 中提取应用 ID 和区域
  const urlMap = url.split("/");
  const appid = urlMap[urlMap.length - 1].split("?")[0].replace("id", "") || "";
  const region = urlMap[3] || "cn";

  async function fetchAppInfo() {
    await getAppInfo(appid, region).then((r) => data.setValue(r));
  }

  useEffect(() => {
    fetchAppInfo();
  }, []);

  return (
    <List refreshable={fetchAppInfo}>
      <Section title="应用信息">
        <InfoSection
          name={data.value?.trackName || ""}
          appid={data.value ? appid : ""}
          version={data.value?.version || ""}
          date={data.value?.releaseDate || ""}
          symbol={data.value?.bundleId || ""}
        />
      </Section>
      <Section title="发布说明">
        <TranslateSection content={data.value?.releaseNotes || ""} />
      </Section>
      <Section title="应用说明">
        <TranslateSection content={data.value?.description || ""} />
      </Section>
    </List>
  );
}
