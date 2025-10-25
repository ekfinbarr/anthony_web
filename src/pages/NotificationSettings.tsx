/**
 * Notifications Settings Page
 * Comprehensive notification management with real-time updates,
 * notification preferences, and notification history
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  BellOff,
  Mail,
  MessageSquare,
  Calendar,
  Heart,
  Users,
  Star,
  Church,
  Settings,
  Check,
  X,
  ArrowLeft,
  Clock,
  Filter,
  MoreHorizontal,
  Trash2,
  CheckSquare,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Link } from 'react-router-dom';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Hooks and Utils
import { usePersonalization } from '@/hooks/dashboard/usePersonalization';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { uiUtils } from '@/lib/dashboard-utils';

/**
 * Interface for notification settings
 */
interface NotificationSettings {
  email: {
    enabled: boolean;
    events: boolean;
    reminders: boolean;
    updates: boolean;
    spiritual: boolean;
    community: boolean;
  };
  push: {
    enabled: boolean;
    events: boolean;
    reminders: boolean;
    updates: boolean;
    spiritual: boolean;
    community: boolean;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
}

/**
 * Interface for individual notifications
 */
interface Notification {
  id: string;
  type: 'event' | 'reminder' | 'update' | 'spiritual' | 'community' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
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
 * Notification type icons mapping
 */
const notificationIcons = {
  event: Calendar,
  reminder: Bell,
  update: MessageSquare,
  spiritual: Heart,
  community: Users,
  system: Settings
};

/**
 * Notification type colors mapping
 */
const notificationColors = {
  event: 'text-blue-600 bg-blue-100',
  reminder: 'text-yellow-600 bg-yellow-100',
  update: 'text-green-600 bg-green-100',
  spiritual: 'text-purple-600 bg-purple-100',
  community: 'text-orange-600 bg-orange-100',
  system: 'text-gray-600 bg-gray-100'
};

/**
 * Notifications Settings Page Component
 */
export default function NotificationSettings() {
  // State management
  const [activeTab, setActiveTab] = useState('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | Notification['type']>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      events: true,
      reminders: true,
      updates: false,
      spiritual: true,
      community: true
    },
    push: {
      enabled: false,
      events: false,
      reminders: true,
      updates: false,
      spiritual: true,
      community: false
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
      frequency: 'immediate'
    }
  });

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'event',
      title: 'Upcoming Sunday Service',
      message: 'Join us for this Sunday\'s worship service at 10:00 AM. Special guest speaker Pastor Johnson.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'high',
      actionUrl: '/events',
      actionText: 'View Event'
    },
    {
      id: '2',
      type: 'spiritual',
      title: 'Prayer Streak Achievement',
      message: 'Congratulations! You\'ve maintained a 7-day prayer streak. Keep up the great work!',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      read: false,
      priority: 'medium',
      actionUrl: '/dashboard?tab=growth',
      actionText: 'View Progress'
    },
    {
      id: '3',
      type: 'community',
      title: 'New Small Group Match',
      message: 'We found a small group that matches your interests: "Young Adults Bible Study".',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'medium',
      actionUrl: '/dashboard?tab=community',
      actionText: 'View Groups'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Goal Check-in Reminder',
      message: 'It\'s time to update your spiritual growth goals. How are you progressing?',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      priority: 'low',
      actionUrl: '/dashboard?tab=growth',
      actionText: 'Update Goals'
    },
    {
      id: '5',
      type: 'update',
      title: 'New Content Available',
      message: 'Pastor Michael has uploaded a new sermon: "Finding Hope in Difficult Times".',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      priority: 'low',
      actionUrl: '/sermons',
      actionText: 'Listen Now'
    }
  ]);

  // Hooks
  const { updateUserPreferences } = useDashboardData();

  /**
   * Handle notification setting changes
   */
  const handleSettingChange = (
    category: keyof NotificationSettings,
    setting: string,
    value: boolean | string
  ) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  /**
   * Save notification settings
   */
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user preferences
      await updateUserPreferences({
        notificationSettings: {
          emailNotifications: notificationSettings.email.enabled,
          pushNotifications: notificationSettings.push.enabled,
          reminderSettings: {
            events: notificationSettings.email.events || notificationSettings.push.events,
            prayers: notificationSettings.email.spiritual || notificationSettings.push.spiritual,
            reading: notificationSettings.email.spiritual || notificationSettings.push.spiritual
          }
        }
      });

      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated.',
      });
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
   * Mark notification as read
   */
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast({
      title: 'All notifications marked as read',
      description: 'Your notification list has been updated.',
    });
  };

  /**
   * Delete notification
   */
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  /**
   * Delete selected notifications
   */
  const deleteSelectedNotifications = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    );
    setSelectedNotifications([]);
    toast({
      title: 'Notifications deleted',
      description: `${selectedNotifications.length} notifications removed.`,
    });
  };

  /**
   * Toggle notification selection
   */
  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  /**
   * Get filtered notifications
   */
  const filteredNotifications = notifications.filter(notification =>
    filter === 'all' || notification.type === filter
  );

  /**
   * Get unread count
   */
  const unreadCount = notifications.filter(n => !n.read).length;

  /**
   * Request notification permission
   */
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleSettingChange('push', 'enabled', true);
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive browser notifications.',
        });
      } else {
        toast({
          title: 'Permission Denied',
          description: 'Browser notifications are not available.',
          variant: 'destructive'
        });
      }
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
                  <Bell className="h-6 w-6" />
                  Notifications
                </h1>
                <p className="text-muted-foreground">
                  Manage your notification preferences and history
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                History
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Email Notifications */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Notifications
                    </CardTitle>
                    <CardDescription>
                      Configure email notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.email.enabled}
                        onCheckedChange={(checked) => handleSettingChange('email', 'enabled', checked)}
                      />
                    </div>

                    {notificationSettings.email.enabled && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Event Reminders</Label>
                            <Switch
                              checked={notificationSettings.email.events}
                              onCheckedChange={(checked) => handleSettingChange('email', 'events', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Prayer & Goal Reminders</Label>
                            <Switch
                              checked={notificationSettings.email.reminders}
                              onCheckedChange={(checked) => handleSettingChange('email', 'reminders', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Church Updates</Label>
                            <Switch
                              checked={notificationSettings.email.updates}
                              onCheckedChange={(checked) => handleSettingChange('email', 'updates', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Spiritual Progress</Label>
                            <Switch
                              checked={notificationSettings.email.spiritual}
                              onCheckedChange={(checked) => handleSettingChange('email', 'spiritual', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Community Activity</Label>
                            <Switch
                              checked={notificationSettings.email.community}
                              onCheckedChange={(checked) => handleSettingChange('email', 'community', checked)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Push Notifications */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BellRing className="h-5 w-5" />
                      Push Notifications
                    </CardTitle>
                    <CardDescription>
                      Browser and device notification settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.push.enabled}
                        onCheckedChange={(checked) => {
                          if (checked && 'Notification' in window && Notification.permission !== 'granted') {
                            requestNotificationPermission();
                          } else {
                            handleSettingChange('push', 'enabled', checked);
                          }
                        }}
                      />
                    </div>

                    {notificationSettings.push.enabled && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Event Reminders</Label>
                            <Switch
                              checked={notificationSettings.push.events}
                              onCheckedChange={(checked) => handleSettingChange('push', 'events', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Prayer & Goal Reminders</Label>
                            <Switch
                              checked={notificationSettings.push.reminders}
                              onCheckedChange={(checked) => handleSettingChange('push', 'reminders', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Spiritual Progress</Label>
                            <Switch
                              checked={notificationSettings.push.spiritual}
                              onCheckedChange={(checked) => handleSettingChange('push', 'spiritual', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Community Activity</Label>
                            <Switch
                              checked={notificationSettings.push.community}
                              onCheckedChange={(checked) => handleSettingChange('push', 'community', checked)}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* In-App Notifications */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5" />
                      In-App Notifications
                    </CardTitle>
                    <CardDescription>
                      Notifications within the church website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Show notifications while using the website
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.inApp.enabled}
                        onCheckedChange={(checked) => handleSettingChange('inApp', 'enabled', checked)}
                      />
                    </div>

                    {notificationSettings.inApp.enabled && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>Sound Notifications</Label>
                            <Switch
                              checked={notificationSettings.inApp.sound}
                              onCheckedChange={(checked) => handleSettingChange('inApp', 'sound', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Desktop Notifications</Label>
                            <Switch
                              checked={notificationSettings.inApp.desktop}
                              onCheckedChange={(checked) => handleSettingChange('inApp', 'desktop', checked)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notification Frequency</Label>
                            <Select
                              value={notificationSettings.inApp.frequency}
                              onValueChange={(value) => handleSettingChange('inApp', 'frequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate</SelectItem>
                                <SelectItem value="hourly">Hourly Summary</SelectItem>
                                <SelectItem value="daily">Daily Summary</SelectItem>
                                <SelectItem value="weekly">Weekly Summary</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Save Button */}
              <motion.div variants={itemVariants}>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {/* Controls */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Select value={filter} onValueChange={setFilter}>
                          <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Notifications</SelectItem>
                            <SelectItem value="event">Events</SelectItem>
                            <SelectItem value="reminder">Reminders</SelectItem>
                            <SelectItem value="spiritual">Spiritual</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="update">Updates</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {selectedNotifications.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={deleteSelectedNotifications}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedNotifications.length})
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Mark All Read
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notifications List */}
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Notification History</CardTitle>
                    <CardDescription>
                      Your recent notifications and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-96">
                      {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No notifications found</p>
                        </div>
                      ) : (
                        <div className="space-y-0">
                          {filteredNotifications.map((notification, index) => {
                            const IconComponent = notificationIcons[notification.type];
                            const isSelected = selectedNotifications.includes(notification.id);
                            
                            return (
                              <div
                                key={notification.id}
                                className={`p-4 border-b hover:bg-accent/50 transition-colors ${
                                  !notification.read ? 'bg-primary/5' : ''
                                } ${isSelected ? 'bg-accent' : ''}`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleNotificationSelection(notification.id)}
                                    className="mt-1"
                                  />
                                  
                                  <div className={`p-2 rounded-lg ${notificationColors[notification.type]}`}>
                                    <IconComponent className="h-4 w-4" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-1">
                                        <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                          {notification.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {notification.type}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {uiUtils.formatRelativeTime(notification.timestamp)}
                                          </span>
                                          {notification.priority === 'high' && (
                                            <Badge variant="destructive" className="text-xs">
                                              High Priority
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {!notification.read && (
                                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                              <Check className="h-4 w-4 mr-2" />
                                              Mark as Read
                                            </DropdownMenuItem>
                                          )}
                                          {notification.actionUrl && (
                                            <DropdownMenuItem asChild>
                                              <Link to={notification.actionUrl}>
                                                <Star className="h-4 w-4 mr-2" />
                                                {notification.actionText || 'View'}
                                              </Link>
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => deleteNotification(notification.id)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>

                                    {notification.actionUrl && (
                                      <div className="mt-3">
                                        <Button variant="outline" size="sm" asChild>
                                          <Link to={notification.actionUrl}>
                                            {notification.actionText || 'View'}
                                          </Link>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
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