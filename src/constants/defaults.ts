import { BudgetCategory, CurrencyCode } from '../types/event';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
};

export interface CategoryMeta {
  key: BudgetCategory;
  label: string;
  defaultShare: number; // Percentage share (e.g., 0.35)
  color: string;
  textColor: string;
  lightBg: string;
  description: string;
  iconName: string;
}

export const BUDGET_CATEGORIES: CategoryMeta[] = [
  {
    key: 'venue',
    label: 'Palace / Resort & Lawns (Venue)',
    defaultShare: 0.35,
    color: '#6366f1', // Indigo
    textColor: 'text-indigo-600 dark:text-indigo-400',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    description: 'Heritage lawn, banquet hall, Janwaas stay rooms, generator & permits',
    iconName: 'Building2',
  },
  {
    key: 'catering',
    label: 'Catering, Live Chaat & Mithai',
    defaultShare: 0.30,
    color: '#f43f5e', // Rose
    textColor: 'text-rose-600 dark:text-rose-400',
    lightBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    description: 'Multi-cuisine buffet, live counters (chaat/dosa/jalebi), Jain options, sweets',
    iconName: 'Utensils',
  },
  {
    key: 'decor',
    label: 'Mandap, Stage & Floral Decor',
    defaultShare: 0.12,
    color: '#10b981', // Emerald
    textColor: 'text-emerald-600 dark:text-emerald-400',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    description: 'Vedic Mandap, marigold & jasmine florals, entrance torans, fairy lights',
    iconName: 'Sparkles',
  },
  {
    key: 'photography',
    label: 'Candid Photo & Cinematic Video',
    defaultShare: 0.10,
    color: '#06b6d4', // Cyan
    textColor: 'text-cyan-600 dark:text-cyan-400',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800',
    description: 'Pre-wedding shoot, candid photographers, drone ceremony footage, teaser reel',
    iconName: 'Camera',
  },
  {
    key: 'entertainment',
    label: 'DJ, Dhol Players & Sangeet Sound',
    defaultShare: 0.07,
    color: '#8b5cf6', // Violet
    textColor: 'text-violet-600 dark:text-violet-400',
    lightBg: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    description: 'Live Punjabi/Nasik Dhol for Baraat, Sangeet choreography sound, LED screens',
    iconName: 'Music',
  },
  {
    key: 'attire',
    label: 'Bridal Lehengas & Sherwanis',
    defaultShare: 0.04,
    color: '#f59e0b', // Amber
    textColor: 'text-amber-600 dark:text-amber-400',
    lightBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    description: 'Bridal bridalwear, Groom sherwani, Safas/turbans, Mehendi artist, bridal makeup',
    iconName: 'Shirt',
  },
  {
    key: 'misc',
    label: 'Shagun, Mithai Boxes & Pooja',
    defaultShare: 0.02,
    color: '#64748b', // Slate
    textColor: 'text-slate-600 dark:text-slate-400',
    lightBg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
    description: 'Pooja samagri, Pandit ji dakshina, return mithai gift hampers, 5% emergency buffer',
    iconName: 'HelpCircle',
  },
];

export const DEFAULT_VENDOR_QUESTIONS: Record<BudgetCategory, string[]> = {
  venue: [
    'Is open-air loud music & Baraat Dhol permitted, and what is the local administration curfew time?',
    'How many AC rooms are included for the Baraat Janwaas and bridal dressing suites?',
    'Is the Havankund / sacred fire permitted for Vedic Pheras on the main lawn/mandap?',
    'What is your generator backup policy in case of power interruption during Sangeet?',
    'Are outside catering teams and live chaat vendors allowed without royalty charges?',
  ],
  catering: [
    'Can you provide a dedicated separate counter and kitchen prep for Pure Jain meals?',
    'How many live food stations (e.g. Chaat, Dosa, Woodfired Pizza, Jalebi-Rabdi) are included in the per-plate rate?',
    'What are the arrangements for morning Haldi tea/coffee and midnight Pheras snacks?',
    'Do you provide mineral water bottles, welcome drinks (Thandai/Aam Panna), and service staff in uniform?',
    'What is the policy for food tasting before finalizing the full multi-course menu?',
  ],
  decor: [
    'Does the quote cover the complete Mandap (chhat, pillars, floral backdrop) and entrance Torans?',
    'Are fresh seasonal flowers (Marigold, Jasmine/Mogra, Rajnigandha, Orchids) used or artificial ones?',
    'Can the day-time Haldi floral setup (yellow marigold swing) be repurposed for evening Mehendi?',
    'Are generator lighting, LED floodlights, and fairy lights for trees included in the quote?',
    'How many hours before the Baraat arrival will the Mandap and stage be 100% ready?',
  ],
  photography: [
    'How many candid photographers and traditional videographers will be deployed across Haldi, Sangeet & Pheras?',
    'Will you provide a 3-minute Instagram/WhatsApp cinematic teaser reel within 7 days of the wedding?',
    'Is a pre-wedding couple photoshoot and drone coverage included in the package?',
    'Do you capture drone aerial shots for the Baraat entry and Varmala moment?',
    'What is the delivery timeline for the hardbound luxury photo album and raw 4K video files?',
  ],
  entertainment: [
    'How many live Dhol players will accompany the groom for the Baraat procession?',
    'Do you have wireless microphones and audio patch chords ready for family Sangeet dance performances?',
    'Can you handle traditional folk music / Shehnai for the morning ceremony and high-energy Bollywood for the reception?',
    'What is your protocol if the Sangeet party goes on 1-2 hours past midnight?',
  ],
  attire: [
    'How many fittings and alteration sessions are included for the bridal lehenga and groom sherwani?',
    'Do you provide coordinated Safas (turbans) and Stoles for the groom’s close family (Baratis)?',
    'What is the turnaround time for bridal Mehendi (both hands and feet) and bridal makeup trial?',
  ],
  misc: [
    'What are the lead times for custom-printed wedding invitation cards and digital animated video invites?',
    'Are custom-printed Shagun envelopes and dry-fruit Mithai gift boxes provided with branding?',
    'Is the complete list of Vedic Pooja samagri, havan wood, and dry fruits coordinated with the Pandit ji?',
  ],
};

export const QUICK_CHAT_PROMPTS = [
  'How to negotiate banquet hall rates in India for a 400-guest wedding?',
  'Suggest a 3-day Indian wedding schedule (Haldi, Mehendi, Sangeet, Pheras).',
  'What live food counters are most popular for an Indian wedding dinner?',
  'Draft a polite WhatsApp RSVP reminder message for Indian family & guests.',
  'What emergency kit items should we keep ready for the bride and groom?',
];
