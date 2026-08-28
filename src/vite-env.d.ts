/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_LIVE_API?: string | boolean;
  readonly VITE_API_ENDPOINT?: string;
  readonly VITE_BASE_DOMAIN?: string;
  readonly VITE_APP_PATH?: string;
  readonly PROD?: boolean;
  readonly DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
