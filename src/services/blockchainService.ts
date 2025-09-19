import { FABRIC_CONFIG, NETWORK_CONFIG, CHAINCODE_FUNCTIONS } from '../config/fabric';

// Fabric service for demo mode
// In production, this would connect to real Hyperledger Fabric network
class BlockchainService {
  private initialized = false;

  async initialize() {
    if (this.initialized) return true;
    
    try {
      // Initialize Fabric connection (demo mode)
      console.log('Initializing Fabric service...');

      this.initialized = true;
      console.log('✅ Fabric service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing Fabric service:', error);
      return false;
    }
  }

  async createBatch(userAddress: string, batchData: any) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await fetch('/api/blockchain/create-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userAddress, batchData })
        });
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return {
          success: true,
          transactionId: `tx_${Math.random().toString(36).substr(2, 16)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async addQualityTestEvent(userAddress: string, eventData: any) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await fetch('/api/blockchain/add-quality-test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userAddress, eventData })
        });
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return {
          success: true,
          transactionId: `tx_${Math.random().toString(36).substr(2, 16)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error adding quality test event:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async addProcessingEvent(userAddress: string, eventData: any) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await fetch('/api/blockchain/add-processing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userAddress, eventData })
        });
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return {
          success: true,
          transactionId: `tx_${Math.random().toString(36).substr(2, 16)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error adding processing event:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async addManufacturingEvent(userAddress: string, eventData: any) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await fetch('/api/blockchain/add-manufacturing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ userAddress, eventData })
        });
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return {
          success: true,
          transactionId: `tx_${Math.random().toString(36).substr(2, 16)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 100000,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error adding manufacturing event:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getBatchEvents(batchId: string) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const response = await fetch(`/api/tracking/batch/${batchId}`);
        const data = await response.json();
        
        if (data.success) {
          return data.batch.events || [];
        } else {
          throw new Error(data.error || 'Failed to fetch batch events');
        }
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return [
          {
            eventId: `COLLECTION-${Date.now()}-1234`,
            eventType: 'COLLECTION',
            collectorName: 'John Collector',
            ipfsHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            location: { zone: 'Himalayan Region - Uttarakhand' }
          }
        ];
      }
    } catch (error) {
      console.error('Error getting batch events:', error);
      return [];
    }
  }

  async getAllBatches() {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const response = await fetch('/api/tracking/batches');
        const data = await response.json();
        
        if (data.success) {
          return data.batches || [];
        } else {
          throw new Error(data.error || 'Failed to fetch batches');
        }
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return [
          {
            batchId: 'HERB-1234567890-1234',
            herbSpecies: 'Ashwagandha',
            creationTime: new Date(Date.now() - 86400000).toISOString(),
            eventCount: 1
          }
        ];
      }
    } catch (error) {
      console.error('Error getting all batches:', error);
      return [];
    }
  }

  generateBatchId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `HERB-${timestamp}-${random}`;
  }

  generateEventId(eventType: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${eventType}-${timestamp}-${random}`;
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;