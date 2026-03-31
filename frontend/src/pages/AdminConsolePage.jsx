import { useEffect, useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

export default function AdminConsolePage() {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [reportRes, usersRes, coursesRes] = await Promise.all([
          api.get('/admin/reports/overview'),
          api.get('/admin/users'),
          api.get('/admin/courses')
        ]);

        if (mounted) {
          setReport(unwrapApiData(reportRes) || null);
          setUsers(unwrapApiData(usersRes) || []);
          setCourses(unwrapApiData(coursesRes) || []);
          setError('');
        }
      } catch (e) {
        if (mounted) {
          setError(e.response?.data?.message || 'Cannot load admin dashboard now.');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-shell">
      <section className="section-block">
        <h1>Admin Console</h1>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="admin-grid">
          <article className="panel">
            <h2>Users</h2>
            <p>{users.length} accounts</p>
            <p>
              Active: <strong>{report?.users?.active ?? '-'}</strong>
            </p>
            <p>
              Admin / Instructor / Student: <strong>{report?.users?.admins ?? '-'}</strong> /{' '}
              <strong>{report?.users?.instructors ?? '-'}</strong> /{' '}
              <strong>{report?.users?.students ?? '-'}</strong>
            </p>
          </article>
          <article className="panel">
            <h2>Courses</h2>
            <p>{courses.length} courses</p>
            <p>
              Published: <strong>{report?.courses?.published ?? '-'}</strong> | Draft:{' '}
              <strong>{report?.courses?.draft ?? '-'}</strong>
            </p>
            <p>
              Certificate / Instructor-led: <strong>{report?.courses?.certificate ?? '-'}</strong> /{' '}
              <strong>{report?.courses?.instructor_led ?? '-'}</strong>
            </p>
          </article>
          <article className="panel">
            <h2>Enrollments</h2>
            <p>
              Total: <strong>{report?.enrollments?.total ?? '-'}</strong>
            </p>
            <p>
              Active / Completed / Dropped: <strong>{report?.enrollments?.active ?? '-'}</strong> /{' '}
              <strong>{report?.enrollments?.completed ?? '-'}</strong> /{' '}
              <strong>{report?.enrollments?.dropped ?? '-'}</strong>
            </p>
          </article>
          <article className="panel">
            <h2>Assessments</h2>
            <p>
              Total: <strong>{report?.assessments?.total ?? '-'}</strong>
            </p>
            <p>
              Chapter quiz / Final exam: <strong>{report?.assessments?.chapter_quiz ?? '-'}</strong> /{' '}
              <strong>{report?.assessments?.final_exam ?? '-'}</strong>
            </p>
            <p>
              Certificates issued: <strong>{report?.certificates?.total ?? '-'}</strong>
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
