import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatEntry } from './chat-entry';

describe('ChatEntry', () => {
  it('renders message with correct content and origin', () => {
    const mockProps = {
      locale: 'en-US',
      timestamp: Date.now(),
      message: 'Hello, this is a test message from the agent',
      messageOrigin: 'remote' as const,
      name: 'Agent',
    };

    render(<ChatEntry {...mockProps} />);

    const messageElement = screen.getByText('Hello, this is a test message from the agent');
    expect(messageElement).toBeInTheDocument();

    const nameElement = screen.getByText('Agent');
    expect(nameElement).toBeInTheDocument();

    const listItem = screen.getByRole('listitem');
    expect(listItem).toHaveAttribute('data-lk-message-origin', 'remote');
  });
});
