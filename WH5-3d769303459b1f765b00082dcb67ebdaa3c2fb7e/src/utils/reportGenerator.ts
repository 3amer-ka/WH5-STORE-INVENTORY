/**
 * Report generation utilities using native browser APIs
 */

/**
 * Generate a printable daily activity report
 */
export const generateDailyReport = (activities: any[], userInfo: any) => {
  const today = new Date();
  const todayActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    return activityDate.toDateString() === today.toDateString();
  });

  const stats = {
    total: todayActivities.length,
    create: todayActivities.filter(a => a.type === 'create').length,
    update: todayActivities.filter(a => a.type === 'update').length,
    delete: todayActivities.filter(a => a.type === 'delete').length,
    scan: todayActivities.filter(a => a.type === 'scan').length
  };

  const reportHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>WH5 Construction Store - Daily Activity Report</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #059669; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #059669; 
            margin-bottom: 10px;
          }
          .subtitle { 
            color: #666; 
            margin: 5px 0; 
            font-size: 16px;
          }
          .stats-container { 
            margin: 30px 0; 
          }
          .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 20px; 
            margin: 20px 0; 
          }
          .stat-item { 
            text-align: center; 
            padding: 15px; 
            border: 2px solid #059669; 
            border-radius: 8px; 
            background: #f8f9fa;
          }
          .stat-value { 
            font-size: 32px; 
            font-weight: bold; 
            color: #059669; 
          }
          .stat-label { 
            font-size: 14px; 
            color: #666; 
            margin-top: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 30px; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #059669; 
            color: white; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f2f2f2; 
          }
          .activity-create { color: #059669; font-weight: bold; }
          .activity-update { color: #3B82F6; font-weight: bold; }
          .activity-delete { color: #EF4444; font-weight: bold; }
          .activity-scan { color: #8B5CF6; font-weight: bold; }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            font-size: 12px; 
            color: #666; 
          }
          .no-activity { 
            text-align: center; 
            padding: 40px; 
            color: #666; 
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">WH5 CONSTRUCTION STORE</div>
          <div class="subtitle">INVENTORY MANAGEMENT SYSTEM</div>
          <div class="subtitle">Daily Activity Report</div>
          <div class="subtitle">Report Date: ${today.toLocaleDateString()}</div>
          <div class="subtitle">Generated: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}</div>
        </div>
        
        <div class="stats-container">
          <h2 style="color: #059669; margin-bottom: 20px;">Daily Summary</h2>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${stats.total}</div>
              <div class="stat-label">Total Activities</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.create}</div>
              <div class="stat-label">Items Created</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.update}</div>
              <div class="stat-label">Items Updated</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.delete}</div>
              <div class="stat-label">Items Deleted</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${stats.scan}</div>
              <div class="stat-label">Scans/Logins</div>
            </div>
          </div>
        </div>

        <h2 style="color: #059669; margin-bottom: 20px;">Activity Details</h2>
        
        ${todayActivities.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Description</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              ${todayActivities.map(activity => `
                <tr>
                  <td>${new Date(activity.timestamp).toLocaleTimeString()}</td>
                  <td class="activity-${activity.type}">${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</td>
                  <td>${activity.description}</td>
                  <td>${userInfo?.name || 'System'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<div class="no-activity">No activities recorded for today.</div>'}

        <div class="footer">
          <p><strong>WH5 Construction Store - Inventory Management System</strong></p>
          <p>Report generated on ${today.toLocaleDateString()} | Page 1 of 1</p>
          <p>© 2024 WH5 Construction Store. All rights reserved.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;

  return reportHTML;
};

/**
 * Export data as downloadable file
 */
export const exportToJSON = (data: any, filename: string) => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Generate CSV report
 */
export const generateCSVReport = (activities: any[]) => {
  const headers = ['Date', 'Time', 'Type', 'Description', 'User'];
  const csvContent = [
    headers.join(','),
    ...activities.map(activity => [
      new Date(activity.timestamp).toLocaleDateString(),
      new Date(activity.timestamp).toLocaleTimeString(),
      activity.type,
      `"${activity.description.replace(/"/g, '""')}"`,
      activity.userId || 'System'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `activity-report-${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
};
