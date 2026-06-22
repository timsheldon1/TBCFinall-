/**
 * Password Requirements Display Component
 * Shows the password security requirements to users
 */

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PasswordRequirementsProps {
  isExpanded?: boolean;
  className?: string;
}

export default function PasswordRequirements({ isExpanded = false, className = '' }: PasswordRequirementsProps) {
  const requirements = [
    {
      title: 'Minimum Length',
      description: 'At least 6 characters long'
    },
    {
      title: 'Character Variety',
      description: 'Mix of uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (!@#$%^&*...)'
    },
    {
      title: 'Avoid Patterns',
      description: 'No sequential characters (abc, 123) or repeating patterns (aaaa, 1111)'
    },
    {
      title: 'Unique & Random',
      description: 'Avoid common words and dictionary terms'
    },
    {
      title: 'Memorable (Optional)',
      description: 'Use passphrase style: unrelated words separated by symbols (e.g., Coffee#Mountain$2024)'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={`overflow-hidden ${className}`}
    >
      <div className="bg-white/[0.03] border border-white/[0.08] rounded p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-[#c9a961]" />
          <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-white/60">
            Password Requirements
          </h3>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {requirements.map((req, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-[#c9a961]/60 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] tracking-[0.1em] uppercase font-light text-white/40">
                  {req.title}
                </p>
                <p className="text-[11px] font-light text-white/30 mt-1">
                  {req.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="pt-3 border-t border-white/[0.06] text-[9px] text-white/25 font-light">
          Following these guidelines ensures your account remains secure and resistant to password cracking attempts.
        </div>
      </div>
    </motion.div>
  );
}
