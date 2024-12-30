// ... existing types ...

export interface TaskDesignation {
  id: string;
  title: string;
  createdAt: string;
}

// Update Task and Routine interfaces
export interface Task {
  // ... existing Task properties ...
  designationId?: string;
}

export interface Routine {
  // ... existing Routine properties ...
  designationId?: string;
}