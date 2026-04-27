/**
 * receiptUtils.js
 * Generates printable/downloadable booking receipts for Car24.
 * Opens in a new browser tab with a print-optimized layout.
 */

const formatINR = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const formatDt = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

/**
 * Generates a complete HTML receipt page string.
 * @param {object} booking  - booking/task data object
 * @param {"user"|"owner"}  type - receipt type
 */
export function generateReceiptHTML(booking, type = "user") {
  const totalPrice = Number(booking.totalPrice || booking.total_price || booking.total_amount || 0);
  const advancePaid = Number(booking.advance_paid || booking.advancePaid || 0);
  const remaining = Number(booking.remaining_amount || (totalPrice - advancePaid) || 0);
  const carModel = booking.model || booking.car_model || booking.carModel || "N/A";
  const licensePlate =
    booking.licensePlate || booking.license_plate || booking.car_plate || "N/A";
  const pickupDate = booking.pickupDate || booking.pickup_date;
  const dropoffDate = booking.dropoffDate || booking.dropoff_date;
  const customerName =
    booking.customer_name || booking.customerName || "N/A";
  const customerPhone =
    booking.customer_phone || booking.customerPhone || "N/A";
  const bookingId = booking.id || booking.booking_id;
  const receiptNo = `CAR24-${String(bookingId).padStart(6, "0")}`;
  const isPaidFull = remaining <= 0;
  const status = (booking.status || booking.display_status || "pending").toLowerCase();
  const platformFee = Math.ceil(totalPrice * 0.0236);
  const ownerEarnings = totalPrice - platformFee;

  const statusColor =
    status === "completed"
      ? "#059669"
      : isPaidFull
      ? "#059669"
      : "#b45309";
  const statusBg =
    status === "completed"
      ? "rgba(5,150,105,0.1)"
      : isPaidFull
      ? "rgba(5,150,105,0.1)"
      : "rgba(180,83,9,0.1)";
  const statusLabel =
    status === "completed"
      ? "✓ Completed"
      : isPaidFull
      ? "✓ Fully Paid"
      : "⚠ Payment Pending";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Booking Receipt — ${receiptNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Inter', system-ui, sans-serif;
    background: #f0f4f8;
    padding: 24px;
    color: #1e293b;
  }
  .no-print {
    text-align: center;
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  .btn-print {
    padding: 10px 28px;
    background: linear-gradient(135deg, #14b8a6, #0d9488);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(20,184,166,0.35);
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-print:hover { background: linear-gradient(135deg, #0d9488, #0f766e); }
  .btn-close {
    padding: 10px 20px;
    background: #e2e8f0;
    color: #475569;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .receipt {
    max-width: 720px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  }
  .receipt-header {
    background: linear-gradient(135deg, #0c0f14 0%, #131820 100%);
    padding: 32px 36px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .receipt-logo { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
  .receipt-logo .accent { color: #14b8a6; }
  .receipt-tagline { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
  .receipt-type { font-size: 0.78rem; color: #14b8a6; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; font-weight: 600; }
  .receipt-no-block { text-align: right; }
  .receipt-no-block .no { display: block; font-size: 1.1rem; color: #14b8a6; font-weight: 700; font-family: monospace; }
  .receipt-no-block .date { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 4px; }
  .status-bar {
    padding: 14px 36px;
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    background: ${statusBg};
    color: ${statusColor};
    border-bottom: 1px solid ${statusColor}22;
  }
  .status-pill {
    padding: 3px 10px;
    border-radius: 999px;
    background: ${statusColor}22;
    border: 1px solid ${statusColor}44;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .receipt-body { padding: 32px 36px; }
  .section { margin-bottom: 28px; }
  .section-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #94a3b8;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-item label { display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 5px; }
  .info-item .val { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
  .info-item .val.accent { color: #14b8a6; }
  .info-item .val.code { font-family: 'Courier New', monospace; background: #f8fafc; padding: 3px 8px; border-radius: 5px; display: inline-block; border: 1px solid #e2e8f0; }
  .info-item .val.otp { font-family: 'Courier New', monospace; font-size: 1.1rem; color: #14b8a6; background: rgba(20,184,166,0.08); padding: 4px 12px; border-radius: 6px; display: inline-block; border: 1px solid rgba(20,184,166,0.2); letter-spacing: 0.2em; }
  .divider { border: none; border-top: 1px dashed #e2e8f0; margin: 24px 0; }
  .amount-wrap { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; }
  .amount-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 0.875rem; }
  .amount-row:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
  .amount-row .label { color: #64748b; }
  .amount-row .value { font-weight: 600; color: #1e293b; }
  .amount-row.paid .value { color: #059669; }
  .amount-row.remaining .value { color: #dc2626; }
  .amount-row.fee .value { color: #94a3b8; }
  .amount-row.total { padding-top: 14px; margin-top: 4px; border-top: 2px solid #e2e8f0 !important; }
  .amount-row.total .label { font-size: 1rem; font-weight: 700; color: #1e293b; }
  .amount-row.total .value { font-size: 1.2rem; color: #14b8a6; }
  .receipt-footer {
    padding: 20px 36px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .footer-note { font-size: 0.72rem; color: #94a3b8; line-height: 1.5; }
  .footer-brand { font-size: 0.85rem; font-weight: 700; color: #14b8a6; }
  .watermark-wrap { position: relative; }
  .watermark-wrap::after {
    content: '${isPaidFull ? "PAID" : "PENDING"}';
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-25deg);
    font-size: 6rem;
    font-weight: 900;
    color: ${isPaidFull ? "rgba(5,150,105,0.05)" : "rgba(245,158,11,0.05)"};
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }
  @media print {
    body { background: white; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; }
    .no-print { display: none !important; }
  }
  @media (max-width: 600px) {
    .info-grid { grid-template-columns: 1fr; }
    .receipt-header { flex-direction: column; gap: 16px; }
    .receipt-no-block { text-align: left; }
    body { padding: 12px; }
    .receipt-body { padding: 20px; }
    .receipt-header { padding: 24px 20px; }
  }
</style>
</head>
<body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨 Print / Save PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <div class="receipt">
    <!-- Header -->
    <div class="receipt-header">
      <div>
        <div class="receipt-logo"><span class="accent">Car</span>24</div>
        <div class="receipt-tagline">India's Trusted Car Rental Platform</div>
        <div class="receipt-type">${type === "owner" ? "Owner Earnings Receipt" : "Booking Confirmation Receipt"}</div>
      </div>
      <div class="receipt-no-block">
        <span class="no">${receiptNo}</span>
        <span class="date">Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
      ${statusLabel}
      <span class="status-pill">${(booking.status || "PENDING").toUpperCase()}</span>
    </div>

    <!-- Body -->
    <div class="receipt-body watermark-wrap">

      <!-- Booking Info -->
      <div class="section">
        <div class="section-label">Booking Details</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Booking ID</label>
            <span class="val code">#${bookingId}</span>
          </div>
          ${
            booking.confirmationNumber != null
              ? `<div class="info-item">
            <label>Confirmation OTP</label>
            <span class="val otp">${booking.confirmationNumber}</span>
          </div>`
              : `<div class="info-item">
            <label>Payment Status</label>
            <span class="val">${booking.payment_status || "N/A"}</span>
          </div>`
          }
          <div class="info-item">
            <label>Customer Name</label>
            <span class="val">${customerName}</span>
          </div>
          <div class="info-item">
            <label>Customer Phone</label>
            <span class="val">${customerPhone}</span>
          </div>
        </div>
      </div>

      <!-- Vehicle Info -->
      <div class="section">
        <div class="section-label">Vehicle Details</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Car Model</label>
            <span class="val">${carModel}</span>
          </div>
          <div class="info-item">
            <label>License Plate</label>
            <span class="val code">${licensePlate}</span>
          </div>
          <div class="info-item">
            <label>Fuel Type</label>
            <span class="val">${booking.fuelType || booking.fuel_type || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Branch</label>
            <span class="val">${
              booking.branch_name
                ? `${booking.branch_name}${booking.branch_city ? ", " + booking.branch_city : ""}`
                : "N/A"
            }</span>
          </div>
        </div>
      </div>

      <!-- Rental Period -->
      <div class="section">
        <div class="section-label">Rental Period</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Pickup Date &amp; Time</label>
            <span class="val">${formatDt(pickupDate)}</span>
          </div>
          <div class="info-item">
            <label>Return Date &amp; Time</label>
            <span class="val">${formatDt(dropoffDate)}</span>
          </div>
        </div>
      </div>

      <hr class="divider">

      <!-- Payment Summary -->
      <div class="section">
        <div class="section-label">Payment Summary</div>
        <div class="amount-wrap">
          <div class="amount-row">
            <span class="label">Rental Amount</span>
            <span class="value">${formatINR(totalPrice)}</span>
          </div>
          <div class="amount-row paid">
            <span class="label">Advance Paid</span>
            <span class="value">${formatINR(advancePaid)}</span>
          </div>
          ${
            remaining > 0
              ? `<div class="amount-row remaining">
            <span class="label">Remaining Balance</span>
            <span class="value">${formatINR(remaining)}</span>
          </div>`
              : ""
          }
          ${
            type === "owner"
              ? `<div class="amount-row fee">
            <span class="label">Platform Fee (2.36%)</span>
            <span class="value">− ${formatINR(platformFee)}</span>
          </div>
          <div class="amount-row total">
            <span class="label">Owner Earnings</span>
            <span class="value">${formatINR(ownerEarnings)}</span>
          </div>`
              : `<div class="amount-row total">
            <span class="label">Total Amount</span>
            <span class="value">${formatINR(totalPrice)}</span>
          </div>`
          }
        </div>
      </div>

    </div><!-- /receipt-body -->

    <!-- Footer -->
    <div class="receipt-footer">
      <div class="footer-note">
        This is a computer-generated receipt. No physical signature required.<br>
        For support: support@car24.in &nbsp;|&nbsp; +91 628 170 4664
      </div>
      <div class="footer-brand">Car24 India</div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens a new tab with a printable receipt.
 * @param {object} booking
 * @param {"user"|"owner"} type
 */
export function printBookingReceipt(booking, type = "user") {
  const html = generateReceiptHTML(booking, type);
  const win = window.open("", "_blank", "width=820,height=900,menubar=no,toolbar=no");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
  } else {
    alert("Popup blocked. Please allow pop-ups to download the receipt.");
  }
}
