import React, { useState } from "react";
import { resolveAsset } from "../../utils/assetUtils";
import { Instagram, Facebook, Mail } from "lucide-react";
import { getThemeValue } from "../../utils/themeUtils";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSelectedCategory,
  setContactFormOpen,
  setTrackOrderOpen,
  showToast,
} from "../../store/slices/uiSlice";
import { selectCategories } from "../../store/slices/productSlice";
import { SOCIAL_URLS, CONTACT_INFO } from "../../utils/constants";
import { toggleLoginModal } from "../../store/slices/adminSlice";

const Footer = ({ theme }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector(selectCategories);
  const [showAll, setShowAll] = useState(false);
  const [, setLogoClicks] = useState(0);
  const activeCategories = categories.filter((cat) => cat.isActive);

  const handleNavigate = (category) => {
    dispatch(setSelectedCategory(category));
    navigate("/store");
  };

  const socialIcons = [
    {
      icon: Instagram,
      href: SOCIAL_URLS.INSTAGRAM,
      label: "Instagram",
    },
    {
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      href: SOCIAL_URLS.TIKTOK,
      label: "TikTok",
    },
    {
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.206 2.024c-5.575 0-10.096 4.406-10.096 9.837 0 4.276 2.877 7.896 6.846 9.138-.094-.774-.18-1.962.038-2.805.197-.764 1.27-5.386 1.27-5.386s-.325-.642-.325-1.594c0-1.493.87-2.607 1.95-2.607.92 0 1.364.686 1.364 1.508 0 .918-.587 2.292-.89 3.567-.253 1.064.536 1.933 1.59 1.933 1.91 0 3.377-2.013 3.377-4.92 0-2.571-1.846-4.368-4.485-4.368-3.055 0-4.85 2.29-4.85 4.657 0 .922.356 1.912.8 2.45.088.107.1.2.074.31-.08.331-.258 1.051-.293 1.197-.047.193-.156.234-.36.141-1.344-.627-2.184-2.596-2.184-4.175 0-3.389 2.463-6.503 7.104-6.503 3.73 0 6.628 2.657 6.628 6.205 0 3.702-2.332 6.68-5.573 6.68-1.088 0-2.11-.564-2.46-1.231 0 0-.538 2.051-.67 2.554-.242.944-.9 2.127-1.34 2.849 1.01.313 2.08.482 3.195.482 5.575 0 10.096-4.406 10.096-9.837 0-5.432-4.52-9.838-10.096-9.838z" />
        </svg>
      ),
      href: SOCIAL_URLS.SNAPCHAT,
      label: "SnapChat",
    },
    {
      icon: Facebook,
      href: SOCIAL_URLS.FACEBOOK,
      label: "Facebook",
    },
    {
      icon: Mail,
      href: `mailto:${CONTACT_INFO.EMAIL}`,
      label: "Gmail",
    },
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    dispatch(showToast("تم الاشتراك في النشرة البريدية بنجاح"));
  };

  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const newVal = prev + 1;
      if (newVal >= 5) {
        dispatch(toggleLoginModal());
        return 0; // Reset
      }
      return newVal;
    });

    // Reset clicks after 2 seconds of inactivity
    setTimeout(() => setLogoClicks(0), 2000);
  };

  return (
    <footer className="bg-brand-footer text-brand-light py-20 px-12 text-right transition-colors duration-500 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 border-b border-white/10 pb-20">
        <div className="col-span-1 md:col-span-2 order-1">
          <img
            src={resolveAsset(
              getThemeValue(theme, "/assets/logo.png", "/assets/logo.png"),
            )}
            alt="STORIA DESIGN"
            onClick={handleLogoClick}
            className="h-16 mb-6 ml-auto brightness-0 invert cursor-default active:scale-95 transition-transform"
          />
          <p className="text-xs md:text-sm font-light text-brand-light/50 leading-relaxed tracking-wide mb-8">
            عباية STORIA علامة تجارية فاخرة للعبايات، تستمد إلهامها من الأناقة
            والذوق السعودي الأصيل. يجسد اللون البترولى الفخامة والهوية العميقة،
            بينما يعكس الشعار الأنوثة الراقية وقيم الموضة السعودية الحديثة.
            يوازن تصميمها بين التراث الكلاسيكي والجماليات البسيطة المعاصرة،
            لتمثل الثقة والتميز في كل تفصيل. هویة بصرية فاخرة صممت خصيصاً للمرأة
            التي تقدر التفرد.
          </p>
          <div className="flex justify-start gap-6 text-brand-light/70">
            {socialIcons.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="hover:text-brand-gold transition-colors duration-300 transform hover:scale-110"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>
        <div className="order-3 md:order-2">
          <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
            تصنيفات المتجر
          </h4>
          <ul className="flex flex-col gap-4 text-sm font-light tracking-widest text-brand-light/70">
            {activeCategories
              .slice(0, showAll ? activeCategories.length : 4)
              .map((category) => (
                <li
                  key={category._id || category.id}
                  onClick={() =>
                    handleNavigate(category.slug || category._id || category.id)
                  }
                  className="hover:text-brand-gold transition-colors cursor-pointer text-right"
                >
                  {category.name?.ar ||
                    category.label ||
                    category.name ||
                    "قسم"}
                </li>
              ))}
            {activeCategories.length > 4 && (
              <li
                onClick={() => setShowAll(!showAll)}
                className="text-brand-gold hover:underline transition-all cursor-pointer text-right text-xs font-bold mt-2"
              >
                {showAll ? "عرض أقل ▲" : "المزيد ▼"}
              </li>
            )}
          </ul>
        </div>
        <div className="order-4 md:order-3">
          <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
            روابط مهمة
          </h4>
          <ul className="flex flex-col gap-4 text-sm font-light tracking-widest text-brand-light/70">
            <li
              onClick={() =>
                dispatch(showToast("قريباً - سياسة الاستبدال والاسترجاع"))
              }
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              سياسة الاستبدال والاسترجاع
            </li>
            <li
              onClick={() => dispatch(showToast("قريباً - دليل المقاسات"))}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              دليل المقاسات
            </li>
            <li
              onClick={() => dispatch(setTrackOrderOpen(true))}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              تتبع الطلب
            </li>
            <li
              onClick={() => dispatch(setContactFormOpen(true))}
              className="hover:text-brand-gold transition-colors cursor-pointer"
            >
              تواصلي معنا
            </li>
          </ul>
        </div>
        <div className="order-2 md:order-4">
          <h4 className="uppercase tracking-[0.3em] text-xs mb-8 font-semibold">
            اشترك معنا ليصلك كل جديد
          </h4>
          <form onSubmit={handleSubscribe} className="relative w-full mt-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="w-full bg-transparent border-b border-white/20 py-3 pl-16 pr-2 text-right text-brand-light placeholder:text-brand-light/30 focus:outline-none focus:border-brand-gold transition-all duration-300 text-sm font-light"
              required
            />
            <button
              type="submit"
              className="absolute left-0 bottom-3 text-xs font-bold text-brand-gold hover:text-white transition-colors duration-300 border-b border-transparent hover:border-white pb-0.5"
            >
              اشتراك
            </button>
          </form>
        </div>
      </div>
      <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-3 items-center text-[10px] md:text-xs font-light tracking-widest text-brand-light/30 gap-4">
        <span className="text-center md:text-start">الرقم الضريبي</span>
        <span
          dir="ltr"
          className="text-center flex flex-col items-center gap-1"
        >
          <span>&copy; 2026 STORIA DESIGN. All Rights Reserved.</span>
        </span>
        <div className="flex justify-center md:justify-end gap-4"></div>
      </div>
    </footer>
  );
};

export default Footer;
