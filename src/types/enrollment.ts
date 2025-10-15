export interface EnrollmentData {
    userId: string
    examPlanId: string
    formData: {
        name: string
        idNumber: string
        gender: string
        culturalLevel: string
        workUnit: string
        workExperience: string
        materials: string[]
        employerOpinion: string
    }
}

export interface EnrollmentResponse {
    success: boolean
    message: string
    data?: {
        enrollmentId: string
        status: string
    }
} 