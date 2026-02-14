import React, { useEffect } from "react";
import gsap from "gsap";

const CustomCursor = () => {
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Emit snow on move
      if (Math.random() > 0.4) {
        createSnowflake(mouseX, mouseY);
      }
    };

    const createSnowflake = (x, y) => {
      const snowflake = document.createElement("div");
      snowflake.className =
        "fixed pointer-events-none z-[9999999] rounded-full";

      const size = Math.random() * 4 + 1.5;
      const opacity = Math.random() * 0.4 + 0.4;

      snowflake.style.left = `${x}px`;
      snowflake.style.top = `${y}px`;
      snowflake.style.width = `${size}px`;
      snowflake.style.height = `${size}px`;
      snowflake.style.backgroundColor = "gold";
      snowflake.style.opacity = opacity.toString();
      snowflake.style.filter = "blur(0.5px)";
      // Add a subtle border/glow so it's visible on white
      snowflake.style.boxShadow = "0 0 4px rgba(0,0,0,0.15), 0 0 2px gold";

      // Append to root to avoid "body > *" CSS hiding rule
      const root = document.getElementById("root");
      if (root) root.appendChild(snowflake);
      else document.body.appendChild(snowflake);

      // Animation: Drift and Fall
      gsap.to(snowflake, {
        y: `+=${Math.random() * 120 + 60}`,
        x: `+=${(Math.random() - 0.5) * 80}`,
        opacity: 0,
        scale: 0.3,
        duration: 2 + Math.random(),
        ease: "power1.out",
        onComplete: () => snowflake.remove(),
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return null; // Component only emits particles, has no permanent UI
};

export default CustomCursor;
