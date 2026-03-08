import { useState } from 'react';

interface SignInModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => void;
}

function SignInModal({ onClose, onLogin }: SignInModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onLogin(username, password);
    onClose();
  };

  return (
    <div className="signin-modal-overlay">
      <div className="signin-modal">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="signin-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signin-input"
          />
          <button type="submit" className="signin-button">Login</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default SignInModal;