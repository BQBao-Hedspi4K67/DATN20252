import { useEffect, useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

export default function AdminConsolePage() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [usersRes, coursesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/courses')
      ]);

      if (mounted) {
        setUsers(unwrapApiData(usersRes) || []);
        setCourses(unwrapApiData(coursesRes) || []);
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
        <div className="admin-grid">
          <article className="panel">
            <h2>Users</h2>
            <p>{users.length} accounts</p>
          </article>
          <article className="panel">
            <h2>Courses</h2>
            <p>{courses.length} courses</p>
          </article>
        </div>
      </section>
    </div>
  );
}
