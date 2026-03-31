import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

const authState = {
  loading: false,
  isAuthenticated: false,
  user: null,
  logout: vi.fn()
};

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState
}));

vi.mock('../pages/DashboardPage', () => ({
  default: () => <div>Dashboard Mock</div>
}));
vi.mock('../pages/LoginPage', () => ({
  default: () => <div>Login Mock</div>
}));
vi.mock('../pages/CourseDetailPage', () => ({
  default: () => <div>Course Detail Mock</div>
}));
vi.mock('../pages/MyLearningPage', () => ({
  default: () => <div>My Learning Mock</div>
}));
vi.mock('../pages/CertificatesPage', () => ({
  default: () => <div>Certificates Mock</div>
}));
vi.mock('../pages/AssessmentPage', () => ({
  default: () => <div>Assessment Mock</div>
}));
vi.mock('../pages/InstructorStudioPage', () => ({
  default: () => <div>Instructor Studio Mock</div>
}));
vi.mock('../pages/AdminConsolePage', () => ({
  default: () => <div>Admin Console Mock</div>
}));
vi.mock('../pages/LearningPlayerPage', () => ({
  default: () => <div>Learning Player Mock</div>
}));
vi.mock('../pages/CertificateVerifyPage', () => ({
  default: () => <div>Certificate Verify Mock</div>
}));

function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('route guards and role transitions', () => {
  it('redirects guest from student learning route to login', async () => {
    authState.loading = false;
    authState.isAuthenticated = false;
    authState.user = null;

    renderAppAt('/student/learning');

    expect(await screen.findByText('Login Mock')).toBeTruthy();
  });

  it('allows student to access learning player route', async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: 'student', fullName: 'Student Demo', email: 'student@lms.local' };

    renderAppAt('/student/learn/react-fundamentals');

    expect(await screen.findByText('Learning Player Mock')).toBeTruthy();
  });

  it('blocks student from admin console route and redirects to dashboard', async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: 'student', fullName: 'Student Demo', email: 'student@lms.local' };

    renderAppAt('/admin/console');

    expect(await screen.findByText('Dashboard Mock')).toBeTruthy();
  });

  it('allows instructor to access instructor studio', async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: 'instructor', fullName: 'Instructor Demo', email: 'ins@lms.local' };

    renderAppAt('/instructor/studio');

    expect(await screen.findByText('Instructor Studio Mock')).toBeTruthy();
  });

  it('supports student assessment route transition', async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { role: 'student', fullName: 'Student Demo', email: 'student@lms.local' };

    renderAppAt('/student/assessments/15');

    expect(await screen.findByText('Assessment Mock')).toBeTruthy();
  });
});
