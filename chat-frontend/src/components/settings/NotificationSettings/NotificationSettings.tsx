"use client";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Notification Settings
        </h2>
        <p className="text-gray-600 mt-1">
          Manage how you receive notifications
        </p>
      </div>

      <div className="space-y-4">
        {[
          {
            title: "Message Notifications",
            description: "Get notified when you receive new messages",
          },
          {
            title: "Contact Requests",
            description: "Get notified when someone wants to add you",
          },
          {
            title: "Group Invites",
            description: "Get notified when you're invited to a group",
          },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}