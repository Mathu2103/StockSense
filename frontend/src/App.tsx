import AppRouter from './routes/AppRouter'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <AppRouter />
    </>
  )
}

export default App