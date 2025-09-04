# 📋 개발 규칙 및 가이드라인 (Development Rules)

## 🎯 프로젝트 목적 및 원칙

### 핵심 목적
- **유튜브 크리에이터의 실질적 도움**: 수익보다는 진정한 도움 제공 우선
- **무료 서비스**: Google AdSense 기반 수익 모델로 사용자는 무료 이용
- **간단하고 직관적**: 복잡한 기능보다는 필요한 기능에 집중

### 개발 철학
- **사용자 중심 설계**: 크리에이터의 실제 워크플로우에 맞춘 UX
- **성능 우선**: 빠른 응답속도와 안정성
- **지속가능성**: 유지보수가 쉬운 코드 작성

## 🔧 코딩 컨벤션

### HTML 규칙
```html
<!-- ✅ 올바른 예시 -->
<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0,minimum-scale=0,maximum-scale=10,user-scalable=no">
    <title>유튜브 메타데이터 최적화 도구</title>
</head>

<!-- 필수 메타태그 포함 -->
<meta name="description" content="유튜브 제목 썸네일 자동생성기" />
<meta name="keywords" content="유튜브, 제목최적화, 태그생성, 크리에이터도구" />
<meta property="og:type" content="website" />
<meta property="og:title" content="유튜브 메타데이터 최적화" />
<meta property="og:description" content="AI 기반 유튜브 제목, 태그 최적화 도구" />
<meta property="og:image" content="/assets/og-image.png">
<meta property="og:url" content="https://yourdomain.com/" />
```

### CSS 규칙
```css
/* 1. BEM 방법론 사용 */
.optimizer-form {}
.optimizer-form__input {}
.optimizer-form__button {}
.optimizer-form__button--primary {}

/* 2. CSS 변수 활용 */
:root {
  --primary-color: #ff0000;
  --secondary-color: #282828;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

/* 3. 모바일 우선 반응형 */
.container {
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}
```

### JavaScript 규칙
```javascript
// 1. ES6+ 문법 사용
const API_ENDPOINTS = {
  OPTIMIZE_TITLE: '/api/optimize/title',
  GET_TAGS: '/api/optimize/tags',
  ANALYTICS: '/api/analytics'
};

// 2. async/await 사용
async function optimizeTitle(originalTitle) {
  try {
    const response = await fetch(API_ENDPOINTS.OPTIMIZE_TITLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: originalTitle })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Title optimization failed:', error);
    showErrorMessage('제목 최적화에 실패했습니다. 다시 시도해주세요.');
  }
}

// 3. 함수명은 동사로 시작
function validateUserInput(input) {}
function displayOptimizedTitles(titles) {}
function handleSubmitForm(event) {}

// 4. 상수는 대문자로
const MAX_TITLE_LENGTH = 100;
const DEFAULT_TAG_COUNT = 10;
```

## 🎨 UI/UX 개발 규칙

### 광고 배치 규칙
```html
<!-- 상단 자동 광고 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8057197445850296" crossorigin="anonymous"></script>

<!-- 사이드바 광고 (데스크톱만) -->
<div class="sidebar-ad d-none d-lg-block">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8057197445850296" crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-8057197445850296"
       data-ad-slot="5964488484"
       data-ad-format="auto"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>

<!-- 중간 인아티클 광고 -->
<div class="content-ad">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8057197445850296" crossorigin="anonymous"></script>
  <ins class="adsbygoogle"
       style="display:block; text-align:center;"
       data-ad-layout="in-article"
       data-ad-format="fluid"
       data-ad-client="ca-pub-8057197445850296"
       data-ad-slot="5964488484"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

### 반응형 디자인 규칙
```css
/* 광고가 콘텐츠를 방해하지 않도록 */
.main-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.sidebar {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 160px;
}

/* 모바일에서는 사이드 광고 숨김 */
@media (max-width: 991px) {
  .sidebar {
    display: none;
  }
  
  .main-content {
    padding: 0 16px;
  }
}
```

### 사용자 경험 우선순위
1. **핵심 기능 우선**: 제목 최적화 → 태그 생성 → 업로드 시간 추천
2. **로딩 속도**: 3초 내 첫 화면 로딩 완료
3. **에러 처리**: 친화적인 에러 메시지 제공
4. **접근성**: 키보드 네비게이션, 스크린 리더 지원

## 🔒 보안 및 개인정보 규칙

### API 보안
```javascript
// 1. API 키는 환경변수로만 관리
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // ✅
const GEMINI_API_KEY = 'AIzaSy...'; // ❌ 절대 금지

// 2. Rate Limiting 적용
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 100, // 시간당 최대 100회
  message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. 입력 검증 및 Sanitization
const validator = require('validator');

