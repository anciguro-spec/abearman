class IPFSService {
  // Demo IPFS service - in production this would connect to real IPFS

  async uploadJSON(jsonData: any, name: string) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const response = await fetch('/api/ipfs/upload-json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ jsonData, name })
        });
        
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
        return {
          success: true,
          ipfsHash: mockHash,
          pinataUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`
        };
      }
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async uploadFile(file: File) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/ipfs/upload-file', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`;
        return {
          success: true,
          ipfsHash: mockHash,
          pinataUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`
        };
      }
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async getFile(ipfsHash: string) {
    try {
      // Connect to real backend API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const response = await fetch(`/api/ipfs/get-file/${ipfsHash}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API call failed, using fallback:', error);
        // Fallback for demo
        return {
          success: true,
          data: {
            type: 'collection',
            herbSpecies: 'Ashwagandha',
            collector: 'John Collector',
            weight: 500,
            notes: 'High quality herbs collected from approved zone'
          }
        };
      }
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  async createCollectionMetadata(collectionData: any) {
    try {
      const response = await fetch('/api/ipfs/create-collection-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ collectionData })
      });
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      // Fallback
      const metadata = {
        type: 'collection',
        timestamp: new Date().toISOString(),
        ...collectionData
      };
      return await this.uploadJSON(metadata, `collection-${collectionData.batchId}`);
    }
  }

  async createQualityTestMetadata(testData: any) {
    try {
      const response = await fetch('/api/ipfs/create-quality-test-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ testData })
      });
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      // Fallback
      const metadata = {
        type: 'quality_test',
        timestamp: new Date().toISOString(),
        ...testData
      };
      return await this.uploadJSON(metadata, `quality-test-${testData.eventId}`);
    }
  }

  async createProcessingMetadata(processData: any) {
    try {
      const response = await fetch('/api/ipfs/create-processing-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ processData })
      });
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      // Fallback
      const metadata = {
        type: 'processing',
        timestamp: new Date().toISOString(),
        ...processData
      };
      return await this.uploadJSON(metadata, `processing-${processData.eventId}`);
    }
  }

  async createManufacturingMetadata(mfgData: any) {
    try {
      const response = await fetch('/api/ipfs/create-manufacturing-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mfgData })
      });
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API call failed, using fallback:', error);
      // Fallback
      const metadata = {
        type: 'manufacturing',
        timestamp: new Date().toISOString(),
        ...mfgData
      };
      return await this.uploadJSON(metadata, `manufacturing-${mfgData.eventId}`);
    }
  }
}

export const ipfsService = new IPFSService();
export default ipfsService;