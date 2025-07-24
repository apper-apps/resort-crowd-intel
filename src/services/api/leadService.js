import leadsData from "@/services/mockData/leads.json"

let leads = [...leadsData.leads]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const leadService = {
  async getAll() {
    await delay(300)
    return [...leads]
  },

  async getById(id) {
    await delay(200)
    const lead = leads.find(l => l.Id === parseInt(id))
    if (!lead) {
      throw new Error("Lead not found")
    }
    return { ...lead }
  },

  async create(leadData) {
    await delay(400)
    const newLead = {
      ...leadData,
      Id: Math.max(...leads.map(l => l.Id)) + 1,
      quotes: [],
      status: "open",
      reminderDateTimeUTC: null,
      notes: ""
    }
    leads.push(newLead)
    return { ...newLead }
  },

  async update(id, updateData) {
    await delay(300)
    const index = leads.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lead not found")
    }
    leads[index] = { ...leads[index], ...updateData }
    return { ...leads[index] }
  },

  async delete(id) {
    await delay(200)
    const index = leads.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lead not found")
    }
    leads.splice(index, 1)
    return true
  },

  async addQuote(leadId, quoteData) {
    await delay(300)
    const lead = leads.find(l => l.Id === parseInt(leadId))
    if (!lead) {
      throw new Error("Lead not found")
    }
    
    const newQuote = {
      ...quoteData,
      Id: Math.max(0, ...lead.quotes.map(q => q.Id)) + 1,
      createdAt: new Date().toISOString()
    }
    
    lead.quotes.push(newQuote)
    return { ...newQuote }
  },

  async updateStatus(id, status) {
    await delay(200)
    const lead = leads.find(l => l.Id === parseInt(id))
    if (!lead) {
      throw new Error("Lead not found")
    }
    
    lead.status = status
    return { ...lead }
  }
}