import { createContext, useContext, useSelector, useState, VirtualNode } from "scripting"

export enum CapsState {
  Off,
  On,
  Locked
}

function useStoreState() {
  const [capsState, setCapsState] = useState(CapsState.Off)

  const capsEnabled = capsState !== CapsState.Off
  const capsLocked = capsState === CapsState.Locked

  return {
    capsState,
    setCapsState,
    capsEnabled,
    capsLocked,
  }
}

type StoreState = ReturnType<typeof useStoreState>

export const StoreContext = createContext<StoreState>()

export function StoreProvider({
  children
}: {
  children: VirtualNode
}) {
  const store = useStoreState()
  return <StoreContext.Provider value={store}>
    {children}
  </StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

export function selectStore<R>(
  selector: (store: StoreState) => R
) {
  return useSelector(StoreContext, selector)
}