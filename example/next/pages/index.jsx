import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <div className="{ 'pl-20px bg-yellow-300 font-white text-2xl' }">
            Should be Yellow
          </div>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description + ' pt-35px'}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>d

        <div className={styles.grid}>
          <div className="{ 'pl-50px bg-green-500 text-blue-200 text-2xl p-20 rounded-full text-white font-bold shadow' }">
            Should be Yellow
          </div>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>Documentation &rarr;</h3>
            <p className="bg-red-200">Find in-depth information about Next.js features and API.</p>
          </a>

          <div className="scss-global">
            <h2>SCSS global</h2>
          </div>
          <div className="sass-global">
            <h2>SASS global</h2>
          </div>
          <div className="css-global">
            <h2>CSS global</h2>
          </div>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h3>Learn &rarr;</h3>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Examples &rarr;</h3>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Deploy &rarr;</h3>
            <p className="underline text-gray-600 text-shadow bg-teal-100 text-xl">
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
