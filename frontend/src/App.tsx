import AppRouter from './routes/AppRouter'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </>
  )
}

export default App