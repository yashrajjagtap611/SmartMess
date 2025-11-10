import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import OtpVerificationScreen from './OtpVerificationScreen';

describe('OtpVerificationScreen', () => {
  it('renders title', () => {
    render(
      <BrowserRouter>
        <OtpVerificationScreen />
      </BrowserRouter>
    );
    expect(screen.getByText(/verify|verification|reset password/i)).toBeInTheDocument();
  });
});


