import { useEffect, useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

export default function CertificatesPage() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const response = await api.get('/certificates/me');
      if (mounted) {
        setCerts(unwrapApiData(response) || []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-shell">
      <section className="section-block">
        <h1>My Certificates</h1>
        <div className="certificate-grid">
          {certs.map((cert) => (
            <article key={cert.id} className="certificate-card">
              <h3>{cert.course_title}</h3>
              <p>Code: {cert.certificate_code}</p>
              <p>Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
              <a href={cert.verification_url} target="_blank" rel="noreferrer" className="btn-primary">Verify</a>
            </article>
          ))}
          {certs.length === 0 && <p>No certificates yet. Keep learning and complete your tracks.</p>}
        </div>
      </section>
    </div>
  );
}
