import { cn } from '../../lib/cn';

interface BadgeProps {
  variant?: 'online' | 'offline' | 'verified' | 'category' | 'risk-low' | 'risk-high';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'category', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
        {
          'bg-green-100 text-green-700': variant === 'online',
          'bg-gray-100 text-apple-sub': variant === 'offline',
          'bg-blue-50 text-apple-blue': variant === 'verified',
          'bg-apple-gray2 text-apple-text': variant === 'category',
          'bg-green-50 text-green-700': variant === 'risk-low',
          'bg-red-50 text-red-600': variant === 'risk-high',
        },
        className,
      )}
    >
      {(variant === 'online' || variant === 'offline') && (
        <span className={cn('w-1.5 h-1.5 rounded-full', variant === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
      )}
      {children}
    </span>
  );
}
