import { useEffect, useState } from "react";
import type { UserInterface } from "../Interfaces";

function Account() {
  const [accountInfo, setAccountInfo] = useState<UserInterface | null>(null);

  useEffect(() => {
    fetch("/api/authentication/me", {
      credentials: "include",
    })
      .then((response) => response.json() as Promise<UserInterface>)
      .then((data) => setAccountInfo(data));
  }, []);

  return (
    <div>
      <h1>Account Info</h1>
      {accountInfo ? (
        <div>
          <p>You are logged in as {accountInfo.userName}.</p>
          <p>
            Name: {accountInfo.firstName} {accountInfo.lastName}
          </p>
          <p>Display Name: {accountInfo.displayName}</p>
          <p>Phone Number: {accountInfo.phoneNumber}</p>
          <p>Email: {accountInfo.email}</p>
          <p>Role(s): {accountInfo.roles}</p>
          <p></p>
        </div>
      ) : (
        <p>Please sign in to view your account details.</p>
      )}
    </div>
  );
}

export default Account;
