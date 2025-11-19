import { create } from "zustand";

interface Props {
  selectedOrganizationId: string | null;
  setOrganizationId: (id: string) => void;
}

export const organizationStore = create<Props>((set, get) => ({
  selectedOrganizationId: null,
  setOrganizationId: (id) => {
    set({ selectedOrganizationId: id });
  },
}));
