"""
方案 1: Content-Based Recommendation System
纯 TF-IDF + Cosine Similarity

适合场景：
- 冷启动（新用户）
- 小数据量
- 需要快速实现

算法：Content-Based Filtering
- TF-IDF Vectorization
- Cosine Similarity
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np


class ContentBasedRecommender:
    """纯内容推荐系统"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        self.content_matrix = None
        self.content_df = None
        
    def fit(self, content_df):
        """训练模型"""
        print("🔧 Training Content-Based Model...")
        
        self.content_df = content_df.copy()
        
        # 组合特征
        self.content_df['features'] = (
            self.content_df['title'] + ' ' +
            self.content_df['title'] + ' ' +  # 标题重复（加权）
            self.content_df['category'] + ' ' +
            self.content_df['level'] + ' ' +
            self.content_df.get('description', '').fillna('')
        )
        
        # TF-IDF 向量化
        self.content_matrix = self.vectorizer.fit_transform(
            self.content_df['features']
        )
        
        print(f"✅ Trained with {len(content_df)} items")
        print(f"📊 Features: {self.content_matrix.shape[1]}")
        
    def recommend(self, user_level, learning_goals, completed_lessons=None, n=10):
        """生成推荐"""
        if completed_lessons is None:
            completed_lessons = []
        
        # 构建用户查询
        query = ' '.join([
            user_level, user_level, user_level,  # Level 重复3次
            *[goal for goal in learning_goals for _ in range(2)]  # Goals 重复2次
        ])
        
        # 向量化
        user_vector = self.vectorizer.transform([query])
        
        # 计算相似度
        similarities = cosine_similarity(user_vector, self.content_matrix)[0]
        
        # 创建结果
        results = self.content_df.copy()
        results['similarity'] = similarities
        
        # Level 匹配加分
        level_map = {'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3, 'C1': 4, 'C2': 5}
        user_level_num = level_map.get(user_level, 0)
        
        def level_bonus(content_level):
            content_num = level_map.get(content_level, 0)
            diff = abs(user_level_num - content_num)
            if diff == 0: return 0.3
            if diff == 1: return 0.15
            return 0
        
        results['level_bonus'] = results['level'].apply(level_bonus)
        
        # 最终得分
        results['score'] = results['similarity'] * 0.7 + results['level_bonus'] * 0.3
        
        # 排除已完成
        results = results[~results['id'].isin(completed_lessons)]
        
        # 排序返回
        return results.nlargest(n, 'score')[['id', 'title', 'category', 'level', 'score']]


# ========== 测试代码 ==========

def test_content_based():
    # 示例数据
    content = pd.DataFrame([
        {'id': 'g1', 'title': 'Present Simple Tense', 'category': 'Grammar', 'level': 'A1', 'description': 'Basic tense'},
        {'id': 'g2', 'title': 'Past Simple Tense', 'category': 'Grammar', 'level': 'A2', 'description': 'Past tense'},
        {'id': 'v1', 'title': 'Common Verbs', 'category': 'Vocabulary', 'level': 'A1', 'description': 'Essential verbs'},
        {'id': 'v2', 'title': 'English Idioms', 'category': 'Vocabulary', 'level': 'B2', 'description': 'Idioms'},
        {'id': 'r1', 'title': 'Short Stories', 'category': 'Reading', 'level': 'A1', 'description': 'Reading practice'},
    ])
    
    # 训练
    recommender = ContentBasedRecommender()
    recommender.fit(content)
    
    # 推荐
    print("\n" + "="*60)
    print("📚 CONTENT-BASED RECOMMENDATIONS")
    print("="*60)
    
    recommendations = recommender.recommend(
        user_level='A1',
        learning_goals=['Grammar', 'Vocabulary'],
        completed_lessons=[],
        n=3
    )
    
    print(recommendations.to_string(index=False))
    print("\n算法：TF-IDF + Cosine Similarity")
    print("权重：相似度 70% + Level匹配 30%")


if __name__ == '__main__':
    test_content_based()