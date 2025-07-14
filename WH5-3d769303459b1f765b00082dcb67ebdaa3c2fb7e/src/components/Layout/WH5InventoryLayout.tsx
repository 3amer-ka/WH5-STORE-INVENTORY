import * as React from "react";

export default function WH5InventoryLayout(): React.JSX.Element {
  return (
    <div className="flex min-h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-16 bg-gray-900 text-white flex flex-col items-center py-4 space-y-6">
        <Icon label="🏠" />
        <Icon label="📦" />
        <Icon label="🗂" />
        <Icon label="🚚" />
        <Icon label="📊" />
        <Icon label="⚙️" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 p-6">
        <header className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search items..."
            className="border px-4 py-2 rounded w-full max-w-md"
          />
          <div className="flex space-x-2">
            <button className="bg-green-600 text-white px-4 py-2 rounded">Add Item</button>
            <button className="bg-black text-white px-4 py-2 rounded">Scan QR</button>
          </div>
        </header>

        {/* Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Widget title="Recent Activity Log" />
          <Widget title="AI Assistant" />
          <Widget title="Latest Waybills Summary" />
        </section>
      </main>
    </div>
  );
}

function Icon({ label }: { label: string }): React.JSX.Element {
  return <div className="text-2xl hover:text-green-400 cursor-pointer">{label}</div>;
}

function Widget({ title }: { title: string }): React.JSX.Element {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="text-gray-500 text-sm">Widget content here...</div>
    </div>
  );
}
