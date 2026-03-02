import { createContext, useContext, useSelector, useState, VirtualNode } from "scripting";

function useStoreState() {
  const [debugMsg, setDebugMsg] = useState("等待波段中...");
  const [decodedContent, setDecodedContent] = useState("");

  const updateDebugMsg = (msg: string) => setDebugMsg(msg);
  const updateDecodedContent = (content: string) => setDecodedContent(content);

  return {
    debugMsg,
    updateDebugMsg,
    decodedContent,
    updateDecodedContent,
  };
}

export type StoreState = ReturnType<typeof useStoreState>;

// Fixed: createContext used without arguments to match Scripting environment types
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
