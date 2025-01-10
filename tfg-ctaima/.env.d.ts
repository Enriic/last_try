interface ImportMetaEnv {
  readonly API_URL: string = 'http://localhost:8000';
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}