export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">Page not found</p>
        <a href="/" className="mt-6 inline-block rounded bg-primary px-4 py-2 text-white hover:bg-primary/90">
          Go Home
        </a>
      </div>
    </div>
  );
}
