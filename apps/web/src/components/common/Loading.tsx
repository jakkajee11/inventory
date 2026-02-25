'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  fullScreen?: boolean;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, text, fullScreen = false, ...props }, ref) => {
    const content = (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', className)}
        {...props}
      >
        <Loader2 className={cn(spinnerVariants({ size }))} />
        {text && <span className="ml-2 text-sm text-muted-foreground">{text}</span>}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {content}
        </div>
      );
    }

    return content;
  }
);
Loading.displayName = 'Loading';

// Skeleton component for loading states
const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    variant: {
      default: '',
      circular: 'rounded-full',
      text: 'h-4 w-full',
      title: 'h-6 w-3/4',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-10 w-24',
      card: 'h-32 w-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

// Page Loading component
interface PageLoadingProps {
  text?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  );
};

// Table Loading skeleton
const TableLoading: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      <div className="p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 py-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Card Loading skeleton
const CardLoading: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
};

export { Loading, Skeleton, PageLoading, TableLoading, CardLoading, spinnerVariants };