function validateTitleInput(title) {
  if (!title || typeof title !== 'string') {
    throw new Error('제목을 입력해주세요.');
  }
  
  if (title.length > 200) {
    throw new Error('제목이 너무 깁니다. (최대 200자)');
  }
  
  // XSS 방지
  return validator.escape(title.trim());
}
```

### 개인정보 보호
```javascript
// 최소한의 데이터만 수집
const userSchema = {
  googleId: String,
  channelId: String,
  channelTitle: String,
  subscriberCount: Number,
  createdAt: Date,
  lastLogin: Date
  // ❌ email, phone, address 등 개인정보 수집 금지
};

// YouTube API 응답에서 필요한 데이터만 추출
function extractChannelData(apiResponse) {
  return {
    channelId: apiResponse.id,
    title: apiResponse.snippet.title,
    subscriberCount: apiResponse.statistics.subscriberCount,
    // 개인정보는 저장하지 않음
  };
}
```

## 🚀 성능 최적화 규칙

### 1. 이미지 최적화
```html
<!-- WebP 형식 우선 사용 -->
<picture>
  <source srcset="hero-image.webp" type="image/webp">
  <source srcset="hero-image.jpg" type="image/jpeg">
  <img src="hero-image.jpg" alt="유튜브 최적화 도구" loading="lazy">
</picture>
```

### 2. CSS/JS 최적화
```html
<!-- Critical CSS 인라인 -->
<style>
  /* 첫 화면에 필요한 CSS만 */
  .hero { display: flex; align-items: center; }
</style>

<!-- 나머지 CSS는 비동기 로드 -->
<link rel="preload" href="css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- JavaScript 지연 로딩 -->
<script src="js/main.js" defer></script>
```

### 3. API 응답 최적화
```javascript
// 캐싱 전략
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10분 캐시

async function getChannelAnalytics(channelId) {
  const cacheKey = `analytics_${channelId}`;
  
  // 캐시 확인
  let data = cache.get(cacheKey);
  if (data) {
    return data;
  }
  
  // API 호출
  data = await fetchFromYouTubeAPI(channelId);
  cache.set(cacheKey, data);
  return data;
}
```

## 🧪 테스트 규칙

### 1. 테스트 작성 의무
```javascript
// 모든 핵심 함수는 테스트 작성 필수
describe('Title Optimization', () => {
  test('should return 3 optimized titles', async () => {
    const originalTitle = '오늘 요리해봤어요';
    const result = await optimizeTitle(originalTitle);
    
    expect(result).toHaveLength(3);
    expect(result[0].title).toBeDefined();
    expect(result[0].expectedCTR).toBeGreaterThan(0);
  });
  
  test('should handle empty input', async () => {
    await expect(optimizeTitle('')).rejects.toThrow('제목을 입력해주세요.');
  });
});
```

### 2. E2E 테스트 시나리오
```javascript
// Playwright 또는 Cypress 사용
test('Complete optimization workflow', async ({ page }) => {
  // 1. 메인 페이지 접속
  await page.goto('/');
  
  // 2. YouTube 로그인 (Mock)
  await page.click('[data-testid="youtube-login"]');
  
  // 3. 제목 입력
  await page.fill('[data-testid="title-input"]', '테스트 제목');
  
  // 4. 최적화 버튼 클릭
  await page.click('[data-testid="optimize-button"]');
  
  // 5. 결과 확인
  await expect(page.locator('[data-testid="optimized-titles"]')).toBeVisible();
});
```

## 📊 분석 및 모니터링 규칙

### Google Analytics 설정
```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>

<!-- 커스텀 이벤트 추적 -->
<script>
function trackOptimization(type, success) {
  gtag('event', 'optimize', {
    'event_category': 'engagement',
    'event_label': type,
    'value': success ? 1 : 0
  });
}
</script>
```

### 에러 로깅
```javascript
// Winston 로거 설정
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// API 에러 처리
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
  res.status(500).json({
    error: '서버 오류가 발생했습니다.',
    timestamp: new Date().toISOString()
  });
});
```

## 🔄 Git 워크플로우 규칙

### 브랜치 전략
```bash
main        # 프로덕션 배포용
├── develop # 개발 통합 브랜치
├── feature/title-optimization  # 기능 개발
├── feature/youtube-integration
├── hotfix/urgent-bug-fix      # 긴급 수정
└── release/v1.0.0             # 릴리즈 준비
```

### 커밋 메시지 규칙
```bash
# 타입: 제목 (50자 이내)
# 
# 상세 설명 (72자로 줄바꿈)
# 
# Footer (이슈 번호 등)

feat: YouTube OAuth 인증 기능 추가

