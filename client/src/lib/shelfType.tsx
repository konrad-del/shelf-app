import { createContext, useContext, useState } from "react";

export type ShelfType = "book" | "podcast" | "movie";

interface ShelfTypeContextType {
  activeType: ShelfType;
  setActiveType: (t: ShelfType) => void;
}

const ShelfTypeContext = createContext<ShelfTypeContextType>({
  activeType: "book",
  setActiveType: () => {},
});

export function ShelfTypeProvider({ children }: { children: React.ReactNode }) {
  const [activeType, setActiveType] = useState<ShelfType>("book");
  return (
    <ShelfTypeContext.Provider value={{ activeType, setActiveType }}>
      {children}
    </ShelfTypeContext.Provider>
  );
}

export function useShelfType() {
  return useContext(ShelfTypeContext);
}
