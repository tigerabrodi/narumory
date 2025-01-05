import type { Route } from '@rr-views/home/+types/index';
import { Button } from "~/components/ui/button";
import { prisma } from '~/lib/db.server';

export function meta() {
  return [
    { title: "Narumory" },
    { name: "description", content: "A multiplayer Naruto memory game" },
  ];
}

export async function loader() {
  const users = await prisma.user.findMany();

  return { users };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData;

  return (
    <div className="container mx-auto flex flex-col items-center">
      <h1 className="text-4xl text-primary font-ninja">hello world</h1>
      <Button>Click me</Button>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </div>
  );
}
