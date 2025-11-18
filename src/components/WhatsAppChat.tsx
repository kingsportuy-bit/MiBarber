"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useWhatsAppChats } from "@/hooks/useWhatsAppChats";
import { useClientes, useClientesByIds } from "@/hooks/useClientes";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { formatWhatsAppTimestamp } from "@/utils/formatters";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ChatConversation, ChatMessage, Client } from "@/types/db";
import Image from "next/image";

import { WhatsAppChatMobile } from "@/components/WhatsAppChatMobile"; // Importar el componente móvil

// Función para convertir puntaje a estrellas con borde dorado y sin relleno
const getStarsFromScore = (puntaje: number) => {
  // Para puntaje 0 y 1, mostrar 1 estrella
  // Para puntajes mayores, mostrar la cantidad correspondiente
  const starCount =
    puntaje <= 1 ? 1 : Math.min(5, Math.max(0, Math.floor(puntaje)));

  // Añadir solo estrellas vacías con borde dorado según el puntaje
  const stars = [];
  for (let i = 0; i < starCount; i++) {
    stars.push(
      <span key={`star-${i}`} className="text-amber-400 text-sm">
        ☆
      </span>,
    );
  }

  return <span className="tracking-wide">{stars}</span>;
};

export function WhatsAppChat() {
  const { idBarberia, isAdmin, barbero } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined);
  const [showAllSucursales, setShowAllSucursales] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Agregar estado para el término de búsqueda
  const supabase: any = getSupabaseClient();
  
  // Para barberos comunes, usar la sucursal asociada
  // Para administradores, permitir seleccionar sucursal o ver todas
  const sucursalId = !isAdmin && barbero?.id_sucursal ? barbero.id_sucursal : selectedSucursal;
  
  const { grouped, isLoading, subscriptionError, refreshChats, isRefreshing, clients } = useWhatsAppChats(sucursalId, showAllSucursales);
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null); // Estado para imagen en pantalla completa
  const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(false); // Estado para controlar la visibilidad de la imagen de fondo
  
  // Cambiar para que no seleccione automáticamente el primer chat
  const activeConv = grouped?.find((g: ChatConversation) => g.session_id === active) || null;

  // Función para obtener el nombre del cliente por su ID
  const getClientName = (sessionId: string) => {
    const cliente = clients?.find((c: Client) => c.telefono === sessionId || c.id_cliente === sessionId);
    return cliente?.nombre || "Cliente desconocido";
  };

  // Función para obtener información del cliente
  const getClientInfo = (sessionId: string) => {
    return clients?.find((c: Client) => c.telefono === sessionId || c.id_cliente === sessionId);
  };
  
  // Obtener IDs únicos de clientes de las conversaciones
  const clienteIds = useMemo(() => {
    if (!grouped) return [];
    return Array.from(
      new Set(
        grouped
          .map(conv => {
            const client = getClientInfo(conv.session_id);
            return client?.id_cliente;
          })
          .filter((id): id is string => id !== null && id !== undefined)
      )
    );
  }, [grouped, clients]);

  // Obtener información de todos los clientes necesarios
  const { data: clientesData } = useClientesByIds(clienteIds);

  // Crear un mapa de clientes por ID para acceso rápido
  const clientesMap = useMemo(() => {
    if (!clientesData) return {};
    return clientesData.reduce((acc, cliente) => {
      if (cliente.id_cliente) {
        acc[cliente.id_cliente] = cliente;
      }
      return acc;
    }, {} as Record<string, Client>);
  }, [clientesData]);

  // Filtrar conversaciones según el término de búsqueda
  const filteredConversations = useMemo(() => {
    if (!grouped || !searchTerm) return grouped || [];
    
    const term = searchTerm.toLowerCase().trim();
    return grouped.filter((conversation: ChatConversation) => {
      const clientName = getClientName(conversation.session_id).toLowerCase();
      const clientInfo = getClientInfo(conversation.session_id);
      const phoneNumber = clientInfo?.telefono?.toLowerCase() || '';
      
      return clientName.includes(term) || phoneNumber.includes(term);
    });
  }, [grouped, searchTerm, clients]);

  // Efecto para manejar el evento de tecla Escape y deseleccionar el chat
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(null);
        setShowBackgroundImage(false);
      }
    };

    // Agregar el event listener cuando el componente se monta
    window.addEventListener('keydown', handleEscapeKey);

    // Limpiar el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Efecto para hacer scroll al último mensaje cuando cambia el chat activo
  useEffect(() => {
    // Si no hay conversación activa o no está activa la vista, no hacer nada
    if (!activeConv?.session_id || !active) return;

    const scrollToBottom = () => {
      const container = document.getElementById('messages-container');
      if (container) {
        // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    };

    // Ejecutar inmediatamente y después de diferentes intervalos para asegurar la actualización del DOM
    scrollToBottom();
    const timer1 = setTimeout(scrollToBottom, 50);
    const timer2 = setTimeout(scrollToBottom, 100);
    const timer3 = setTimeout(scrollToBottom, 200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [activeConv?.session_id, active]);

  // Efecto adicional para asegurar el scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (!activeConv) return;

    const scrollToBottom = () => {
      const container = document.getElementById('messages-container');
      if (container) {
        // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    };

    // Ejecutar después de diferentes intervalos para asegurar la actualización del DOM
    const timer1 = setTimeout(scrollToBottom, 50);
    const timer2 = setTimeout(scrollToBottom, 100);
    const timer3 = setTimeout(scrollToBottom, 200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [activeConv?.messages]);

  // Efecto para mostrar la imagen de fondo cuando se selecciona un chat
  useEffect(() => {
    if (active !== null) {
      setShowBackgroundImage(true);
    }
  }, [active]);

  // Función para verificar si un mensaje contiene una imagen
  const isImageUrl = (content: string) => {
    // Verificar si el contenido es una URL que termina en una extensión de imagen
    const imageRegex = /\.(jpeg|jpg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    try {
      // Verificar si el contenido es una URL válida primero
      const url = new URL(content);
      // Verificar si es una URL http o https
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return false;
      }
      // Verificar si el pathname termina con una extensión de imagen
      return imageRegex.test(url.pathname);
    } catch {
      // Si no es una URL válida, verificar si el contenido contiene una URL con extensión de imagen
      const urlRegex = /https?:\/\/[^\s]+\.(jpeg|jpg|png|gif|webp|bmp|svg)(\?[^\s]*)?/gi;
      return urlRegex.test(content);
    }
  };

  // Función para extraer la URL de la imagen y el caption
  const parseImageMessage = (content: string) => {
    // Verificar si el contenido contiene una URL de imagen
    const urlRegex = /(https?:\/\/[^\s&]+(?:\.(?:jpeg|jpg|png|gif|webp|bmp|svg))(?:\?[^\s&]*)?)/gi;
    const match = content.match(urlRegex);
    
    if (match && match[0]) {
      const imageUrl = match[0];
      // Extraer el caption si existe (contenido entre &)
      const captionMatch = content.match(/&(.+)&/);
      const caption = captionMatch ? captionMatch[1] : '';
      
      return { imageUrl, caption };
    }
    
    // Si no encontramos una URL con &caption&, verificar si todo el contenido es una URL de imagen
    if (isImageUrl(content)) {
      return { imageUrl: content, caption: '' };
    }
    
    return null;
  };

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!message.trim() || !activeConv) return;
    
    try {
      // Insertar mensaje en la tabla mibarber_historial
      const newMessage = {
        session_id: activeConv.session_id,
        message: {
          type: "ai",
          content: message,
          source: "manual",
          timestamp: new Date().toISOString()
        },
        timestamptz: new Date().toISOString()
      };

      const { error } = await supabase
        .from("mibarber_historial")
        .insert([newMessage]);

      if (error) {
        console.error("Error al enviar mensaje:", error);
        return;
      }

      // Enviar webhook
      try {
        const webhookData = {
          session_id: activeConv.session_id,
          message: message,
          type: "ai",
          source: "manual",
          timestamp: new Date().toISOString()
        };

        await fetch("https://webhookn8ncodexa.codexa.uy/webhook/manual", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        });
      } catch (webhookError) {
        console.error("Error al enviar webhook:", webhookError);
      }

      // Limpiar campo de mensaje
      setMessage("");

      // Activar modo humano cuando se envía un mensaje (invertir la lógica)
      const client = getClientInfo(activeConv.session_id);
      if (client && client.chat_humano === 0) {
        await supabase
          .from("mibarber_clientes")
          .update({ chat_humano: 1 })
          .eq("id_cliente", client.id_cliente);
      }
      
      // Recargar los chats después de enviar el mensaje
      await refreshChats();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  };

  // Manejar cambio en el switch de control humano
  const handleControlHumanoChange = async (checked: boolean) => {
    if (!activeConv) return;
    
    try {
      // Invertir la lógica: checked = true significa modo Humano (chat_humano = 1)
      const newValue = checked ? 1 : 0; // 1 = Humano, 0 = IA
      const client = getClientInfo(activeConv.session_id);
      if (client) {
        const { error } = await supabase
          .from("mibarber_clientes")
          .update({ chat_humano: newValue })
          .eq("id_cliente", client.id_cliente);
        
        if (error) {
          console.error("Error al actualizar control humano:", error);
        } else {
          // Recargar los chats después de actualizar el control humano
          await refreshChats();
        }
      }
    } catch (error) {
      console.error("Error al actualizar control humano:", error);
    }
  };

  // Manejar Enter para enviar mensaje
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Versión desktop */}
      <div className="hidden md:block h-screen w-full">
        {/* Contenedor principal del chat */}
        <div className="flex h-[calc(100vh-60px)] w-full bg-qoder-dark-bg-secondary overflow-hidden min-w-0 mt-[60px]">
          {/* Panel izquierdo - Lista de chats estilo WhatsApp */}
          <aside className="w-[450px] border-r border-qoder-dark-border-primary flex flex-col bg-qoder-dark-bg-form md:w-[400px] sm:w-[350px] xs:w-full min-w-0 relative" style={{ fontSize: '1.2705em' }}>
            {/* Header del panel de chats */}
            <div className="p-2 bg-qoder-dark-bg-header min-w-0 relative">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-qoder-dark-text-primary px-2" style={{ fontSize: '1.1em' }}>WhatsApp</h2>
                <div className="flex items-center gap-1 ml-auto">
                  {isRefreshing && (
                    <div className="flex items-center gap-1 text-xs text-qoder-dark-text-secondary">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-qoder-dark-accent-primary"></div>
                    </div>
                  )}
                  <button 
                    onClick={refreshChats}
                    disabled={isRefreshing}
                    className="boton-simple p-2 rounded-full hover:bg-qoder-dark-bg-hover transition-colors disabled:opacity-50"
                    title="Refrescar chats"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-qoder-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filtros para administradores y campo de búsqueda en la misma línea */}
<div className="px-3 py-2">
  {isAdmin && sucursales && sucursales.length > 0 ? (
    <div className="flex items-end gap-3">
      {/* Filtro de sucursales */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-qoder-dark-text-secondary mb-1.5">
          Filtrar por sucursal:
        </label>
        <select
          value={showAllSucursales ? "todas" : (selectedSucursal || "")}
          onChange={(e) => {
            if (e.target.value === "todas") {
              setShowAllSucursales(true);
              setSelectedSucursal(undefined);
            } else {
              setShowAllSucursales(false);
              setSelectedSucursal(e.target.value || undefined);
            }
          }}
          className="w-full h-10 qoder-dark-search-box py-2 px-3 text-qoder-dark-text-primary focus:outline-none rounded-lg border border-qoder-dark-border-primary focus:border-qoder-dark-accent-primary"
        >
          <option value="todas">Todos los chats</option>
          {sucursales?.map((sucursal: any) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
            </option>
          ))}
        </select>
      </div>

      {/* Campo de búsqueda */}
      <div className="flex-1 min-w-0">
        <label className="block text-xs text-qoder-dark-text-secondary mb-1.5">
          Buscar:
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 py-2 px-3 text-qoder-dark-text-primary focus:outline-none rounded-lg pr-10 bg-qoder-dark-bg-form border border-qoder-dark-border-primary focus:border-qoder-dark-accent-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="boton-simple absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-300 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="relative">
      <input
        type="text"
        placeholder="Buscar por nombre o teléfono..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full h-10 py-2 px-3 text-qoder-dark-text-primary focus:outline-none rounded-lg pr-10 bg-qoder-dark-bg-form border border-qoder-dark-border-primary focus:border-qoder-dark-accent-primary"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="boton-simple absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-300 transition-colors"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )}
</div>

             
              
             
            </div>
            
            {/* Lista de conversaciones */}
            <div className="flex-1 overflow-y-auto custom-scrollbar border-b border-qoder-dark-border-primary bg-qoder-dark-bg-header scrollbar-styled min-w-0 relative" style={{ padding: '0 10px' }}>
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qoder-dark-accent-primary mx-auto mb-2"></div>
                  <p className="text-sm text-qoder-dark-text-secondary">Cargando chats...</p>
                </div>
              )}
              
              {filteredConversations.map((conversation: ChatConversation) => {
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const clientName = getClientName(conversation.session_id);
                const isActive = active === conversation.session_id;
                
                return (
                  <div
                    key={conversation.session_id}
                    onClick={() => setActive(conversation.session_id)}
                    className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer mb-1 ${
                      isActive ? 'bg-[#2D2E2E]' : 'hover:bg-[#2D2E2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar del cliente */}
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const clientInfo = getClientInfo(conversation.session_id);
                          const fotoPerfil = clientInfo?.foto_perfil;
                          
                          if (fotoPerfil) {
                            return (
                              <Image 
                                src={fotoPerfil} 
                                alt={clientName} 
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                                onError={(e) => {
                                  // Si la imagen no carga, mostrar el avatar con inicial
                                  e.currentTarget.onerror = null;
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = `<span class="text-white font-semibold">${clientName.charAt(0).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            );
                          } else {
                            return (
                              <span className="text-white font-semibold">
                                {clientName.charAt(0).toUpperCase()}
                              </span>
                            );
                          }
                        })()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Nombre del cliente y timestamp */}
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-normal text-qoder-dark-text-primary truncate" style={{ fontSize: '1.09375rem' }}>
                            {clientName}
                            {(() => {
                              const clientInfo = getClientInfo(conversation.session_id);
                              const clientData = clientInfo?.id_cliente ? clientesMap[clientInfo.id_cliente] : undefined;
                              return clientData && clientData.puntaje !== null && clientData.puntaje !== undefined ? (
                                <span className="ml-2">
                                  {getStarsFromScore(clientData.puntaje)}
                                </span>
                              ) : null;
                            })()}
                          </h3>
                          <span className="text-xs text-qoder-dark-text-secondary flex-shrink-0">
                            {lastMessage ? formatWhatsAppTimestamp(lastMessage.timestamp) : ""}
                          </span>
                        </div>
                        
                        {/* Último mensaje */}
                        <div className="text-qoder-dark-text-secondary truncate" style={{ fontSize: '0.8125rem' }}>
                          {lastMessage ? (
                            <span>
                              {isImageUrl(lastMessage.content) ? (
                                <span className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Foto
                                </span>
                              ) : lastMessage.content}
                            </span>
                          ) : (
                            "Sin mensajes"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {!isLoading && filteredConversations.length === 0 && (
                <div className="p-4 text-center text-qoder-dark-text-secondary">
                  <p>No hay chats disponibles</p>
                </div>
              )}
            </div>
          </aside>

          {/* Panel derecho - Ventana de chat */}
          <div className="flex-1 flex flex-col min-w-0 relative" style={{ backgroundColor: '#161717' }}>
            
            {/* Contenedor con color #161717 y imagen de fondo detrás de M y E */}
            {showBackgroundImage && (
              <div 
                className="absolute inset-0 z-0 overflow-hidden"
                style={{ backgroundColor: '#161717' }}
              >
                <div 
                  className="absolute inset-0 bg-[url('https://i.postimg.cc/bwtp831q/m5BEg2K4OR4.png')] bg-repeat bg-center"
                  style={{ 
                    backgroundSize: 'auto 100%',
                    mixBlendMode: 'overlay'
                  }}
                ></div>
              </div>
            )}
            
            {/* Header del chat */}
            {activeConv ? (
              <div className="p-33 bg-qoder-dark-bg-header flex items-center justify-between min-w-0 relative">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActive(null)}
                    className="md:hidden p-2 rounded-full hover:bg-qoder-dark-bg-hover transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-qoder-dark-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const clientInfo = getClientInfo(activeConv.session_id);
                      const fotoPerfil = clientInfo?.foto_perfil;
                      const clientName = getClientName(activeConv.session_id);
                      
                      if (fotoPerfil) {
                        return (
                          <img 
                            src={fotoPerfil} 
                            alt={clientName} 
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              // Si la imagen no carga, mostrar el avatar con inicial
                              e.currentTarget.onerror = null;
                              if (e.currentTarget.parentElement) {
                                e.currentTarget.parentElement.innerHTML = `<span class="text-white font-semibold">${clientName.charAt(0).toUpperCase()}</span>`;
                              }
                            }}
                          />
                        );
                      } else {
                        return (
                          <span className="text-white font-semibold">
                            {clientName.charAt(0).toUpperCase()}
                          </span>
                        );
                      }
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-qoder-dark-text-primary">{getClientName(activeConv.session_id)}</h3>
                    <p className="text-xs text-qoder-dark-text-secondary">
                      {getClientInfo(activeConv.session_id)?.telefono || 'Número no disponible'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Control humano/IA */}
                  <div className="flex items-center gap-2 bg-qoder-dark-bg-form px-3 py-1 rounded-full border border-qoder-dark-border-primary">
                    <span className="text-xs text-qoder-dark-text-secondary">IA</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={getClientInfo(activeConv.session_id)?.chat_humano === 1}
                        onChange={(e) => handleControlHumanoChange(e.target.checked)}
                      />
                      <div className={`w-11 h-6 ${getClientInfo(activeConv.session_id)?.chat_humano === 1 ? 'bg-[#144D37] ' : 'bg-[#14274D]'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                    </label>
                    <span className="text-xs text-qoder-dark-text-secondary">Humano</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#161717] flex items-center justify-center h-16">
              </div>
            )}
            
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar scrollbar-styled bg-transparent bg-[url('/whatsapp-bg.png')] bg-repeat bg-[length:300px_500px] min-w-0 relative" id="messages-container">
              {activeConv ? (
                <div className="space-y-2">
                  {activeConv.messages.map((msg: ChatMessage, index: number) => (
                    <div 
                      key={index} 
                      className={`flex ${(msg.type === 'ai' && msg.source === 'manual') || msg.type === 'ai' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-3xl ${
                          (msg.type === 'ai' && msg.source === 'manual') 
                            ? 'whatsapp-outgoing-bubble' 
                            : (msg.type === 'ai' 
                                ? 'whatsapp-incoming-bubble' 
                                : 'whatsapp-client-bubble')
                        }`}
                      >
                        {/* Verificar si el contenido es una imagen */}
                        {isImageUrl(msg.content) ? (
                          (() => {
                            const imageData = parseImageMessage(msg.content);
                            return (
                              <div className="space-y-1 max-w-full">
                                <Image 
                                  src={imageData?.imageUrl || msg.content} 
                                  alt="Imagen del mensaje" 
                                  width={256}
                                  height={256}
                                  className="max-w-full max-h-64 object-contain rounded cursor-pointer"
                                  onClick={() => setFullscreenImage(imageData?.imageUrl || msg.content)}
                                />
                                {imageData?.caption && (
                                  <p className="text-sm text-qoder-dark-text-primary mt-1">
                                    {imageData.caption}
                                  </p>
                                )}
                                <p className="text-xs opacity-50 mt-1">
                                  {msg.type === 'ai' && msg.source === 'manual' ? 'Humano' : (msg.type === 'ai' ? 'IA' : 'Cliente')} • {formatWhatsAppTimestamp(msg.timestamp)}
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-1">
                            <p className="whitespace-pre-wrap message-text">{msg.content}</p>
                            <div className="message-info">
                              <span className="message-sender">{msg.type === 'ai' && msg.source === 'manual' ? 'Humano' : (msg.type === 'ai' ? 'IA' : 'Cliente')}</span>
                              <span className="message-time">{formatWhatsAppTimestamp(msg.timestamp)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} style={{ height: '1px' }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-[#161717]">
                  <div className="text-center text-qoder-dark-text-secondary">
                    <p className="max-w-md">Selecciona un chat para comenzar a enviar y recibir mensajes</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Área de entrada de mensaje */}
            {activeConv && (
              <div className="p-3 bg-transparent min-w-0 relative">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 py-4 px-4 focus:outline-none focus:ring-0 focus:ring-transparent focus:border-transparent bg-[#242626] relative pill-effect border-0"
                    style={{ backgroundColor: '#242626' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Versión móvil */}
      <div className="block md:hidden h-screen w-full z-10">
        <WhatsAppChatMobile />
      </div>

      {/* Modal para imagen en pantalla completa */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-pointer min-w-0"
          onClick={() => setFullscreenImage(null)}
        >
          <img 
            src={fullscreenImage} 
            alt="Imagen en pantalla completa" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
