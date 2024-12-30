import { BaseRepository } from './baseRepository';
import { Zone, SubZone } from '../../types';
import { getDb, saveDb } from '../index';

class ZoneRepository extends BaseRepository {
  // ... other methods remain the same ...

  async delete(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new Error('Valid zone ID is required');
    }

    const db = await this.getDb();
    let transactionStarted = false;

    try {
      // First verify the zone exists
      const zone = await this.findById(id);
      if (!zone) {
        throw new Error('Zone not found');
      }

      // Start transaction
      await db.exec('BEGIN IMMEDIATE TRANSACTION');
      transactionStarted = true;

      // Delete all related records in the correct order
      const deleteOperations = [
        // First delete task-related records
        'DELETE FROM status_history WHERE task_id IN (SELECT id FROM tasks WHERE zone_id = ?)',
        'DELETE FROM collaborators WHERE task_id IN (SELECT id FROM tasks WHERE zone_id = ?)',
        'DELETE FROM tasks WHERE zone_id = ?',
        // Then delete routine-related records
        'DELETE FROM routine_assignments WHERE routine_id IN (SELECT id FROM routines WHERE zone_id = ?)',
        'DELETE FROM routines WHERE zone_id = ?',
        // Finally delete zone-related records
        'DELETE FROM sub_zones WHERE zone_id = ?',
        'DELETE FROM zones WHERE id = ?'
      ];

      // Execute each deletion operation
      for (const sql of deleteOperations) {
        try {
          await db.run(sql, [id]);
          await saveDb(); // Save after each successful operation
        } catch (error) {
          console.error(`Failed to execute deletion operation:`, { sql, error });
          throw error;
        }
      }

      // Commit transaction
      await db.exec('COMMIT');
      transactionStarted = false;

      // Final save
      await saveDb();

      // Verify deletion
      const verifyZone = await this.findById(id);
      if (verifyZone) {
        throw new Error('Zone deletion verification failed');
      }

    } catch (error) {
      if (transactionStarted) {
        try {
          await db.exec('ROLLBACK');
          await saveDb();
        } catch (rollbackError) {
          console.error('Failed to rollback zone deletion:', rollbackError);
        }
      }
      throw new Error('Failed to delete zone: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  // ... other methods remain the same ...
}

export const zoneRepository = new ZoneRepository();