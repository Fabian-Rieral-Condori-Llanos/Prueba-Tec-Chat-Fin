"use client";

export function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
        <p className="text-gray-600 mt-1">Control who can see your information</p>
      </div>

      <div className="space-y-4">
        {[
          { title: "Profile Picture", options: ["Everyone", "Contacts", "Nobody"] },
          { title: "Last Seen", options: ["Everyone", "Contacts", "Nobody"] },
          { title: "Phone Number", options: ["Everyone", "Contacts", "Nobody"] },
        ].map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{item.title}</h3>
            <div className="space-y-2">
              {item.options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={item.title}
                    defaultChecked={option === "Contacts"}
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}