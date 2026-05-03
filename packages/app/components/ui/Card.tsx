import { cn } from '../../lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ hover = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-apple-white rounded-card shadow-card',
        hover && 'transition-shadow duration-200 hover:shadow-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
