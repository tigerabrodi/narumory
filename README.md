# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjacob-ebey%2Freact-router-templates%2Ftree%2Fmain%2Fvercel&project-name=my-react-router-app&repository-name=my-react-router-app)

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

---

i hate try catch in typescript, ended up writing a utility to handle async functions

```ts
type ExtractAsyncFnArgs<Args extends Array<any>> =
  Args extends Array<infer PotentialArgTypes> ? [PotentialArgTypes] : []

type Result<ReturnType> = [ReturnType, null] | [null, Error]

export async function runAsync<Args extends Array<any>, ReturnType>(
  asyncFn: (...args: ExtractAsyncFnArgs<Args>) => Promise<ReturnType>,
  ...args: ExtractAsyncFnArgs<Args>
): Promise<Result<ReturnType>> {
  try {
    const result = await asyncFn(...args)
    return [result, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

// Use it like
const [post, error] = await runAsync(createPost, {
  title: 'Hello World',
  content: 'This is a test post',
})

if (error) throw new Error('Failed to create post')

// ...
```
