/**
 * YouTube OAuth 인증 관련 기능
 * 
 * @author SDI Solution Driven Innovators
 * @version 1.0.0
 */

// OAuth 설정
const OAUTH_CONFIG = {
  CLIENT_ID: 'your_google_client_id',
  REDIRECT_URI: window.location.origin + '/auth/callback',
  SCOPE: 'https://www.googleapis.com/auth/youtube.readonly',
  AUTH_URL: 'https://accounts.google.com/o/oauth2/auth'
};

/**
 * OAuth 인증 URL 생성
 */
function generateAuthUrl() {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.CLIENT_ID,
    redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
    scope: OAUTH_CONFIG.SCOPE,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `${OAUTH_CONFIG.AUTH_URL}?${params.toString()}`;
}

/**
 * 인증 코드를 액세스 토큰으로 교환
 */
async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      throw new Error('토큰 교환 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('토큰 교환 오류:', error);
    throw error;
  }
}

/**
 * YouTube 채널 정보 가져오기
 */
async function getYouTubeChannelInfo(accessToken) {
  try {
    const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('채널 정보 가져오기 실패');
    }
    
    const data = await response.json();
    return data.items[0];
  } catch (error) {
    console.error('채널 정보 가져오기 오류:', error);
    throw error;
  }
}

/**
 * 인증 상태 확인
 */
function checkAuthStatus() {
  const token = localStorage.getItem('youtube_access_token');
  const expiresAt = localStorage.getItem('youtube_token_expires_at');
  
  if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
    return { isAuthenticated: true, token };
  }
  
  return { isAuthenticated: false };
}

/**
 * 토큰 저장
 */
function saveToken(tokenData) {
  const expiresAt = Date.now() + (tokenData.expires_in * 1000);
  
  localStorage.setItem('youtube_access_token', tokenData.access_token);
  localStorage.setItem('youtube_token_expires_at', expiresAt.toString());
  
  if (tokenData.refresh_token) {
    localStorage.setItem('youtube_refresh_token', tokenData.refresh_token);
  }
}

/**
 * 토큰 새로고침
 */
async function refreshToken() {
  const refreshToken = localStorage.getItem('youtube_refresh_token');
  
  if (!refreshToken) {
    throw new Error('리프레시 토큰이 없습니다.');
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('토큰 새로고침 실패');
    }
    
    const tokenData = await response.json();
    saveToken(tokenData);
    return tokenData.access_token;
  } catch (error) {
    console.error('토큰 새로고침 오류:', error);
    throw error;
  }
}

/**
 * 로그아웃
 */
function logout() {
  localStorage.removeItem('youtube_access_token');
  localStorage.removeItem('youtube_token_expires_at');
  localStorage.removeItem('youtube_refresh_token');
  localStorage.removeItem('youtube_channel_info');
  
  // UI 상태 업데이트
  if (typeof updateUIState === 'function') {
    updateUIState();
  }
}

/**
 * 인증 팝업 창 관리
 */
class AuthPopup {
  constructor() {
    this.popup = null;
    this.checkInterval = null;
  }
  
  open() {
    const authUrl = generateAuthUrl();
    const popupFeatures = 'width=500,height=600,scrollbars=yes,resizable=yes,status=yes';
    
    this.popup = window.open(authUrl, 'youtube_auth', popupFeatures);
    
    if (!this.popup) {
      throw new Error('팝업 창을 열 수 없습니다. 팝업 차단을 해제해주세요.');
    }
    
    return this.popup;
  }
  
  waitForResult() {
    return new Promise((resolve, reject) => {
      this.checkInterval = setInterval(() => {
        try {
          if (this.popup.closed) {
            clearInterval(this.checkInterval);
            reject(new Error('인증이 취소되었습니다.'));
            return;
          }
          
          const currentUrl = this.popup.location.href;
          
          if (currentUrl.includes('auth/callback')) {
            clearInterval(this.checkInterval);
            this.popup.close();
            
            const urlParams = new URLSearchParams(this.popup.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            
            if (error) {
              reject(new Error('인증에 실패했습니다.'));
            } else if (code) {
              resolve(code);
            } else {
              reject(new Error('인증 코드를 받지 못했습니다.'));
            }
          }
        } catch (error) {
          // 팝업이 다른 도메인에 있을 때 발생하는 오류는 무시
        }
      }, 100);
    });
  }
  
  close() {
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// 전역 인증 팝업 인스턴스
let authPopup = null;

/**
 * YouTube 채널 연동 (개선된 버전)
 */
async function connectYouTubeChannel() {
  try {
    showLoadingState('connectChannel');
    
    // 인증 팝업 열기
    authPopup = new AuthPopup();
    const popup = authPopup.open();
    
    // 인증 결과 대기
    const code = await authPopup.waitForResult();
    
    // 토큰 교환
    const tokenData = await exchangeCodeForToken(code);
    saveToken(tokenData);
    
    // 채널 정보 가져오기
    const channelInfo = await getYouTubeChannelInfo(tokenData.access_token);
    
    // 채널 정보 저장
    localStorage.setItem('youtube_channel_info', JSON.stringify(channelInfo));
    
    // 앱 상태 업데이트
    appState.isConnected = true;
    appState.channelId = channelInfo.id;
    appState.channelName = channelInfo.snippet.title;
    
    saveAppState();
    updateUIState();
    showSuccessMessage('채널이 성공적으로 연동되었습니다!');
    
    // 분석 이벤트 추적
    trackEvent('engagement', 'channel_connected');
    
    // 업로드 시간 분석 시작
    analyzeUploadTime();
    
  } catch (error) {
    console.error('채널 연동 오류:', error);
    showErrorMessage('채널 연동에 실패했습니다. 다시 시도해주세요.');
    
    // 분석 이벤트 추적
    trackEvent('error', 'channel_connection_failed');
  } finally {
    hideLoadingState('connectChannel');
    
    if (authPopup) {
      authPopup.close();
      authPopup = null;
    }
  }
}

/**
 * 인증 상태 초기화
 */
function initializeAuth() {
  const authStatus = checkAuthStatus();
  
  if (authStatus.isAuthenticated) {
    // 저장된 채널 정보 복원
    const channelInfo = localStorage.getItem('youtube_channel_info');
    if (channelInfo) {
      const channel = JSON.parse(channelInfo);
      appState.isConnected = true;
      appState.channelId = channel.id;
      appState.channelName = channel.snippet.title;
    }
  }
}

// 페이지 로드 시 인증 상태 초기화
document.addEventListener('DOMContentLoaded', initializeAuth);
