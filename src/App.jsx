import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";

import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import DealerRequestsPage from "./pages/DealerRequestsPage";
import OrdersPage from './pages/Orders';
import NotificationsPage from './pages/NotificationsPage';
import GiftCatalogPage from "./pages/GiftCatalogPage";
import DealerGiftInventoryPage from "./pages/DealerGiftInventoryPage";
import ScratchRewardOrdersPage from "./pages/ScratchRewardOrdersPage";

const OverviewPage = () => {
  return (
    <div className="p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-orange-500">
        Dashboard
      </p>

      <h1 className="text-3xl font-black text-slate-900 mt-1">
        Welcome to Surya Marketing
      </h1>

      <p className="text-slate-500 mt-2">
        Overview dashboard will come here.
      </p>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <DashboardLayout />
          }
        >
          <Route
            path="/"
            element={
              <OverviewPage />
            }
          />

          <Route
            path="/products"
            element={
              <ProductsPage />
            }
          />

          <Route
            path="/users"
            element={
              <UsersPage />
            }
          />
          <Route
            path="/dealer-requests"
            element={<DealerRequestsPage />}
          />

          <Route
            path="/orders"
            element={<OrdersPage />}
          />
          <Route
            path="gifts"
            element={<GiftCatalogPage />}
          />
          <Route
            path="dealer-gifts"
            element={<DealerGiftInventoryPage />}
          />

          <Route
            path="scratch-orders"
            element={<ScratchRewardOrdersPage />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

          <Route
            path="/notifications"
            element={
              <NotificationsPage />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}