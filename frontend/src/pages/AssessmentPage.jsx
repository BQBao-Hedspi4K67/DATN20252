import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptFilter, setAttemptFilter] = useState('all');

  const latestAttemptId = attempts[0]?.id || null;
  const bestPassedAttempt = attempts
    .filter((attempt) => attempt.isPassed)
    .sort((a, b) => {
      if (Number(b.score) !== Number(a.score)) {
        return Number(b.score) - Number(a.score);
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    })[0] || null;

  const filteredAttempts = attempts.filter((attempt) => {
    if (attemptFilter === 'passed') {
      return attempt.isPassed;
    }
    if (attemptFilter === 'failed') {
      return !attempt.isPassed;
    }
    return true;
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [response, attemptsRes] = await Promise.all([
        api.get(`/assessments/${assessmentId}`),
        api.get(`/assessments/${assessmentId}/attempts`)
      ]);
      if (mounted) {
        setAssessment(unwrapApiData(response));
        setAttempts(unwrapApiData(attemptsRes) || []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [assessmentId]);

  const submit = async () => {
    const payload = {
      answers: Object.entries(answers).map(([questionId, optionId]) => ({
        questionId: Number(questionId),
        optionId: Number(optionId)
      }))
    };

    const response = await api.post(`/assessments/${assessmentId}/submit`, payload);
    setResult(unwrapApiData(response));

    const attemptsRes = await api.get(`/assessments/${assessmentId}/attempts`);
    setAttempts(unwrapApiData(attemptsRes) || []);
  };

  if (!assessment) {
    return <div className="page-shell"><div className="loader">Loading assessment...</div></div>;
  }

  return (
    <div className="page-shell">
      <section className="section-block quiz-box">
        <h1>{assessment.title}</h1>
        <p>Pass score: {assessment.passScore}%</p>

        {assessment.questions.map((question) => (
          <article key={question.id} className="question-card">
            <h3>{question.position}. {question.questionText}</h3>
            {question.options.map((option) => (
              <label key={option.id} className="option-row">
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  checked={Number(answers[question.id]) === option.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                />
                <span>{option.optionText}</span>
              </label>
            ))}
          </article>
        ))}

        <button type="button" className="btn-primary" onClick={submit}>Submit Assessment</button>

        {result && (
          <div className="result-box">
            <p>Score: {result.score}%</p>
            <p>Result: {result.isPassed ? 'Passed' : 'Not passed'}</p>
          </div>
        )}

        {attempts.length > 0 && (
          <div className="attempt-list">
            <h3>Attempt History</h3>
            <div className="attempt-summary-grid">
              <div className="attempt-chip">
                <span>Total attempts</span>
                <strong>{attempts.length}</strong>
              </div>
              <div className="attempt-chip">
                <span>Latest score</span>
                <strong>{attempts[0]?.score ?? '-'}%</strong>
              </div>
              <div className="attempt-chip">
                <span>Best passed</span>
                <strong>{bestPassedAttempt ? `${bestPassedAttempt.score}%` : 'None yet'}</strong>
              </div>
            </div>

            <div className="attempt-filters">
              <button
                type="button"
                className={`btn-ghost ${attemptFilter === 'all' ? 'filter-active' : ''}`}
                onClick={() => setAttemptFilter('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn-ghost ${attemptFilter === 'passed' ? 'filter-active' : ''}`}
                onClick={() => setAttemptFilter('passed')}
              >
                Passed
              </button>
              <button
                type="button"
                className={`btn-ghost ${attemptFilter === 'failed' ? 'filter-active' : ''}`}
                onClick={() => setAttemptFilter('failed')}
              >
                Not Passed
              </button>
            </div>

            <ul>
              {filteredAttempts.map((attempt) => (
                <li key={attempt.id}>
                  <span>
                    Attempt #{attempt.id}
                    {Number(attempt.id) === Number(latestAttemptId) ? ' • Latest' : ''}
                    {bestPassedAttempt && Number(attempt.id) === Number(bestPassedAttempt.id) ? ' • Best passed' : ''}
                  </span>
                  <strong>{attempt.score}%</strong>
                  <em>{attempt.isPassed ? 'Passed' : 'Not passed'}</em>
                </li>
              ))}
            </ul>
            {filteredAttempts.length === 0 && (
              <p className="inline-note">No attempts in this filter yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
