import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.plantwallet.app",
  appName: "PlantWallet",
  webDir: ".output/public",
  server: {
    androidScheme: "https",
  },
};

export default config;
