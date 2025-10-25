/**
 * General Settings Page
 * Comprehensive settings management for dashboard preferences,
 * appearance, accessibility, and system configurations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Palette,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  Type,
  Accessibility,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  ArrowLeft,
  Smartphone,
  Calendar,
  Clock,
  Database,
  Shield,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Hooks and Utils
import { usePersonalization } from '@/hooks/dashboard/usePersonalization';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { storageUtils } from '@/lib/dashboard-utils';

/**
 * Interface for general settings
 */
interface GeneralSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: number;
    compactMode: boolean;
    animations: boolean;
    highContrast: boolean;
  };
  dashboard: {
    defaultTab: 'feed' | 'calendar' | 'growth' | 'community';
    autoRefresh: boolean;
    refreshInterval: number;
    showQuickActions: boolean;
    enableOfflineMode: boolean;
  };
  calendar: {
    defaultView: 'week' | 'month' | 'agenda';
    weekStartsOn: number;
    timeFormat: '12h' | '24h';
    timeZone: string;
    showConflicts: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    largeText: boolean;
    highContrast: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
  advanced: {
    enableDebugMode: boolean;
    dataRetentionDays: number;
    cacheSize: number;
    enableAnalytics: boolean;
  };
}

/**
 * Animation variants for page sections
 */
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

/**
 * Settings Page Component
 */
