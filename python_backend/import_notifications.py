# import_notifications.py - 批量导入通知到Firebase

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# ✅ 初始化Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # 改成你的路径
firebase_admin.initialize_app(cred)
db = firestore.client()

# 📬 示例通知数据
sample_notifications = [
    {
        'type': 'reward',
        'title': '🎁 Daily Reward Available!',
        'content': 'Claim your daily bonus of 50 XP and keep your streak going strong!',
        'read': False
    },
    {
        'type': 'announcement',
        'title': '📚 New Grammar Lessons Added',
        'content': 'Check out our new advanced grammar lessons covering complex sentence structures and advanced tenses.',
        'read': False
    },
    {
        'type': 'tip',
        'title': '💡 Learning Tip of the Day',
        'content': 'Practice speaking out loud for better pronunciation! Recording yourself can help identify areas for improvement.',
        'read': False
    },
    {
        'type': 'reminder',
        'title': '⏰ Continue Your Lesson',
        'content': 'You were halfway through "Present Perfect Tense". Continue where you left off to maintain your progress.',
        'read': True
    },
    {
        'type': 'announcement',
        'title': '🎉 Platform Update',
        'content': 'We have updated our speaking module with new AI-powered pronunciation feedback.',
        'read': True
    },
    {
        'type': 'reward',
        'title': '🔥 7-Day Streak Achievement!',
        'content': 'Congratulations! You have maintained a 7-day learning streak. Keep it up!',
        'read': True
    },
]

def send_notification_to_user(user_id, notification_data, days_ago=0):
    """
    发送通知给特定用户
    
    Args:
        user_id: 用户ID
        notification_data: 通知数据（dict）
        days_ago: 几天前（用于设置时间戳）
    """
    notifications_ref = db.collection('users').document(user_id).collection('notifications')
    
    # 计算时间戳
    timestamp = datetime.now() - timedelta(days=days_ago)
    
    notification = {
        'type': notification_data['type'],
        'title': notification_data['title'],
        'content': notification_data['content'],
        'timestamp': timestamp,
        'read': notification_data.get('read', False)
    }
    
    # 添加到Firestore
    doc_ref = notifications_ref.add(notification)
    print(f"  ✅ Added notification: {notification_data['title'][:50]}...")
    return doc_ref

def send_notification_to_all_users(notification_data, days_ago=0):
    """
    发送通知给所有用户
    """
    users_ref = db.collection('users')
    users = users_ref.stream()
    
    count = 0
    for user in users:
        send_notification_to_user(user.id, notification_data, days_ago)
        count += 1
    
    print(f"✅ Notification sent to {count} users")
    return count

def import_sample_notifications_for_user(user_id):
    """
    为特定用户导入示例通知
    """
    print(f"\n📬 Importing notifications for user: {user_id}")
    print("=" * 60)
    
    # 导入通知，设置不同的时间
    send_notification_to_user(user_id, sample_notifications[0], days_ago=0)  # 今天
    send_notification_to_user(user_id, sample_notifications[1], days_ago=0)  # 今天
    send_notification_to_user(user_id, sample_notifications[2], days_ago=1)  # 昨天
    send_notification_to_user(user_id, sample_notifications[3], days_ago=1)  # 昨天
    send_notification_to_user(user_id, sample_notifications[4], days_ago=2)  # 2天前
    send_notification_to_user(user_id, sample_notifications[5], days_ago=3)  # 3天前
    
    print("=" * 60)
    print(f"✅ Imported {len(sample_notifications)} notifications for {user_id}")

def import_sample_notifications_for_all_users():
    """
    为所有用户导入示例通知
    """
    print("\n📬 Importing notifications for ALL users")
    print("=" * 60)
    
    users_ref = db.collection('users')
    users = users_ref.stream()
    
    user_count = 0
    for user in users:
        print(f"\n👤 User: {user.id}")
        import_sample_notifications_for_user(user.id)
        user_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Imported notifications for {user_count} users")

def send_holiday_greeting_to_all():
    """
    发送节日祝福给所有用户
    """
    notification = {
        'type': 'announcement',
        'title': '🎄 Merry Christmas!',
        'content': 'Wishing you a wonderful holiday season! Keep learning and growing with us. 🎁✨',
        'read': False
    }
    
    print("\n🎄 Sending Christmas greeting to all users...")
    count = send_notification_to_all_users(notification)
    print(f"✅ Sent to {count} users!")

def send_new_year_greeting_to_all():
    """
    发送新年祝福给所有用户
    """
    notification = {
        'type': 'announcement',
        'title': '🎊 Happy New Year 2026!',
        'content': 'Welcome to 2026! Set new learning goals and achieve them together! 🚀',
        'read': False
    }
    
    print("\n🎊 Sending New Year greeting to all users...")
    count = send_notification_to_all_users(notification)
    print(f"✅ Sent to {count} users!")

def send_chinese_new_year_greeting():
    """
    发送农历新年祝福
    """
    notification = {
        'type': 'announcement',
        'title': '🧧 Happy Chinese New Year!',
        'content': '恭喜发财！Wishing you prosperity and success in the Year of the Snake! 🐍✨',
        'read': False
    }
    
    print("\n🧧 Sending Chinese New Year greeting to all users...")
    count = send_notification_to_all_users(notification)
    print(f"✅ Sent to {count} users!")

# ============================================
# 主程序
# ============================================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("📬 NOTIFICATION IMPORT TOOL")
    print("=" * 60)
    
    # 选择功能
    print("\nChoose an option:")
    print("1. Import sample notifications for a specific user")
    print("2. Import sample notifications for ALL users")
    print("3. Send Christmas greeting to all users")
    print("4. Send New Year greeting to all users")
    print("5. Send Chinese New Year greeting to all users")
    
    choice = input("\nEnter your choice (1-5): ")
    
    if choice == '1':
        user_id = input("Enter user ID: ")
        import_sample_notifications_for_user(user_id)
    
    elif choice == '2':
        confirm = input("⚠️  This will send notifications to ALL users. Continue? (yes/no): ")
        if confirm.lower() == 'yes':
            import_sample_notifications_for_all_users()
        else:
            print("❌ Cancelled")
    
    elif choice == '3':
        confirm = input("🎄 Send Christmas greeting to all users? (yes/no): ")
        if confirm.lower() == 'yes':
            send_holiday_greeting_to_all()
        else:
            print("❌ Cancelled")
    
    elif choice == '4':
        confirm = input("🎊 Send New Year greeting to all users? (yes/no): ")
        if confirm.lower() == 'yes':
            send_new_year_greeting_to_all()
        else:
            print("❌ Cancelled")
    
    elif choice == '5':
        confirm = input("🧧 Send Chinese New Year greeting to all users? (yes/no): ")
        if confirm.lower() == 'yes':
            send_chinese_new_year_greeting()
        else:
            print("❌ Cancelled")
    
    else:
        print("❌ Invalid choice")
    
    print("\n" + "=" * 60)
    print("✅ Done!")
    print("=" * 60)