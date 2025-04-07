
import { Pothole } from '@/types';

export const potholes: Pothole[] = [
  {
    id: '1',
    latitude: 37.7749,
    longitude: -122.4194,
    address: '123 Market St, San Francisco, CA',
    severity: 'high',
    status: 'reported',
    reportedAt: '2025-04-05T10:30:00Z',
    updatedAt: null,
    description: 'Large pothole spanning half the lane, about 1ft deep.',
    imageUrl: '/placeholder.svg',
    reporter: 'john.doe@example.com',
    upvotes: 12
  },
  {
    id: '2',
    latitude: 37.7848,
    longitude: -122.4294,
    address: '456 Mission St, San Francisco, CA',
    severity: 'medium',
    status: 'confirmed',
    reportedAt: '2025-04-04T14:20:00Z',
    updatedAt: '2025-04-05T09:10:00Z',
    description: 'Medium sized pothole at intersection, causing traffic slowdowns.',
    imageUrl: '/placeholder.svg',
    reporter: 'jane.smith@example.com',
    upvotes: 8
  },
  {
    id: '3',
    latitude: 37.7947,
    longitude: -122.4094,
    address: '789 Howard St, San Francisco, CA',
    severity: 'low',
    status: 'in_progress',
    reportedAt: '2025-04-03T09:15:00Z',
    updatedAt: '2025-04-06T11:45:00Z',
    description: 'Small crack developing into a pothole, near the bus stop.',
    imageUrl: '/placeholder.svg',
    reporter: 'mark.wilson@example.com',
    upvotes: 5
  },
  {
    id: '4',
    latitude: 37.7849,
    longitude: -122.4194,
    address: '101 California St, San Francisco, CA',
    severity: 'high',
    status: 'in_progress',
    reportedAt: '2025-04-02T16:40:00Z',
    updatedAt: '2025-04-04T08:30:00Z',
    description: 'Deep pothole causing damage to vehicles, urgent repair needed.',
    imageUrl: '/placeholder.svg',
    reporter: 'susan.jones@example.com',
    upvotes: 24
  },
  {
    id: '5',
    latitude: 37.7749,
    longitude: -122.4294,
    address: '222 Folsom St, San Francisco, CA',
    severity: 'medium',
    status: 'resolved',
    reportedAt: '2025-03-28T13:20:00Z',
    updatedAt: '2025-04-05T15:10:00Z',
    description: 'Pothole repair completed, road surface restored.',
    imageUrl: '/placeholder.svg',
    reporter: 'alex.brown@example.com',
    upvotes: 3
  },
  {
    id: '6',
    latitude: 37.7649,
    longitude: -122.4194,
    address: '333 Bryant St, San Francisco, CA',
    severity: 'low',
    status: 'reported',
    reportedAt: '2025-04-06T10:10:00Z',
    updatedAt: null,
    description: 'Small pothole forming near the crosswalk.',
    imageUrl: '/placeholder.svg',
    reporter: 'lisa.miller@example.com',
    upvotes: 2
  }
];
