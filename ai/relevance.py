"""Gemini 관련성 응답 검증. DB와 독립적."""
import json
import re

RELEVANCE_MIN = 0.5

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
    label, score, summary = result.get('sentiment'), result.get('score'), result.get('summary')
    if label not in ('positive', 'negative', 'neutral'):
        raise ParseError('invalid sentiment')
    if isinstance(score, bool) or not isinstance(score, (float, int)) or not -1 <= score <= 1:
        raise ParseError('invalid score')
    if ((label == 'positive' and score <= 0) or (label == 'negative' and score >= 0) or (label == 'neutral' and score != 0)):
        raise ParseError('sentiment and score mismatch')
    if not isinstance(summary, list) or len(summary) != 3 or not all(isinstance(s, str) and s.strip() for s in summary):
        raise ParseError('summary must contain three sentences')
    return {'is_relevant': True, 'relevance': float(relevance), 'reason': str(result.get('reason') or '')[:300], 'sentiment': label, 'score': float(score), 'summary': summary}
