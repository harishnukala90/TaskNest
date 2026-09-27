import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addActivity, applyForJob } from './activity';

vi.mock('../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(val => val),
  getDoc: vi.fn()
}));

import { doc, updateDoc, getDoc } from 'firebase/firestore';

describe('Activity Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addActivity', () => {
    it('returns early if userId is falsy', async () => {
      await addActivity(null, 'Test message');
      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('updates user doc with activity log entry', async () => {
      doc.mockReturnValue('user-doc-ref');
      updateDoc.mockResolvedValueOnce(undefined);

      await addActivity('user123', 'Applied for job', 'provider456');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123');
      expect(updateDoc).toHaveBeenCalledWith('user-doc-ref', {
        activity: expect.objectContaining({
          message: 'Applied for job',
          relatedUserId: 'provider456'
        })
      });
    });
  });

  describe('applyForJob', () => {
    it('returns error result when job is not found', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const res = await applyForJob('job123', 'worker123', 'John Worker');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Job not found');
    });

    it('applies for job successfully and adds activity', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ title: 'Plumbing Repair', providerId: 'provider789' })
      });
      updateDoc.mockResolvedValue(undefined);

      const res = await applyForJob('job123', 'worker123', 'John Worker');

      expect(res.success).toBe(true);
      expect(updateDoc).toHaveBeenCalledTimes(2);
    });
  });
});
