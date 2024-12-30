import { getDb } from '../index';
import { Task } from '../../types';

export const taskRepository = {
  async create(taskData: Partial<Task>): Promise<Task> {
    const db = await getDb();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    try {
      await db.exec('BEGIN IMMEDIATE TRANSACTION;');

      await db.run(`
        INSERT INTO tasks (
          id, title, description, status, zone_id, sub_zone_id,
          created_at, action_date, has_deadline, deadline_date, is_routine,
          designation_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        taskData.title,
        taskData.description || null,
        taskData.status || 'available',
        taskData.zoneId || null,
        taskData.subZoneId || null,
        createdAt,
        taskData.actionDate || createdAt,
        taskData.hasDeadline ? 1 : 0,
        taskData.deadlineDate || null,
        taskData.isRoutine ? 1 : 0,
        taskData.designationId || null
      ]);

      // Insert collaborators if any
      if (taskData.collaborators?.length) {
        for (const collab of taskData.collaborators) {
          await db.run(`
            INSERT INTO collaborators (
              id, task_id, user_id, status, joined_at,
              started_at, time_spent, last_status_change
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            crypto.randomUUID(),
            id,
            collab.userId,
            collab.status,
            collab.joinedAt,
            collab.startedAt || null,
            collab.timeSpent || 0,
            collab.lastStatusChange
          ]);
        }
      }

      // Insert status history if any
      if (taskData.statusHistory?.length) {
        for (const history of taskData.statusHistory) {
          await db.run(`
            INSERT INTO status_history (
              id, task_id, status, timestamp, user_id, reason
            )
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            crypto.randomUUID(),
            id,
            history.status,
            history.timestamp,
            history.userId || null,
            history.reason || null
          ]);
        }
      }

      await db.exec('COMMIT;');
      return await this.findById(id) as Task;
    } catch (error) {
      await db.exec('ROLLBACK;');
      throw error;
    }
  },

  async findById(id: string): Promise<Task | undefined> {
    const db = await getDb();
    
    try {
      const task = await db.exec(`
        SELECT t.*, GROUP_CONCAT(c.user_id) as collaborator_ids
        FROM tasks t
        LEFT JOIN collaborators c ON t.id = c.task_id
        WHERE t.id = ?
        GROUP BY t.id
      `, [id]);

      if (!task.length) return undefined;

      const collaborators = await db.exec(`
        SELECT * FROM collaborators WHERE task_id = ?
        ORDER BY joined_at
      `, [id]);

      const statusHistory = await db.exec(`
        SELECT * FROM status_history WHERE task_id = ?
        ORDER BY timestamp
      `, [id]);

      const taskRow = task[0].values[0];
      const taskColumns = task[0].columns;

      return {
        id: taskRow[taskColumns.indexOf('id')],
        title: taskRow[taskColumns.indexOf('title')],
        description: taskRow[taskColumns.indexOf('description')],
        status: taskRow[taskColumns.indexOf('status')],
        zoneId: taskRow[taskColumns.indexOf('zone_id')],
        subZoneId: taskRow[taskColumns.indexOf('sub_zone_id')],
        createdAt: taskRow[taskColumns.indexOf('created_at')],
        actionDate: taskRow[taskColumns.indexOf('action_date')],
        hasDeadline: Boolean(taskRow[taskColumns.indexOf('has_deadline')]),
        deadlineDate: taskRow[taskColumns.indexOf('deadline_date')],
        isRoutine: Boolean(taskRow[taskColumns.indexOf('is_routine')]),
        designationId: taskRow[taskColumns.indexOf('designation_id')],
        collaborators: collaborators[0]?.values.map(row => ({
          userId: row[collaborators[0].columns.indexOf('user_id')],
          status: row[collaborators[0].columns.indexOf('status')],
          joinedAt: row[collaborators[0].columns.indexOf('joined_at')],
          startedAt: row[collaborators[0].columns.indexOf('started_at')],
          timeSpent: row[collaborators[0].columns.indexOf('time_spent')],
          lastStatusChange: row[collaborators[0].columns.indexOf('last_status_change')]
        })) || [],
        statusHistory: statusHistory[0]?.values.map(row => ({
          status: row[statusHistory[0].columns.indexOf('status')],
          timestamp: row[statusHistory[0].columns.indexOf('timestamp')],
          userId: row[statusHistory[0].columns.indexOf('user_id')],
          reason: row[statusHistory[0].columns.indexOf('reason')]
        })) || []
      };
    } catch (error) {
      console.error('Error finding task:', error);
      throw new Error('Failed to find task');
    }
  },

  async getAll(): Promise<Task[]> {
    const db = await getDb();
    
    try {
      const tasks = await db.exec(`
        SELECT t.*, GROUP_CONCAT(c.user_id) as collaborator_ids
        FROM tasks t
        LEFT JOIN collaborators c ON t.id = c.task_id
        GROUP BY t.id
      `);

      if (!tasks.length) return [];

      const taskRows = tasks[0].values;
      const taskColumns = tasks[0].columns;

      const collaborators = await db.exec('SELECT * FROM collaborators');
      const statusHistory = await db.exec('SELECT * FROM status_history');

      return taskRows.map(taskRow => ({
        id: taskRow[taskColumns.indexOf('id')],
        title: taskRow[taskColumns.indexOf('title')],
        description: taskRow[taskColumns.indexOf('description')],
        status: taskRow[taskColumns.indexOf('status')],
        zoneId: taskRow[taskColumns.indexOf('zone_id')],
        subZoneId: taskRow[taskColumns.indexOf('sub_zone_id')],
        createdAt: taskRow[taskColumns.indexOf('created_at')],
        actionDate: taskRow[taskColumns.indexOf('action_date')],
        hasDeadline: Boolean(taskRow[taskColumns.indexOf('has_deadline')]),
        deadlineDate: taskRow[taskColumns.indexOf('deadline_date')],
        isRoutine: Boolean(taskRow[taskColumns.indexOf('is_routine')]),
        designationId: taskRow[taskColumns.indexOf('designation_id')],
        collaborators: collaborators[0]?.values
          .filter(row => row[collaborators[0].columns.indexOf('task_id')] === taskRow[taskColumns.indexOf('id')])
          .map(row => ({
            userId: row[collaborators[0].columns.indexOf('user_id')],
            status: row[collaborators[0].columns.indexOf('status')],
            joinedAt: row[collaborators[0].columns.indexOf('joined_at')],
            startedAt: row[collaborators[0].columns.indexOf('started_at')],
            timeSpent: row[collaborators[0].columns.indexOf('time_spent')],
            lastStatusChange: row[collaborators[0].columns.indexOf('last_status_change')]
          })) || [],
        statusHistory: statusHistory[0]?.values
          .filter(row => row[statusHistory[0].columns.indexOf('task_id')] === taskRow[taskColumns.indexOf('id')])
          .sort((a, b) => new Date(a[statusHistory[0].columns.indexOf('timestamp')]).getTime() - 
                         new Date(b[statusHistory[0].columns.indexOf('timestamp')]).getTime())
          .map(row => ({
            status: row[statusHistory[0].columns.indexOf('status')],
            timestamp: row[statusHistory[0].columns.indexOf('timestamp')],
            userId: row[statusHistory[0].columns.indexOf('user_id')],
            reason: row[statusHistory[0].columns.indexOf('reason')]
          })) || []
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }
};