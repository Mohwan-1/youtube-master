const axios = require('axios');
const ApiKey = require('../models/ApiKey');

class GeminiService {
  constructor() {
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async getApiKey(userId) {
    try {
      const apiKey = await ApiKey.findOne({ userId });
      return apiKey?.geminiApiKey || process.env.GEMINI_API_KEY;
    } catch (error) {
      console.error('Get API key error:', error);
      return process.env.GEMINI_API_KEY;
    }
  }

  async generateContent(prompt, options = {}, userId = null) {
    try {
      const apiKey = await this.getApiKey(userId);
      
      if (!apiKey) {
        return {
          success: false,
          error: 'Gemini API 키가 설정되지 않았습니다. 설정 페이지에서 API 키를 입력해주세요.'
        };
      }

      const response = await axios.post(
        `${this.baseURL}?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        data: response.data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Gemini API 호출 중 오류가 발생했습니다.'
      };
    }
  }

  async optimizeTitle(originalTitle, options = {}, userId = null) {
    const prompt = `
다음 유튜브 제목을 최적화하여 5개의 다른 버전을 만들어주세요.
각 버전은 클릭률을 높이기 위해 다음 요소들을 포함해야 합니다:
- 이모지 (${options.includeEmoji ? '포함' : '제외'})
- 트렌드 키워드 (${options.includeTrending ? '포함' : '제외'})
- 감정적 표현
- 호기심을 자극하는 표현
- 구체적인 숫자나 연도

원본 제목: "${originalTitle}"

다음 형식으로 응답해주세요:
1. [최적] 제목1
2. [추천] 제목2
3. [대안] 제목3
4. [트렌드] 제목4
5. [클릭률] 제목5

각 제목은 50자 이내로 작성해주세요.
`;

    return await this.generateContent(prompt, { temperature: 0.8 }, userId);
  }

  async generateTags(title, channelInfo = {}, userId = null) {
    const prompt = `
다음 유튜브 제목에 대한 관련 태그 15개를 생성해주세요.
태그는 다음 카테고리로 분류해주세요:

주요 키워드 (5개):
- 제목의 핵심 키워드

관련 분야 (5개):
- 콘텐츠 분야와 관련된 태그

트렌드 태그 (5개):
- 현재 인기 있는 관련 태그

제목: "${title}"
채널 정보: ${channelInfo.category || '일반'}

태그는 쉼표로 구분하여 한 줄로 작성해주세요.
`;

    return await this.generateContent(prompt, { temperature: 0.6 }, userId);
  }

  async analyzeUploadTime(channelData, userId = null) {
    const prompt = `
다음 유튜브 채널 데이터를 기반으로 최적의 업로드 시간을 분석해주세요.

채널 데이터:
- 구독자 수: ${channelData.subscriberCount || '알 수 없음'}
- 콘텐츠 분야: ${channelData.category || '일반'}
- 평균 조회수: ${channelData.averageViews || '알 수 없음'}

다음 형식으로 응답해주세요:

최적 업로드 시간:
1. 월요일: 19:00 (95점)
2. 화요일: 20:00 (92점)
3. 수요일: 18:30 (89점)
4. 목요일: 19:30 (87점)
5. 금요일: 21:00 (85점)

분석 결과:
- 주중 저녁 시간대가 가장 높은 참여도
- 월요일과 화요일이 최적 시간
- 주말은 상대적으로 낮은 성과
`;

    return await this.generateContent(prompt, { temperature: 0.5 }, userId);
  }
}

module.exports = new GeminiService();
