import { useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const useCustomization = () => {
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        const customRef = ref(database, 'customization');
        const snapshot = await get(customRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          
          // Apply font customization
          if (data.font?.enabled) {
            document.documentElement.style.fontFamily = data.font.fontFamily;
            
            if (data.font.fontSize === 'small') {
              document.documentElement.style.fontSize = '14px';
            } else if (data.font.fontSize === 'large') {
              document.documentElement.style.fontSize = '18px';
            } else {
              document.documentElement.style.fontSize = '16px';
            }
          }
          
          // Apply color customization
          if (data.colors?.enabled) {
            // Convert hex to HSL for CSS variables
            const hexToHSL = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              if (!result) return hex;
              
              const r = parseInt(result[1], 16) / 255;
              const g = parseInt(result[2], 16) / 255;
              const b = parseInt(result[3], 16) / 255;
              
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              let h = 0, s = 0;
              const l = (max + min) / 2;
              
              if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                
                switch (max) {
                  case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                  case g: h = ((b - r) / d + 2) / 6; break;
                  case b: h = ((r - g) / d + 4) / 6; break;
                }
              }
              
              return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
            };
            
            document.documentElement.style.setProperty('--primary', hexToHSL(data.colors.primaryColor));
            document.documentElement.style.setProperty('--accent', hexToHSL(data.colors.accentColor));
          }
        }
      } catch (error) {
        console.error('Error loading customization:', error);
      }
    };
    
    loadCustomization();
  }, []);
};
