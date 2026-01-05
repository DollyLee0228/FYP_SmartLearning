// AdminImportPage.tsx - 更新版（包含Videos和Achievements导入）

import React, { useState } from 'react';
import { importVideos } from '@/data/Grammar_Lessons_Complete';
import { importAchievements } from '@/scripts/importAchievements';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, CheckCircle2, XCircle, Loader2, Trophy, Video } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminImportPage() {
  const [importingVideos, setImportingVideos] = useState(false);
  const [videosResult, setVideosResult] = useState<any>(null);
  
  const [importingAchievements, setImportingAchievements] = useState(false);
  const [achievementsResult, setAchievementsResult] = useState<any>(null);

  // Import Videos
  const handleImportVideos = async () => {
    setImportingVideos(true);
    setVideosResult(null);
    
    try {
      toast.info('开始导入视频数据...');
      const res = await importVideos();
      
      setVideosResult(res);
      
      if (res.success) {
        toast.success(`成功导入 ${res.successCount} 个视频！`);
      } else {
        toast.error('导入失败！');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('导入出错！');
      setVideosResult({ success: false, error });
    } finally {
      setImportingVideos(false);
    }
  };

  // Import Achievements
  const handleImportAchievements = async () => {
    setImportingAchievements(true);
    setAchievementsResult(null);
    
    try {
      toast.info('开始导入成就数据...');
      const res = await importAchievements();
      
      setAchievementsResult(res);
      
      if (res.success) {
        toast.success(`成功导入 ${res.successCount} 个成就！`);
      } else {
        toast.error('导入失败！');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('导入出错！');
      setAchievementsResult({ success: false, error });
    } finally {
      setImportingAchievements(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin: Import Data</h1>
        <p className="text-gray-600 mb-8">一键导入示例数据到Firebase</p>

        {/* Videos Import */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Import Videos</h3>
              <p className="text-sm text-gray-600 mb-4">
                导入12个示例视频到Firestore的videos collection
              </p>
              
              <Button
                onClick={handleImportVideos}
                disabled={importingVideos}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {importingVideos ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在导入...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    开始导入
                  </>
                )}
              </Button>
            </div>
          </div>

          {videosResult && (
            <div className="mt-6 pt-6 border-t">
              {videosResult.success ? (
                <div className="flex items-start gap-3 text-green-600">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">导入成功！</p>
                    <p className="text-sm">
                      成功: {videosResult.successCount} / 失败: {videosResult.errorCount} / 总计: {videosResult.total}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-red-600">
                  <XCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">导入失败</p>
                    <p className="text-sm">{videosResult.error?.message || '未知错误'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Achievements Import */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Import Achievements</h3>
              <p className="text-sm text-gray-600 mb-4">
                导入27个成就到Firestore的achievements collection
              </p>
              
              <Button
                onClick={handleImportAchievements}
                disabled={importingAchievements}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {importingAchievements ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在导入...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    开始导入
                  </>
                )}
              </Button>
            </div>
          </div>

          {achievementsResult && (
            <div className="mt-6 pt-6 border-t">
              {achievementsResult.success ? (
                <div className="flex items-start gap-3 text-green-600">
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">导入成功！</p>
                    <p className="text-sm">
                      成功: {achievementsResult.successCount} / 总计: {achievementsResult.total}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-red-600">
                  <XCircle className="w-5 h-5 mt-0.5" />
                  <div>
                    <p className="font-semibold">导入失败</p>
                    <p className="text-sm">{achievementsResult.error?.message || '未知错误'}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200 mb-6">
          <h3 className="font-semibold mb-2">📝 使用说明</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>1. 点击对应的"开始导入"按钮</li>
            <li>2. 等待导入完成（约5-10秒）</li>
            <li>3. 查看导入结果</li>
            <li>4. Videos: 前往 /videos 页面查看</li>
            <li>5. Achievements: 前往 /achievements 页面查看</li>
          </ul>
        </Card>

        {/* Warning */}
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 注意</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 每次点击会添加新数据</li>
            <li>• 不会检查重复，请勿多次点击</li>
            <li>• 如需清空，请前往Firebase Console手动删除</li>
            <li>• 确保Firestore Rules允许写入</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}