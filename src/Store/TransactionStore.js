import create from "zustand";
import { persist } from "zustand/middleware"

export const useTransactionStore = create(persist(
    (set, get) => ({
        Transaction: [],
        // setTransaction: (payload) => set(() => ({ Transaction: payload })),
        addTransaction: ({tnxHash,method,status}) => {
            set((state) => ({
                Transaction: [
                ...state.Transaction,
                {
                  tnxHash,
                  method,
                  status: status,
                },
              ],
            }));
          },
          updateTransaction: (transaction) => {
            set((state) => ({
                Transaction: state.Transaction.map((tnx) =>
                tnx.tnxHash === transaction.tnxHash
                  ? ({ ...tnx, status: transaction.status })
                  : tnx
              ),
            }));
          },
        resetTransaction: () => set({ Transaction: [] }),
    }),
    {
        name: "Transaction-storage",
        getStorage: () => sessionStorage,
    }
))