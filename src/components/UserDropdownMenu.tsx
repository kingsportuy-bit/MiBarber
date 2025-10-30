"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface UserDropdownMenuProps {
  userName: string;
  isAdmin: boolean;
  onLogout: () => void;
}

function formatUserName(name: string): string {
  if (!name) return "";
  
  // Dividir el nombre en partes (nombre y apellido)
  const parts = name.trim().split(/\s+/);
  
  if (parts.length === 0) return "";
  
  // Tomar solo el primer nombre y el primer apellido
  const firstName = parts[0];
  const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
  
  // Formatear: primera letra mayúscula, resto minúscula
  const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const formattedLastName = lastName ? lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase() : "";
  
  // Retornar el nombre formateado
  return formattedLastName ? `${formattedFirstName} ${formattedLastName}` : formattedFirstName;
}

export function UserDropdownMenu({ userName, isAdmin, onLogout }: UserDropdownMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Formatear el nombre del usuario
  const formattedUserName = formatUserName(userName);
  
  return (
    <DropdownMenu.Root onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="hidden md:flex text-qoder-dark-text-primary hover:text-qoder-dark-accent-orange p-1 rounded-md hover:bg-qoder-dark-bg-hover items-center gap-1 relative"
          title="Menú de usuario"
          style={{ 
            fontFamily: "'Roboto', 'Arial', sans-serif", 
            color: '#ffffff',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            background: 'transparent', // Sobrescribir el gradiente naranja
            backgroundImage: 'none', // Eliminar cualquier imagen de fondo
            padding: '0.25rem 0.5rem', // Ajustar padding
            borderRadius: '0.375rem', // Ajustar border-radius
            fontWeight: 'normal', // Ajustar fontWeight
            textTransform: 'none', // Eliminar transformación de texto
            letterSpacing: 'normal', // Eliminar espaciado de letras
            fontSize: '0.875rem' // Ajustar tamaño de fuente
          }}
        >
          <span className="text-sm" style={{ 
            color: '#ffffff', 
            textTransform: 'none',
            backgroundColor: 'transparent'
          }}>{formattedUserName}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
          {/* Barra inferior que aparece al pasar el mouse o cuando el menú está abierto */}
          <span 
            className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-orange-800 to-orange-500 transition-all duration-300 ${
              isOpen ? 'w-4/5' : 'w-0'
            }`}
            style={{
              background: 'linear-gradient(90deg, #cc5500, #ff7700)'
            }}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdown-menu min-w-[200px]"
          sideOffset={5}
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.95)',
            border: '1px solid rgba(255, 119, 0, 0.3)',
            borderRadius: '6px',
            padding: '5px 0'
          }}
        >
          {isAdmin ? (
            <>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/mi-barberia" 
                  className={`dropdown-item ${pathname?.startsWith("/mi-barberia") ? "active" : ""}`}
                  style={{
                    padding: '12px 15px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    fontFamily: "'Roboto', 'Arial', sans-serif",
                    fontSize: '1rem'
                  }}
                >
                  Mi Barbería
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="border-qoder-dark-border-primary my-1" />
              <DropdownMenu.Item 
                className="dropdown-item text-red-400 hover:!bg-red-900/30 hover:!text-red-400"
                onClick={onLogout}
                style={{
                  padding: '12px 15px',
                  color: '#f87171',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  fontFamily: "'Roboto', 'Arial', sans-serif",
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </DropdownMenu.Item>
            </>
          ) : (
            <>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/mis-datos" 
                  className={`dropdown-item ${pathname?.startsWith("/mis-datos") ? "active" : ""}`}
                  style={{
                    padding: '12px 15px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'all 0.2s ease',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    fontFamily: "'Roboto', 'Arial', sans-serif",
                    fontSize: '1rem'
                  }}
                >
                  Mis Datos
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="border-qoder-dark-border-primary my-1" />
              <DropdownMenu.Item 
                className="dropdown-item text-red-400 hover:!bg-red-900/30 hover:!text-red-400"
                onClick={onLogout}
                style={{
                  padding: '12px 15px',
                  color: '#f87171',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'all 0.2s ease',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  fontFamily: "'Roboto', 'Arial', sans-serif",
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </DropdownMenu.Item>
            </>
          )}
          
          <DropdownMenu.Arrow className="fill-qoder-dark-border-primary" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}