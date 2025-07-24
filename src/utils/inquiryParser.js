export const parseWhatsAppInquiry = (text) => {
  const parsedData = {
    clientName: "",
    mobile: "",
    checkinDate: "",
    checkoutDate: "",
    rooms: [],
    notes: text
  }

  // Extract name patterns
  const namePatterns = [
    /(?:my name is|i am|i'm|name:|from)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|and|mobile|contact|phone|\d)/i,
    /(?:hi|hello|hey),?\s*(?:this is|i am|i'm)?\s*([a-zA-Z\s]+?)(?:\s|$|,|\.|and|mobile|contact|phone|\d)/i
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      parsedData.clientName = match[1].trim()
      break
    }
  }

  // Extract mobile number
  const mobilePattern = /(?:mobile|contact|phone|number|call|reach)[\s:]*(\d{10})/i
  const mobileMatch = text.match(mobilePattern) || text.match(/(\d{10})/g)
  if (mobileMatch) {
    parsedData.mobile = Array.isArray(mobileMatch) ? mobileMatch[0] : mobileMatch[1]
  }

  // Extract dates
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g,
    /(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*(\d{2,4})?/gi,
    /(?:from|check[\s-]?in)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]?(\d{2,4})?/i,
    /(?:to|check[\s-]?out)[\s:]*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.]?(\d{2,4})?/i
  ]

  const dates = []
  const currentYear = new Date().getFullYear()

  for (const pattern of datePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      let day, month, year

      if (match[2] && isNaN(match[2])) {
        // Month name format
        const months = {
          jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
          jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
        }
        day = parseInt(match[1])
        month = months[match[2].toLowerCase().substring(0, 3)]
        year = match[3] ? parseInt(match[3]) : currentYear
      } else {
        // Numeric format
        day = parseInt(match[1])
        month = parseInt(match[2])
        year = match[3] ? parseInt(match[3]) : currentYear
      }

      if (year < 100) year += 2000
      if (day > 0 && day <= 31 && month > 0 && month <= 12) {
        const date = new Date(year, month - 1, day)
        dates.push(date.toISOString().split('T')[0])
      }
    }
  }

  if (dates.length >= 2) {
    dates.sort()
    parsedData.checkinDate = dates[0]
    parsedData.checkoutDate = dates[1]
  } else if (dates.length === 1) {
    parsedData.checkinDate = dates[0]
    // Assume 2 nights if only one date provided
    const checkoutDate = new Date(dates[0])
    checkoutDate.setDate(checkoutDate.getDate() + 2)
    parsedData.checkoutDate = checkoutDate.toISOString().split('T')[0]
  }

  // Extract room and guest information
  const roomPatterns = [
    /(\d+)\s*rooms?/i,
    /(\d+)\s*adults?/i,
    /(\d+)\s*people/i,
    /(\d+)\s*persons?/i,
    /(\d+)\s*guests?/i,
    /family\s*of\s*(\d+)/i
  ]

  let rooms = 1
  let adults = 2
  let children = 0

  for (const pattern of roomPatterns) {
    const match = text.match(pattern)
    if (match) {
      const number = parseInt(match[1])
      if (pattern.source.includes('room')) {
        rooms = number
      } else if (pattern.source.includes('adult')) {
        adults = number
      } else if (pattern.source.includes('people|person|guest|family')) {
        adults = number
        // Adjust for family size
        if (number > 4) {
          rooms = Math.ceil(number / 3)
          adults = Math.ceil(number * 0.7) // Assume 70% adults
          children = number - adults
        }
      }
    }
  }

  // Extract children information
  const childrenPatterns = [
    /(\d+)\s*(?:child|children|kid|kids)/i,
    /with\s*(\d+)\s*(?:child|children)/i
  ]

  for (const pattern of childrenPatterns) {
    const match = text.match(pattern)
    if (match) {
      children = parseInt(match[1])
      break
    }
  }

  // Create room configuration
  parsedData.rooms = Array.from({ length: rooms }, () => ({
    type: "Standard",
    adults: Math.ceil(adults / rooms),
    children: Math.ceil(children / rooms),
    infants: 0,
    hasAC: true,
    nightlyDiscounts: [],
    pets: 0
  }))

  return parsedData
}