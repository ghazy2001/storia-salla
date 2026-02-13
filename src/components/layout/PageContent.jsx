import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  selectTheme,
  selectSelectedCategory,
  setSelectedCategory,
} from "../../store/slices/uiSlice";

// Components
import Hero from "../home/Hero";
import ProductListing from "../shop/ProductListing";
import ProductDetails from "../product/ProductDetails";
import Store from "../shop/Store";
import ShoppingCart from "../cart/ShoppingCart";
import Checkout from "../checkout/Checkout";
import OurStory from "../home/OurStory";
import BestSellers from "../home/BestSellers";
import Reviews from "../home/Reviews";
import FAQ from "../home/FAQ";
import AdminDashboard from "../admin/AdminDashboard";

const HomePage = ({ handleGoToStore, handleProductSelect, theme }) => (
  <>
    <Hero goToStore={handleGoToStore} onProductSelect={handleProductSelect} />
    <ProductListing
      goToStore={handleGoToStore}
      onProductSelect={handleProductSelect}
    />
    <OurStory theme={theme} />
    <BestSellers onProductSelect={handleProductSelect} />
    <Reviews theme={theme} />
    <FAQ theme={theme} />
  </>
);

const PageContent = () => {
  const theme = useSelector(selectTheme);
  const selectedCategory = useSelector(selectSelectedCategory);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on navigation changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleProductSelect = (id) => {
    navigate(`/product/${id}`);
  };

  const handleGoToStore = () => {
    dispatch(setSelectedCategory("all"));
    navigate("/store");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            handleGoToStore={handleGoToStore}
            handleProductSelect={handleProductSelect}
            theme={theme}
          />
        }
      />
      <Route
        path="/store"
        element={
          <Store
            initialFilter={selectedCategory}
            onProductSelect={handleProductSelect}
          />
        }
      />
      <Route
        path="/cart"
        element={<ShoppingCart onContinueShopping={handleGoToStore} />}
      />
      <Route path="/checkout" element={<Checkout theme={theme} />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route
        path="/admin-dashboard"
        element={<AdminDashboard theme={theme} />}
      />
    </Routes>
  );
};

export default PageContent;
