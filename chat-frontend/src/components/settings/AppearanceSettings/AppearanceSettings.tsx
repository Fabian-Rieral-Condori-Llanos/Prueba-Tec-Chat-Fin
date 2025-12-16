"use client";

export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Appearance Settings
        </h2>
        <p className="text-gray-600 mt-1">Customize how ChatApp looks</p>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Theme</h3>
          <div className="grid grid-cols-3 gap-3">
            {["Light", "Dark", "Auto"].map((theme) => (
              <button
                key={theme}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 transition"
              >
                <div className="text-center">
                  <div className={`h-12 w-12 rounded-full mx-auto mb-2 ${
                    theme === "Light" ? "bg-white border-2 border-gray-300" :
                    theme === "Dark" ? "bg-gray-900" :
                    "bg-gradient-to-br from-white to-gray-900"
                  }`}></div>
                  <span className="text-sm font-medium">{theme}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Font Size</h3>
          <input type="range" min="12" max="20" defaultValue="16" className="w-full" />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>
      </div>
    </div>
  );
}