export default function Settings() {
  // State management
  const [activeTab, setActiveTab] = useState('appearance');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<GeneralSettings>({
    appearance: {
      theme: 'system',
      fontSize: 14,
      compactMode: false,
      animations: true,
      highContrast: false
    },
    dashboard: {
      defaultTab: 'feed',
      autoRefresh: true,
      refreshInterval: 300000, // 5 minutes
      showQuickActions: true,
      enableOfflineMode: true
    },
    calendar: {
      defaultView: 'week',
      weekStartsOn: 0, // Sunday
      timeFormat: '12h',
      timeZone: 'America/New_York',
      showConflicts: true
    },
    accessibility: {
      reducedMotion: false,
      largeText: false,
      highContrast: false,
      screenReaderOptimized: false,
      keyboardNavigation: true
    },
    advanced: {
      enableDebugMode: false,
      dataRetentionDays: 90,
      cacheSize: 50,
      enableAnalytics: true
    }
  });

  // Hooks
  const { updateUserPreferences } = useDashboardData();
  const { exportData, resetMetrics } = usePersonalization();

  /**
   * Load settings from storage on mount
   */
  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('generalSettings');
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  /**
   * Handle setting changes
   */
  const handleSettingChange = (
    category: keyof GeneralSettings,
    setting: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  /**
   * Save all settings
   */
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('generalSettings', JSON.stringify(settings));
      
      // Update user preferences through dashboard hook
      await updateUserPreferences({
        calendarSettings: {
          defaultView: settings.calendar.defaultView,
          timeZone: settings.calendar.timeZone,
          syncExternalCalendars: false
        }
      });

      // Apply theme changes
      applyThemeSettings();
      
      // Apply accessibility settings
      applyAccessibilitySettings();

      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Apply theme settings to the document
   */
  const applyThemeSettings = () => {
    const { theme, fontSize, compactMode, animations, highContrast } = settings.appearance;
    
    // Apply theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }

    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Apply compact mode
    document.documentElement.classList.toggle('compact-mode', compactMode);

    // Apply animations
    document.documentElement.classList.toggle('reduce-motion', !animations);

    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', highContrast);
  };

  /**
   * Apply accessibility settings
   */
  const applyAccessibilitySettings = () => {
    const { reducedMotion, largeText, screenReaderOptimized } = settings.accessibility;
    
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    document.documentElement.classList.toggle('large-text', largeText);
    document.documentElement.classList.toggle('screen-reader-optimized', screenReaderOptimized);
  };

  /**
   * Reset to default settings
   */
  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultSettings: GeneralSettings = {
        appearance: {
          theme: 'system',
          fontSize: 14,
          compactMode: false,
          animations: true,
          highContrast: false
        },
        dashboard: {
          defaultTab: 'feed',
          autoRefresh: true,
          refreshInterval: 300000,
          showQuickActions: true,
          enableOfflineMode: true
        },
        calendar: {
          defaultView: 'week',
          weekStartsOn: 0,
          timeFormat: '12h',
          timeZone: 'America/New_York',
          showConflicts: true
        },
        accessibility: {
          reducedMotion: false,
          largeText: false,
          highContrast: false,
          screenReaderOptimized: false,
          keyboardNavigation: true
        },
        advanced: {
          enableDebugMode: false,
          dataRetentionDays: 90,
          cacheSize: 50,
          enableAnalytics: true
        }
      };

      setSettings(defaultSettings);
      setHasUnsavedChanges(true);
      
      toast({
        title: 'Settings Reset',
        description: 'All settings have been reset to defaults.',
      });
    }
  };

  /**
   * Export settings
   */
  const handleExportSettings = () => {
    const exportData = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'church-dashboard-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Settings Exported',
      description: 'Your settings have been downloaded successfully.',
    });
  };

  /**
   * Import settings
   */
  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string);
          if (importData.settings) {
            setSettings(importData.settings);
            setHasUnsavedChanges(true);
            toast({
              title: 'Settings Imported',
              description: 'Settings have been imported successfully.',
            });
          }
        } catch (error) {
          toast({
            title: 'Import Error',
            description: 'Failed to import settings. Invalid file format.',
            variant: 'destructive'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  /**
   * Clear all data
   */
  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storageUtils.clearDashboardData();
      resetMetrics();
      localStorage.removeItem('generalSettings');
      
      toast({
        title: 'Data Cleared',
        description: 'All local data has been cleared.',
        variant: 'destructive'
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Settings
                </h1>
                <p className="text-muted-foreground">
                  Customize your dashboard experience
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                Accessibility
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Theme & Appearance</CardTitle>
                    <CardDescription>
                      Customize the visual appearance of your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Theme</Label>
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center gap-2">
                              <Sun className="h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center gap-2">
                              <Monitor className="h-4 w-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size: {settings.appearance.fontSize}px</Label>
                      <Slider
                        value={[settings.appearance.fontSize]}
                        onValueChange={([value]) => handleSettingChange('appearance', 'fontSize', value)}
                        min={12}
                        max={20}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Compact Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Reduce spacing and padding for a denser layout
                        </p>
                      </div>
                      <Switch
                        checked={settings.appearance.compactMode}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'compactMode', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Animations</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable smooth transitions and animations
                        </p>
                      </div>
                      <Switch
                        checked={settings.appearance.animations}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'animations', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>High Contrast</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase contrast for better visibility
                        </p>
                      </div>
                      <Switch
                        checked={settings.appearance.highContrast}
                        onCheckedChange={(checked) => handleSettingChange('appearance', 'highContrast', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Preferences</CardTitle>
                    <CardDescription>
                      Configure how your dashboard behaves and displays
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Default Tab</Label>
                      <Select
                        value={settings.dashboard.defaultTab}
                        onValueChange={(value) => handleSettingChange('dashboard', 'defaultTab', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feed">Content Feed</SelectItem>
                          <SelectItem value="calendar">Calendar</SelectItem>
                          <SelectItem value="growth">Spiritual Growth</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto Refresh</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically refresh dashboard data
                        </p>
                      </div>
                      <Switch
                        checked={settings.dashboard.autoRefresh}
                        onCheckedChange={(checked) => handleSettingChange('dashboard', 'autoRefresh', checked)}
                      />
                    </div>

                    {settings.dashboard.autoRefresh && (
                      <div className="space-y-2">
                        <Label>Refresh Interval: {Math.floor(settings.dashboard.refreshInterval / 60000)} minutes</Label>
                        <Slider
                          value={[settings.dashboard.refreshInterval]}
                          onValueChange={([value]) => handleSettingChange('dashboard', 'refreshInterval', value)}
                          min={60000} // 1 minute
                          max={1800000} // 30 minutes
                          step={60000}
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Show Quick Actions</Label>
                        <p className="text-sm text-muted-foreground">
                          Display quick action buttons at the top
                        </p>
                      </div>
                      <Switch
                        checked={settings.dashboard.showQuickActions}
                        onCheckedChange={(checked) => handleSettingChange('dashboard', 'showQuickActions', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Offline Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Cache data for offline access
                        </p>
                      </div>
                      <Switch
                        checked={settings.dashboard.enableOfflineMode}
                        onCheckedChange={(checked) => handleSettingChange('dashboard', 'enableOfflineMode', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Calendar Settings</CardTitle>
                    <CardDescription>
                      Configure calendar display and behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Default View</Label>
                      <Select
                        value={settings.calendar.defaultView}
                        onValueChange={(value) => handleSettingChange('calendar', 'defaultView', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Week View</SelectItem>
                          <SelectItem value="month">Month View</SelectItem>
                          <SelectItem value="agenda">Agenda View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Week Starts On</Label>
                      <Select
                        value={settings.calendar.weekStartsOn.toString()}
                        onValueChange={(value) => handleSettingChange('calendar', 'weekStartsOn', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select
                        value={settings.calendar.timeFormat}
                        onValueChange={(value) => handleSettingChange('calendar', 'timeFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <Select
                        value={settings.calendar.timeZone}
                        onValueChange={(value) => handleSettingChange('calendar', 'timeZone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Africa/Lagos">West Africa Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Show Event Conflicts</Label>
                        <p className="text-sm text-muted-foreground">
                          Highlight overlapping events
                        </p>
                      </div>
                      <Switch
                        checked={settings.calendar.showConflicts}
                        onCheckedChange={(checked) => handleSettingChange('calendar', 'showConflicts', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Accessibility Options</CardTitle>
                    <CardDescription>
                      Configure accessibility features for better usability
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Reduced Motion</Label>
                        <p className="text-sm text-muted-foreground">
                          Minimize animations and transitions
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.reducedMotion}
                        onCheckedChange={(checked) => handleSettingChange('accessibility', 'reducedMotion', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Large Text</Label>
                        <p className="text-sm text-muted-foreground">
                          Increase text size for better readability
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.largeText}
                        onCheckedChange={(checked) => handleSettingChange('accessibility', 'largeText', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>High Contrast</Label>
                        <p className="text-sm text-muted-foreground">
                          Enhanced contrast for better visibility
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.highContrast}
                        onCheckedChange={(checked) => handleSettingChange('accessibility', 'highContrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Screen Reader Optimized</Label>
                        <p className="text-sm text-muted-foreground">
                          Enhanced markup for screen readers
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.screenReaderOptimized}
                        onCheckedChange={(checked) => handleSettingChange('accessibility', 'screenReaderOptimized', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Keyboard Navigation</Label>
                        <p className="text-sm text-muted-foreground">
                          Enhanced keyboard navigation support
                        </p>
                      </div>
                      <Switch
                        checked={settings.accessibility.keyboardNavigation}
                        onCheckedChange={(checked) => handleSettingChange('accessibility', 'keyboardNavigation', checked)}
                      />
                    </div>

                    <Alert>
                      <Accessibility className="h-4 w-4" />
                      <AlertDescription>
                        These settings help make the dashboard more accessible. Changes will be applied immediately.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Advanced configuration and data management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Data Retention: {settings.advanced.dataRetentionDays} days</Label>
                      <Slider
                        value={[settings.advanced.dataRetentionDays]}
                        onValueChange={([value]) => handleSettingChange('advanced', 'dataRetentionDays', value)}
                        min={7}
                        max={365}
                        step={7}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        How long to keep activity and personalization data
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Cache Size: {settings.advanced.cacheSize} MB</Label>
                      <Slider
                        value={[settings.advanced.cacheSize]}
                        onValueChange={([value]) => handleSettingChange('advanced', 'cacheSize', value)}
                        min={10}
                        max={500}
                        step={10}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Maximum cache size for offline data
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Help improve the dashboard with usage analytics
                        </p>
                      </div>
                      <Switch
                        checked={settings.advanced.enableAnalytics}
                        onCheckedChange={(checked) => handleSettingChange('advanced', 'enableAnalytics', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Show additional debugging information
                        </p>
                      </div>
                      <Switch
                        checked={settings.advanced.enableDebugMode}
                        onCheckedChange={(checked) => handleSettingChange('advanced', 'enableDebugMode', checked)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Data Management</h4>
                      
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handleExportSettings}>
                          <Download className="h-4 w-4 mr-2" />
                          Export Settings
                        </Button>
                        
                        <label>
                          <Button variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Import Settings
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleImportSettings}
                          />
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={handleResetSettings}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset to Defaults
                        </Button>
                        
                        <Button variant="destructive" onClick={handleClearAllData}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear All Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}