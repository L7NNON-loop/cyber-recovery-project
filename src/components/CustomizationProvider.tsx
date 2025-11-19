import { ReactNode } from 'react';
import { useCustomization } from '@/hooks/useCustomization';

export const CustomizationProvider = ({ children }: { children: ReactNode }) => {
  useCustomization();
  return <>{children}</>;
};
