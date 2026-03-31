import { useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

export default function CertificateVerifyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    try {
      const response = await api.get(`/certificates/verify/${code}`);
      setResult(unwrapApiData(response));
    } catch (err) {
      setError(err?.response?.data?.message || 'Certificate not found');
    }
  };

  return (
    <div className="page-shell center-screen">
      <form className="glass-form" onSubmit={verify}>
        <h1>Verify Certificate</h1>
        <p>Paste certificate code to validate authenticity.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="CERT-..."
          required
        />
        <button type="submit" className="btn-primary">Verify</button>
        {error && <div className="error-text">{error}</div>}
        {result && (
          <div className="result-box">
            <p><strong>Valid certificate</strong></p>
            <p>Learner: {result.learner_name}</p>
            <p>Course: {result.course_title}</p>
            <p>Issued: {new Date(result.issued_at).toLocaleString()}</p>
          </div>
        )}
      </form>
    </div>
  );
}
