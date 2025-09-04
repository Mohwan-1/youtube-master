# 🎬 YouTube 메타데이터 최적화 도구

> 유튜브 크리에이터를 위한 AI 기반 제목·태그·업로드시간 최적화 서비스

## 📖 프로젝트 소개

유튜브 크리에이터들의 반복적이고 번거로운 메타데이터 최적화 작업을 자동화하는 무료 웹 서비스입니다. Google Gemini AI와 YouTube Data API를 활용하여 개인 채널에 최적화된 제목, 태그, 업로드 시간을 제안합니다.

### ✨ 주요 기능

- 🤖 **AI 제목 최적화**: 원제목을 입력하면 3가지 최적화된 제목 제안
- 📊 **개인화 분석**: 사용자의 YouTube 채널 데이터 기반 맞춤 제안
- ⏰ **최적 업로드 시간**: 구독자 활동 패턴 분석으로 최적 업로드 시간 추천
- 🏷️ **스마트 태그 생성**: 트렌드와 채널 특성을 고려한 태그 자동 생성
- 📱 **반응형 디자인**: PC와 모바일 모두 지원

### 🎯 타겟 사용자

- 구독자 1천~10만명의 중소 유튜브 크리에이터
- 메타데이터 최적화에 시간을 많이 투자하는 크리에이터
- YouTube 마케팅 초보자

## 🛠 기술 스택

### Frontend
- **HTML5**, **CSS3**, **JavaScript** (ES6+)
- **Bootstrap 5** - 반응형 UI 프레임워크
- **Font Awesome** - 아이콘
- **Google Fonts** - 타이포그래피

### Backend
- **Node.js** + **Express.js** - 서버 프레임워크
- **MongoDB** - 사용자 데이터 저장
- **Mongoose** - MongoDB ODM

### APIs & Services
- **Google Gemini API** - AI 텍스트 생성
- **YouTube Data API v3** - 채널 데이터 분석
- **Google AdSense** - 수익화

### 배포
- **Frontend**: Netlify 또는 Vercel
- **Backend**: Railway 또는 Render
- **Database**: MongoDB Atlas

## 📁 프로젝트 구조

```
youtube-optimizer/
├── frontend/
│   ├── index.html              # 메인 페이지
│   ├── css/
│   │   ├── style.css          # 메인 스타일시트
│   │   └── responsive.css     # 반응형 스타일
│   ├── js/
│   │   ├── app.js            # 메인 애플리케이션 로직
│   │   ├── youtube-auth.js   # YouTube OAuth 인증
│   │   └── ui-components.js  # UI 컴포넌트
│   └── assets/
│       ├── images/           # 이미지 파일
│       └── fonts/           # 웹 폰트
├── backend/
│   ├── server.js            # Express 서버 메인
│   ├── routes/
│   │   ├── auth.js         # 인증 라우트
│   │   ├── optimize.js     # 최적화 API
│   │   └── analytics.js    # 분석 API
│   ├── models/
│   │   ├── User.js         # 사용자 모델
│   │   └── OptimizationHistory.js
│   ├── services/
│   │   ├── gemini.js       # Gemini API 서비스
│   │   ├── youtube.js      # YouTube API 서비스
│   │   └── optimizer.js    # 최적화 로직
│   └── middleware/
│       ├── auth.js         # 인증 미들웨어
│       └── rateLimit.js    # API 제한
├── docs/
│   ├── PRD.md              # 제품 요구사항 문서
│   ├── API.md              # API 문서
│   └── DEPLOYMENT.md       # 배포 가이드
├── .env.example            # 환경변수 템플릿
├── package.json
└── README.md
```

## 🚀 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/youtube-optimizer.git
cd youtube-optimizer
```

### 2. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
# Google APIs
YOUTUBE_API_KEY=your_youtube_api_key
GEMINI_API_KEY=AIzaSyDBe0JCBmlce0jVlhyXpp08pXiLbW9G7bw

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Database
MONGODB_URI=mongodb://localhost:27017/youtube-optimizer

# Server
PORT=3000
NODE_ENV=development

# AdSense
ADSENSE_CLIENT_ID=ca-pub-8057197445850296
```

### 3. 의존성 설치

