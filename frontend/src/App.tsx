import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BlogDetailPage } from './pages/BlogDetailPage'
import { BlogListPage } from './pages/BlogListPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductListPage } from './pages/ProductListPage'
import { AdminBannersPage } from './pages/admin/AdminBannersPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminContactPage } from './pages/admin/AdminContactPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminPostFormPage } from './pages/admin/AdminPostFormPage'
import { AdminPostsPage } from './pages/admin/AdminPostsPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { LoginPage } from './pages/admin/LoginPage'

export default function App() {
  return <Routes>
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
    <Route path="/admin/dang-nhap" element={<LoginPage />} />
    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="san-pham" replace />} />
      <Route path="san-pham" element={<AdminProductsPage />} />
      <Route path="san-pham/moi" element={<AdminProductFormPage />} />
      <Route path="san-pham/:id" element={<AdminProductFormPage />} />
      <Route path="danh-muc" element={<AdminCategoriesPage />} />
      <Route path="banner" element={<AdminBannersPage />} />
      <Route path="bai-viet" element={<AdminPostsPage />} />
      <Route path="bai-viet/moi" element={<AdminPostFormPage />} />
      <Route path="bai-viet/:id" element={<AdminPostFormPage />} />
      <Route path="lien-he" element={<AdminContactPage />} />
      <Route path="don-hang" element={<AdminOrdersPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
