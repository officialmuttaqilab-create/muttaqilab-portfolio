
import { Project } from './types';

export const COLORS = {
  black: '#0B0B0B',
  orange: '#FF7A00',
  white: '#FFFFFF',
  gray: '#1A1A1A'
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Aura Skincare Rebrand',
    category: 'Visual Identity',
    description: 'A complete visual overhaul for a premium botanical skincare line. Focus on minimalism and high-end typography.',
    images: ['https://picsum.photos/seed/aura/1200/800'],
    isFeatured: true,
    dateCreated: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Neon Pulse Festival',
    category: 'Event Branding',
    description: 'Dynamic poster series and digital assets for an underground electronic music festival.',
    images: ['https://picsum.photos/seed/neon/1200/800'],
    isFeatured: true,
    dateCreated: Date.now() - 2000000
  },
  {
    id: '3',
    title: 'The Modernist Journal',
    category: 'Editorial Design',
    description: 'A high-contrast layout design for a monthly architecture and design publication.',
    images: ['https://picsum.photos/seed/journal/1200/800'],
    isFeatured: false,
    dateCreated: Date.now() - 3000000
  }
];
