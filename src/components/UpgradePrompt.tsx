import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface UpgradePromptProps {
	message: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ message }) => {
	const navigate = useNavigate();

	return (
		<Card className="bg-primary/5 border-primary/20 mb-6">
			<CardContent className="pt-6">
				<div className="flex items-start gap-4">
					<div className="rounded-full bg-primary/10 p-2">
						<Sparkles className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h3 className="font-medium mb-1">Tingkatkan ke Pro</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
					</div>
				</div>
			</CardContent>
			<CardFooter className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
				<Button className="ml-auto text-xs" onClick={() => navigate('/pricing')}>
					Lihat Paket Pro
				</Button>
			</CardFooter>
		</Card>
	);
};

export default UpgradePrompt;
