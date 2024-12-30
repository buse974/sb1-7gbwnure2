import { BaseRepository } from './baseRepository';
import { TaskDesignation } from '../../types';

class DesignationRepository extends BaseRepository {
  async create(title: string): Promise<TaskDesignation> {
    if (!title.trim()) {
      throw new Error('Designation title is required');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await this.exec(
      'INSERT INTO designations (id, title, created_at) VALUES (?, ?, ?)',
      [id, title.trim(), now]
    );

    const designation = await this.findById(id);
    if (!designation) {
      throw new Error('Failed to create designation');
    }

    return designation;
  }

  async update(id: string, title: string): Promise<TaskDesignation> {
    if (!title.trim()) {
      throw new Error('Designation title is required');
    }

    const designation = await this.findById(id);
    if (!designation) {
      throw new Error('Designation not found');
    }

    await this.exec(
      'UPDATE designations SET title = ? WHERE id = ?',
      [title.trim(), id]
    );

    const updatedDesignation = await this.findById(id);
    if (!updatedDesignation) {
      throw new Error('Failed to update designation');
    }

    return updatedDesignation;
  }

  async delete(id: string): Promise<void> {
    const designation = await this.findById(id);
    if (!designation) {
      throw new Error('Designation not found');
    }

    await this.exec('DELETE FROM designations WHERE id = ?', [id]);
  }

  async findById(id: string): Promise<TaskDesignation | undefined> {
    return this.queryOne<TaskDesignation>(
      'SELECT * FROM designations WHERE id = ?',
      [id]
    );
  }

  async getAll(): Promise<TaskDesignation[]> {
    return this.query<TaskDesignation>(
      'SELECT * FROM designations ORDER BY title'
    );
  }

  async findByTitle(title: string): Promise<TaskDesignation | undefined> {
    return this.queryOne<TaskDesignation>(
      'SELECT * FROM designations WHERE title = ?',
      [title.trim()]
    );
  }
}

export const designationRepository = new DesignationRepository();