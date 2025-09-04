const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const ApiKey = require('../models/ApiKey');

// OAuth2 클라이언트 생성 함수
async function createOAuth2Client(userId) {
  try {
    const apiKey = await ApiKey.findOne({ userId });
    if (!apiKey || !apiKey.googleClientId || !apiKey.googleClientSecret) {
      throw new Error('Google OAuth 설정이 완료되지 않았습니다.');
    }
    
    return new OAuth2Client(
      apiKey.googleClientId,
      apiKey.googleClientSecret,
      `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/callback`
    );
  } catch (error) {
    console.error('OAuth2 클라이언트 생성 오류:', error);
    throw error;
  }
}

// OAuth 인증 URL 생성
router.get('/url/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const oauth2Client = await createOAuth2Client(userId);
    
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
    
    res.json({
      success: true,
      data: {
        authUrl: authUrl
      }
    });
    
  } catch (error) {
    console.error('인증 URL 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message || '인증 URL 생성에 실패했습니다.'
    });
  }
});

// OAuth 콜백 처리
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: '인증 코드가 없습니다.'
      });
    }
    
    // state에서 userId 추출 (실제 구현에서는 더 안전한 방법 사용)
    const userId = state || 'default_user';
    
    const oauth2Client = await createOAuth2Client(userId);
    
    // 인증 코드로 토큰 교환
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // 사용자 정보 가져오기
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // YouTube API 클라이언트 생성
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // 사용자의 YouTube 채널 정보 가져오기
    const channelsResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true
    });
    
    const channel = channelsResponse.data.items?.[0];
    
    if (!channel) {
      throw new Error('YouTube 채널을 찾을 수 없습니다.');
    }
    
    // 세션에 토큰 저장 (실제 구현에서는 데이터베이스에 저장)
    req.session = req.session || {};
    req.session[userId] = {
      tokens: tokens,
      userInfo: userInfo.data,
      channelInfo: channel
    };
    
    // 성공 페이지로 리디렉션
    const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-success?userId=${userId}`;
    res.redirect(successUrl);
    
  } catch (error) {
    console.error('OAuth 콜백 처리 오류:', error);
    const errorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth-error?error=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
});

// 사용자 정보 가져오기
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 세션에서 사용자 정보 가져오기
    const sessionData = req.session?.[userId];
    
    if (!sessionData) {
      return res.status(401).json({
        success: false,
        error: '인증되지 않은 사용자입니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        userInfo: sessionData.userInfo,
        channelInfo: sessionData.channelInfo
      }
    });
    
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '사용자 정보 조회에 실패했습니다.'
    });
  }
});

// 로그아웃
router.post('/logout/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // 세션에서 사용자 데이터 삭제
    if (req.session && req.session[userId]) {
      delete req.session[userId];
    }
    
    res.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
    
  } catch (error) {
    console.error('로그아웃 오류:', error);
    res.status(500).json({
      success: false,
      error: '로그아웃에 실패했습니다.'
    });
  }
});

module.exports = router;
