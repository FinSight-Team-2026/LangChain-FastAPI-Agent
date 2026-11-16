"""Gemini 관련성 응답 검증. DB와 독립적."""
import json
import re

RELEVANCE_MIN = 0.1

class ParseError(ValueError):
    pass

def parse_result(raw):
    if not isinstance(raw, str) or not raw.strip():
        raise ParseError('empty response')
    cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', raw.strip(), flags=re.I)
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ParseError(f'invalid JSON: {exc}') from exc
    if not isinstance(result, dict):
        raise ParseError('JSON object required')
    relevance = result.get('relevance')
    if isinstance(relevance, bool) or not isinstance(relevance, (float, int)) or not 0 <= relevance <= 1:
        raise ParseError('relevance must be a number from 0 to 1')
    if relevance < RELEVANCE_MIN:
        return {'relevance': float(relevance), 'reason': str(result.get('reason') or '')[:300], 'is_relevant': False}

    label = result.get('sentiment')
    if label not in ('positive', 'negative', 'neutral'):
        label = 'neutral'

    score = result.get('score')
    if isinstance(score, bool) or not isinstance(score, (float, int)) or not -1 <= score <= 1:
        score = 0.0
    if label == 'positive' and score <= 0:
        score = 0.3
    elif label == 'negative' and score >= 0:
        score = -0.3
    elif label == 'neutral':
        score = 0.0

    summary = result.get('summary')
    if not isinstance(summary, list) or len(summary) != 3 or not all(isinstance(s, str) and s.strip() for s in summary):
        reason_txt = str(result.get('reason') or '시장 전반의 흐름을 다룬 기사입니다.').strip()
        summary = [reason_txt, '개별 종목에 대한 직접적인 실적 변동 요인은 제한적입니다.', '단기 시장 변동성에 따른 관망세가 유지되고 있습니다.']

    return {'is_relevant': True, 'relevance': float(relevance), 'reason': str(result.get('reason') or '')[:300], 'sentiment': label, 'score': float(score), 'summary': summary}
