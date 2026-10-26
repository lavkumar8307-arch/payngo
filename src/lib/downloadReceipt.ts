export interface ReceiptData {
  orderId: string;
  tripId?: string;
  placeName: string;
  travelerName?: string;
  travelerEmail?: string;
  amountINR?: number;
  amountUSD: number;
  bookingDate?: string;
  travelDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  routeCode?: string;
  flightOrTrainNo?: string;
  paymentMethod?: string;
  status?: string;
}

export function downloadReceipt(data: ReceiptData) {
  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PayNGo Receipt - ${data.orderId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f1f5f9;
      display: flex;
      justify-content: center;
      padding: 40px 20px;
      color: #0f172a;
    }
    .receipt {
      background: #fff;
      width: 520px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #0c4a6e 55%, #0f172a 100%);
      padding: 32px 28px 28px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -60px; right: -60px;
      width: 200px; height: 200px;
      border-radius: 50%;
      background: rgba(56,189,248,0.08);
    }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; position: relative; z-index: 1; }
    .brand-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #0ea5e9, #38bdf8);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .brand-name { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
    .brand-tag { font-size: 10px; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; }
    .receipt-label { font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; position: relative; z-index: 1; }
    .receipt-title { font-size: 22px; font-weight: 900; color: white; position: relative; z-index: 1; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4);
      color: #34d399; font-size: 11px; font-weight: 700;
      padding: 4px 12px; border-radius: 99px; margin-top: 12px;
      position: relative; z-index: 1;
    }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; }
    .body { padding: 28px; }
    .amount-block {
      background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
      border: 1px solid #bbf7d0;
      border-radius: 16px; padding: 20px 24px;
      text-align: center; margin-bottom: 24px;
    }
    .amount-label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    .amount-val { font-size: 38px; font-weight: 900; color: #065f46; letter-spacing: -1px; }
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }
    .info-key { color: #64748b; font-weight: 500; }
    .info-val { color: #0f172a; font-weight: 700; text-align: right; max-width: 62%; }
    .info-val.mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0369a1; }
    .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 20px 0; }
    .route-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 20px; }
    .route-row { display: flex; justify-content: space-between; align-items: center; }
    .route-code { font-size: 20px; font-weight: 900; }
    .route-sub { font-size: 10px; color: #94a3b8; font-weight: 500; margin-top: 2px; }
    .route-arrow { flex: 1; text-align: center; color: #94a3b8; font-size: 16px; }
    .route-flight { margin-top: 10px; font-size: 12px; color: #64748b; font-weight: 600; }
    .qr-area { text-align: center; padding: 20px 0; }
    .qr-img { width: 110px; height: 110px; border: 2px solid #e2e8f0; border-radius: 14px; padding: 6px; }
    .qr-label { font-size: 10px; color: #94a3b8; font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }
    .print-btn {
      display: block; width: 100%; margin-top: 20px;
      padding: 14px; background: linear-gradient(135deg, #0369a1, #0284c7);
      color: white; font-size: 14px; font-weight: 700;
      border: none; border-radius: 14px; cursor: pointer;
    }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; }
    .footer-text { font-size: 11px; color: #94a3b8; line-height: 1.7; }
    .footer-text strong { color: #64748b; }
    .generated { font-size: 10px; color: #cbd5e1; margin-top: 8px; }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; width: 100%; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">✈️</div>
        <div>
          <div class="brand-name">PayNGo</div>
          <div class="brand-tag">Intelligent Travel Platform</div>
        </div>
      </div>
      <div class="receipt-label">Official Payment Receipt</div>
      <div class="receipt-title">${data.placeName}</div>
      <div class="badge"><div class="dot"></div>${data.status || 'PAYMENT CONFIRMED'}</div>
    </div>

    <div class="body">
      <div class="amount-block">
        <div class="amount-label">Total Amount Paid</div>
        <div class="amount-val">₹${(data.amountINR || Math.round(data.amountUSD * 83.2)).toLocaleString('en-IN')}</div>
      </div>

      <div class="section-label">Transaction Details</div>
      <div class="info-row">
        <span class="info-key">PayPal Order ID</span>
        <span class="info-val mono">${data.orderId}</span>
      </div>
      ${data.tripId ? `<div class="info-row"><span class="info-key">Booking Reference</span><span class="info-val mono">${data.tripId}</span></div>` : ''}
      <div class="info-row">
        <span class="info-key">Payment Method</span>
        <span class="info-val">${data.paymentMethod || 'PayPal'}</span>
      </div>
      <div class="info-row">
        <span class="info-key">Booking Date</span>
        <span class="info-val">${data.bookingDate || now}</span>
      </div>
      ${data.travelDate ? `<div class="info-row"><span class="info-key">Travel Date</span><span class="info-val">${data.travelDate}</span></div>` : ''}

      <hr class="divider" />

      ${data.travelerName ? `
      <div class="section-label">Traveler Details</div>
      <div class="info-row"><span class="info-key">Name</span><span class="info-val">${data.travelerName}</span></div>
      ${data.travelerEmail ? `<div class="info-row"><span class="info-key">Email</span><span class="info-val">${data.travelerEmail}</span></div>` : ''}
      <hr class="divider" />
      ` : ''}

      ${(data.routeCode || data.flightOrTrainNo) ? `
      <div class="section-label">Journey Details</div>
      <div class="route-block">
        ${data.routeCode ? `<div class="route-row">
          <div><div class="route-code">${data.routeCode.split('➔')[0]?.trim() || ''}</div><div class="route-sub">${data.departureTime || ''}</div></div>
          <div class="route-arrow">✈ ──</div>
          <div style="text-align:right"><div class="route-code">${data.routeCode.split('➔')[1]?.trim() || ''}</div><div class="route-sub">${data.arrivalTime || ''}</div></div>
        </div>` : ''}
        ${data.flightOrTrainNo ? `<div class="route-flight">${data.flightOrTrainNo}</div>` : ''}
      </div>
      ` : ''}

      <div class="qr-area">
        <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PAYNGO-${data.orderId}" alt="QR Code" />
        <div class="qr-label">Scan at Venue / Gate</div>
      </div>

      <button class="print-btn" onclick="window.print()">🖨️ &nbsp; Save as PDF / Print Receipt</button>
    </div>

    <div class="footer">
      <div class="footer-text">
        <strong>PayNGo Technologies Pvt. Ltd.</strong><br/>
        This is a computer-generated receipt and does not require a signature.<br/>
        For support: <strong>support@payngo.app</strong>
      </div>
      <div class="generated">Generated on ${now} &nbsp;|&nbsp; payngo.vercel.app</div>
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=620,height=900,scrollbars=yes');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
