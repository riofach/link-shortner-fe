import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UrlModalProps {
	isOpen?: boolean;
	onClose: () => void;
	onSubmit: (data: { url: string; customAlias?: string }) => void;
	url?: string;
	setUrl?: (value: string) => void;
	customCode?: string;
	setCustomCode?: (value: string) => void;
	loading?: boolean;
	showCustomCodeField?: boolean;
}

const UrlModal = ({
	isOpen = true,
	onClose,
	onSubmit,
	url = '',
	setUrl,
	customCode = '',
	setCustomCode,
	loading = false,
	showCustomCodeField = true,
}: UrlModalProps) => {
	// Menentukan apakah menggunakan props atau state internal
	const usePropsForUrl = typeof setUrl === 'function';
	const usePropsForCustomCode = typeof setCustomCode === 'function';

	const [localUrl, setLocalUrl] = useState(url);
	const [localCustomCode, setLocalCustomCode] = useState(customCode);
	const [isLoading, setIsLoading] = useState(loading);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Gunakan nilai state lokal atau props tergantung mana yang digunakan
		const finalUrl = usePropsForUrl ? url : localUrl;
		const finalCustomCode = usePropsForCustomCode ? customCode : localCustomCode;

		// Validate URL
		if (!finalUrl) {
			toast.error('Silakan masukkan URL');
			return;
		}

		try {
			// Basic URL validation
			new URL(finalUrl);
		} catch (error) {
			toast.error('Silakan masukkan URL yang valid');
			return;
		}

		setIsLoading(true);

		// Submit data to parent component
		onSubmit({
			url: finalUrl,
			customAlias: finalCustomCode || undefined,
		});

		// Reset form setelah submission jika menggunakan state lokal
		if (!usePropsForUrl) {
			setLocalUrl('');
		}
		if (!usePropsForCustomCode) {
			setLocalCustomCode('');
		}
		setIsLoading(false);
	};

	const handleClose = () => {
		if (!usePropsForUrl) {
			setLocalUrl('');
		}
		if (!usePropsForCustomCode) {
			setLocalCustomCode('');
		}
		onClose();
	};

	// Handler untuk input URL
	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (usePropsForUrl) {
			setUrl?.(value);
		} else {
			setLocalUrl(value);
		}
	};

	// Handler untuk input custom code
	const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (usePropsForCustomCode) {
			setCustomCode?.(value);
		} else {
			setLocalCustomCode(value);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-150">
				<button
					onClick={handleClose}
					className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
				>
					<X className="h-5 w-5" />
				</button>

				<h3 className="text-xl font-bold mb-6">Buat Tautan Pendek</h3>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="url">URL yang akan dipendekkan</Label>
						<Input
							id="url"
							placeholder="https://contoh.com/tautan/panjang"
							value={usePropsForUrl ? url : localUrl}
							onChange={handleUrlChange}
							required
						/>
					</div>

					{showCustomCodeField && (
						<div className="space-y-2">
							<Label htmlFor="customAlias">Kode kustom (opsional)</Label>
							<Input
								id="customAlias"
								placeholder="nama-kustom"
								value={usePropsForCustomCode ? customCode : localCustomCode}
								onChange={handleCustomCodeChange}
							/>
							<p className="text-xs text-gray-500">
								Kode kustom harus terdiri dari 3-10 karakter. Jika tidak diisi, kode akan dibuat
								secara otomatis.
							</p>
						</div>
					)}

					{!showCustomCodeField && (
						<p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
							Pembuatan kode kustom hanya tersedia untuk pengguna Pro.
							<a href="/pricing" className="text-primary ml-1 hover:underline">
								Upgrade ke Pro
							</a>
						</p>
					)}

					<div className="pt-2 flex justify-end gap-3">
						<Button type="button" variant="outline" onClick={handleClose}>
							Batal
						</Button>
						<Button type="submit" disabled={loading || isLoading}>
							{loading || isLoading ? 'Memproses...' : 'Buat Tautan'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default UrlModal;
