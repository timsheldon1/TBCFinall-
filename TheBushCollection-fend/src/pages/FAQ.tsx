import React from 'react';
import { Button } from '@/components/ui/button';
import FAQModal from '@/components/FAQModal';
import { motion } from 'framer-motion';

export default function FAQ() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<motion.section className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
				<h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h1>
				<p className="max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
					Answers to common questions about planning and booking your safari with The Bush Collection.
				</p>

				<div className="flex justify-center">
					<FAQModal trigger={<Button>Open FAQ</Button>} />
				</div>
			</motion.section>
		</div>
	);
}

