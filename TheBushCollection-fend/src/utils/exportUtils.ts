import { Booking } from '@/hooks/useBookings';

// Updated CSV Export Function to work with AdminBookings structure
export const exportToCSV = (bookings: any[], filename: string = 'bookings-export') => {
  if (!bookings || bookings.length === 0) {
    alert('No bookings to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Booking ID',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Property Name',
    'Room Name',
    'Check-in Date',
    'Check-out Date',
    'Nights',
    'Guests',
    'Total Amount',
    'Deposit Paid',
    'Balance Due',
    'Status',
    'Special Requests',
    'Booking Date'
  ];

  // Convert bookings to CSV rows
  const csvRows = bookings.map(booking => [
    booking.id,
    booking.customerName,
    booking.customerEmail,
    booking.customerPhone || '',
    booking.propertyName,
    booking.roomName || 'Standard Room',
    new Date(booking.checkIn).toLocaleDateString(),
    new Date(booking.checkOut).toLocaleDateString(),
    booking.nights,
    booking.guests,
    `$${booking.total?.toFixed(2) || '0.00'}`,
    `$${booking.depositPaid?.toFixed(2) || '0.00'}`,
    `$${booking.balanceDue?.toFixed(2) || '0.00'}`,
    booking.status,
    booking.specialRequests || '',
    new Date(booking.createdAt).toLocaleDateString()
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export Function
export const exportToPDF = (bookings: any[], filename: string = 'bookings-report') => {
  if (!bookings || bookings.length === 0) {
    alert('No bookings to export');
    return;
  }

  // Calculate summary statistics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'inquiry').length; // Map inquiry to pending for display
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  // Calculate actual revenue (only paid amounts, including completed bookings that were previously paid)
  const totalRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === 'deposit-paid') {
      return sum + (booking.depositPaid || 0);
    } else if (booking.status === 'fully-paid') {
      return sum + (booking.total || 0);
    } else if (booking.status === 'completed') {
      // For completed bookings, include the amount that was actually paid
      if (booking.depositPaid && booking.depositPaid > 0) {
        return sum + (booking.depositPaid || 0);
      } else {
        return sum + (booking.total || 0);
      }
    }
    return sum;
  }, 0);

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>The Bush Collections Bookings Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #4CAF50;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #4CAF50;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .number {
          font-size: 24px;
          font-weight: bold;
          color: #4CAF50;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #4CAF50;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.confirmed {
          background-color: #d4edda;
          color: #155724;
        }
        .status.inquiry {
          background-color: #fff3cd;
          color: #856404;
        }
        .status.deposit-paid {
          background-color: #e9d5ff;
          color: #7c3aed;
        }
        .status.fully-paid {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status.completed {
          background-color: #f3f4f6;
          color: #374151;
        }
        .status.cancelled {
          background-color: #f8d7da;
          color: #721c24;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>The Bush Collections Bookings Report</h1>
        <p>Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>Total Records: ${totalBookings}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="number">${totalBookings}</div>
          <div class="label">Total Bookings</div>
        </div>
        <div class="summary-item">
          <div class="number">${confirmedBookings}</div>
          <div class="label">Confirmed</div>
        </div>
        <div class="summary-item">
          <div class="number">${pendingBookings}</div>
          <div class="label">Pending</div>
        </div>
        <div class="summary-item">
          <div class="number">$${totalRevenue.toFixed(2)}</div>
          <div class="label">Revenue Received</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Property</th>
            <th>Check-in</th>
            <th>Nights</th>
            <th>Guests</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
            <th>Booked</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr>
              <td>#${booking.id}</td>
              <td>
                <strong>${booking.customerName}</strong><br>
                <small>${booking.customerEmail}</small>
              </td>
              <td>${booking.propertyName}</td>
              <td>${new Date(booking.checkIn).toLocaleDateString()}</td>
              <td>${booking.nights}</td>
              <td>${booking.guests}</td>
              <td><strong>$${booking.total?.toFixed(2) || '0.00'}</strong></td>
              <td><strong>$${booking.depositPaid?.toFixed(2) || '0.00'}</strong></td>
              <td><strong>$${booking.balanceDue?.toFixed(2) || '0.00'}</strong></td>
              <td><span class="status ${booking.status}">${booking.status}</span></td>
              <td>${new Date(booking.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was generated automatically by The Bushh Collection Booking Management System.</p>
        <p>For questions or support, please contact the system administrator.</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  } else {
    alert('Please allow popups to export PDF reports');
  }
};

// Get export statistics
export const getExportStats = (bookings: any[]) => {
  const total = bookings.length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const pending = bookings.filter(b => b.status === 'inquiry').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const depositPaid = bookings.filter(b => b.status === 'deposit-paid').length;
  const fullyPaid = bookings.filter(b => b.status === 'fully-paid').length;

  // Calculate actual revenue received (including completed bookings that were previously paid)
  const totalRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === 'deposit-paid') {
      return sum + (booking.depositPaid || 0);
    } else if (booking.status === 'fully-paid') {
      return sum + (booking.total || 0);
    } else if (booking.status === 'completed') {
      // For completed bookings, include the amount that was actually paid
      if (booking.depositPaid && booking.depositPaid > 0) {
        return sum + (booking.depositPaid || 0);
      } else {
        return sum + (booking.total || 0);
      }
    }
    return sum;
  }, 0);

  return {
    total,
    confirmed,
    pending,
    cancelled,
    depositPaid,
    fullyPaid,
    totalRevenue
  };
};

// Arrivals/Departures Export Types
interface GuestMovement {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  type: 'arrival' | 'departure';
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'delayed';
  transferType?: 'airport' | 'inter-camp' | 'self-drive';
  contactInfo: {
    phone?: string;
    email?: string;
  };
  adults: number;
  children: number;
  flightNumber?: string;
  specialRequests?: string;
}

