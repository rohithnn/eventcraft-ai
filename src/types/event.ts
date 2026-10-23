export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export type BudgetCategory = 
  | 'venue'
  | 'catering'
  | 'decor'
  | 'photography'
  | 'entertainment'
  | 'attire'
  | 'misc';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  categoryLabel: string;
  allocatedAmount: number;
  spentAmount: number;
  percentageOfBudget: number;
  notes?: string;
  suggestedVendorsOrTips?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TimelineTask {
  id: string;
  title: string;
  description: string;
  category: BudgetCategory | 'general';
  timeframe: string; // e.g. "6 months before", "3 months before", "1 month before", "1 week before", "Day of event"
  relativeDaysBefore: number; // e.g. 180, 90, 30, 7, 0
  dueDate: string; // ISO date string YYYY-MM-DD
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

export type VendorStatus = 'Shortlisted' | 'Booked' | 'Paid';

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  categoryLabel: string;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  quotedPrice: number;
  status: VendorStatus;
  notes: string;
  aiSuggestedQuestions?: string[];
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  isPinned: boolean;
}

export interface EventIdeas {
  themes: IdeaItem[];
  decor: IdeaItem[];
  menu: IdeaItem[];
  activities: IdeaItem[];
  returnGifts: IdeaItem[];
}

export interface EventDetails {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // YYYY-MM-DD
  guestCount: number;
  city: string;
  totalBudget: number;
  currency: CurrencyCode;
  themeVibe: string;
  culturalPreferences: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  createdAt: string;
  updatedAt: string;
}

export interface FullEventPlan {
  details: EventDetails;
  budget: BudgetItem[];
  timeline: TimelineTask[];
  vendors: Vendor[];
  ideas: EventIdeas;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
