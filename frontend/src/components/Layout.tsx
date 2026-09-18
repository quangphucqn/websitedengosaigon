import { Outlet } from 'react-router-dom'
import { SiteAnnouncementBar } from './SiteAnnouncementBar'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  return (
    <div className="site-page">
      <SiteAnnouncementBar />
      <SiteHeader />
      <main><Outlet /></main>
      <SiteFooter />
    </div>
  )
}