// CSV Export for Arrivals/Departures
export const exportMovementsToCSV = (movements: GuestMovement[], type: 'arrivals' | 'departures' | 'all', dateRange: string) => {
  if (!movements || movements.length === 0) {
    alert('No movements to export');
    return;
  }

  // Filter by type if specified
  const filteredMovements = type === 'all' ? movements : movements.filter(m => 
    type === 'arrivals' ? m.type === 'arrival' : m.type === 'departure'
  );

  // Define CSV headers
  const headers = [
    'Type',
    'Guest Name',
    'Property',
    'Room',
    'Date',
    'Time',
    'Adults',
    'Children',
    'Total Guests',
    'Transfer Type',
    'Flight Number',
    'Phone',
    'Email',
    'Status',
    'Special Requests'
  ];

  // Convert movements to CSV rows
  const csvRows = filteredMovements.map(movement => [
    movement.type.charAt(0).toUpperCase() + movement.type.slice(1),
    movement.guestName,
    movement.propertyName,
    movement.roomName,
    new Date(movement.date).toLocaleDateString(),
    movement.time,
    movement.adults,
    movement.children,
    movement.adults + movement.children,
    movement.transferType || 'N/A',
    movement.flightNumber || 'N/A',
    movement.contactInfo.phone || 'N/A',
    movement.contactInfo.email || 'N/A',
    movement.status,
    movement.specialRequests || 'None'
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = `${type}-${dateRange}-${new Date().toISOString().split('T')[0]}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export for Arrivals/Departures
export const exportMovementsToPDF = (movements: GuestMovement[], type: 'arrivals' | 'departures' | 'all', dateRange: string) => {
  if (!movements || movements.length === 0) {
    alert('No movements to export');
    return;
  }

  // Filter by type if specified
  const filteredMovements = type === 'all' ? movements : movements.filter(m => 
    type === 'arrivals' ? m.type === 'arrival' : m.type === 'departure'
  );

  const arrivals = filteredMovements.filter(m => m.type === 'arrival');
  const departures = filteredMovements.filter(m => m.type === 'departure');
  const totalGuests = filteredMovements.reduce((sum, m) => sum + m.adults + m.children, 0);
  const airportTransfers = filteredMovements.filter(m => m.transferType === 'airport').length;

  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Arrivals & Departures Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #5C3B22;
          margin: 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
          .header img {
                max-width: 100px; 
                height: auto;
                margin-bottom: 10px; 
            }
        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 30px;
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .number {
          font-size: 24px;
          font-weight: bold;
          color: #758774;
        }
        .summary-item .label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #A19B5C;
          margin: 20px 0 10px 0;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #2563eb;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .status {
          padding: 3px 6px;
          border-radius: 3px;
          font-size: 9px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status.completed {
          background-color: #d4edda;
          color: #155724;
        }
        .status.pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status.delayed {
          background-color: #f8d7da;
          color: #721c24;
        }
        .transfer-badge {
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 9px;
          background-color: #e0e7ff;
          color: #3730a3;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
       <img src="/images/PNG-LOGO (1).png" alt="Logo">
        <h1>Arrivals & Departures Report</h1>
        <p><strong>${dateRange}</strong></p>
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="number">${arrivals.length}</div>
          <div class="label">Arrivals</div>
        </div>
        <div class="summary-item">
          <div class="number">${departures.length}</div>
          <div class="label">Departures</div>
        </div>
        <div class="summary-item">
          <div class="number">${totalGuests}</div>
          <div class="label">Total Guests</div>
        </div>
        <div class="summary-item">
          <div class="number">${airportTransfers}</div>
          <div class="label">Airport Transfers</div>
        </div>
      </div>

      ${type === 'all' || type === 'arrivals' ? `
        <div class="section-title">Arrivals (${arrivals.length})</div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Guest Name</th>
              <th>Property</th>
              <th>Room</th>
              <th>Guests</th>
              <th>Transfer</th>
              <th>Flight</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${arrivals.map(movement => `
              <tr>
                <td><strong>${movement.time}</strong></td>
                <td>${movement.guestName}</td>
                <td>${movement.propertyName}</td>
                <td>${movement.roomName}</td>
                <td>${movement.adults}A + ${movement.children}C</td>
                <td><span class="transfer-badge">${movement.transferType || 'Self'}</span></td>
                <td>${movement.flightNumber || '-'}</td>
                <td>${movement.contactInfo.phone || movement.contactInfo.email || '-'}</td>
                <td><span class="status ${movement.status}">${movement.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${type === 'all' || type === 'departures' ? `
        <div class="section-title">Departures (${departures.length})</div>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Guest Name</th>
              <th>Property</th>
              <th>Room</th>
              <th>Guests</th>
              <th>Transfer</th>
              <th>Flight</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${departures.map(movement => `
              <tr>
                <td><strong>${movement.time}</strong></td>
                <td>${movement.guestName}</td>
                <td>${movement.propertyName}</td>
                <td>${movement.roomName}</td>
                <td>${movement.adults}A + ${movement.children}C</td>
                <td><span class="transfer-badge">${movement.transferType || 'Self'}</span></td>
                <td>${movement.flightNumber || '-'}</td>
                <td>${movement.contactInfo.phone || movement.contactInfo.email || '-'}</td>
                <td><span class="status ${movement.status}">${movement.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        <p>This report was generated automatically by the The Bush Collection Management System.</p>
        <p>For questions or support, please contact the system administrator.</p>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  } else {
    alert('Please allow popups to export PDF reports');
  }
};