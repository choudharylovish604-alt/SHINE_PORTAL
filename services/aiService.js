const axios = require('axios');

/**
 * AI Service: Handles communication with the FastAPI ML inference server.
 * Provides risk predictions and explanations for students.
 */
class AIService {
    constructor() {
        this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        this.timeout = 5000; // 5 seconds
    }

    /**
     * Predicts dropout risk for a student.
     * @param {Object} studentData Raw student attributes from database
     * @returns {Object} Prediction result or fallback
     */
    async predictRisk(studentData) {
        try {
            console.log(`Calling AI Service for student: ${studentData.id || 'new'}`);
            
            const response = await axios.post(`${this.baseUrl}/predict`, studentData, {
                timeout: this.timeout
            });

            return response.data;
        } catch (error) {
            console.error('AI Service Error:', error.message);
            
            // Fallback logic: If AI service is down, return a "Safe" prediction with low confidence
            return {
                risk_level: 0,
                risk_label: 'Safe (Fallback)',
                confidence: 0.0,
                probabilities: { "Safe": 1.0, "Medium Risk": 0.0, "High Risk": 0.0 },
                explanation: ['AI Service Offline - using conservative fallback'],
                is_fallback: true
            };
        }
    }

    async predictBatch(studentsArray) {
        try {
            console.log(`Calling AI Service for batch of ${studentsArray.length} students`);
            const response = await axios.post(`${this.baseUrl}/batch-predict`, studentsArray, {
                timeout: 30000 // 30 seconds for batch
            });
            return response.data;
        } catch (error) {
            console.error('AI Batch Error:', error.message);
            return studentsArray.map(() => ({
                risk_level: 0,
                risk_label: 'Safe (Fallback)',
                confidence: 0.0,
                is_fallback: true
            }));
        }
    }

    async getHealth() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.data;
        } catch (error) {
            return { status: 'offline' };
        }
    }
}

module.exports = new AIService();
