export const generateClientIdFromName = (name = '') => {
    const cleanName = String(name || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleanName) return 'STU-NEW';

    const normalized = cleanName.replace(/\s+/g, '');
    return `STU-${normalized}`;
};

export const buildStudentFormData = (formData = {}) => {
    const payload = new FormData();
    const generatedClientId = generateClientIdFromName(formData.studentName || formData.fullName || '');
    const clientId = formData.clientId || generatedClientId;

    const fields = {
        clientId,
        studentName: formData.studentName || '',
        fullName: formData.studentName || '',
        personalPhone: formData.personalPhone || '',
        whatsappNumber: formData.whatsappNumber || '',
        email: formData.email || '',
        dateOfBirth: formData.dateOfBirth || '',
        gender: formData.gender || '',
        city: formData.city || '',
        state: formData.state || '',
        highestQualification: formData.highestQualification || '',
        passingYear: formData.passingYear || '',
        percentageOrCgpa: formData.percentageOrCgpa || '',
        institutionName: formData.institutionName || '',
        targetCourse: formData.targetCourse || '',
        preferredSpecialization: formData.preferredSpecialization || '',
        admissionIntake: formData.admissionIntake || '',
        interestedCollege: formData.interestedCollege || '',
        admissionAgreed: formData.admissionAgreed || 'Pending',
        leadStatus: formData.leadStatus || 'New Inquiry',
        budgetRange: formData.budgetRange || '',
        assignedCounselor: formData.assignedCounselor || '',
        nextFollowUpDate: formData.nextFollowUpDate || '',
        counselingNotes: formData.counselingNotes || '',
    };

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            payload.append(key, String(value));
        }
    });

    if (formData.profileImageFile) {
        payload.append('profileImage', formData.profileImageFile);
    }

    return payload;
};

export const normalizeStudentRecord = (student = {}) => {
    const id = student._id || student.id || student.studentId || '';

    return {
        ...student,
        _id: id,
        id,
        clientId: student.clientId || generateClientIdFromName(student.studentName || student.fullName || ''),
        studentName: student.studentName || student.fullName || 'Unknown Student',
        fullName: student.studentName || student.fullName || 'Unknown Student',
        personalPhone: student.personalPhone || student.mobileNumber || student.mobile || '',
        mobilePrimary: student.personalPhone || student.mobileNumber || student.mobile || '',
        status: student.status || student.leadStatus || student.projectStatus || 'Active',
        course: student.targetCourse || student.course || '',
        email: student.email || '',
        createdAt: student.createdAt || new Date().toISOString(),
    };
};
