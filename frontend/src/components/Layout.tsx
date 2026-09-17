import { Outlet } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  return (
    <div className="site-page">
      <SiteHeader />
      <main><Outlet /></main>
      <SiteFooter />
    </div>
  )
}
