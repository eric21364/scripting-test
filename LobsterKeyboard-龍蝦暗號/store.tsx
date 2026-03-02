import { createContext, useContext, useSelector, useState, VirtualNode } from "scripting";

export enum KeyboardMode {
  Standard,
  Agent
}

export enum KeyboardLang {
  EN,
  ZH
}

export enum CapsState {
  Off,
  On,
  Locked
}

function useStoreState() {
  const [mode, setMode] = useState(KeyboardMode.Standard);
  const [lang, setLang] = useState(KeyboardLang.EN);
  const [capsState, setCapsState] = useState(CapsState.Off);
  const [isSymbols, setIsSymbols] = useState(false); // 🆕 符號模式狀態
  const [debugMsg, setDebugMsg] = useState("龍蝦波段已對齊");
  const [decodedContent, setDecodedContent] = useState("");

  const capsEnabled = capsState !== CapsState.Off;
  const capsLocked = capsState === CapsState.Locked;

  return {
    mode, setMode,
    lang, setLang,
    capsState, setCapsState,
    isSymbols, setIsSymbols,
    capsEnabled, capsLocked,
    debugMsg, setDebugMsg,
    decodedContent, setDecodedContent
  };
}

export type StoreState = ReturnType<typeof useStoreState>;
export const StoreContext = createContext<StoreState>(null!);

export function StoreProvider({ children }: { children: VirtualNode }) {
  const store = useStoreState();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}

export function selectStore<R>(selector: (store: StoreState) => R) {
  return useSelector(StoreContext, selector);
}
