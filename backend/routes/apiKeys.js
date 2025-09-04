const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');

// GET default API keys (for regular users)
router.get('/default', async (req, res) => {
  try {
    // 개발자가 환경변수에 설정한 기본 API 키들을 반환
    const defaultKeys = {
      geminiApiKey: process.env.DEFAULT_GEMINI_API_KEY || '',
      youtubeApiKey: process.env.DEFAULT_YOUTUBE_API_KEY || '',
      googleClientId: process.env.DEFAULT_GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.DEFAULT_GOOGLE_CLIENT_SECRET || '',
      isConfigured: !!(process.env.DEFAULT_GEMINI_API_KEY && process.env.DEFAULT_YOUTUBE_API_KEY),
      hasGeminiKey: !!(process.env.DEFAULT_GEMINI_API_KEY),
      hasYouTubeKey: !!(process.env.DEFAULT_YOUTUBE_API_KEY),
      hasGoogleOAuth: !!(process.env.DEFAULT_GOOGLE_CLIENT_ID && process.env.DEFAULT_GOOGLE_CLIENT_SECRET)
    };

    res.json({
      success: true,
      data: defaultKeys
    });
  } catch (error) {
    console.error('Error getting default API keys:', error);
    res.status(500).json({
      success: false,
      error: '기본 API 키를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

// Get API keys for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 임시로 MongoDB 없이 응답
    res.json({
      success: true,
      data: {
        isConfigured: false,
        hasGeminiKey: false,
        hasYouTubeKey: false,
        hasGoogleOAuth: false
      }
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API keys'
    });
  }
});

// Save API keys
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { geminiApiKey, youtubeApiKey, googleClientId, googleClientSecret } = req.body;
    
    // 임시로 MongoDB 없이 응답
    const isConfigured = !!(geminiApiKey && googleClientId && googleClientSecret);
    
    res.json({
      success: true,
      data: {
        isConfigured: isConfigured,
        message: 'API 키가 성공적으로 저장되었습니다.'
      }
    });
  } catch (error) {
    console.error('Save API keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save API keys'
    });
  }
});

// Test API keys
router.post('/:userId/test', async (req, res) => {
  try {
    const { userId } = req.params;
    const { geminiApiKey, youtubeApiKey } = req.body;
    
    const testResults = {
      gemini: false,
      youtube: false,
      messages: []
    };
    
    // Test Gemini API
    if (geminiApiKey) {
      try {
        const axios = require('axios');
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            contents: [{
              parts: [{ text: "Hello" }]
            }]
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
        if (response.data.candidates && response.data.candidates[0]) {
          testResults.gemini = true;
          testResults.messages.push('✅ Gemini API 연결 성공');
        }
      } catch (error) {
        testResults.messages.push('❌ Gemini API 연결 실패: ' + (error.response?.data?.error?.message || error.message));
      }
    }
    
    // Test YouTube API
    if (youtubeApiKey) {
      try {
        const axios = require('axios');
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${youtubeApiKey}&maxResults=1`
        );
        
        if (response.data.items) {
          testResults.youtube = true;
          testResults.messages.push('✅ YouTube API 연결 성공');
        }
      } catch (error) {
        testResults.messages.push('❌ YouTube API 연결 실패: ' + (error.response?.data?.error?.message || error.message));
      }
    }
    
    res.json({
      success: true,
      data: testResults
    });
  } catch (error) {
    console.error('Test API keys error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test API keys'
    });
  }
});

module.exports = router;
