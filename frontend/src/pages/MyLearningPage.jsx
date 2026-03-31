import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

export default function MyLearningPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const response = await api.get('/enrollments/me');
      if (mounted) {
        setItems(unwrapApiData(response) || []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeCount = useMemo(() => items.filter((item) => item.status === 'active').length, [items]);

  return (
    <div className="page-shell">
      <section className="section-block">
        <h1>My Learning</h1>
        <p>{activeCount} active course(s) in progress.</p>
        <div className="enrollment-grid">
          {items.map((item) => (
            <article key={item.id} className="enrollment-card">
              <h3>{item.course_title}</h3>
              <p>{item.course_mode === 'certificate' ? 'Certificate course' : 'Instructor-led course'}</p>
              <div className="progress-line">
                <div style={{ width: `${item.progress_percent}%` }} />
              </div>
              <span>{item.progress_percent}% completed</span>
              <Link to={`/student/learn/${item.course_slug}`} className="btn-primary">Continue Learning</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
