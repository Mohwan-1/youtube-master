/**
 * YouTube 메타데이터 최적화 도구 - 메인 애플리케이션 로직
 * 
 * @author SDI Solution Driven Innovators
 * @version 1.0.0
 */

// 전역 변수
const API_ENDPOINTS = {
  OPTIMIZE_TITLE: '/api/optimize/title',
  GET_TAGS: '/api/optimize/tags',
  ANALYTICS: '/api/analytics',
  AUTH: '/api/auth'
};

const MAX_TITLE_LENGTH = 200;
const DEFAULT_TAG_COUNT = 10;

// 애플리케이션 상태
let appState = {
  isConnected: false,
  channelId: null,
  channelName: null,
  currentOptimization: null
};

/**
 * 애플리케이션 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('YouTube Optimizer 초기화 중...');
  
  initializeApp();
  setupEventListeners();
  setupScrollAnimations();
  
  console.log('YouTube Optimizer 초기화 완료');
});

/**
 * 애플리케이션 초기화
 */
function initializeApp() {
  // 로컬 스토리지에서 상태 복원
  restoreAppState();
  
  // UI 상태 업데이트
  updateUIState();
  
  // 광고 로드
  loadAds();
  
  // 분석 이벤트 추적
  trackPageView();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 시작하기 버튼
  const startBtn = document.getElementById('startOptimization');
  if (startBtn) {
    startBtn.addEventListener('click', scrollToOptimization);
  }
  
  // 사용법 보기 버튼
  const learnBtn = document.getElementById('learnMore');
  if (learnBtn) {
    learnBtn.addEventListener('click', scrollToHowItWorks);
  }
  
  // 채널 연동 버튼
  const connectBtn = document.getElementById('connectChannel');
  if (connectBtn) {
    connectBtn.addEventListener('click', connectYouTubeChannel);
  }
  
  // 제목 최적화 버튼
  const optimizeBtn = document.getElementById('optimizeTitle');
  if (optimizeBtn) {
    optimizeBtn.addEventListener('click', optimizeTitle);
  }
  
  // 제목 입력 필드
  const titleInput = document.getElementById('originalTitle');
  if (titleInput) {
    titleInput.addEventListener('input', handleTitleInput);
    titleInput.addEventListener('keypress', handleTitleKeypress);
  }
  
  // 옵션 체크박스들
  const emojiCheckbox = document.getElementById('includeEmoji');
  const trendingCheckbox = document.getElementById('includeTrending');
  
  if (emojiCheckbox) {
    emojiCheckbox.addEventListener('change', handleOptionChange);
  }
  
  if (trendingCheckbox) {
    trendingCheckbox.addEventListener('change', handleOptionChange);
  }
  
  // 스무스 스크롤
  setupSmoothScroll();
}

/**
 * 스크롤 애니메이션 설정
 */
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);
  
  // 애니메이션 대상 요소들
  const animateElements = document.querySelectorAll('.scroll-animate');
  animateElements.forEach(el => observer.observe(el));
}

/**
 * 스무스 스크롤 설정
 */
function setupSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 최적화 섹션으로 스크롤
 */
function scrollToOptimization() {
  const optimizationSection = document.getElementById('optimization');
  if (optimizationSection) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = optimizationSection.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // 분석 이벤트 추적
    trackEvent('engagement', 'scroll_to_optimization');
  }
}

/**
 * 사용법 섹션으로 스크롤
 */
function scrollToHowItWorks() {
  const howItWorksSection = document.getElementById('how-it-works');
  if (howItWorksSection) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = howItWorksSection.offsetTop - headerHeight - 20;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // 분석 이벤트 추적
    trackEvent('engagement', 'scroll_to_how_it_works');
  }
}

/**
 * YouTube 채널 연동
 */
