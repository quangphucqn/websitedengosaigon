import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Loading } from './Loading'
import { SiteAnnouncementBar } from './SiteAnnouncementBar'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function Layout() {
  return (
    <div className="site-page">
      <SiteAnnouncementBar />
      <SiteHeader />
      <main>
        <Suspense
          fallback={
            <div className="shell page-space">
              <Loading />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  )
}
