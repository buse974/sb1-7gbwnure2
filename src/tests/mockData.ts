import { addDays, subDays, addWeeks, addMonths } from 'date-fns';
import { Task, User, Zone, Routine } from '../types';

const now = new Date();

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    canManageTasksAndRoutines: true,
    createdAt: subDays(now, 30).toISOString(),
    passwordHash: ''
  },
  {
    id: '2',
    name: 'Jean Dupont',
    email: 'jean@example.com',
    role: 'user',
    canManageTasksAndRoutines: true,
    createdAt: subDays(now, 25).toISOString(),
    passwordHash: ''
  },
  {
    id: '3',
    name: 'Marie Martin',
    email: 'marie@example.com',
    role: 'user',
    canManageTasksAndRoutines: false,
    createdAt: subDays(now, 20).toISOString(),
    passwordHash: ''
  },
  {
    id: '4',
    name: 'Pierre Bernard',
    email: 'pierre@example.com',
    role: 'user',
    canManageTasksAndRoutines: false,
    createdAt: subDays(now, 15).toISOString(),
    passwordHash: ''
  }
];

// Mock Zones
export const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Potager Nord',
    description: 'Zone principale de culture des légumes',
    color: '#4CAF50',
    subZones: [
      { id: '1-1', zoneId: '1', name: 'Tomates', priority: 1 },
      { id: '1-2', zoneId: '1', name: 'Salades', priority: 2 }
    ],
    createdAt: subDays(now, 30).toISOString()
  },
  {
    id: '2',
    name: 'Serre',
    description: 'Zone de culture protégée',
    color: '#2196F3',
    subZones: [
      { id: '2-1', zoneId: '2', name: 'Semis', priority: 1 },
      { id: '2-2', zoneId: '2', name: 'Plantes fragiles', priority: 2 }
    ],
    createdAt: subDays(now, 28).toISOString()
  },
  {
    id: '3',
    name: 'Verger',
    description: 'Zone des arbres fruitiers',
    color: '#FF9800',
    subZones: [
      { id: '3-1', zoneId: '3', name: 'Pommiers', priority: 2 },
      { id: '3-2', zoneId: '3', name: 'Poiriers', priority: 2 }
    ],
    createdAt: subDays(now, 25).toISOString()
  }
];

// Mock Tasks with varying completion times and statuses
export const mockTasks: Task[] = [
  // Completed tasks with normal completion time
  {
    id: '1',
    title: 'Arrosage des tomates',
    description: 'Arrosage complet de la zone des tomates',
    status: 'completed',
    zoneId: '1',
    subZoneId: '1-1',
    createdAt: subDays(now, 20).toISOString(),
    actionDate: subDays(now, 20).toISOString(),
    hasDeadline: false,
    collaborators: [
      {
        userId: '2',
        status: 'completed',
        joinedAt: subDays(now, 20).toISOString(),
        startedAt: subDays(now, 20).toISOString(),
        timeSpent: 45, // 45 minutes
        lastStatusChange: subDays(now, 20).toISOString()
      }
    ],
    statusHistory: [
      {
        status: 'available',
        timestamp: subDays(now, 20).toISOString()
      },
      {
        status: 'in-progress',
        timestamp: subDays(now, 20).toISOString(),
        userId: '2'
      },
      {
        status: 'completed',
        timestamp: subDays(now, 20).toISOString(),
        userId: '2'
      }
    ]
  },
  // Task with abnormally long completion time
  {
    id: '2',
    title: 'Arrosage des tomates',
    description: 'Arrosage complet de la zone des tomates',
    status: 'completed',
    zoneId: '1',
    subZoneId: '1-1',
    createdAt: subDays(now, 15).toISOString(),
    actionDate: subDays(now, 15).toISOString(),
    hasDeadline: false,
    collaborators: [
      {
        userId: '3',
        status: 'completed',
        joinedAt: subDays(now, 15).toISOString(),
        startedAt: subDays(now, 15).toISOString(),
        timeSpent: 90, // 90 minutes (twice the normal time)
        lastStatusChange: subDays(now, 15).toISOString()
      }
    ],
    statusHistory: [
      {
        status: 'available',
        timestamp: subDays(now, 15).toISOString()
      },
      {
        status: 'in-progress',
        timestamp: subDays(now, 15).toISOString(),
        userId: '3'
      },
      {
        status: 'completed',
        timestamp: subDays(now, 15).toISOString(),
        userId: '3'
      }
    ]
  },
  // Task in progress
  {
    id: '3',
    title: 'Désherbage des salades',
    description: 'Retirer les mauvaises herbes',
    status: 'in-progress',
    zoneId: '1',
    subZoneId: '1-2',
    createdAt: subDays(now, 1).toISOString(),
    actionDate: now.toISOString(),
    hasDeadline: true,
    deadlineDate: addDays(now, 2).toISOString(),
    collaborators: [
      {
        userId: '4',
        status: 'active',
        joinedAt: subDays(now, 1).toISOString(),
        startedAt: subDays(now, 1).toISOString(),
        timeSpent: 30,
        lastStatusChange: subDays(now, 1).toISOString()
      }
    ],
    statusHistory: [
      {
        status: 'available',
        timestamp: subDays(now, 1).toISOString()
      },
      {
        status: 'in-progress',
        timestamp: subDays(now, 1).toISOString(),
        userId: '4'
      }
    ]
  },
  // Available task
  {
    id: '4',
    title: 'Inspection des semis',
    description: 'Vérification de la croissance des semis',
    status: 'available',
    zoneId: '2',
    subZoneId: '2-1',
    createdAt: now.toISOString(),
    actionDate: now.toISOString(),
    hasDeadline: false,
    collaborators: [],
    statusHistory: [
      {
        status: 'available',
        timestamp: now.toISOString()
      }
    ]
  },
  // Task with multiple collaborators
  {
    id: '5',
    title: 'Taille des arbres',
    description: 'Taille d\'entretien des pommiers',
    status: 'completed',
    zoneId: '3',
    subZoneId: '3-1',
    createdAt: subDays(now, 10).toISOString(),
    actionDate: subDays(now, 10).toISOString(),
    hasDeadline: false,
    collaborators: [
      {
        userId: '2',
        status: 'completed',
        joinedAt: subDays(now, 10).toISOString(),
        startedAt: subDays(now, 10).toISOString(),
        timeSpent: 120,
        lastStatusChange: subDays(now, 10).toISOString()
      },
      {
        userId: '3',
        status: 'completed',
        joinedAt: subDays(now, 10).toISOString(),
        startedAt: subDays(now, 10).toISOString(),
        timeSpent: 120,
        lastStatusChange: subDays(now, 10).toISOString()
      }
    ],
    statusHistory: [
      {
        status: 'available',
        timestamp: subDays(now, 10).toISOString()
      },
      {
        status: 'in-progress',
        timestamp: subDays(now, 10).toISOString(),
        userId: '2'
      },
      {
        status: 'completed',
        timestamp: subDays(now, 10).toISOString(),
        userId: '2'
      }
    ]
  }
];

