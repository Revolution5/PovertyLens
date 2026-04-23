// Created by Marisol morales for work review 3 - Automated message templates for PovertyLens inbox system

export type MessageType =
  | 'story_under_review'
  | 'story_approved'
  | 'story_removed'
  | 'warning_issued'
  | 'suspension_issued'
  | 'unsuspension_issued'
  | 'ban_issued'
  | 'story_report_cleared'
  | 'contact_received'
  // Added by Christella - 04/13/2026
  | 'contact_reply'
  | 'event_under_review'
  | 'event_approved'
  | 'event_denied';
  // End of Addition by Christella - 04/13/2026
  
export interface Message {
  id: string;
  type: MessageType;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  from: string;
}

// Generates a message object for a given type and optional context variables
// Replace this with a real DB insert when backend is ready
export function generateMessage(
  type: MessageType,
  context: {
    storyTitle?: string;
    warningCount?: number;
    suspensionDays?: number;
  } = {}
): Omit<Message, 'id' | 'date' | 'read'> {
  const from = 'PovertyLens Team';

  switch (type) {
    case 'story_under_review':
      return {
        type,
        from,
        subject: 'Your story has been reported',
        body: `Hi! We wanted to let you know that your story "${context.storyTitle ?? 'your story'}" has been reported by another user. We are currently putting it under review. We appreciate your patience while we look into this — we will follow up as soon as we have completed our review.`,
      };

    case 'story_approved':
      return {
        type,
        from,
        subject: 'Your story has been approved ✓',
        body: `Great news! After reviewing your story "${context.storyTitle ?? 'your story'}", we determined that it does not violate our community guidelines. Your story remains published and visible to the community. Thank you for contributing to PovertyLens!`,
      };

    case 'story_removed':
      return {
        type,
        from,
        subject: 'Your story has been removed',
        body: `After reviewing your story "${context.storyTitle ?? 'your story'}", we found that it violated our community guidelines and it has been removed from the platform. If you believe this was a mistake, please contact our support team. We encourage you to review our community guidelines before posting again.`,
      };

    case 'warning_issued':
      return {
        type,
        from,
        subject: `Warning issued — ${context.warningCount ?? 1} of 3`,
        body: `You have received a warning on your PovertyLens account. This is warning ${context.warningCount ?? 1} of 3. Please note that reaching 3 warnings will result in a temporary suspension of your account. We encourage you to review our community guidelines to avoid further action.`,
      };

    case 'suspension_issued':
      return {
        type,
        from,
        subject: 'Your account has been temporarily suspended',
        body: `Your PovertyLens account has been temporarily suspended for ${context.suspensionDays ?? 7} days due to repeated violations of our community guidelines. You will not be able to post or interact with the platform during this period. If you believe this was a mistake, please contact our support team.`,
      };

    case 'unsuspension_issued':
      return {
        type,
        from,
        subject: 'Your account suspension has been lifted',
        body: 'Your PovertyLens account suspension has been lifted. You can now post stories and create pledges again. Please continue following our community guidelines.',
      };

    case 'ban_issued':
      return {
        type,
        from,
        subject: 'Your account has been permanently banned',
        body: `After multiple violations of our community guidelines, your PovertyLens account has been permanently banned. You will no longer be able to access the platform. If you believe this was done in error, please contact our support team to appeal this decision.`,
      };

    case 'story_report_cleared':
      return {
        type,
        from,
        subject: 'Report on your story has been cleared',
        body: `We have completed our review of the report made against your story "${context.storyTitle ?? 'your story'}". We found no violations of our community guidelines and your story remains published. Thank you for your patience during this process.`,
      };
  case 'contact_received':
  return {
    type,
    from,
    subject: 'We received your message',
    body: 'Thank you for reaching out to PovertyLens. We have received your message and will get back to you as soon as possible.',
  };

  case 'contact_reply':
    return {
      type,
      from,
      subject: 'A reply to your message',
      body: 'The PovertyLens team has replied to your contact form submission. Please see the message above.',
    };
  
    // Added by Christella - 04/13/2026 - template messages for event submissions
    case 'event_under_review':
      return {
        type,
        from,
        subject: 'Thank you for submitting your event',
        body: 'Thank you for submitting your event. The PovertyLens will review your submission and will get back to you as soon as possible.',
      };
    
    case 'event_approved':
      return{
        type,
        from,
        subject: 'Your event has been approved!',
        body: 'Your event submission has been approved. Please allow 1-2 hours for the event to show up on our calendar.'
      };
    
    case 'event_denied':
      return {
        type,
        from,
        subject: 'Your event has been denied.',
        body: 'Your event submission was denied due to suspicious activity or inaccuracy. If you believe this is an error, please contact us using the contact form.'
      }
    // End of addition by Christella - 04/13/2026
    }
  }

export const mockMessages: Message[] = [];