```bash
# Backend 의존성
npm install

# Frontend는 별도 빌드 도구 없이 바로 사용
```

### 4. 개발 서버 실행

```bash
# Backend 서버 실행 (Port 3000)
npm run dev

# Frontend는 라이브 서버로 실행 (Port 5500)
# VS Code Live Server 확장 사용 권장
```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/google` - Google OAuth 인증
- `GET /api/auth/profile` - 사용자 프로필 조회

### 메타데이터 최적화
- `POST /api/optimize/title` - 제목 최적화
- `POST /api/optimize/tags` - 태그 생성
- `GET /api/optimize/upload-time/:channelId` - 최적 업로드 시간

### 분석
- `GET /api/analytics/channel/:channelId` - 채널 분석 데이터
- `GET /api/analytics/history` - 최적화 히스토리

## 💡 사용법

### 1. 채널 연동
1. "YouTube 채널 연동" 버튼 클릭
2. Google 계정으로 로그인
3. YouTube 채널 선택

### 2. 제목 최적화
1. 원본 제목 입력
2. "제목 최적화" 버튼 클릭
3. 3가지 최적화된 제목 중 선택

### 3. 최적 업로드 시간 확인
- 채널 연동 후 자동으로 최적 업로드 시간 분석
- 요일별, 시간대별 추천 제공

## 🎨 UI/UX 가이드라인

### 컬러 팔레트
```css
:root {
  --primary-color: #ff0000;      /* YouTube Red */
  --secondary-color: #282828;    /* Dark Gray */
  --accent-color: #4285f4;       /* Google Blue */
  --success-color: #00c851;      /* Green */
  --warning-color: #ffbb33;      /* Orange */
  --danger-color: #ff4444;       /* Red */
  --light-bg: #f8f9fa;          /* Light Background */
  --dark-text: #212529;         /* Dark Text */
}
```

### 타이포그래피
- **헤딩**: Noto Sans KR Bold
- **본문**: Noto Sans KR Regular
- **버튼/라벨**: Noto Sans KR Medium

## 📱 반응형 브레이크포인트

```css
/* Mobile First */
@media (min-width: 576px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 992px) { /* lg */ }
@media (min-width: 1200px) { /* xl */ }
```

## 🔐 보안 고려사항

### 데이터 보호
- YouTube OAuth 2.0을 통한 안전한 인증
- API 키는 환경변수로 관리
- 사용자 개인정보 최소 수집
- HTTPS 강제 사용

### API 보안
- Rate Limiting 적용 (100 requests/hour per user)
- CORS 설정
- Input 검증 및 sanitization

## 🧪 테스트

```bash
# 단위 테스트 실행
npm test

# E2E 테스트 실행
npm run test:e2e

# 테스트 커버리지 확인
npm run test:coverage
```

## 📊 모니터링

### Google Analytics
- 페이지 조회수
- 사용자 행동 분석
- 전환율 추적

### 서버 모니터링
- API 응답 시간
- 에러율
- 메모리 사용량

## 🚀 배포 가이드

### Frontend 배포 (Netlify)
1. GitHub 저장소 연결
2. 빌드 설정: 없음 (정적 파일)
3. 환경변수 설정
4. 도메인 연결

### Backend 배포 (Railway)
1. GitHub 저장소 연결
2. 환경변수 설정
3. 자동 배포 설정

## 📈 향후 로드맵

### Phase 2
- [ ] 설명란 최적화
- [ ] 썸네일 A/B 테스트
- [ ] 경쟁 채널 분석

### Phase 3
- [ ] 유료 플랜 추가
- [ ] 모바일 앱 개발
- [ ] 다국어 지원

## 🤝 기여 방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- **이메일**: support@yourdomain.com
- **GitHub Issues**: [Issue 생성](https://github.com/your-username/youtube-optimizer/issues)
- **Discord**: [개발자 커뮤니티](https://discord.gg/your-server)

## 🙏 감사의 말

이 프로젝트는 유튜브 크리에이터 커뮤니티의 피드백과 제안으로 만들어졌습니다. 모든 크리에이터들의 성공을 응원합니다!

---

**⭐ 이 프로젝트가 도움이 되었다면 GitHub Star를 눌러주세요!**