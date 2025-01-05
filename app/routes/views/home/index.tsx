import type { Route } from '@rr-views/home/+types/index';
import { useState } from "react";
import { Button } from "~/components/ui/button";

export function meta() {
  return [
    { title: "Narumory" },
    { name: "description", content: "A multiplayer Naruto memory game" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_VERCEL };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [isHi] = useState(true);

  console.log(loaderData);
  console.log("hi", isHi);

  return (
    <div className="container mx-auto flex flex-col items-center">
      <h1 className="text-4xl text-primary font-ninja">hello world</h1>
      <Button>Click me</Button>
    </div>
  );
}
