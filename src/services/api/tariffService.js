import tariffsData from "@/services/mockData/tariffs.json"

let tariffs = [...tariffsData.tariffs]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const tariffService = {
  async getAll() {
    await delay(200)
    return [...tariffs]
  },

  async getByRoomType(roomType) {
    await delay(150)
    const tariff = tariffs.find(t => t.roomType === roomType)
    if (!tariff) {
      throw new Error("Tariff not found for room type")
    }
    return { ...tariff }
  },

  async update(roomType, tariffData) {
    await delay(300)
    const index = tariffs.findIndex(t => t.roomType === roomType)
    if (index === -1) {
      throw new Error("Tariff not found")
    }
    tariffs[index] = { ...tariffs[index], ...tariffData }
    return { ...tariffs[index] }
  }
}