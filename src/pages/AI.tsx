import React from 'react';
import DifyChat from '../components/DifyChat';
import './AI.css';

const AI: React.FC = () => {
  return (
    <div className="ai-container">
      <h1>AI Insights</h1>
      <div className="chatbot-container">
        <DifyChat />
      </div>
    </div>
  );
};

export default AI;
