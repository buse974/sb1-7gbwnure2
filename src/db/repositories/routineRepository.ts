import { BaseRepository } from './baseRepository';
import { Routine } from '../../types';

class RoutineRepository extends BaseRepository {
  async create(routineData: Partial<Routine>): Promise<Routine> {
    const id = crypto.randomUUID();

    await this.exec(`
      INSERT INTO routines (
        id, title, description, frequency, custom_interval,
        zone_id, sub_zone_id, created_at, next_execution,
        last_execution, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      routineData.title,
      routineData.description || null,
      routineData.frequency,
      routineData.customInterval || null,
      routineData.zoneId,
      routineData.subZoneId || null,
      routineData.createdAt,
      routineData.nextExecution,
      routineData.lastExecution || null,
      routineData.status || 'available'
    ]);

    if (routineData.routineConfig?.assignedUsers?.length) {
      for (const userId of routineData.routineConfig.assignedUsers) {
        await this.exec(`
          INSERT INTO routine_assignments (id, routine_id, user_id)
          VALUES (?, ?, ?)
        `, [
          crypto.randomUUID(),
          id,
          userId
        ]);
      }
    }

    return (await this.findById(id))!;
  }

  async update(id: string, updates: Partial<Routine>): Promise<Routine> {
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.title) {
      updateFields.push('title = ?');
      params.push(updates.title);
    }
    if (typeof updates.description !== 'undefined') {
      updateFields.push('description = ?');
      params.push(updates.description);
    }
    if (updates.frequency) {
      updateFields.push('frequency = ?');
      params.push(updates.frequency);
    }
    if (typeof updates.customInterval !== 'undefined') {
      updateFields.push('custom_interval = ?');
      params.push(updates.customInterval);
    }
    if (updates.zoneId) {
      updateFields.push('zone_id = ?');
      params.push(updates.zoneId);
    }
    if (typeof updates.subZoneId !== 'undefined') {
      updateFields.push('sub_zone_id = ?');
      params.push(updates.subZoneId);
    }
    if (updates.nextExecution) {
      updateFields.push('next_execution = ?');
      params.push(updates.nextExecution);
    }
    if (typeof updates.lastExecution !== 'undefined') {
      updateFields.push('last_execution = ?');
      params.push(updates.lastExecution);
    }
    if (updates.status) {
      updateFields.push('status = ?');
      params.push(updates.status);
    }

    params.push(id);

    if (updateFields.length > 0) {
      await this.exec(`
        UPDATE routines
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, params);
    }

    if (updates.routineConfig?.assignedUsers) {
      await this.exec('DELETE FROM routine_assignments WHERE routine_id = ?', [id]);

      for (const userId of updates.routineConfig.assignedUsers) {
        await this.exec(`
          INSERT INTO routine_assignments (id, routine_id, user_id)
          VALUES (?, ?, ?)
        `, [
          crypto.randomUUID(),
          id,
          userId
        ]);
      }
    }

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.transaction(async () => {
      await this.exec('DELETE FROM routine_assignments WHERE routine_id = ?', [id]);
      await this.exec('DELETE FROM routines WHERE id = ?', [id]);
    });
  }

  async findById(id: string): Promise<Routine | undefined> {
    const routine = await this.queryOne<Routine>(`
      SELECT r.*, GROUP_CONCAT(ra.user_id) as assigned_users
      FROM routines r
      LEFT JOIN routine_assignments ra ON r.id = ra.routine_id
      WHERE r.id = ?
      GROUP BY r.id
    `, [id]);

    if (!routine) return undefined;

    return this.transformRoutine(routine);
  }

  async getAll(): Promise<Routine[]> {
    const routines = await this.query<any>(`
      SELECT r.*, GROUP_CONCAT(ra.user_id) as assigned_users
      FROM routines r
      LEFT JOIN routine_assignments ra ON r.id = ra.routine_id
      GROUP BY r.id
    `);

    return routines.map(this.transformRoutine);
  }

  private transformRoutine(routine: any): Routine {
    const assignedUsers = routine.assignedUsers
      ? routine.assignedUsers.split(',')
      : [];

    return {
      ...routine,
      routineConfig: {
        frequency: routine.frequency,
        customInterval: routine.customInterval,
        assignedUsers,
        nextGeneration: routine.nextExecution
      }
    };
  }
}

export const routineRepository = new RoutineRepository();