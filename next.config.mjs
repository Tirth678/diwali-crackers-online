/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Removed COOP/COEP headers that were blocking camera in preview iframe
  // (require-corp breaks getUserMedia in embedded previews; MediaPipe still works without it)
};
export default nextConfig;
