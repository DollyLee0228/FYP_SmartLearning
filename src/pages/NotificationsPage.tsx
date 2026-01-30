// NotificationsPage.tsx - Firebase连接版本
// ✅ 从Firebase读取通知
// ✅ 支持动态添加节日祝福等消息
// TRY AGAIN

import React, { useState, useEffect } from 'react';
import { Bell, Gift, Info, MessageCircle, Check, CheckCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Notification {
  id: string;
  type: 'announcement' | 'reward' | 'tip' | 'reminder';
  title: string;
  content: string;
  time: string;
  timestamp: any; // Firestore Timestamp
  read: boolean;
  userId?: string; // 如果是针对特定用户的通知
}

const typeIcons = {
  announcement: Bell,
  reward: Gift,
  tip: Info,
  reminder: MessageCircle,
};

const typeColors = {
  announcement: 'bg-blue-500/10 text-blue-500',
  reward: 'bg-amber-500/10 text-amber-500',
  tip: 'bg-green-500/10 text-green-500',
  reminder: 'bg-purple-500/10 text-purple-500',
};

const typeLabels = {
  announcement: 'Announcement',
  reward: 'Reward',
  tip: 'Tip',
  reminder: 'Reminder',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // ✅ 从Firebase加载通知
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // 查询用户的通知
    const notificationsRef = collection(db, 'users', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    // 实时监听通知
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // 计算时间差
        const timestamp = data.timestamp?.toDate();
        const timeAgo = timestamp ? getTimeAgo(timestamp) : 'Unknown';
        
        notifs.push({
          id: doc.id,
          type: data.type || 'announcement',
          title: data.title || 'Notification',
          content: data.content || '',
          time: timeAgo,
          timestamp: data.timestamp,
          read: data.read || false,
          userId: data.userId,
        });
      });
      
      setNotifications(notifs);
      setLoading(false);
      
      console.log('📬 Loaded notifications:', notifs.length);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  // ✅ 计算时间差
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  // ✅ 标记为已读
  const markAsRead = async (id: string) => {
    if (!user) return;
    
    try {
      const notifRef = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(notifRef, { read: true });
      
      // 本地更新
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ 全部标记为已读
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      
      notifications.forEach(notif => {
        if (!notif.read) {
          const notifRef = doc(db, 'users', user.uid, 'notifications', notif.id);
          batch.update(notifRef, { read: true });
        }
      });
      
      await batch.commit();
      
      // 本地更新
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Tabs Filter */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="all" className="text-xs py-2">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs py-2">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcement" className="text-xs py-2">
              <Bell className="w-3 h-3 mr-1" />
              News
            </TabsTrigger>
            <TabsTrigger value="reward" className="text-xs py-2">
              <Gift className="w-3 h-3 mr-1" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="tip" className="text-xs py-2">
              <Info className="w-3 h-3 mr-1" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="reminder" className="text-xs py-2">
              <MessageCircle className="w-3 h-3 mr-1" />
              Reminders
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No notifications found</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              
              return (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    !notification.read ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                  onClick={() => openNotification(notification)}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[notification.type]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                      </div>
                    </div>

                    {!notification.read && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="flex-shrink-0 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Notification Detail Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="sm:max-w-md">
            {selectedNotification && (() => {
              const Icon = typeIcons[selectedNotification.type];
              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[selectedNotification.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <DialogTitle>{selectedNotification.title}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[selectedNotification.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {selectedNotification.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedNotification.content}
                    </p>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
