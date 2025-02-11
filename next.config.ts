// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
// Importing the type from Next.js
import type { NextConfig } from 'next';

// Define your Next.js configuration with proper typing
const nextConfig: NextConfig = {
  // Your config options here
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // Example: Disables ESLint during the build process
  },
  // Add other configuration options as needed
};

// Export the configuration as default
export default nextConfig;
