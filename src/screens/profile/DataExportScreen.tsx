import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import { dataExportService } from '@/services/dataExport';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<ProfileStackParamList, 'DataExport'>;

interface ExportInfo {
  entriesCount: number;
  customFoodsCount: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}

const DataExportScreen: React.FC<Props> = ({ navigation }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  useEffect(() => {
    loadExportInfo();
  }, []);

  const loadExportInfo = async () => {
    setIsLoadingInfo(true);
    try {
      const info = await dataExportService.getExportInfo();
      setExportInfo(info);
    } catch (error) {
      console.error('Error loading export info:', error);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await dataExportService.exportData();
      // Note: Share sheet handles success/cancel, no need for alert
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'An error occurred while exporting your data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      'Import Data',
      'This will replace your current data with the imported backup. Are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await dataExportService.importData();
              if (result.success) {
                Alert.alert('Import Successful', result.message, [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Refresh export info after import
                      loadExportInfo();
                    },
                  },
                ]);
              } else if (result.message !== 'Import cancelled') {
                Alert.alert('Import Failed', result.message);
              }
            } catch (error: any) {
              Alert.alert('Import Failed', error.message || 'An error occurred while importing your data.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Export Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Export Data</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Create a backup file containing all your food entries, custom foods, and settings. 
            Save it to Google Drive, iCloud, or send via email.
          </Text>

          {/* Export Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your Data Summary</Text>
            {isLoadingInfo ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Food Entries</Text>
                  <Text style={styles.infoValue}>{exportInfo?.entriesCount || 0}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Custom Foods</Text>
                  <Text style={styles.infoValue}>{exportInfo?.customFoodsCount || 0}</Text>
                </View>
                {exportInfo?.oldestEntry && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date Range</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(exportInfo.oldestEntry)} - {formatDate(exportInfo.newestEntry)}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.exportButton]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Icon name="download-outline" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Export My Data</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Import Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="cloud-download-outline" size={24} color={colors.success} />
            <Text style={styles.sectionTitle}>Import Data</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Restore your data from a backup file. This will replace all current data on this device.
          </Text>

          <View style={styles.warningCard}>
            <Icon name="warning-outline" size={20} color={colors.warning} />
            <Text style={styles.warningText}>
              Importing will overwrite your current data. Make sure to export first if you want to keep it.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.importButton]}
            onPress={handleImport}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={colors.success} />
            ) : (
              <>
                <Icon name="folder-open-outline" size={20} color={colors.success} />
                <Text style={[styles.buttonText, styles.importButtonText]}>Import from File</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>• Export regularly to keep your data safe</Text>
          <Text style={styles.tipText}>• Save backups to cloud storage (Google Drive, iCloud, Dropbox)</Text>
          <Text style={styles.tipText}>• Use email to transfer between devices</Text>
          <Text style={styles.tipText}>• Backup files are in JSON format and human-readable</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as any,
    color: colors.text,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  exportButton: {
    backgroundColor: colors.primary,
  },
  importButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.success,
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.white,
  },
  importButtonText: {
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: '#856404',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  tipsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 22,
  },
});

export default DataExportScreen;
