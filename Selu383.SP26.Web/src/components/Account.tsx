import type { UserInterface } from '../Interfaces';

interface AccountProps {
  user: UserInterface | null;
}

function Account({ user }: AccountProps) {

  return (
    <div>
      <h1>Account Info</h1>
      {user ? (<div><p>You are logged in as {user.userName}.</p></div>) : (<p>Please sign in to view your account details.</p>)}
    </div>
  );
}

export default Account;