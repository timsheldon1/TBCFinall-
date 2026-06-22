import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

type SafariBooking = {
  id: string;
  check_in: string;
  check_out: string;
  status?: string;
  created_at?: string;
  total_amount?: number;
};

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  days_before_checkin: number;
  refund_percentage: number;
  processing_fee: number;
  is_active: boolean;
}

export interface CancellationRequest {
  booking_id: string;
  reason: string;
  requested_by: string;
  cancellation_date: string;
  refund_amount: number;
  processing_fee: number;
  totalRefund: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_notes?: string;
}

export const useBookingCancellation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default cancellation policies
  const defaultPolicies: CancellationPolicy[] = [
    {
      id: 'free-24h',
      name: 'Free Cancellation (24 hours)',
      description: 'Cancel within 24 hours of booking for full refund',
      days_before_checkin: 999,
      refund_percentage: 100,
      processing_fee: 0,
      is_active: true
    },
    {
      id: 'standard-7d',
      name: 'Standard Cancellation (7+ days)',
      description: 'Cancel 7 or more days before check-in for 75% refund',
      days_before_checkin: 7,
      refund_percentage: 75,
      processing_fee: 25,
      is_active: true
    },
    {
      id: 'late-2d',
      name: 'Late Cancellation (2-7 days)',
      description: 'Cancel 2-7 days before check-in for 50% refund',
      days_before_checkin: 2,
      refund_percentage: 50,
      processing_fee: 50,
      is_active: true
    },
    {
      id: 'no-refund-48h',
      name: 'No Refund (Less than 48 hours)',
      description: 'Cancel less than 48 hours before check-in - no refund',
      days_before_checkin: 0,
      refund_percentage: 0,
      processing_fee: 100,
      is_active: true
    }
  ];

  // Calculate refund amount based on cancellation timing
  const calculateRefund = (booking: SafariBooking, cancellationDate: Date = new Date()): Promise<{
    refundAmount: number;
    processingFee: number;
    totalRefund: number;
    policy: CancellationPolicy;
  }> => {
    return new Promise((resolve) => {
      const checkInDate = new Date(booking.check_in);
      const bookingDate = new Date(booking.created_at);
      const hoursSinceBooking = (cancellationDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);
      const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24));

      let applicablePolicy = defaultPolicies[0]; // Default to free cancellation

      // Check if within 24 hours of booking (always free)
      if (hoursSinceBooking <= 24) {
        applicablePolicy = defaultPolicies[0];
      }
      // Check other policies based on days until check-in
      else {
        for (const policy of defaultPolicies.slice(1)) {
          if (daysUntilCheckIn >= policy.days_before_checkin) {
            applicablePolicy = policy;
            break;
          }
        }
      }

      const refundAmount = (booking.total_amount || 0) * (applicablePolicy.refund_percentage / 100);
      const processingFee = applicablePolicy.processing_fee;
      const totalRefund = Math.max(0, refundAmount - processingFee);

      resolve({
        refundAmount,
        processingFee,
        totalRefund,
        policy: applicablePolicy
      });
    });
  };

  // Check if booking can be cancelled
  const canCancelBooking = (booking: SafariBooking, currentDate: Date = new Date()): boolean => {
    // Can't cancel if already cancelled
    if (booking.status === 'cancelled') return false;

    // Can't cancel if check-in has passed
    if (currentDate >= new Date(booking.check_in)) return false;

    // Can't cancel if check-out has passed
    if (currentDate >= new Date(booking.check_out)) return false;

    return true;
  };

  // Request booking cancellation (requires admin approval)
  const requestCancellation = async (
    bookingId: string,
    reason: string,
    requestedBy: string,
    customerEmail: string
  ): Promise<{ success: boolean; message: string; requestId: string }> => {
    try {
      setLoading(true);

      // Get booking details from backend
      const { data: booking } = await api.get(`/bookings/booking-confirmation/${bookingId}`);
      if (!booking) throw new Error('Booking not found');

      // Check if cancellation is allowed
      if (!canCancelBooking(booking)) {
        throw new Error('This booking cannot be cancelled');
      }

      // Calculate refund
  const refundCalculation = await calculateRefund(booking as SafariBooking);

      // Create cancellation request record
      const cancellationRequest: CancellationRequest = {
        booking_id: bookingId,
        reason,
        requested_by: requestedBy,
        cancellation_date: new Date().toISOString(),
        refund_amount: refundCalculation.refundAmount,
        processing_fee: refundCalculation.processingFee,
        totalRefund: refundCalculation.totalRefund,
        status: 'pending'
      };

      // Store cancellation request
      const existingRequests = JSON.parse(localStorage.getItem('cancellation-requests') || '[]');
      existingRequests.push(cancellationRequest);
      localStorage.setItem('cancellation-requests', JSON.stringify(existingRequests));

      // TODO: Send email notification to user (request submitted)
      // await sendUserCancellationRequestEmail(booking, cancellationRequest, customerEmail);

      // TODO: Send email notification to admin (new request to review)
      // await sendAdminCancellationRequestEmail(booking, cancellationRequest);

      toast.success('Cancellation request submitted successfully. You will receive an email confirmation.');

      return {
        success: true,
        message: 'Cancellation request submitted for review',
        requestId: `req_${Date.now()}`
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit cancellation request';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
        requestId: ''
      };
    } finally {
      setLoading(false);
    }
  };

  // Keep the old function for backward compatibility but mark as deprecated
  const cancelBooking = async (
    bookingId: string,
    reason: string,
    requestedBy: string
  ): Promise<{ success: boolean; refundAmount: number; message: string }> => {
    // Redirect to request cancellation
    const result = await requestCancellation(bookingId, reason, requestedBy, '');
    if (result.success) {
      const refundCalculation = await calculateRefund(await getBooking(bookingId));
      return {
        success: true,
        refundAmount: refundCalculation.totalRefund,
        message: `Cancellation request submitted. ${refundCalculation.policy.name} applied.`
      };
    }
    return {
      success: false,
      refundAmount: 0,
      message: result.message
    };
  };

  // Helper function to get booking details
  const getBooking = async (bookingId: string) => {
    const res = await api.get(`/bookings/booking-confirmation/${bookingId}`);
    if (!res.data) throw new Error('Booking not found');
    return res.data;
  };
  const getCancellationHistory = (userId: string): CancellationRequest[] => {
    try {
      const requests = JSON.parse(localStorage.getItem('cancellation-requests') || '[]');
      return requests.filter((req: CancellationRequest) => req.requested_by === userId);
    } catch {
      return [];
    }
  };

  // Admin functions - Get all cancellation requests
  const getAllCancellationRequests = (): CancellationRequest[] => {
    try {
      return JSON.parse(localStorage.getItem('cancellation-requests') || '[]');
    } catch {
      return [];
    }
  };

  // Admin function - Approve cancellation request
  const approveCancellationRequest = async (
    requestIndex: number,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const requests = getAllCancellationRequests();
      if (requestIndex >= requests.length) {
        throw new Error('Request not found');
      }

      const request = requests[requestIndex];
      if (request.status !== 'pending') {
        throw new Error('Request has already been processed');
      }

      // Get booking details for email
      const booking = await getBooking(request.booking_id);

      // Update request status
      request.status = 'approved';
      request.admin_notes = adminNotes || '';
      request.totalRefund = request.totalRefund || request.refund_amount - request.processing_fee;

      // Save updated requests
      localStorage.setItem('cancellation-requests', JSON.stringify(requests));

      // TODO: Send approval email to user
      // await sendUserCancellationApprovalEmail(booking, request);

      toast.success('Cancellation request approved successfully');

      return {
        success: true,
        message: 'Cancellation request approved'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Admin function - Deny cancellation request
  const denyCancellationRequest = async (
    requestIndex: number,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const requests = getAllCancellationRequests();
      if (requestIndex >= requests.length) {
        throw new Error('Request not found');
      }

      const request = requests[requestIndex];
      if (request.status !== 'pending') {
        throw new Error('Request has already been processed');
      }

      // Get booking details for email
      const booking = await getBooking(request.booking_id);

      // Update request status
      request.status = 'rejected';
      request.admin_notes = adminNotes || '';
      request.totalRefund = 0;

      // Save updated requests
      localStorage.setItem('cancellation-requests', JSON.stringify(requests));

      // TODO: Send denial email to user
      // await sendUserCancellationDenialEmail(booking, request);

      toast.success('Cancellation request denied');

      return {
        success: true,
        message: 'Cancellation request denied'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny request';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Admin function - Process approved cancellation (mark as processed)
  const processCancellationRequest = async (
    requestIndex: number,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true);

      const requests = getAllCancellationRequests();
      if (requestIndex >= requests.length) {
        throw new Error('Request not found');
      }

      const request = requests[requestIndex];
      if (request.status !== 'approved') {
        throw new Error('Only approved requests can be processed');
      }

      // Get booking details
      const booking = await getBooking(request.booking_id);

      // Update booking status to cancelled
      // Use admin endpoint to cancel booking and include the original reason and any admin notes
      await api.post(`/bookings/admin/bookings/${request.booking_id}/cancel`, {
        reason: request.reason,
        admin_notes: adminNotes || request.admin_notes || ''
      });

      // Update request status to processed
      request.status = 'processed';
      if (adminNotes) {
        request.admin_notes = (request.admin_notes || '') + '\n\nProcessing Note: ' + adminNotes;
      }

      // Save updated requests
      localStorage.setItem('cancellation-requests', JSON.stringify(requests));

      // TODO: Send processing confirmation email
      // await sendUserCancellationProcessedEmail(booking, request);

      toast.success('Cancellation processed successfully');

      return {
        success: true,
        message: 'Cancellation processed successfully'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process cancellation';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Admin function - Update admin notes
  const updateAdminNotes = async (
    requestIndex: number,
    adminNotes: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const requests = getAllCancellationRequests();
      if (requestIndex >= requests.length) {
        throw new Error('Request not found');
      }

      requests[requestIndex].admin_notes = adminNotes;
      localStorage.setItem('cancellation-requests', JSON.stringify(requests));

      toast.success('Admin notes updated');

      return {
        success: true,
        message: 'Admin notes updated'
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notes';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  // Email notification placeholders (to be implemented)
  const sendUserCancellationRequestEmail = async (booking: SafariBooking, request: CancellationRequest, customerEmail: string) => {
    // TODO: Implement email sending
    console.log('Sending cancellation request confirmation to:', customerEmail);
  };

  const sendAdminCancellationRequestEmail = async (booking: SafariBooking, request: CancellationRequest) => {
    // TODO: Implement email sending
    console.log('Sending admin notification for new cancellation request');
  };

  const sendUserCancellationApprovalEmail = async (booking: SafariBooking, request: CancellationRequest) => {
    // TODO: Implement email sending
    console.log('Sending approval email to user');
  };

  const sendUserCancellationDenialEmail = async (booking: SafariBooking, request: CancellationRequest) => {
    // TODO: Implement email sending
    console.log('Sending denial email to user');
  };

  const sendUserCancellationProcessedEmail = async (booking: SafariBooking, request: CancellationRequest) => {
    // TODO: Implement email sending
    console.log('Sending processing confirmation email to user');
  };

  return {
    loading,
    error,
    defaultPolicies,
    calculateRefund,
    canCancelBooking,
    requestCancellation,
    cancelBooking, // Keep for backward compatibility
    getCancellationHistory,
    // Admin functions
    getAllCancellationRequests,
    approveCancellationRequest,
    denyCancellationRequest,
    processCancellationRequest,
    updateAdminNotes
  };
};
