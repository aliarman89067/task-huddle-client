import { create } from "zustand";
import { UserPros } from "..";

interface Props {
  user: UserPros | null;
  setUser: (data: UserPros) => void;
  logoutUser: () => void;
}

export const userStore = create<Props>((set, get) => ({
  user: null,
  setUser: (data) => {
    set({ user: data });
  },
  logoutUser: () => {
    set({ user: null });
  },
}));
