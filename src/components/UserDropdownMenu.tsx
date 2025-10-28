"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  
  // Formatear el nombre del usuario
  const formattedUserName = formatUserName(userName);
  
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="hidden md:flex text-qoder-dark-text-primary hover:text-qoder-dark-accent-orange p-1 rounded-md hover:bg-qoder-dark-bg-hover items-center gap-1"
          title="Menú de usuario"
          style={{ fontFamily: "'Roboto', 'Arial', sans-serif", color: '#ffffff' }}
        >
          <span className="text-sm" style={{ color: '#ffffff', textTransform: 'none' }}>{formattedUserName}</span>
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
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdown-menu min-w-[200px]"
          sideOffset={5}
        >
          {isAdmin ? (
            <>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/mi-barberia" 
                  className={`dropdown-item ${pathname?.startsWith("/mi-barberia") ? "active" : ""}`}
                >
                  Mi Barbería
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link 
                  href="/estadisticas" 
                  className={`dropdown-item ${pathname?.startsWith("/estadisticas") ? "active" : ""}`}
                >
                  Estadísticas
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="border-qoder-dark-border-primary my-1" />
              <DropdownMenu.Item 
                className="dropdown-item text-red-400 hover:!bg-red-900/30 hover:!text-red-400"
                onClick={onLogout}
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
                >
                  Mis Datos
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="border-qoder-dark-border-primary my-1" />
              <DropdownMenu.Item 
                className="dropdown-item text-red-400 hover:!bg-red-900/30 hover:!text-red-400"
                onClick={onLogout}
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