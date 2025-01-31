// Dashboard.test.js
import { render, screen } from '@testing-library/react';
import Dashboard from './app/dashboard/page';  // Path to your Dashboard component



describe('Dashboard Component', () => {

  test('renders dashboard heading correctly', () => {
    render(<Dashboard />);
    const dashboardHeading = screen.getByText(/dashboard/i);
    expect(dashboardHeading).toBeInTheDocument();
  });

  test('renders create and start interview description', () => {
    render(<Dashboard />);
    const description = screen.getByText(/create and start interview/i);
    expect(description).toBeInTheDocument();
  });

  test('renders AddNewInterview component', () => {
    render(<Dashboard />);
    const addNewInterviewElement = screen.getByText(/add new interview/i);
    expect(addNewInterviewElement).toBeInTheDocument();
  });

  test('renders grid structure', () => {
    render(<Dashboard />);
    const gridElement = screen.getByRole('grid');
    expect(gridElement).toBeInTheDocument();
  });
});
