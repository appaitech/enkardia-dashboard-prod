// store/financialStore.ts
import { create } from 'zustand'

type ClientData = {
    id: string,
    clientName: string,
}

type FinancialData = {
  2026: number,
  2024: number
  // Add other financial fields as needed
}

type ClientFinancialData = {
    client: ClientData,
    financialData: FinancialData
}

export type DataModel = {
    selectedClientId: string,
}

type FinancialStore = {
  data: DataModel | null
  setData: (data: DataModel) => void
  clearData: () => void
}

export const useFinancialStore = create<FinancialStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}))