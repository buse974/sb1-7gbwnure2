import { initializeMockData } from './mockData';
import { useTaskStore } from '../store/taskStore';
import { useRoutineStore } from '../store/routineStore';
import { useZoneStore } from '../store/zoneStore';
import { useUserStore } from '../store/userStore';

export const runSystemTest = async () => {
  console.log('Starting system test...');
  const results: string[] = [];

  try {
    // Initialize stores with mock data
    const { users, zones, tasks, routines } = initializeMockData();
    
    // Test user store
    const userStore = useUserStore.getState();
    await Promise.all(users.map(user => userStore.createUser(user)));
    results.push('✓ User store initialized successfully');

    // Test zone store
    const zoneStore = useZoneStore.getState();
    await Promise.all(zones.map(zone => zoneStore.createZone(zone)));
    results.push('✓ Zone store initialized successfully');

    // Test task store
    const taskStore = useTaskStore.getState();
    await Promise.all(tasks.map(task => taskStore.createTask(task)));
    results.push('✓ Task store initialized successfully');

    // Test routine store
    const routineStore = useRoutineStore.getState();
    await Promise.all(routines.map(routine => routineStore.createRoutine(routine)));
    results.push('✓ Routine store initialized successfully');

    // Test task assignment
    const testTask = tasks[3]; // Available task
    await taskStore.assignTask(testTask.id, users[1].id);
    const updatedTask = taskStore.getState().tasks.find(t => t.id === testTask.id);
    if (updatedTask?.status === 'in-progress') {
      results.push('✓ Task assignment working correctly');
    } else {
      throw new Error('Task assignment failed');
    }

    // Test routine assignment
    const testRoutine = routines[0];
    await routineStore.assignRoutine(testRoutine.id, users[1].id);
    const updatedRoutine = routineStore.getState().routines.find(r => r.id === testRoutine.id);
    if (updatedRoutine?.status === 'in-progress') {
      results.push('✓ Routine assignment working correctly');
    } else {
      throw new Error('Routine assignment failed');
    }

    // Test task completion
    await taskStore.completeTask(testTask.id, users[1].id);
    const completedTask = taskStore.getState().tasks.find(t => t.id === testTask.id);
    if (completedTask?.status === 'completed') {
      results.push('✓ Task completion working correctly');
    } else {
      throw new Error('Task completion failed');
    }

    // Test routine completion
    await routineStore.completeRoutine(testRoutine.id, users[1].id);
    const completedRoutine = routineStore.getState().routines.find(r => r.id === testRoutine.id);
    if (completedRoutine?.status === 'completed') {
      results.push('✓ Routine completion working correctly');
    } else {
      throw new Error('Routine completion failed');
    }

    console.log('System test completed successfully!');
    console.log(results.join('\n'));
    return { success: true, results };

  } catch (error) {
    console.error('System test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      results 
    };
  }
};