import { Badge, Button, useAuthenticator } from "@aws-amplify/ui-react";

export function UserProfile() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <>
      <Badge>{user?.username}</Badge>
      <Button onClick={signOut}>Log Out</Button>
    </>
  );
}