async function connectYouTubeChannel() {
  try {
    showLoadingState('connectChannel');
    
    // Google OAuth 인증 URL 생성
    const authUrl = await getAuthUrl();
    
    // 새 창에서 인증 진행
    const authWindow = window.open(authUrl, 'youtube_auth', 
      'width=500,height=600,scrollbars=yes,resizable=yes');
    
    // 인증 완료 대기
    const result = await waitForAuthResult(authWindow);
    
    if (result.success) {
      appState.isConnected = true;
      appState.channelId = result.channelId;
      appState.channelName = result.channelName;
      
      saveAppState();
      updateUIState();
      showSuccessMessage('채널이 성공적으로 연동되었습니다!');
      
      // 분석 이벤트 추적
      trackEvent('engagement', 'channel_connected');
      
      // 업로드 시간 분석 시작
      analyzeUploadTime();
    } else {
      throw new Error(result.error || '채널 연동에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('채널 연동 오류:', error);
    showErrorMessage('채널 연동에 실패했습니다. 다시 시도해주세요.');
    
    // 분석 이벤트 추적
    trackEvent('error', 'channel_connection_failed');
  } finally {
    hideLoadingState('connectChannel');
  }
}

/**
 * 제목 최적화
 */
async function optimizeTitle() {
  const originalTitle = document.getElementById('originalTitle').value.trim();
  
  // 입력 검증
  if (!originalTitle) {
    showErrorMessage('제목을 입력해주세요.');
    return;
  }
  
  if (originalTitle.length > MAX_TITLE_LENGTH) {
    showErrorMessage(`제목이 너무 깁니다. (최대 ${MAX_TITLE_LENGTH}자)`);
    return;
  }
  
  try {
    showLoadingState('optimizeTitle');
    hideResults();
    
    // 최적화 옵션 수집
    const options = {
      includeEmoji: document.getElementById('includeEmoji').checked,
      includeTrending: document.getElementById('includeTrending').checked,
      channelId: appState.channelId
    };
    
    // API 호출
    const result = await callOptimizeAPI(originalTitle, options);
    
    if (result.success) {
      appState.currentOptimization = result.data;
      displayOptimizedTitles(result.data.titles);
      generateTags(originalTitle, result.data.titles);
      
      // 분석 이벤트 추적
      trackEvent('engagement', 'title_optimized', {
        title_length: originalTitle.length,
        has_channel: !!appState.channelId
      });
    } else {
      throw new Error(result.error || '제목 최적화에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('제목 최적화 오류:', error);
    showErrorMessage('제목 최적화에 실패했습니다. 다시 시도해주세요.');
    
    // 분석 이벤트 추적
    trackEvent('error', 'title_optimization_failed');
  } finally {
    hideLoadingState('optimizeTitle');
  }
}

/**
 * 제목 입력 처리
 */
function handleTitleInput(event) {
  const textarea = event.target;
  const charCount = textarea.value.length;
  const charCounter = document.getElementById('charCount');
  
  if (charCounter) {
    charCounter.textContent = charCount;
    
    // 글자 수에 따른 색상 변경
    if (charCount > MAX_TITLE_LENGTH * 0.9) {
      charCounter.style.color = 'var(--warning-color)';
    } else if (charCount > MAX_TITLE_LENGTH) {
      charCounter.style.color = 'var(--danger-color)';
    } else {
      charCounter.style.color = 'var(--gray-500)';
    }
  }
}

/**
 * 제목 입력 키보드 처리
 */
function handleTitleKeypress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    optimizeTitle();
  }
}

/**
 * 옵션 변경 처리
 */
function handleOptionChange() {
  // 옵션 변경 시 이전 결과 숨김
  hideResults();
}

/**
 * 최적화된 제목 표시
 */
function displayOptimizedTitles(titles) {
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsSection = document.getElementById('optimizationResults');
  
  if (!resultsContainer || !resultsSection) return;
  
  resultsContainer.innerHTML = '';
  
  titles.forEach((titleData, index) => {
    const resultItem = createResultItem(titleData, index + 1);
    resultsContainer.appendChild(resultItem);
  });
  
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * 결과 아이템 생성
 */
function createResultItem(titleData, rank) {
  const resultItem = document.createElement('div');
  resultItem.className = 'result-item fade-in-up';
  
  const ctrPercentage = (titleData.expectedCTR * 100).toFixed(1);
  const confidencePercentage = (titleData.confidence * 100).toFixed(0);
  
  resultItem.innerHTML = `
    <div class="result-title">${titleData.title}</div>
    <div class="result-stats">
      <div class="stat-item">
        <i class="fas fa-chart-line"></i>
        <span>예상 클릭률: <span class="stat-value">${ctrPercentage}%</span></span>
      </div>
      <div class="stat-item">
        <i class="fas fa-shield-alt"></i>
        <span>신뢰도: <span class="stat-value">${confidencePercentage}%</span></span>
      </div>
      <div class="stat-item">
        <i class="fas fa-hashtag"></i>
        <span>순위: <span class="stat-value">${rank}</span></span>
      </div>
    </div>
    <div class="result-actions">
      <button class="btn btn-copy" onclick="copyToClipboard('${titleData.title}')">
        <i class="fas fa-copy"></i> 복사
      </button>
      <button class="btn btn-copy" onclick="useTitle('${titleData.title}')">
        <i class="fas fa-check"></i> 사용
      </button>
    </div>
  `;
  
  return resultItem;
}

/**
 * 태그 생성
 */
async function generateTags(originalTitle, optimizedTitles) {
  try {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return;
    
    // 로딩 상태 표시
    tagsContainer.innerHTML = `
      <div class="tags-placeholder">
        <div class="loading-spinner"></div>
        <p>태그를 생성하고 있습니다...</p>
      </div>
    `;
    
    // 태그 생성 API 호출
    const result = await callTagsAPI(originalTitle, optimizedTitles);
    
    if (result.success) {
      displayTags(result.data.tags);
    } else {
      throw new Error(result.error || '태그 생성에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('태그 생성 오류:', error);
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
      tagsContainer.innerHTML = `
        <div class="tags-placeholder">
          <p>태그 생성에 실패했습니다.</p>
        </div>
      `;
    }
  }
}

/**
 * 태그 표시
 */
function displayTags(tags) {
  const tagsContainer = document.getElementById('tagsContainer');
  if (!tagsContainer) return;
  
  const tagsList = document.createElement('div');
  tagsList.className = 'tags-list';
  
  tags.forEach(tag => {
    const tagItem = document.createElement('div');
    tagItem.className = 'tag-item';
    tagItem.textContent = tag;
    tagItem.onclick = () => copyToClipboard(tag);
    tagsList.appendChild(tagItem);
  });
  
  tagsContainer.innerHTML = '';
  tagsContainer.appendChild(tagsList);
}

/**
 * 업로드 시간 분석
 */
async function analyzeUploadTime() {
  if (!appState.channelId) return;
  
  try {
    const uploadTimeContainer = document.getElementById('uploadTimeContainer');
    if (!uploadTimeContainer) return;
    
    // 로딩 상태 표시
    uploadTimeContainer.innerHTML = `
      <div class="upload-time-placeholder">
        <div class="loading-spinner"></div>
        <p>업로드 시간을 분석하고 있습니다...</p>
      </div>
    `;
    
    // 분석 API 호출
    const result = await callAnalyticsAPI(appState.channelId);
    
    if (result.success) {
      displayUploadTime(result.data.uploadTime);
    } else {
      throw new Error(result.error || '업로드 시간 분석에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('업로드 시간 분석 오류:', error);
    const uploadTimeContainer = document.getElementById('uploadTimeContainer');
    if (uploadTimeContainer) {
      uploadTimeContainer.innerHTML = `
        <div class="upload-time-placeholder">
          <p>업로드 시간 분석에 실패했습니다.</p>
        </div>
      `;
    }
  }
}

/**
 * 업로드 시간 표시
 */
function displayUploadTime(uploadTimeData) {
  const uploadTimeContainer = document.getElementById('uploadTimeContainer');
  if (!uploadTimeContainer) return;
  
  const timeGrid = document.createElement('div');
  timeGrid.className = 'upload-time-grid';
  
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const timeSlots = ['오전', '오후', '저녁', '밤'];
  
  days.forEach(day => {
    timeSlots.forEach(timeSlot => {
      const timeSlotElement = document.createElement('div');
      timeSlotElement.className = 'time-slot';
      
      const isOptimal = uploadTimeData.optimal.includes(`${day}-${timeSlot}`);
      if (isOptimal) {
        timeSlotElement.classList.add('optimal');
      }
      
      timeSlotElement.innerHTML = `
        <div><strong>${day}</strong></div>
        <div>${timeSlot}</div>
      `;
      
      timeGrid.appendChild(timeSlotElement);
    });
  });
  
  uploadTimeContainer.innerHTML = '';
  uploadTimeContainer.appendChild(timeGrid);
}

/**
 * 클립보드에 복사
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback('클립보드에 복사되었습니다!');
    
    // 분석 이벤트 추적
    trackEvent('engagement', 'copy_title');
    
  } catch (error) {
    console.error('클립보드 복사 오류:', error);
    showErrorMessage('클립보드 복사에 실패했습니다.');
  }
}

/**
 * 제목 사용
 */
function useTitle(title) {
  const titleInput = document.getElementById('originalTitle');
  if (titleInput) {
    titleInput.value = title;
    showCopyFeedback('제목이 입력되었습니다!');
    
    // 분석 이벤트 추적
    trackEvent('engagement', 'use_title');
  }
}

/**
 * UI 상태 업데이트
 */
function updateUIState() {
  const connectionStatus = document.getElementById('connectionStatus');
  const channelName = document.getElementById('channelName');
  const connectBtn = document.getElementById('connectChannel');
  
  if (appState.isConnected) {
    if (connectionStatus) {
      connectionStatus.style.display = 'block';
    }
    if (channelName) {
      channelName.textContent = appState.channelName;
    }
    if (connectBtn) {
      connectBtn.innerHTML = '<i class="fas fa-check me-2"></i>연동 완료';
      connectBtn.disabled = true;
      connectBtn.classList.remove('btn-danger');
      connectBtn.classList.add('btn-success');
    }
  } else {
    if (connectionStatus) {
      connectionStatus.style.display = 'none';
    }
    if (connectBtn) {
      connectBtn.innerHTML = '<i class="fab fa-google me-2"></i>Google 계정으로 연동';
      connectBtn.disabled = false;
      connectBtn.classList.remove('btn-success');
      connectBtn.classList.add('btn-danger');
    }
  }
}

/**
 * 로딩 상태 표시
 */
function showLoadingState(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.innerHTML = '<div class="loading-spinner"></div> 처리 중...';
  }
  
  if (buttonId === 'optimizeTitle') {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.style.display = 'block';
    }
  }
}

/**
 * 로딩 상태 숨김
 */
function hideLoadingState(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    
    if (buttonId === 'connectChannel') {
      button.innerHTML = '<i class="fab fa-google me-2"></i>Google 계정으로 연동';
    } else if (buttonId === 'optimizeTitle') {
      button.innerHTML = '<i class="fas fa-magic me-2"></i>제목 최적화하기';
    }
  }
  
  if (buttonId === 'optimizeTitle') {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.style.display = 'none';
    }
  }
}

/**
 * 결과 숨김
 */
function hideResults() {
  const resultsSection = document.getElementById('optimizationResults');
  if (resultsSection) {
    resultsSection.style.display = 'none';
  }
}

/**
 * 성공 메시지 표시
 */
function showSuccessMessage(message) {
  showAlert(message, 'success');
}

/**
 * 에러 메시지 표시
 */
function showErrorMessage(message) {
  showAlert(message, 'danger');
}

/**
 * 경고 메시지 표시
 */
function showWarningMessage(message) {
  showAlert(message, 'warning');
}

/**
 * 알림 표시
 */
function showAlert(message, type = 'info') {
  const alertContainer = document.createElement('div');
  alertContainer.className = `alert alert-${type} alert-dismissible fade show`;
  alertContainer.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.querySelector('.optimization-container');
  if (container) {
    container.insertBefore(alertContainer, container.firstChild);
    
    // 5초 후 자동 제거
    setTimeout(() => {
      if (alertContainer.parentNode) {
        alertContainer.remove();
      }
    }, 5000);
  }
}

/**
 * 복사 피드백 표시
 */
function showCopyFeedback(message) {
  // 기존 피드백 제거
  const existingFeedback = document.querySelector('.copy-feedback');
  if (existingFeedback) {
    existingFeedback.remove();
  }
  
  const feedback = document.createElement('div');
  feedback.className = 'copy-feedback';
  feedback.textContent = message;
  
  document.body.appendChild(feedback);
  
  // 애니메이션 시작
  setTimeout(() => {
    feedback.classList.add('show');
  }, 100);
  
  // 3초 후 제거
  setTimeout(() => {
    feedback.classList.remove('show');
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.remove();
      }
    }, 300);
  }, 3000);
}

