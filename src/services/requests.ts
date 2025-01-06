import { ServiceRequestDB, RequestStatus } from './../app/types/index';

export const fetchRequests = async (): Promise<ServiceRequestDB[]> => {
    try {
      const response = await fetch('/api/requests');
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  };
  
  export const updateRequestStatus = async (
    requestId: string,
    status: RequestStatus
  ): Promise<ServiceRequestDB> => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update request status');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  };
  
  export const rescheduleRequest = async (
    requestId: string,
    preferredDate: string,
    preferredTime: string
  ): Promise<ServiceRequestDB> => {
    try {
      const response = await fetch(`/api/requests/${requestId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          preferred_date: preferredDate, 
          preferred_time: preferredTime,
          status: 'remarcado' 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reschedule request');
      }
      return response.json();
    } catch (error) {
      console.error('Error rescheduling request:', error);
      throw error;
    }
  };