// src/utils/streakTracking.ts
// 处理Streak追踪的所有功能

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Timestamp | null;
  streakHistory: Array<{ date: string; completed: boolean }>;
}

/**
 * 检查date1是否是date2的前一天
 */
function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    date1.getFullYear() === yesterday.getFullYear() &&
    date1.getMonth() === yesterday.getMonth() &&
    date1.getDate() === yesterday.getDate()
  );
}

/**
 * 检查两个日期是否是同一天
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 更新用户的streak
 * 每次完成lesson时调用
 */
export async function updateStreak(userId: string): Promise<StreakData> {
  try {
    const streakRef = doc(db, 'users', userId, 'stats', 'streak');
    const streakSnap = await getDoc(streakRef);
    
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompletedDate: Date | null = null;
    
    if (streakSnap.exists()) {
      const data = streakSnap.data() as StreakData;
      currentStreak = data.currentStreak || 0;
      longestStreak = data.longestStreak || 0;
      lastCompletedDate = data.lastCompletedDate 
        ? new Date(data.lastCompletedDate.seconds * 1000)
        : null;
    }
    
    // 检查是否需要更新streak
    if (lastCompletedDate) {
      if (isSameDay(lastCompletedDate, now)) {
        // 今天已经完成过了，不需要更新streak
        console.log('✅ Already completed today, streak unchanged');
      } else if (isYesterday(lastCompletedDate, now)) {
        // 昨天完成了，继续连续
        currentStreak++;
        console.log(`🔥 Streak continues! Now ${currentStreak} days`);
      } else {
        // 断了，重置为1
        currentStreak = 1;
        console.log('💔 Streak broken, reset to 1');
      }
    } else {
      // 第一次完成lesson
      currentStreak = 1;
      console.log('🎉 First lesson completed! Streak = 1');
    }
    
    // 更新最长记录
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
      console.log(`🏆 New longest streak record: ${longestStreak} days!`);
    }
    
    // 保存到Firebase
    const updatedData: StreakData = {
      currentStreak,
      longestStreak,
      lastCompletedDate: Timestamp.fromDate(now),
      streakHistory: [] // 可以后续添加历史记录
    };
    
    await setDoc(streakRef, updatedData, { merge: true });
    
    return updatedData;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
}

/**
 * 获取用户的streak数据
 */
export async function getStreak(userId: string): Promise<StreakData> {
  try {
    const streakRef = doc(db, 'users', userId, 'stats', 'streak');
    const streakSnap = await getDoc(streakRef);
    
    if (streakSnap.exists()) {
      return streakSnap.data() as StreakData;
    }
    
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakHistory: []
    };
  } catch (error) {
    console.error('Error getting streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
      streakHistory: []
    };
  }
}

/**
 * 获取过去7天的打卡历史（用于日历显示）
 */
export function getWeeklyStreakHistory(lastCompletedDate: Date | null, currentStreak: number) {
  const history: Array<{ day: string; completed: boolean; date: Date }> = [];
  const today = new Date();
  
  // 生成过去7天
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 1); // S, M, T, W...
    
    // 判断这一天是否完成了
    let completed = false;
    
    if (lastCompletedDate && currentStreak > 0) {
      const daysSinceLastCompleted = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysAgo = i;
      
      // 如果在streak范围内
      if (daysAgo <= daysSinceLastCompleted && daysAgo < currentStreak) {
        completed = true;
      }
    }
    
    history.push({ day: dayName, completed, date });
  }
  
  return history;
}