사용자가 Google 계정으로 로그인하여 YouTube 채널 데이터에
접근할 수 있도록 OAuth 2.0 인증 플로우를 구현했습니다.

- Google OAuth 라이브러리 설정
- 콜백 URL 처리
- 사용자 세션 관리

Closes #15
```

### 커밋 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 설정 등

## 🚀 배포 규칙

### 환경별 설정
```javascript
// config/environment.js
const environments = {
  development: {
    apiUrl: 'http://localhost:3000',
    logLevel: 'debug',
    cacheEnabled: false
  },
  production: {
    apiUrl: 'https://api.yourdomain.com',
    logLevel: 'error',
    cacheEnabled: true
  }
};

module.exports = environments[process.env.NODE_ENV || 'development'];
```

### 배포 전 체크리스트
- [ ] 모든 테스트 통과
- [ ] 성능 테스트 완료 (Lighthouse 점수 90+ 목표)
- [ ] 보안 검사 완료 (npm audit)
- [ ] 환경변수 설정 확인
- [ ] Google AdSense 코드 적용 확인
- [ ] SEO 메타태그 확인
- [ ] 크로스 브라우저 테스트 완료

### 롤백 계획
```bash
# 버전 태깅
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 롤백 시
git checkout v0.9.0
git checkout -b hotfix/rollback-v1.0.0
```

## 📝 문서화 규칙

### 코드 주석
```javascript
/**
 * 제목을 최적화하여 3개의 제안을 반환합니다.
 * 
 * @param {string} originalTitle - 원본 제목
 * @param {string} channelId - YouTube 채널 ID
 * @param {Object} options - 최적화 옵션
 * @param {number} options.maxLength - 최대 제목 길이 (기본값: 100)
 * @param {boolean} options.includeEmoji - 이모지 포함 여부 (기본값: true)
 * @returns {Promise<Array<OptimizedTitle>>} 최적화된 제목 배열
 * 
 * @example
 * const titles = await optimizeTitle('오늘 요리해봤어요', 'UC1234567890');
 * console.log(titles[0].title); // "15분만에! 혼밥족을 위한 간단 파스타 🍝"
 */
async function optimizeTitle(originalTitle, channelId, options = {}) {
  // 구현 코드
}
```

### API 문서
```markdown
## POST /api/optimize/title

제목 최적화 API입니다.

### Request
```json
{
  "title": "원본 제목",
  "channelId": "YouTube 채널 ID",
  "options": {
    "maxLength": 100,
    "includeEmoji": true
  }
}
```

### Response
```json
{
  "success": true,
  "data": [
    {
      "title": "최적화된 제목 1",
      "expectedCTR": 0.15,
      "confidence": 0.85
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "INVALID_INPUT"
}
```
```

## ⚠️ 절대 금지 사항

### 1. 보안 위반
- API 키를 코드에 하드코딩 ❌
- 사용자 개인정보 불필요한 수집 ❌
- SQL Injection, XSS 취약점 방치 ❌

### 2. 성능 저해
- 무한 루프나 메모리 누수 코드 ❌
- 동기식 API 호출로 UI 블로킹 ❌
- 최적화되지 않은 대용량 이미지 사용 ❌

### 3. 사용자 경험 저해
- 광고가 핵심 기능을 가리는 배치 ❌
- 5초 이상 로딩 시간 ❌
- 명확하지 않은 에러 메시지 ❌

### 4. 법적/윤리적 위반
- YouTube API 이용약관 위반 ❌
- 저작권 침해 콘텐츠 생성 ❌
- 스팸성 최적화 제안 ❌

## 🎯 품질 기준

### 코드 품질
- **ESLint 규칙 100% 통과**
- **테스트 커버리지 80% 이상**
- **함수당 최대 20줄 제한**
- **순환 복잡도 10 이하**

### 성능 기준
- **First Contentful Paint < 2초**
- **Largest Contentful Paint < 3초**
- **Time to Interactive < 4초**
- **Cumulative Layout Shift < 0.1**

### 접근성 기준
- **WCAG 2.1 AA 준수**
- **키보드 네비게이션 지원**
- **스크린 리더 호환성**
- **색상 대비비 4.5:1 이상**

## 🔄 지속적 개선

### 주간 리뷰
- 사용자 피드백 분석
- 성능 지표 검토
- 버그 리포트 우선순위 지정

### 월간 업데이트
- 새로운 YouTube API 기능 적용
- AI 모델 성능 개선
- 사용자 요청 기능 개발

### 분기별 전략 검토
- 시장 트렌드 분석
- 경쟁사 기능 벤치마킹
- 수익 모델 최적화

---

**이 규칙을 모든 개발자가 숙지하고 준수해야 합니다. 규칙 위반 시 코드 리뷰에서 반려될 수 있습니다.**