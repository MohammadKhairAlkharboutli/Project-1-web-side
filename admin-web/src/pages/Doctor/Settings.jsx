import { useState } from "react";
import { Bell, Lock, Sliders, ShieldCheck } from "lucide-react";

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState("general");

  // حالات وهمية لحفظ الإعدادات (يمكن ربطها بالباك إند لاحقاً)
  const [generalSettings, setGeneralSettings] = useState({
    language: "English",
    timeZone: "(GMT+03:00) Amman / Riyadh"
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleGeneralSave = (e) => {
    e.preventDefault();
    // هنا يتم ربط طلب الـ API لحفظ تفضيلات النظام العامة
    console.log("Saving general preferences...", generalSettings);
  };

  const handleNotificationSave = (e) => {
    e.preventDefault();
    // هنا يتم ربط طلب الـ API لحفظ إعدادات الإشعارات
    console.log("Saving notification settings...", notifications);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    // هنا يتم ربط طلب الـ API لتغيير كلمة المرور
    console.log("Updating password...");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* عنوان الصفحة */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your system preferences, notification channels, and account security.</p>
      </div>

      {/* التبويبات (Tabs) */}
      <div className="flex gap-2 border-b border-slate-100 pb-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "general"
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Sliders size={16} />
          <span>General Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "notifications"
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Bell size={16} />
          <span>Notifications</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "security"
              ? "bg-blue-50 text-blue-600 border border-blue-100"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Lock size={16} />
          <span>Security & Password</span>
        </button>
      </div>

      {/* محتوى التبويبات */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        
        {/* التبويب الأول: التفضيلات العامة */}
        {activeTab === "general" && (
          <form onSubmit={handleGeneralSave} className="space-y-5 pt-2">
            <h3 className="text-sm font-black text-slate-900 border-b pb-3">System & Display Preferences</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Language</label>
                <select 
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({...generalSettings, language: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="English">English</option>
                  <option value="Arabic">العربية</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Time Zone</label>
                <select 
                  value={generalSettings.timeZone}
                  onChange={(e) => setGeneralSettings({...generalSettings, timeZone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
                >
                  <option value="(GMT+03:00) Amman / Riyadh">(GMT+03:00) Amman / Riyadh</option>
                  <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* التبويب الثاني: الإشعارات */}
        {activeTab === "notifications" && (
          <form onSubmit={handleNotificationSave} className="space-y-5 pt-2">
            <h3 className="text-sm font-black text-slate-900 border-b pb-3">Notification Channels</h3>
            
            <div className="space-y-4 max-w-2xl">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-slate-800">Email Notifications</p>
                  <p className="text-[11px] text-slate-400">Receive emails about new appointments, cancellations, and updates.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer" 
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-all">
                <div>
                  <p className="text-xs font-bold text-slate-800">SMS Alerts</p>
                  <p className="text-[11px] text-slate-400">Receive urgent SMS alerts regarding patient schedule changes.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer" 
                />
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                Save Notifications
              </button>
            </div>
          </form>
        )}

        {/* التبويب الثالث: الأمان وكلمة المرور */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSave} className="space-y-5 pt-2">
            <div className="flex items-center gap-2 border-b pb-3">
              <ShieldCheck size={18} className="text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">Change Password</h3>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block widget block mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800" 
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm">
                Update Password
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}