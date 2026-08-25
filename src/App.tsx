function App() {
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-stone-50 px-6 py-16 text-stone-950 dark:bg-stone-950 dark:text-stone-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.16),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(14,116,144,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.10),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(34,211,238,0.08),transparent_34%)]"
      />

      <section aria-labelledby="product-name" className="w-full max-w-2xl">
        <div className="border-l-2 border-lime-500 pl-6 sm:pl-8 dark:border-lime-400">
          <p className="mb-5 flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-stone-600 uppercase dark:text-stone-300">
            <span className="size-2 rounded-full bg-lime-500 dark:bg-lime-400" aria-hidden="true" />
            Foundation ready
          </p>
          <h1 id="product-name" className="text-5xl font-semibold tracking-[-0.045em] sm:text-7xl">
            Explocation
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600 sm:text-xl dark:text-stone-300">
            The technical foundation is in place for discovering locations that fit what matters.
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
