import { createContext, useContext, useSelector, useState, VirtualNode } from "scripting";

export enum KeyboardMode {
  Standard,
  Agent
}

export enum CapsState {
  Off,
  On,
  Locked
}

function useStoreState() {
  const [mode, setMode] = useState(KeyboardMode.Standard);
  const [capsState, setCapsState] = useState(CapsState.Off);
  const [debugMsg, setDebugMsg] = useState("波段穩定中...");
  const [decodedContent, setDecodedContent] = useState("");

  const capsEnabled = capsState !== CapsState.Off;
  const capsLocked = capsState === CapsState.Locked;

  return {
    mode, setMode,
    capsState, setCapsState,
    capsEnabled, capsLocked,
    debugMsg, setDebugMsg,
    decodedContent, setDecodedContent
  };
}

export type StoreState = ReturnType<typeof useStoreState>;
export const StoreContext = createContext<StoreState>();

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
