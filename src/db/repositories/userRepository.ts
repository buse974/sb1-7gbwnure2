import { BaseRepository } from './baseRepository';
import { User } from '../../types';
import bcrypt from 'bcryptjs';

class UserRepository extends BaseRepository {
  async findByEmail(email: string): Promise<User | undefined> {
    return this.queryOne<User>('SELECT * FROM users WHERE email = ?', [email]);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  async create(userData: Partial<User> & { password: string }): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);
    const id = crypto.randomUUID();

    await this.exec(`
      INSERT INTO users (id, name, email, role, password_hash, can_manage_tasks_and_routines, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      userData.name,
      userData.email,
      userData.role || 'user',
      passwordHash,
      userData.canManageTasksAndRoutines ? 1 : 0,
      new Date().toISOString()
    ]);

    return (await this.findById(id))!;
  }

  async update(id: string, updates: Partial<User> & { password?: string }): Promise<User> {
    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.name) {
      updateFields.push('name = ?');
      params.push(updates.name);
    }
    if (updates.email) {
      updateFields.push('email = ?');
      params.push(updates.email);
    }
    if (updates.role) {
      updateFields.push('role = ?');
      params.push(updates.role);
    }
    if (typeof updates.canManageTasksAndRoutines !== 'undefined') {
      updateFields.push('can_manage_tasks_and_routines = ?');
      params.push(updates.canManageTasksAndRoutines ? 1 : 0);
    }
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(updates.password, salt);
      updateFields.push('password_hash = ?');
      params.push(passwordHash);
    }

    params.push(id);

    if (updateFields.length > 0) {
      await this.exec(`
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, params);
    }

    return (await this.findById(id))!;
  }

  async delete(id: string): Promise<void> {
    await this.exec('DELETE FROM users WHERE id = ?', [id]);
  }

  async getAll(): Promise<User[]> {
    return this.query<User>('SELECT * FROM users');
  }
}

export const userRepository = new UserRepository();