/**
 * 앱 상태 저장
 */
function saveAppState() {
  try {
    localStorage.setItem('youtubeOptimizerState', JSON.stringify(appState));
  } catch (error) {
    console.error('상태 저장 오류:', error);
  }
}

/**
 * 앱 상태 복원
 */
function restoreAppState() {
  try {
    const savedState = localStorage.getItem('youtubeOptimizerState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      appState = { ...appState, ...parsedState };
    }
  } catch (error) {
    console.error('상태 복원 오류:', error);
  }
}

/**
 * 광고 로드
 */
function loadAds() {
  // AdSense 광고는 이미 HTML에 포함되어 있음
  // 추가 광고 로드 로직이 필요한 경우 여기에 구현
}

/**
 * 페이지 조회 추적
 */
function trackPageView() {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: 'YouTube 메타데이터 최적화 도구',
      page_location: window.location.href
    });
  }
}

/**
 * 이벤트 추적
 */
function trackEvent(action, label, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: 'engagement',
      event_label: label,
      ...parameters
    });
  }
}

// API 호출 함수들 (백엔드 구현 후 실제 API 호출로 교체)
async function getAuthUrl() {
  // 임시 구현 - 실제로는 백엔드 API 호출
  return 'https://accounts.google.com/o/oauth2/auth?client_id=your_client_id&redirect_uri=your_redirect_uri&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code';
}

