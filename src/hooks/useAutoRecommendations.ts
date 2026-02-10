// hooks/useAutoRecommendations.ts
// 自动生成推荐的 Hook

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * 调用后端 API 生成推荐
 */
async function generateRecommendations(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Recommendations generated:', data.recommendations);
      return true;
    } else {
      console.error('❌ Failed to generate recommendations:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error calling recommendation API:', error);
    return false;
  }
}

/**
 * Hook: 在 Quiz 完成页面调用
 * 
 * 使用方法：
 * const { triggerRecommendations } = useAutoRecommendations();
 * 
 * // Quiz 完成后调用
 * await triggerRecommendations();
 */
export function useAutoRecommendations() {
  const { user } = useAuth();

  const triggerRecommendations = async (): Promise<boolean> => {
    if (!user) {
      console.warn('User not logged in, skipping recommendation generation');
      return false;
    }

    console.log('🔄 Triggering recommendation generation...');
    return await generateRecommendations(user.uid);
  };

  return {
    triggerRecommendations,
  };
}

/**
 * Hook: 自动监听用户数据变化并生成推荐
 * 
 * 使用方法：
 * useAutoRecommendationsOnChange(); // 在 App.tsx 或主组件中使用
 */
export function useAutoRecommendationsOnChange() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // 监听 localStorage 中的 quiz 完成事件
    const handleQuizComplete = (event: StorageEvent) => {
      if (event.key === 'quiz_completed' && event.newValue === 'true') {
        console.log('📝 Quiz completed detected, generating recommendations...');
        generateRecommendations(user.uid);
        localStorage.removeItem('quiz_completed'); // 清除标记
      }
    };

    window.addEventListener('storage', handleQuizComplete);

    return () => {
      window.removeEventListener('storage', handleQuizComplete);
    };
  }, [user]);
}