const { ApperClient } = window.ApperSDK;

// Initialize ApperClient
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const tableName = 'lead';

export const leadService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "mobile" } },
          { field: { Name: "checkin_date" } },
          { field: { Name: "checkout_date" } },
          { field: { Name: "status" } },
          { field: { Name: "reminder_date_time_utc" } },
          { field: { Name: "notes" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform database fields to match UI expectations
      const transformedLeads = response.data.map(lead => ({
        Id: lead.Id,
        name: lead.Name,
        mobile: lead.mobile,
        checkinDate: lead.checkin_date,
        checkoutDate: lead.checkout_date,
        status: lead.status || 'open',
        reminderDateTimeUTC: lead.reminder_date_time_utc,
        notes: lead.notes || '',
        quotes: [], // Quotes would be handled separately in a real implementation
        tags: lead.Tags
      }));

      return transformedLeads;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leads:", error?.response?.data?.message);
      } else {
        console.error("Error fetching leads:", error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "mobile" } },
          { field: { Name: "checkin_date" } },
          { field: { Name: "checkout_date" } },
          { field: { Name: "status" } },
          { field: { Name: "reminder_date_time_utc" } },
          { field: { Name: "notes" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Lead not found");
      }

      // Transform database fields to match UI expectations
      return {
        Id: response.data.Id,
        name: response.data.Name,
        mobile: response.data.mobile,
        checkinDate: response.data.checkin_date,
        checkoutDate: response.data.checkout_date,
        status: response.data.status || 'open',
        reminderDateTimeUTC: response.data.reminder_date_time_utc,
        notes: response.data.notes || '',
        quotes: [], // Quotes would be handled separately
        tags: response.data.Tags
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching lead with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching lead with ID ${id}:`, error.message);
      }
      throw error;
    }
  },

  async create(leadData) {
    try {
      const params = {
        records: [
          {
            Name: leadData.name,
            mobile: leadData.mobile,
            checkin_date: leadData.checkinDate,
            checkout_date: leadData.checkoutDate,
            status: leadData.status || 'open',
            reminder_date_time_utc: leadData.reminderDateTimeUTC,
            notes: leadData.notes || ''
          }
        ]
      };

      const response = await apperClient.createRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create lead ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const createdLead = successfulRecords[0].data;
          return {
            Id: createdLead.Id,
            name: createdLead.Name,
            mobile: createdLead.mobile,
            checkinDate: createdLead.checkin_date,
            checkoutDate: createdLead.checkout_date,
            status: createdLead.status || 'open',
            reminderDateTimeUTC: createdLead.reminder_date_time_utc,
            notes: createdLead.notes || '',
            quotes: []
          };
        }
      }
      
      throw new Error("Failed to create lead");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating lead:", error?.response?.data?.message);
      } else {
        console.error("Error creating lead:", error.message);
      }
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.name,
            mobile: updateData.mobile,
            checkin_date: updateData.checkinDate,
            checkout_date: updateData.checkoutDate,
            status: updateData.status,
            reminder_date_time_utc: updateData.reminderDateTimeUTC,
            notes: updateData.notes
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
          console.error(`Failed to update lead ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedLead = successfulUpdates[0].data;
          return {
            Id: updatedLead.Id,
            name: updatedLead.Name,
            mobile: updatedLead.mobile,
            checkinDate: updatedLead.checkin_date,
            checkoutDate: updatedLead.checkout_date,
            status: updatedLead.status,
            reminderDateTimeUTC: updatedLead.reminder_date_time_utc,
            notes: updatedLead.notes || '',
            quotes: []
          };
        }
      }
      
      throw new Error("Failed to update lead");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating lead:", error?.response?.data?.message);
      } else {
        console.error("Error updating lead:", error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete lead ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting lead:", error?.response?.data?.message);
      } else {
        console.error("Error deleting lead:", error.message);
      }
      throw error;
    }
  },

  // Note: This method handles quotes as embedded data since there's no separate quote table
  async addQuote(leadId, quoteData) {
    try {
      // In a real implementation, this would either create a separate quote record
      // or update the lead record with embedded quote data
      // For now, we'll simulate the functionality
      const lead = await this.getById(leadId);
      
      const newQuote = {
        ...quoteData,
        Id: Date.now(), // Temporary ID generation
        createdAt: new Date().toISOString()
      };
      
      // In actual implementation, you would store this in a proper field or related table
      return newQuote;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error adding quote to lead:", error?.response?.data?.message);
      } else {
        console.error("Error adding quote to lead:", error.message);
      }
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            status: status
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
          console.error(`Failed to update lead status ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const updatedLead = successfulUpdates[0].data;
          return {
            Id: updatedLead.Id,
            name: updatedLead.Name,
            mobile: updatedLead.mobile,
            checkinDate: updatedLead.checkin_date,
            checkoutDate: updatedLead.checkout_date,
            status: updatedLead.status,
            reminderDateTimeUTC: updatedLead.reminder_date_time_utc,
            notes: updatedLead.notes || '',
            quotes: []
          };
        }
      }
      
      throw new Error("Failed to update lead status");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating lead status:", error?.response?.data?.message);
      } else {
        console.error("Error updating lead status:", error.message);
      }
      throw error;
    }
  }
}