async function waitForAuthResult(authWindow) {
  // 임시 구현 - 실제로는 OAuth 콜백 처리
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        channelId: 'UC1234567890',
        channelName: '테스트 채널'
      });
    }, 2000);
  });
}

async function callOptimizeAPI(title, options) {
  // 임시 구현 - 실제로는 백엔드 API 호출
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          titles: [
            {
              title: '🎬 AI가 만든 완벽한 제목으로 조회수 폭증!',
              expectedCTR: 0.15,
              confidence: 0.85
            },
            {
              title: '🔥 이 제목 하나로 유튜브 성공 확정!',
              expectedCTR: 0.12,
              confidence: 0.78
            },
            {
              title: '💡 크리에이터들이 몰래 쓰는 제목 비법',
              expectedCTR: 0.10,
              confidence: 0.72
            }
          ]
        }
      });
    }, 3000);
  });
}

async function callTagsAPI(originalTitle, optimizedTitles) {
  // 임시 구현 - 실제로는 백엔드 API 호출
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          tags: ['유튜브', '최적화', '제목', 'AI', '크리에이터', '성공', '조회수', '팁', '노하우', '마케팅']
        }
      });
    }, 2000);
  });
}

async function callAnalyticsAPI(channelId) {
  // 임시 구현 - 실제로는 백엔드 API 호출
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          uploadTime: {
            optimal: ['월-오후', '화-오후', '수-오후', '목-오후', '금-오후']
          }
        }
      });
    }, 1500);
  });
}

// 전역 함수로 노출 (HTML에서 직접 호출)
window.copyToClipboard = copyToClipboard;
window.useTitle = useTitle;
