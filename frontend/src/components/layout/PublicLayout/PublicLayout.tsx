import { Outlet } from 'react-router-dom'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'

export default function PublicLayout() {
  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col overflow-x-hidden">
      <PublicNavbar />
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
