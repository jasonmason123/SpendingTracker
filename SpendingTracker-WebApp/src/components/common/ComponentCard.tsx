import React from "react";
import Tippy from '@tippyjs/react';

interface ActionProps {
  actionName: string;
  icon?: React.ReactNode;
  action: () => void
}

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  actions?: ActionProps[];
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  actions
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5 flex justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
        <div className="flex gap-2">
         {actions && actions.map((action, index) => (
          <Tippy content={action.actionName} key={action.actionName || index}>
            <button
              onClick={action.action}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
            >
              <span className="text-sm">{action.icon}</span>
            </button>
          </Tippy>
         ))}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
