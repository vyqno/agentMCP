import { cn } from '../../lib/cn';

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function WizardShell({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
}: WizardShellProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i < currentStep - 1
                ? 'bg-apple-blue flex-[2]'
                : i === currentStep - 1
                ? 'bg-apple-blue flex-[3]'
                : 'bg-gray-200 flex-1',
            )}
          />
        ))}
      </div>

      <h1 className="text-3xl font-semibold text-apple-text tracking-tight">
        {title}
      </h1>
      <p className="text-apple-sub mt-2 mb-8">{subtitle}</p>

      {children}
    </div>
  );
}
