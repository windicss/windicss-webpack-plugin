import 'virtual:windi.css'

export default function Layout({ title, children }) {
  return (
    <div id="layout-wrapper" className="bg-gray-100 text-gray-900">
      <Head>
        <title >{title}</title>
      </Head>
      {children}
      <style jsx global>{`
        body {
          @apply m-0 p-0 w-100vw h-100vh overflow-hidden hover:(bg-blue-500 text-xs);
          font-family: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
            'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', 'sans-serif';
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </div>
  )
}
