import React, { useState } from 'react';
import { Bell, Gift, Info, MessageCircle, Check, CheckCheck, ArrowLeft, X } from 'lucide-react';
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

interface Notification {
  id: string;
  type: 'announcement' | 'reward' | 'tip' | 'reminder';
  title: string;
  content: string;
  time: string;
  read: boolean;
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

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'reward',
    title: 'Daily Reward Available!',
    content: 'Claim your daily bonus of 50 XP and keep your streak going strong!',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'announcement',
    title: 'New Grammar Lessons Added',
    content: 'Check out our new advanced grammar lessons covering complex sentence structures and advanced tenses.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'tip',
    title: 'Learning Tip of the Day',
    content: 'Practice speaking out loud for better pronunciation! Recording yourself can help identify areas for improvement.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Continue Your Lesson',
    content: 'You were halfway through "Present Perfect Tense". Continue where you left off to maintain your progress.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Platform Update',
    content: 'We have updated our speaking module with new AI-powered pronunciation feedback.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '6',
    type: 'reward',
    title: '7-Day Streak Achievement!',
    content: 'Congratulations! You have maintained a 7-day learning streak. Keep it up!',
    time: '3 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    markAsRead(notification.id);
  };

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
