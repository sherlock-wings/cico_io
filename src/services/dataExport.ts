import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { pick, types } from 'react-native-document-picker';
import { Platform } from 'react-native';

// Keys used by the app for AsyncStorage
const STORAGE_KEYS = {
  CURRENT_USER: '@cico_current_user',
  FOOD_ENTRIES: '@cico_food_entries',
  DAILY_LOGS: '@cico_daily_logs',
  CUSTOM_FOODS: '@cico_custom_foods',
};

export interface ExportData {
  version: string;
  exportDate: string;
  appName: string;
  data: {
    user: any;
    foodEntries: any;
    dailyLogs: any;
    customFoods: any;
  };
}

class DataExportService {
  private readonly EXPORT_VERSION = '1.0.0';
  private readonly APP_NAME = 'CICO';

  /**
   * Gather all app data from AsyncStorage
   */
  async gatherAllData(): Promise<ExportData> {
    try {
      // Get all keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Get user data
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      const user = userJson ? JSON.parse(userJson) : null;
      
      // Get food entries (all user keys)
      const foodEntriesKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.FOOD_ENTRIES)
      );
      const foodEntriesData: Record<string, any> = {};
      for (const key of foodEntriesKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          foodEntriesData[key] = JSON.parse(data);
        }
      }
      
      // Get daily logs (all user keys)
      const dailyLogsKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.DAILY_LOGS)
      );
      const dailyLogsData: Record<string, any> = {};
      for (const key of dailyLogsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          dailyLogsData[key] = JSON.parse(data);
        }
      }
      
      // Get custom foods (all user keys)
      const customFoodsKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.CUSTOM_FOODS)
      );
      const customFoodsData: Record<string, any> = {};
      for (const key of customFoodsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          customFoodsData[key] = JSON.parse(data);
        }
      }

      return {
        version: this.EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        appName: this.APP_NAME,
        data: {
          user,
          foodEntries: foodEntriesData,
          dailyLogs: dailyLogsData,
          customFoods: customFoodsData,
        },
      };
    } catch (error) {
      console.error('Error gathering data:', error);
      throw new Error('Failed to gather app data for export');
    }
  }

  /**
   * Export all app data to a JSON file and share it
   */
  async exportData(): Promise<void> {
    try {
      // Gather all data
      const exportData = await this.gatherAllData();
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `cico_backup_${date}.json`;
      
      // Write to temporary file
      const filePath = `${RNFS.CachesDirectoryPath}/${filename}`;
      await RNFS.writeFile(filePath, jsonString, 'utf8');
      
      // Share the file
      await Share.open({
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        type: 'application/json',
        filename: filename,
        title: 'Export CICO Data',
        message: 'Here is your CICO calorie tracker backup file',
        subject: 'CICO Backup',
      });
      
      // Clean up temp file after sharing
      setTimeout(async () => {
        try {
          await RNFS.unlink(filePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
      
    } catch (error: any) {
      // User cancelled share - not an error
      if (error.message?.includes('User did not share')) {
        return;
      }
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import data from a JSON backup file
   */
  async importData(): Promise<{ success: boolean; message: string }> {
    try {
      // Pick a JSON file
      const result = await pick({
        type: [types.json, types.allFiles],
        copyTo: 'cachesDirectory',
      });
      
      if (!result || result.length === 0) {
        return { success: false, message: 'No file selected' };
      }
      
      const file = result[0];
      const filePath = file.fileCopyUri || file.uri;
      
      // Read the file
      const fileContent = await RNFS.readFile(
        filePath.replace('file://', ''),
        'utf8'
      );
      
      // Parse JSON
      const importData: ExportData = JSON.parse(fileContent);
      
      // Validate the data
      if (!this.validateImportData(importData)) {
        return { 
          success: false, 
          message: 'Invalid backup file format. Please select a valid CICO backup file.' 
        };
      }
      
      // Import the data
      await this.restoreData(importData);
      
      // Clean up copied file
      try {
        await RNFS.unlink(filePath.replace('file://', ''));
      } catch (e) {
        // Ignore cleanup errors
      }
      
      return { 
        success: true, 
        message: `Data restored successfully from backup dated ${new Date(importData.exportDate).toLocaleDateString()}` 
      };
      
    } catch (error: any) {
      // User cancelled picker - not an error
      if (error.code === 'DOCUMENT_PICKER_CANCELED') {
        return { success: false, message: 'Import cancelled' };
      }
      console.error('Error importing data:', error);
      return { 
        success: false, 
        message: 'Failed to import data. Please ensure the file is a valid CICO backup.' 
      };
    }
  }

  /**
   * Validate that the imported data has the correct structure
   */
  private validateImportData(data: any): data is ExportData {
    return (
      data &&
      typeof data === 'object' &&
      data.appName === this.APP_NAME &&
      data.version &&
      data.exportDate &&
      data.data &&
      typeof data.data === 'object'
    );
  }

  /**
   * Restore data from import to AsyncStorage
   */
  private async restoreData(importData: ExportData): Promise<void> {
    const { data } = importData;
    
    // Restore user
    if (data.user) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_USER, 
        JSON.stringify(data.user)
      );
    }
    
    // Restore food entries
    if (data.foodEntries) {
      for (const [key, value] of Object.entries(data.foodEntries)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }
    
    // Restore daily logs
    if (data.dailyLogs) {
      for (const [key, value] of Object.entries(data.dailyLogs)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }
    
    // Restore custom foods
    if (data.customFoods) {
      for (const [key, value] of Object.entries(data.customFoods)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    }
  }

  /**
   * Get info about what will be exported
   */
  async getExportInfo(): Promise<{
    entriesCount: number;
    customFoodsCount: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Count food entries
      let entriesCount = 0;
      const foodEntriesKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.FOOD_ENTRIES)
      );
      for (const key of foodEntriesKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const entries = JSON.parse(data);
          entriesCount += Array.isArray(entries) ? entries.length : 0;
        }
      }
      
      // Count custom foods
      let customFoodsCount = 0;
      const customFoodsKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.CUSTOM_FOODS)
      );
      for (const key of customFoodsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const foods = JSON.parse(data);
          customFoodsCount += Array.isArray(foods) ? foods.length : 0;
        }
      }
      
      // Find date range from daily logs
      let oldestEntry: string | null = null;
      let newestEntry: string | null = null;
      const dailyLogsKeys = allKeys.filter(key => 
        key.startsWith(STORAGE_KEYS.DAILY_LOGS)
      );
      for (const key of dailyLogsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const logs = JSON.parse(data);
          if (Array.isArray(logs)) {
            for (const log of logs) {
              if (log.date) {
                if (!oldestEntry || log.date < oldestEntry) {
                  oldestEntry = log.date;
                }
                if (!newestEntry || log.date > newestEntry) {
                  newestEntry = log.date;
                }
              }
            }
          }
        }
      }
      
      return {
        entriesCount,
        customFoodsCount,
        oldestEntry,
        newestEntry,
      };
    } catch (error) {
      return {
        entriesCount: 0,
        customFoodsCount: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }
}

export const dataExportService = new DataExportService();
