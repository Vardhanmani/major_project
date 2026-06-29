import { Toaster } from "react-hot-toast"
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import AppLayout from "./pages/AppLayout"
import ProductPages from "./pages/ProductPages"
import Products from "./pages/Products"
import SearchResult from "./pages/SearchResult"
import FlashDeals from "./pages/FlashDeals"
import CheckOut from "./pages/CheckOut"
import MyOrders from "./pages/MyOrders"
import OrderTracking from "./pages/OrderTracking"
import Addresses from "./pages/Addresses"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";
import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryLayout from "./pages/delivery/DeliveryLayout";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1B3022",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
          },
        }}
      />

      <Routes>
        {/*auth pages */}
        <Route path="/login" element={<Login />} />
        {/*main page with navbar/footer*/}
        <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductPages />}  />
            <Route path="search" element={<SearchResult />} />
            <Route path="deals" element={<FlashDeals />} />

            {/* Protected routes — now nested so AppLayout (Navbar/Footer) shows */}
            <Route element={<ProtectedRoute/>}>
                <Route path="CheckOut" element={<CheckOut />} />
                <Route path="MyOrders" element={<MyOrders />} />
                <Route path="MyOrders/:id" element={<OrderTracking />} />
                <Route path="Addresses" element={<Addresses />} />
            </Route>
        </Route>
        {/* Admin pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="delivery-partners" element={<AdminDeliveryPartners />}/>
        </Route>
        {/* Delivery Partner pages */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery" element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
