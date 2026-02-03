import type { ReactNode } from "react";

interface SectionContainerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

const SectionContainer = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
}: SectionContainerProps) => {
  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
          {badge && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({badge})
            </span>
          )}
        </h2>
        {headerAction}
      </div>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
};

export default SectionContainer;
