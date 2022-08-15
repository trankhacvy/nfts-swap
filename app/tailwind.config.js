/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#fd435a",
        secondary: "#22B8CF",
        info: "#00B1ED",
        success: "#0CD66E",
        warning: "#FFC81A",
        error: "#FF4842",
        gray: {
          100: "#F9FAFB",
          200: "#F4F6F8",
          300: "#DFE3E8",
          400: "#C4CDD5",
          500: "#919EAB",
          600: "#637381",
          700: "#454F5B",
          800: "#212B36",
          900: "#161C24",
        },
      },
      lineHeight: {
        "extra-relaxed": "1.85",
      },
      opacity: {
        8: "0.08",
        12: "0.12",
        16: "0.16",
        24: "0.24",
        32: "0.32",
        48: "0.48",
      },
      fontSize: {
        13: "13px",
        15: "15px",
      },
      boxShadow: {
        z1: "0px 1px 2px rgba(145, 158, 171, 0.24)",
        z4: "-4px 4px 24px rgba(145, 158, 171, 0.08)",
        z8: "-8px 8px 24px -8px rgba(145, 158, 171, 0.1)",
        z12: "-12px 12px 48px -4px rgba(145, 158, 171, 0.12)",
        z16: "-16px 16px 56px -8px rgba(145, 158, 171, 0.16)",
        z20: "-20px 20px 64px -8px rgba(145, 158, 171, 0.2)",
        z24: "-24px 24px 72px -8px rgba(145, 158, 171, 0.24)",
      },
    },
  },
  plugins: [],
};
