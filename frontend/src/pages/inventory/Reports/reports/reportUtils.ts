import brandLogo from '../../assets/logo.png';

export type ViewState = 'overview' | 'sales' | 'inventory' | 'supplier' | 'activity' | 'purchase' | 'alert';

export const downloadReport = (
  reportName: string,
  format: 'pdf' | 'excel' | 'csv' = 'csv',
  reportData?: { headers: string[], rows: (string | number)[][] }
) => {
  const headers = reportData?.headers || ['Product Ref', 'Category', 'Supermarket Description', 'Asset Value / Cost'];
  const rows = reportData?.rows || [
    ['INV-9823', 'Dairy', 'Fresh Milk 1L Procurement Reorder', 'Rs. 45,000.00'],
    ['INV-8823', 'Produce', 'Organic Avocados Stock Intake', 'Rs. 201,880.00'],
    ['INV-7721', 'Grocery', 'Ceylon Black Tea Consignment', 'Rs. 132,000.00'],
    ['INV-4412', 'Beverage', 'Spring Water Case Restocking', 'Rs. 84,900.00'],
    ['INV-1102', 'Bakery', 'Whole Wheat Bread Batch Audit', 'Rs. 22,000.00'],
  ];

  if (format === 'pdf') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName.replace(/_/g, ' ')}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #334155; margin: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #0b8252; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { display: flex; align-items: center; gap: 12px; }
          .logo-icon { background: #0b8252; color: white; width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 26px; }
          h1 { color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; }
          h2 { color: #0b8252; margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .meta { text-align: right; font-size: 11px; color: #64748b; line-height: 1.5; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .kpi-card { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; border-left: 4px solid #0b8252; }
          .kpi-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          .kpi-value { font-size: 18px; font-weight: bold; color: #0f172a; margin: 0; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th { background: #eef8f2; color: #0b8252; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: left; padding: 10px 14px; border-bottom: 2px solid #bbf7d0; }
          td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <img src="${brandLogo}" style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #e2e8f0; padding: 2px; background: #fff;" />
            <div>
              <h2>CHAMSON MULTI SHOP</h2>
              <h1>${reportName.replace(/_/g, ' ')}</h1>
            </div>
          </div>
          <div class="meta">
            <p><strong>Branch:</strong> Colombo 03 Branch</p>
            <p><strong>Business Reg:</strong> PV-00283921</p>
            <p><strong>TIN (18% VAT):</strong> 203928172</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-title">Report Period</div>
            <div class="kpi-value">Active Audit</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Total Records</div>
            <div class="kpi-value">${rows.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Currency Standard</div>
            <div class="kpi-value">LKR (Rs.)</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">Status</div>
            <div class="kpi-value">Verified</div>
          </div>
        </div>

        <h3>Detailed Data Breakdown</h3>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          &copy; ${new Date().getFullYear()} Chamson Multi Shop. This is a system-generated document.
        </div>
        <script>
          window.onload = () => { window.print(); };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return;
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  let content = csvContent;

  let filename = `${reportName.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.csv`;
  let type = 'text/csv;charset=utf-8;';

  const blob = new Blob([content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
