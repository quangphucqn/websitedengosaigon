import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Loading } from './components/Loading'
import { HomePage } from './pages/HomePage'
import { ProductListPage } from './pages/ProductListPage'

// Lazy-load secondary customer pages for faster initial Core Web Vitals
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })),
)
const CartPage = lazy(() =>
  import('./pages/CartPage').then((m) => ({ default: m.CartPage })),
)
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const OrderSuccessPage = lazy(() =>
  import('./pages/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })),
)
const BlogListPage = lazy(() =>
  import('./pages/BlogListPage').then((m) => ({ default: m.BlogListPage })),
)
const BlogDetailPage = lazy(() =>
  import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })),
)
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)

// Lazy-load all Admin routes to drastically shrink the main bundle for customers
const AdminLayout = lazy(() =>
  import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
)
const LoginPage = lazy(() =>
  import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AdminProductsPage = lazy(() =>
  import('./pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })),
)
const AdminProductFormPage = lazy(() =>
  import('./pages/admin/AdminProductFormPage').then((m) => ({ default: m.AdminProductFormPage })),
)
const AdminCategoriesPage = lazy(() =>
  import('./pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })),
)
const AdminBannersPage = lazy(() =>
  import('./pages/admin/AdminBannersPage').then((m) => ({ default: m.AdminBannersPage })),
)
const AdminIntroSlidesPage = lazy(() =>
  import('./pages/admin/AdminIntroSlidesPage').then((m) => ({ default: m.AdminIntroSlidesPage })),
)
const AdminPostsPage = lazy(() =>
  import('./pages/admin/AdminPostsPage').then((m) => ({ default: m.AdminPostsPage })),
)
const AdminPostFormPage = lazy(() =>
  import('./pages/admin/AdminPostFormPage').then((m) => ({ default: m.AdminPostFormPage })),
)
const AdminContactPage = lazy(() =>
  import('./pages/admin/AdminContactPage').then((m) => ({ default: m.AdminContactPage })),
)
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })),
)

function AdminSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="shell page-space">
          <Loading label="Đang tải trang quản trị…" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductListPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan" element={<CheckoutPage />} />
        <Route path="/dat-hang-thanh-cong" element={<OrderSuccessPage />} />
        <Route path="/bai-viet" element={<BlogListPage />} />
        <Route path="/bai-viet/:slug" element={<BlogDetailPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>

      <Route
        path="/admin/dang-nhap"
        element={
          <AdminSuspense>
            <LoginPage />
          </AdminSuspense>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminSuspense>
            <AdminLayout />
          </AdminSuspense>
        }
      >
        <Route index element={<Navigate to="san-pham" replace />} />
        <Route path="san-pham" element={<AdminProductsPage />} />
        <Route path="san-pham/moi" element={<AdminProductFormPage />} />
        <Route path="san-pham/:id" element={<AdminProductFormPage />} />
        <Route path="danh-muc" element={<AdminCategoriesPage />} />
        <Route path="banner" element={<AdminBannersPage />} />
        <Route path="gioi-thieu" element={<AdminIntroSlidesPage />} />
        <Route path="bai-viet" element={<AdminPostsPage />} />
        <Route path="bai-viet/moi" element={<AdminPostFormPage />} />
        <Route path="bai-viet/:id" element={<AdminPostFormPage />} />
        <Route path="lien-he" element={<AdminContactPage />} />
        <Route path="don-hang" element={<AdminOrdersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
