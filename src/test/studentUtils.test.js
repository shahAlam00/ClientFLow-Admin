import { describe, expect, it } from 'vitest';
import { generateClientIdFromName, buildStudentFormData } from '../lib/studentUtils.js';

describe('student utilities', () => {
    it('generates a client id from the student name', () => {
        expect(generateClientIdFromName('Aarav Sharma')).toBe('STU-AARAVSHARMA');
        expect(generateClientIdFromName('  Priya   Verma  ')).toBe('STU-PRIYAVERMA');
    });

    it('builds form data for API submission', () => {
        const fd = buildStudentFormData({
            studentName: 'Aarav Sharma',
            personalPhone: '9876543210',
            email: 'aarav@test.com',
            targetCourse: 'MBA',
            clientId: '',
        });

        expect(fd.get('studentName')).toBe('Aarav Sharma');
        expect(fd.get('clientId')).toBe('STU-AARAVSHARMA');
        expect(fd.get('personalPhone')).toBe('9876543210');
    });
});
