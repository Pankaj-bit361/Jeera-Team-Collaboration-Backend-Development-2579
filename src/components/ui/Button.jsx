import React from 'react';
import { cn } from '../../lib/utils';
import SafeIcon from '../../common/SafeIcon';

const Button = ({ children, variant = 'primary', size = 'md', className, icon, loading, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={loading}
      {...props}
    >
      {loading && <SafeIcon name="Loader" className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && icon && <SafeIcon icon={icon} className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export default Button;