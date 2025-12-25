import React from 'react';
import { Bell, Gift, Info, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

interface Message {
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

const messages: Message[] = [
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
    content: 'Check out our new advanced grammar lessons.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'tip',
    title: 'Learning Tip of the Day',
    content: 'Practice speaking out loud for better pronunciation!',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Continue Your Lesson',
    content: 'You were halfway through "Present Perfect Tense".',
    time: 'Yesterday',
    read: true,
  },
];

export function NotificationPopover() {
  const navigate = useNavigate();
  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <ScrollArea className="h-80">
          <div className="p-2 space-y-1">
            {messages.map((message) => {
              const Icon = typeIcons[message.type];
              
              return (
                <div
                  key={message.id}
                  className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    !message.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[message.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium truncate">{message.title}</h5>
                      {!message.read && (
                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{message.content}</p>
                    <span className="text-xs text-muted-foreground/70 mt-1 block">{message.time}</span>
                  </div>

                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => navigate('/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
