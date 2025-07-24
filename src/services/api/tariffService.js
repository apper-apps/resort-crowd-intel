const { ApperClient } = window.ApperSDK;

// Initialize ApperClient
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'tariff';

export const tariffService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "room_type" } },
          { field: { Name: "season_rates" } },
          { field: { Name: "ac_charges" } },
          { field: { Name: "extra_adult_charge" } },
          { field: { Name: "child_charge" } }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      const transformedTariffs = response.data.map(tariff => ({
        roomType: tariff.room_type,
        seasonRates: this.parseSeasonRates(tariff.season_rates),
        acCharges: tariff.ac_charges,
        extraAdultCharge: tariff.extra_adult_charge,
        childCharge: tariff.child_charge
      }));

      return transformedTariffs;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tariffs:", error?.response?.data?.message);
      } else {
        console.error("Error fetching tariffs:", error.message);
      }
      return [];
    }
  },

  async getByRoomType(roomType) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "room_type" } },
          { field: { Name: "season_rates" } },
          { field: { Name: "ac_charges" } },
          { field: { Name: "extra_adult_charge" } },
          { field: { Name: "child_charge" } }
        ],
        where: [
          {
            FieldName: "room_type",
            Operator: "EqualTo",
            Values: [roomType]
          }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data || response.data.length === 0) {
        throw new Error("Tariff not found for room type");
      }

      const tariff = response.data[0];
      return {
        roomType: tariff.room_type,
        seasonRates: this.parseSeasonRates(tariff.season_rates),
        acCharges: tariff.ac_charges,
        extraAdultCharge: tariff.extra_adult_charge,
        childCharge: tariff.child_charge
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching tariff for room type ${roomType}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching tariff for room type ${roomType}:`, error.message);
      }
      throw error;
    }
  },

  async update(roomType, tariffData) {
    try {
      // First find the record by room type
      const existingTariffs = await this.getAll();
      const existingTariff = existingTariffs.find(t => t.roomType === roomType);
      
      if (!existingTariff) {
        throw new Error("Tariff not found");
      }

      const params = {
        records: [
          {
            room_type: roomType,
            season_rates: this.stringifySeasonRates(tariffData.seasonRates),
            ac_charges: tariffData.acCharges,
            extra_adult_charge: tariffData.extraAdultCharge,
            child_charge: tariffData.childCharge
          }
        ]
      };

      const response = await apperClient.updateRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update tariff ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedTariff = successfulUpdates[0].data;
          return {
            roomType: updatedTariff.room_type,
            seasonRates: this.parseSeasonRates(updatedTariff.season_rates),
            acCharges: updatedTariff.ac_charges,
            extraAdultCharge: updatedTariff.extra_adult_charge,
            childCharge: updatedTariff.child_charge
          };
        }
      }
      
      throw new Error("Failed to update tariff");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating tariff:", error?.response?.data?.message);
      } else {
        console.error("Error updating tariff:", error.message);
      }
      throw error;
    }
  },

  // Helper method to parse season rates from database storage format
parseSeasonRates(seasonRatesString) {
    try {
      if (!seasonRatesString) return [];
      
      // If it's already an object/array, return as is
      if (typeof seasonRatesString === 'object') {
        return seasonRatesString;
      }
      
      // Try to parse as JSON first
      try {
        return JSON.parse(seasonRatesString);
      } catch (jsonError) {
        // If JSON parsing fails, try to parse as plain text format
        console.log("JSON parsing failed, attempting text format parsing:", jsonError.message);
        
        // Handle text format like "Peak: 4500, High: 3500, Regular: 2500"
        if (typeof seasonRatesString === 'string') {
          const seasonRates = [];
          
          // Split by comma and parse each season
          const seasonPairs = seasonRatesString.split(',').map(pair => pair.trim());
          
          for (const pair of seasonPairs) {
            const colonIndex = pair.indexOf(':');
            if (colonIndex > 0) {
              const season = pair.substring(0, colonIndex).trim();
              const rateStr = pair.substring(colonIndex + 1).trim();
              const rate = parseFloat(rateStr);
              
              if (season && !isNaN(rate)) {
                // Map season names to typical month ranges
                let startMonth, endMonth;
                switch (season.toLowerCase()) {
                  case 'peak':
                    startMonth = 12;
                    endMonth = 2;
                    break;
                  case 'high':
                    startMonth = 3;
                    endMonth = 5;
                    break;
                  case 'regular':
                  case 'low':
                    startMonth = 6;
                    endMonth = 11;
                    break;
                  default:
                    // Default to regular season if unknown
                    startMonth = 6;
                    endMonth = 11;
                }
                
                seasonRates.push({
                  season: season,
                  startMonth: startMonth,
                  endMonth: endMonth,
                  rate: rate
                });
              }
            }
          }
          
          if (seasonRates.length > 0) {
            console.log("Successfully parsed text format season rates:", seasonRates);
            return seasonRates;
          }
        }
        
        // If text parsing also fails, throw the original JSON error
        throw jsonError;
      }
    } catch (error) {
      console.error("Error parsing season rates:", error);
      console.error("Raw season rates data:", seasonRatesString);
      return [];
    }
  },

  // Helper method to stringify season rates for database storage
  stringifySeasonRates(seasonRates) {
    try {
      if (!seasonRates) return '';
      
      // If it's already a string, return as is
      if (typeof seasonRates === 'string') {
        return seasonRates;
      }
      
      // Convert to JSON string
      return JSON.stringify(seasonRates);
    } catch (error) {
      console.error("Error stringifying season rates:", error);
      return '';
    }
  }
}