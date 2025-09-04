// API Key Management
class ApiKeyManager {
  constructor() {
    this.userId = this.generateUserId();
    this.apiKeys = {};
    this.init();
  }

  generateUserId() {
    // Generate a unique user ID or get from localStorage
    let userId = localStorage.getItem('youtube_optimizer_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('youtube_optimizer_user_id', userId);
    }
    return userId;
  }

  async init() {
    await this.loadApiKeys();
    this.updateStatusDisplay();
  }

  async loadApiKeys() {
    try {
      const response = await fetch(`/api/keys/${this.userId}`);
      const data = await response.json();
      
      if (data.success) {
        this.apiKeys = data.data;
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  }

  async saveApiKeys() {
    const formData = {
      geminiApiKey: document.getElementById('geminiApiKey').value,
      youtubeApiKey: document.getElementById('youtubeApiKey').value,
      googleClientId: document.getElementById('googleClientId').value,
      googleClientSecret: document.getElementById('googleClientSecret').value
    };

    try {
      const response = await fetch(`/api/keys/${this.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadApiKeys();
        this.updateStatusDisplay();
        this.showToast('API 키가 성공적으로 저장되었습니다.', 'success');
        return true;
      } else {
        this.showToast('API 키 저장에 실패했습니다.', 'error');
        return false;
      }
    } catch (error) {
      console.error('Failed to save API keys:', error);
      this.showToast('API 키 저장 중 오류가 발생했습니다.', 'error');
      return false;
    }
  }

  async testApiConnection(type) {
    const testResults = document.getElementById('testResults');
    
    // Create test results element if it doesn't exist
    if (!testResults) {
      const form = document.getElementById('apiForm');
      const testDiv = document.createElement('div');
      testDiv.id = 'testResults';
      testDiv.className = 'alert alert-info mt-3';
      testDiv.style.display = 'none';
      form.appendChild(testDiv);
    }

    const testResultsElement = document.getElementById('testResults');
    testResultsElement.style.display = 'block';
    testResultsElement.className = 'alert alert-info mt-3';
    testResultsElement.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>연결 테스트 중...';

    try {
      let apiKey = '';
      if (type === 'gemini') {
        apiKey = document.getElementById('geminiApiKey').value;
      } else if (type === 'youtube') {
        apiKey = document.getElementById('youtubeApiKey').value;
      }

      if (!apiKey) {
        testResultsElement.className = 'alert alert-warning mt-3';
        testResultsElement.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>API 키를 먼저 입력해주세요.';
        return;
      }

      const response = await fetch(`/api/keys/${this.userId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          geminiApiKey: type === 'gemini' ? apiKey : '',
          youtubeApiKey: type === 'youtube' ? apiKey : ''
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const results = data.data;
        let message = '';
        
        if (type === 'gemini' && results.gemini) {
          testResultsElement.className = 'alert alert-success mt-3';
          message = '<i class="fas fa-check-circle me-2"></i>Gemini API 연결 성공!';
        } else if (type === 'youtube' && results.youtube) {
          testResultsElement.className = 'alert alert-success mt-3';
          message = '<i class="fas fa-check-circle me-2"></i>YouTube API 연결 성공!';
        } else {
          testResultsElement.className = 'alert alert-danger mt-3';
          message = '<i class="fas fa-times-circle me-2"></i>' + (results.messages ? results.messages.join('<br>') : '연결 실패');
        }
        
        testResultsElement.innerHTML = message;
      } else {
        testResultsElement.className = 'alert alert-danger mt-3';
        testResultsElement.innerHTML = '<i class="fas fa-times-circle me-2"></i>연결 테스트에 실패했습니다.';
      }
    } catch (error) {
      console.error('Test connection error:', error);
      testResultsElement.className = 'alert alert-danger mt-3';
      testResultsElement.innerHTML = '<i class="fas fa-times-circle me-2"></i>연결 테스트 중 오류가 발생했습니다.';
    }
  }

  updateStatusDisplay() {
    // Update Gemini status
    const geminiStatus = document.getElementById('geminiStatus');
    if (geminiStatus) {
      const geminiBadge = geminiStatus.querySelector('.badge');
      if (this.apiKeys.hasGeminiKey) {
        geminiBadge.className = 'badge bg-success';
        geminiBadge.textContent = '설정됨';
      } else {
        geminiBadge.className = 'badge bg-secondary';
        geminiBadge.textContent = '미설정';
      }
    }

    // Update YouTube status
    const youtubeStatus = document.getElementById('youtubeStatus');
    if (youtubeStatus) {
      const youtubeBadge = youtubeStatus.querySelector('.badge');
      if (this.apiKeys.hasYouTubeKey) {
        youtubeBadge.className = 'badge bg-success';
        youtubeBadge.textContent = '설정됨';
      } else {
        youtubeBadge.className = 'badge bg-secondary';
        youtubeBadge.textContent = '미설정';
      }
    }

    // Update OAuth status
    const oauthStatus = document.getElementById('oauthStatus');
    if (oauthStatus) {
      const oauthBadge = oauthStatus.querySelector('.badge');
      if (this.apiKeys.hasGoogleOAuth) {
        oauthBadge.className = 'badge bg-success';
        oauthBadge.textContent = '설정됨';
      } else {
        oauthBadge.className = 'badge bg-secondary';
        oauthBadge.textContent = '미설정';
      }
    }
  }

  getUserId() {
    return this.userId;
  }

  isConfigured() {
    return this.apiKeys.isConfigured;
  }

  showToast(message, type = 'info') {
    // Create toast element
    const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
    
    const toastId = 'toast_' + Date.now();
    const toastHtml = `
      <div id="${toastId}" class="toast" role="alert">
        <div class="toast-header">
          <i class="fas fa-${type === 'success' ? 'check-circle text-success' : type === 'error' ? 'times-circle text-danger' : 'info-circle text-info'} me-2"></i>
          <strong class="me-auto">알림</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
          ${message}
        </div>
      </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
  }
}

// Global API Key Manager instance
const apiKeyManager = new ApiKeyManager();

// Utility functions
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.nextElementSibling;
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function showApiGuide(type) {
  const guideContent = document.getElementById('guideContent');
  
  let guideHtml = '';
  
  if (type === 'gemini') {
    guideHtml = `
      <h4><i class="fas fa-robot text-primary"></i>Gemini API 키 발급 방법</h4>
      <div class="guide-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h6>Google AI Studio 접속</h6>
            <p>Google AI Studio에 로그인합니다.</p>
            <a href="https://aistudio.google.com/" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-external-link-alt me-1"></i>Google AI Studio 바로가기
            </a>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h6>API 키 생성</h6>
            <p>좌측 메뉴에서 "Get API key" 클릭</p>
            <p>"Create API key" 버튼을 클릭하여 새 키를 생성합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h6>API 키 복사</h6>
            <p>생성된 API 키를 복사하여 위의 입력란에 붙여넣기 합니다.</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>주의:</strong> API 키는 안전하게 보관하고 타인과 공유하지 마세요.
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'youtube') {
    guideHtml = `
      <h4><i class="fab fa-youtube text-danger"></i>YouTube Data API 키 발급 방법</h4>
      <div class="guide-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h6>Google Cloud Console 접속</h6>
            <p>Google Cloud Console에 로그인합니다.</p>
            <a href="https://console.cloud.google.com/" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-external-link-alt me-1"></i>Google Cloud Console 바로가기
            </a>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h6>프로젝트 생성 또는 선택</h6>
            <p>새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h6>YouTube Data API v3 활성화</h6>
            <p>API 및 서비스 > 라이브러리에서 "YouTube Data API v3"를 검색하고 활성화합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h6>API 키 생성</h6>
            <p>API 및 서비스 > 사용자 인증 정보에서 "사용자 인증 정보 만들기" > "API 키"를 클릭합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h6>API 키 제한 설정 (권장)</h6>
            <p>생성된 API 키를 클릭하여 YouTube Data API v3로만 제한하는 것을 권장합니다.</p>
          </div>
        </div>
      </div>
    `;
  } else if (type === 'oauth') {
    guideHtml = `
      <h4><i class="fab fa-google text-success"></i>Google OAuth 설정 방법</h4>
      <div class="guide-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h6>Google Cloud Console 접속</h6>
            <p>YouTube API와 같은 프로젝트를 사용합니다.</p>
            <a href="https://console.cloud.google.com/" target="_blank" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-external-link-alt me-1"></i>Google Cloud Console 바로가기
            </a>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h6>OAuth 동의 화면 설정</h6>
            <p>API 및 서비스 > OAuth 동의 화면에서 앱 정보를 설정합니다.</p>
            <p>사용자 유형을 "외부"로 선택하고 필요한 정보를 입력합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h6>사용자 인증 정보 생성</h6>
            <p>API 및 서비스 > 사용자 인증 정보에서 "사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID"를 클릭합니다.</p>
            <p>애플리케이션 유형을 "웹 애플리케이션"으로 선택합니다.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h6>승인된 리디렉션 URI 설정</h6>
            <p>다음 URI를 승인된 리디렉션 URI에 추가합니다:</p>
            <code>http://localhost:3000/api/auth/callback</code><br>
            <code>https://your-domain.com/api/auth/callback</code>
          </div>
        </div>
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <h6>클라이언트 정보 복사</h6>
            <p>생성된 클라이언트 ID와 클라이언트 시크릿을 위의 입력란에 입력합니다.</p>
            <div class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>주의:</strong> 클라이언트 시크릿은 안전하게 보관하고 타인과 공유하지 마세요.
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  guideContent.innerHTML = guideHtml;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('apiGuideModal'));
  modal.show();
}

function testApiConnection(type) {
  apiKeyManager.testApiConnection(type);
}

async function saveApiKeys() {
  const success = await apiKeyManager.saveApiKeys();
  if (success) {
    // Close modal after successful save
    const modal = bootstrap.Modal.getInstance(document.getElementById('apiSettingsModal'));
    modal.hide();
  }
}

// Show API settings modal
function showApiSettings() {
  const modal = new bootstrap.Modal(document.getElementById('apiSettingsModal'));
  modal.show();
}

// Update app.js to use user-specific API keys
function callOptimizeAPI(endpoint, data) {
  // Add userId to the request
  data.userId = apiKeyManager.getUserId();
  
  return fetch(`/api/optimize/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

// Check API configuration before making requests
function checkApiConfiguration() {
  if (!apiKeyManager.isConfigured()) {
    apiKeyManager.showToast('API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.', 'warning');
    showApiSettings();
    return false;
  }
  return true;
}

// Export for use in other files
window.apiKeyManager = apiKeyManager;
window.showApiSettings = showApiSettings;
window.togglePassword = togglePassword;
window.showApiGuide = showApiGuide;
window.testApiConnection = testApiConnection;
window.saveApiKeys = saveApiKeys;
window.checkApiConfiguration = checkApiConfiguration;
