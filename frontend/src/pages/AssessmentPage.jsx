import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

export default function AssessmentPage() {
  const { assessmentId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState([]);

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
            <ul>
              {attempts.map((attempt) => (
                <li key={attempt.id}>
                  <span>Attempt #{attempt.id}</span>
                  <strong>{attempt.score}%</strong>
                  <em>{attempt.isPassed ? 'Passed' : 'Not passed'}</em>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
