import { useState, useEffect } from "react";
import { MoonStarIcon, SunIcon } from "../Icons/Icons";

function Theme() {
  const [dark, setDark] = useState(false);
  const element = document.documentElement;

  useEffect(() => {
    const isDarkMode = localStorage.getItem("lightMode") === "true";
    setDark(isDarkMode);
    if (isDarkMode) {
      element.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const newDarkMode = !dark;
    localStorage.setItem("lightMode", newDarkMode);
    setDark(newDarkMode);
    if (newDarkMode) {
      element.classList.add("dark");
    } else {
      element.classList.remove("dark");
    }
  };

  return (
    <div>
      <div className="text-xl">
        {dark ? (
          <button className="pt-2 pl-2 lg:pl-0 text-gray-900" onClick={toggle}>
            <MoonStarIcon />
          </button>
        ) : (
          <button className="pt-2 pl-2 lg:pl-0 text-gray-300" onClick={toggle}>
            <SunIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default Theme;
