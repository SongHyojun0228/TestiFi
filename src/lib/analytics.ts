/** GA4 커스텀 이벤트 전송 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}

/** 테스트 시작 이벤트 */
export function trackTestStart(testSlug: string) {
  trackEvent("test_start", { test_slug: testSlug });
}

/** 질문 응답 이벤트 */
export function trackQuestionAnswer(
  testSlug: string,
  questionId: number,
  optionId: string
) {
  trackEvent("question_answer", {
    test_slug: testSlug,
    question_id: questionId,
    option_id: optionId,
  });
}

/** 테스트 완료 이벤트 */
export function trackTestComplete(testSlug: string, resultType: string) {
  trackEvent("test_complete", {
    test_slug: testSlug,
    result_type: resultType,
  });
}

/** 공유 이벤트 */
export function trackShare(
  testSlug: string,
  resultType: string,
  channel: string
) {
  trackEvent("share", {
    test_slug: testSlug,
    result_type: resultType,
    share_channel: channel,
  });
}

/** 결과 페이지 조회 이벤트 */
export function trackResultView(testSlug: string, resultType: string) {
  trackEvent("result_view", {
    test_slug: testSlug,
    result_type: resultType,
  });
}
