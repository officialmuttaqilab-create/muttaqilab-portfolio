
export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  images: string[]; // Base64 or URLs
  isFeatured: boolean;
  dateCreated: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
  } | null;
}

export interface Brief {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  projectGoals: string;
  deliverables: string[];
  budget: string;
  timeline: string;
  dateSubmitted: number;
  status: 'new' | 'reviewed' | 'archived';
}

export interface Review {
  id: string;
  clientName: string;
  content: string;
  rating: number; // 1-5
  date: number;
  status: 'pending' | 'approved';
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
  twitter: string;
  pinterest: string;
  behance: string;
  linkedin: string;
  email: string;
}
