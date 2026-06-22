import { API_BASE } from '@/lib/api';

/**
 * Mailchimp API integration helper
 * Handles contact/email subscription to Mailchimp audience
 */



// Mailchimp API credentials
const MAILCHIMP_API_KEY = import.meta.env.VITE_MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = import.meta.env.VITE_MAILCHIMP_SERVER_PREFIX; // Extracted from API key suffix
const MAILCHIMP_AUDIENCE_ID = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID || 'YOUR_AUDIENCE_ID'; // You'll need to add this from your Mailchimp dashboard

interface MailchimpContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  company?: string;
  tags?: string[];
}

interface MailchimpSubscriptionData {
  email_address: string;
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    PHONE?: string;
    ADDRESS?: string;
    BIRTHDAY?: string;
    COMPANY?: string;
  };
  tags?: string[];
}

/**
 * Convert contact form data to Mailchimp format
 */
function formatContactForMailchimp(contact: MailchimpContact): MailchimpSubscriptionData {
  return {
    email_address: contact.email.toLowerCase().trim(),
    status: 'subscribed',
    merge_fields: {
      FNAME: contact.firstName || '',
      LNAME: contact.lastName || '',
      PHONE: contact.phone || '',
      ADDRESS: contact.address || '',
      BIRTHDAY: contact.birthday || '',
      COMPANY: contact.company || '',
    },
    tags: contact.tags || [],
  };
}

/**
 * Subscribe or update a contact in Mailchimp
 * NOTE: This uses your backend as a proxy to avoid exposing the API key to the frontend
 */
export async function subscribeToMailchimp(contact: MailchimpContact): Promise<{ success: boolean; error?: string; data?: Record<string, unknown>; mailchimp_status?: string }> {
  try {
    // Use the same backend base URL as the rest of the app
    const backendUrl = (API_BASE || '').replace(/\/+$/, '');
    const response = await fetch(`${backendUrl}/api/mailchimp/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formatContactForMailchimp(contact)),
    });

    if (!response.ok) {
      // Try to parse JSON error, but fall back to text if the response is HTML or plain text
      let errorText = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorText = errorData.message || JSON.stringify(errorData);
      } catch (parseErr) {
        try {
          errorText = await response.text();
        } catch (_) {
          // keep default
        }
      }

      throw new Error(errorText);
    }

    // On success, prefer JSON and return response data (include mailchimp_status if provided)
    try {
      const respData = await response.json();
      return { success: true, data: respData, mailchimp_status: respData.mailchimp_status || respData.status };
    } catch (_) {
      // If response isn't JSON, still indicate success
      return { success: true };
    }
  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    };
  }
}

/**
 * Direct Mailchimp API call (client-side)
 * ⚠️ WARNING: This exposes your API key. Use backend proxy instead (recommended).
 * This is provided as fallback if backend proxy is not available.
 */
export async function subscribeToMailchimpDirect(
  contact: MailchimpContact
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!MAILCHIMP_AUDIENCE_ID || MAILCHIMP_AUDIENCE_ID === 'YOUR_AUDIENCE_ID') {
      throw new Error('Mailchimp Audience ID not configured');
    }

    // Encode API key to base64 for Basic Auth
    const auth = btoa(`anystring:${MAILCHIMP_API_KEY}`);

    const mailchimpData = formatContactForMailchimp(contact);

    const response = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mailchimpData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Mailchimp subscription successful:', result);
    return { success: true };
  } catch (error) {
    console.error('Mailchimp direct subscription error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to subscribe',
    };
  }
}

/**
 * Extract first and last name from full name
 */
export function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}
