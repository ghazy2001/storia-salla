import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCurrentPage,
  setCurrentPage,
} from "../../store/slices/cartSlice";
import {
  selectTheme,
  selectSelectedCategory,
  selectSelectedProductId,
  setSelectedCategory,
  setSelectedProductId,
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

const PageContent = () => {
  const currentPage = useSelector(selectCurrentPage);
  const theme = useSelector(selectTheme);
  const selectedCategory = useSelector(selectSelectedCategory);
  const selectedProductId = useSelector(selectSelectedProductId);
  const dispatch = useDispatch();

  // Scroll to top on navigation/page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage, selectedProductId, selectedCategory]);

  const handleProductSelect = (id) => {
    dispatch(setSelectedProductId(id));
    dispatch(setCurrentPage("product-details"));
  };

  const handleGoToStore = () => {
    dispatch(setSelectedCategory("all"));
    dispatch(setCurrentPage("store"));
  };

  switch (currentPage) {
    case "store":
      return (
        <Store
          initialFilter={selectedCategory}
          onProductSelect={handleProductSelect}
        />
      );
    case "admin-dashboard":
      return <AdminDashboard theme={theme} />;
    case "cart":
      return <ShoppingCart onContinueShopping={handleGoToStore} />;
    case "checkout":
      return <Checkout theme={theme} />;
    case "product-details":
      return (
        <ProductDetails key={selectedProductId} productId={selectedProductId} />
      );
    default:
      return (
        <>
          <Hero
            goToStore={handleGoToStore}
            onProductSelect={handleProductSelect}
          />
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
  }
};

export default PageContent;
