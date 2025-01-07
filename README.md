<a href="https://narumory.com">
  <h1 align="center">Narumory</h1>
</a>

<p align="center">
  An open source Naruto Memory Game. Join rooms and play with friends!
</p>

## Why I made this

I love online games that are quick and easy to play online. Especially ones without tedious signup processes and that let you play right away.

I enjoy playing such games with friends and co-workers. This is the first multiplayer one that I've built, I got more to come.

## Tech stack

- [Liveblocks](https://liveblocks.io/) for multiplayer
- [Tailwind](https://tailwindcss.com/) for styling
- [Shadcn](https://ui.shadcn.com/) for components
- [React Router 7 (as a framework)](https://reactrouter.com/home) for fullstack dev
- [Prisma](https://prisma.io/) for orm and database (PostgreSQL)
- [Vercel](https://vercel.com/) for hosting and web analytics

## Cloning & running

1. Clone the repo: `git clone https://github.com/tigerabrodi/narumory`
2. Create a `.env` file.
3. Run `pnpm install` and `pnpm dev` to install dependencies and run locally

For your `.env` file:

```
DATABASE_URL=""
SESSION_SECRET=""
LIVEBLOCKS_SECRET_KEY=""
```

- DATABASE_URL: Any postgres database url. I used Prisma's postgres.
- SESSION_SECRET: Any random string, you can generate one with `openssl rand -base64 32` in the terminal
- LIVEBLOCKS_SECRET_KEY: This is something you get over at [Liveblocks](https://liveblocks.io/).

## Bugs & Contributing

I assume you've it up and running by yourself.

If you find a bug, create an issue.

If you want to contribute, make sure an issue is already created and ASSIGNED to you. Don't waste your time making a PR that won't be merged.

If it's something that I think should be addressed, we can discuss the solution in the github issue, and then you can go ahead and make a PR.

## License

This project is licensed under the MIT License <3
