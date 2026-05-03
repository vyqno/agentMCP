import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-pill disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-apple-black text-white hover:bg-gray-800 active:scale-95':
            variant === 'primary',
          'bg-apple-gray2 text-apple-text hover:bg-gray-200 active:scale-95':
            variant === 'secondary',
          'text-apple-blue hover:underline':
            variant === 'ghost',
        },
        {
          'text-sm px-4 py-2': size === 'sm',
          'text-sm px-5 py-2.5': size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
