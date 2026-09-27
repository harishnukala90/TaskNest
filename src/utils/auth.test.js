import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, loginUser, logoutUser } from './auth';

// Mock firebase auth and firestore
vi.mock('../firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(val => val),
  serverTimestamp: vi.fn(() => 'TIMESTAMP')
}));

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('throws error when username or password is missing', async () => {
      await expect(registerUser({ username: '', password: 'Password123' })).rejects.toThrow(
        'Username and password required'
      );
      await expect(registerUser({ username: 'testuser', password: '' })).rejects.toThrow(
        'Username and password required'
      );
    });

    it('creates user successfully with normalized username', async () => {
      createUserWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'user123' }
      });
      setDoc.mockResolvedValueOnce(undefined);

      const userData = {
        username: '  TestUser  ',
        password: 'Password123',
        role: 'worker',
        profile: { name: 'Test User' }
      };

      const result = await registerUser(userData);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'testuser@tasknest.com',
        'Password123'
      );
      expect(result.username).toBe('testuser');
      expect(result.uid).toBe('user123');
    });
  });

  describe('loginUser', () => {
    it('throws error when credentials missing', async () => {
      await expect(loginUser('', 'password')).rejects.toThrow(
        'Username and password required'
      );
    });

    it('logs in user and returns profile data', async () => {
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'user123' }
      });
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ uid: 'user123', username: 'testuser', role: 'worker' })
      });

      const user = await loginUser('TestUser', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'testuser@tasknest.com',
        'password123'
      );
      expect(user.username).toBe('testuser');
    });

    it('throws error if user snapshot does not exist in Firestore', async () => {
      signInWithEmailAndPassword.mockResolvedValueOnce({
        user: { uid: 'user123' }
      });
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      await expect(loginUser('testuser', 'password123')).rejects.toThrow(
        'User profile missing. Contact admin.'
      );
    });
  });

  describe('logoutUser', () => {
    it('calls signOut and removes localStorage item', async () => {
      signOut.mockResolvedValueOnce();
      localStorage.setItem('currentUser', JSON.stringify({ uid: '123' }));

      await logoutUser();

      expect(signOut).toHaveBeenCalled();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});
