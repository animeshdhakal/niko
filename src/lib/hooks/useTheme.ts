// Re-export useTheme from next-themes for convenience
// You can import this hook anywhere in your app to access/modify theme
export { useTheme } from "next-themes";

// Example usage in any component:
// 
// import { useTheme } from "@/lib/hooks/useTheme";
//
// function MyComponent() {
//   const { theme, setTheme, systemTheme } = useTheme();
//   
//   return (
//     <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
//       Current: {theme}
//     </button>
//   );
// }
