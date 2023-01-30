import create from "zustand";
import { persist } from "zustand/middleware"

export const useTransactionStatusStore = create(persist(
    (set, get) => ({
        showPending: false,
        toggleTnxStatus: (payload) => set(() => ({ showPending: payload }))
    }),
    {
        name: "tnx-status-storage",
        getStorage: () => sessionStorage,
    }
))