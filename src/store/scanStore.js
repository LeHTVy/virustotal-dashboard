import { create } from 'zustand';
import { scanUrl, scanIP, getAnalysisResults } from '../api/virusTotal';

const useScanStore = create((set, get) => ({
  currentScan: null,
  scanHistory: [],
  isLoading: false,
  error: null,
  lastScanTime: null,

  fetchScan: async (target) => {
    try {
      const now = Date.now();
      const lastScan = get().lastScanTime;
      if (lastScan && (now - lastScan) < 2000) {
        console.log('Scan too frequent, skipping...');
        return;
      }

      set({ isLoading: true, error: null, lastScanTime: now });

      const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(target);
      
      let result;
      if (isIP) {
        const ipResult = await scanIP(target);
        result = {
          data: {
            attributes: {
              stats: ipResult.data.attributes.last_analysis_stats,
              results: ipResult.data.attributes.last_analysis_results,
              status: 'completed'
            }
          }
        };
      } else {
        const urlTarget = target.startsWith('http') ? target : `http://${target}`;
        const scanResult = await scanUrl(urlTarget);
        
        const analysisResult = await getAnalysisResults(scanResult.data.id);
        result = {
          data: {
            attributes: {
              stats: analysisResult.data.attributes.stats,
              results: analysisResult.data.attributes.results,
              status: analysisResult.data.attributes.status
            }
          }
        };
      }

      const history = get().scanHistory;
      const updatedHistory = [...history, {
        timestamp: new Date(),
        ...result
      }].slice(-10); 

      set({
        currentScan: result,
        scanHistory: updatedHistory,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Scan error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to scan target'
      });
    }
  },

  clearScan: () => {
    set({
      currentScan: null,
      error: null
    });
  },

  clearHistory: () => {
    set({
      scanHistory: [],
      error: null
    });
  }
}));

export default useScanStore;
