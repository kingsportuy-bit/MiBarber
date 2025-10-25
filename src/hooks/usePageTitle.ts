import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    // Actualizar el título de la pestaña del navegador
    document.title = title;
    
    // También podemos actualizar el título en el metadata si es necesario
    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) {
      metaTitle.setAttribute('content', title);
    }
  }, [title]);
}