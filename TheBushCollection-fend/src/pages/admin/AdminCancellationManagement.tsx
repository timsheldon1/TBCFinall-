import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, User, Building, Eye, Edit2, Check, X } from 'lucide-react';
import { useBookingCancellation } from '@/hooks/useBookingCancellation';
import { useBackendBookings } from '@/hooks/useBackendBookings';

interface CancellationRequest {
  booking_id: string;
  reason: string;
  requested_by: string;
  cancellation_date: string;
  refund_amount: number;
  processing_fee: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  admin_notes?: string;
  totalRefund?: number;
}

export default function AdminCancellationManagement() {
  const {
    loading,
    defaultPolicies,
    getAllCancellationRequests,
    approveCancellationRequest,
    denyCancellationRequest,
    processCancellationRequest,
    updateAdminNotes
  } = useBookingCancellation();

  const { bookings, refetch: refetchBookings } = useBackendBookings();
  const [cancellationRequests, setCancellationRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadCancellationRequests();
  }, []);

  const loadCancellationRequests = () => {
    const requests = getAllCancellationRequests();
    setCancellationRequests(requests);
  };

  const getFilteredRequests = () => {
    switch (filter) {
      case 'pending':
        return cancellationRequests.filter(req => req.status === 'pending');
      case 'approved':
        return cancellationRequests.filter(req => req.status === 'approved');
      case 'rejected':
        return cancellationRequests.filter(req => req.status === 'rejected');
      case 'processed':
        return cancellationRequests.filter(req => req.status === 'processed');
      default:
        return cancellationRequests;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge className="bg-green-500 text-white">Processed</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApproveRequest = async (requestIndex: number) => {
    const result = await approveCancellationRequest(requestIndex, adminNotes);
    if (result.success) {
      loadCancellationRequests();
      setAdminNotes('');
      setIsDetailModalOpen(false);
      toast.success('Cancellation request approved successfully');
    }
  };

  const handleDenyRequest = async (requestIndex: number) => {
    const result = await denyCancellationRequest(requestIndex, adminNotes);
    if (result.success) {
      loadCancellationRequests();
      setAdminNotes('');
      setIsDetailModalOpen(false);
      toast.success('Cancellation request denied');
    }
  };

  const handleProcessRequest = async (requestIndex: number) => {
    const result = await processCancellationRequest(requestIndex, adminNotes);
    if (result.success) {
      loadCancellationRequests();
      setAdminNotes('');
      setIsDetailModalOpen(false);

      // Refresh bookings data to reflect the cancelled status
      await refetchBookings();

      toast.success('Cancellation processed successfully');
    }
  };

  const handleUpdateNotes = async (requestIndex: number) => {
    const result = await updateAdminNotes(requestIndex, adminNotes);
    if (result.success) {
      loadCancellationRequests();
      toast.success('Admin notes updated');
    }
  };

  const openDetailModal = (request: any) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cancellation Management</h1>
          <p className="text-gray-600">Review and manage customer cancellation requests with automated policy calculations</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadCancellationRequests} variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests ({cancellationRequests.length})</SelectItem>
              <SelectItem value="pending">Pending ({cancellationRequests.filter(r => r.status === 'pending').length})</SelectItem>
              <SelectItem value="approved">Approved ({cancellationRequests.filter(r => r.status === 'approved').length})</SelectItem>
              <SelectItem value="rejected">Rejected ({cancellationRequests.filter(r => r.status === 'rejected').length})</SelectItem>
              <SelectItem value="processed">Processed ({cancellationRequests.filter(r => r.status === 'processed').length})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{cancellationRequests.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cancellationRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cancellationRequests.filter(r => r.status === 'approved' || r.status === 'processed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${cancellationRequests
                    .filter(r => r.status === 'processed' || r.status === 'approved')
                    .reduce((sum, r) => sum + (r.totalRefund || 0), 0)
                    .toFixed(0)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation History */}
      <div className="space-y-4">
        {getFilteredRequests().map((request, index) => {
          const booking = bookings.find(b => b.id === request.booking_id);

          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {booking?.property_name || 'Safari Property'}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested by: {request.requested_by}
                    </div>
                    <div className="text-sm text-gray-600">
                      Request Date: {new Date(request.cancellation_date).toLocaleDateString()}
                    </div>
                    {booking && (
                      <div className="text-sm text-gray-600">
                        Booking: {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-2">
                    <div className="font-semibold text-lg">
                      ${request.totalRefund?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${request.refund_amount?.toFixed(2) || '0.00'} refund - ${request.processing_fee?.toFixed(2) || '0.00'} fee
                    </div>
                  </div>
                </div>

                {request.reason && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Reason:</div>
                    <div className="text-sm text-gray-600">{request.reason}</div>
                  </div>
                )}

                {request.admin_notes && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {request.admin_notes}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetailModal(request)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {request.status === 'pending' && (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Approve Cancellation Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to approve this cancellation request? This will apply the calculated refund policy and send a confirmation email to the customer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleApproveRequest(index)}>
                              Approve Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                            <X className="w-4 h-4 mr-2" />
                            Deny
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deny Cancellation Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to deny this cancellation request? The customer will be notified and no refund will be processed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDenyRequest(index)}>
                              Deny Request
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Process
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Process Cancellation</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the booking as cancelled in the system and process the refund. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleProcessRequest(index)}>
                            Process Cancellation
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {getFilteredRequests().length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No Cancellations Found</p>
              <p className="text-sm">
                {filter === 'pending' ? 'No pending cancellation requests' :
                 filter === 'approved' ? 'No approved requests' :
                 filter === 'rejected' ? 'No rejected requests' :
                 filter === 'processed' ? 'No processed requests' :
                 'No cancellation history yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cancellation Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Booking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-600">Property:</span>
                      <p>{bookings.find(b => b.id === selectedRequest.booking_id)?.property_name || 'Safari Property'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Booking ID:</span>
                      <p>#{selectedRequest.booking_id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Customer:</span>
                      <p>{selectedRequest.requested_by}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Request Date:</span>
                      <p>{new Date(selectedRequest.cancellation_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Refund Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const booking = bookings.find(b => b.id === selectedRequest.booking_id);
                      if (!booking) return null;

                      // Calculate policy based on timing
                      const checkInDate = new Date(booking.check_in);
                      const requestDate = new Date(selectedRequest.cancellation_date);
                      const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));

                      const applicablePolicy = defaultPolicies.find(policy => {
                        if (daysUntilCheckIn >= 999) return policy.id === 'free-24h'; // Within 24h of booking
                        if (daysUntilCheckIn >= 7) return policy.id === 'standard-7d';
                        if (daysUntilCheckIn >= 2) return policy.id === 'late-2d';
                        return policy.id === 'no-refund-48h';
                      });

                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-gray-600">Policy Applied:</span>
                              <p className="text-lg font-semibold text-blue-600">{applicablePolicy?.name}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Days Until Check-in:</span>
                              <p>{daysUntilCheckIn} days</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-sm text-gray-600">Original Amount</p>
                                <p className="text-xl font-bold">${booking.total_amount?.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Refund ({applicablePolicy?.refund_percentage}%)</p>
                                <p className="text-xl font-bold text-green-600">
                                  ${selectedRequest.refund_amount?.toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Processing Fee</p>
                                <p className="text-xl font-bold text-red-600">
                                  -${selectedRequest.processing_fee?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="border-t pt-3 mt-3 text-center">
                              <p className="text-sm text-gray-600">Total Refund</p>
                              <p className="text-2xl font-bold text-green-600">
                                ${selectedRequest.totalRefund?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-600">Reason for Cancellation:</span>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedRequest.reason}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-notes">Add/Edit Notes</Label>
                      <Textarea
                        id="admin-notes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes about this cancellation request..."
                        rows={3}
                      />
                    </div>

                    {selectedRequest.admin_notes && (
                      <div>
                        <span className="font-medium text-gray-600">Previous Notes:</span>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          {selectedRequest.admin_notes}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateNotes(cancellationRequests.indexOf(selectedRequest))}>
                        Update Notes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