// Mock Routines
export const mockRoutines: Routine[] = [
  // Daily routine
  {
    id: '1',
    title: 'Arrosage quotidien',
    description: 'Arrosage quotidien des zones sensibles',
    frequency: 'daily',
    zoneId: '1',
    createdAt: subDays(now, 30).toISOString(),
    nextExecution: addDays(now, 1).toISOString(),
    lastExecution: now.toISOString(),
    status: 'available',
    routineConfig: {
      frequency: 'daily',
      assignedUsers: ['2', '3'],
      nextGeneration: addDays(now, 1).toISOString()
    }
  },
  // Weekly routine
  {
    id: '2',
    title: 'Inspection hebdomadaire',
    description: 'Vérification hebdomadaire des installations',
    frequency: 'weekly',
    zoneId: '2',
    createdAt: subDays(now, 25).toISOString(),
    nextExecution: addWeeks(now, 1).toISOString(),
    lastExecution: subDays(now, 7).toISOString(),
    status: 'available',
    routineConfig: {
      frequency: 'weekly',
      assignedUsers: ['2', '4'],
      nextGeneration: addWeeks(now, 1).toISOString()
    }
  },
  // Monthly routine
  {
    id: '3',
    title: 'Maintenance mensuelle',
    description: 'Entretien mensuel des équipements',
    frequency: 'monthly',
    zoneId: '3',
    createdAt: subDays(now, 20).toISOString(),
    nextExecution: addMonths(now, 1).toISOString(),
    lastExecution: subDays(now, 30).toISOString(),
    status: 'available',
    routineConfig: {
      frequency: 'monthly',
      assignedUsers: ['2', '3', '4'],
      nextGeneration: addMonths(now, 1).toISOString()
    }
  },
  // Custom interval routine
  {
    id: '4',
    title: 'Fertilisation',
    description: 'Application d\'engrais selon planning',
    frequency: 'custom',
    customInterval: 10,
    zoneId: '1',
    subZoneId: '1-1',
    createdAt: subDays(now, 15).toISOString(),
    nextExecution: addDays(now, 10).toISOString(),
    lastExecution: subDays(now, 10).toISOString(),
    status: 'available',
    routineConfig: {
      frequency: 'custom',
      customInterval: 10,
      assignedUsers: ['3'],
      nextGeneration: addDays(now, 10).toISOString()
    }
  }
];

// Generate historical data for trends
export const generateHistoricalData = () => {
  const historicalTasks: Task[] = [];
  const startDate = subDays(now, 30);

  // Generate completed tasks for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = subDays(startDate, i);
    const completedCount = Math.floor(Math.random() * 3) + 1; // 1-3 tasks per day

    for (let j = 0; j < completedCount; j++) {
      const task: Task = {
        id: `hist-${i}-${j}`,
        title: `Tâche historique ${i}-${j}`,
        description: 'Tâche historique générée',
        status: 'completed',
        zoneId: mockZones[Math.floor(Math.random() * mockZones.length)].id,
        createdAt: date.toISOString(),
        actionDate: date.toISOString(),
        hasDeadline: false,
        collaborators: [
          {
            userId: mockUsers[Math.floor(Math.random() * (mockUsers.length - 1)) + 1].id,
            status: 'completed',
            joinedAt: date.toISOString(),
            startedAt: date.toISOString(),
            timeSpent: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
            lastStatusChange: date.toISOString()
          }
        ],
        statusHistory: [
          {
            status: 'available',
            timestamp: date.toISOString()
          },
          {
            status: 'completed',
            timestamp: date.toISOString()
          }
        ]
      };
      historicalTasks.push(task);
    }
  }

  return historicalTasks;
};

// Initialize all mock data
export const initializeMockData = () => {
  const historicalTasks = generateHistoricalData();
  return {
    users: mockUsers,
    zones: mockZones,
    tasks: [...mockTasks, ...historicalTasks],
    routines: mockRoutines
  };
};