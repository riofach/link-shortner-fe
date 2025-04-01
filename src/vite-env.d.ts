/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	// tambahkan variabel env lainnya jika diperlukan
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
