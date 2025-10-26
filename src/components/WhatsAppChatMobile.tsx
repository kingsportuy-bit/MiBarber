"use client";

import { useState, useRef, useEffect } from "react";
import { useWhatsAppChats } from "@/hooks/useWhatsAppChats";
import { useClientes } from "@/hooks/useClientes";
import { useBarberoAuth } from "@/hooks/useBarberoAuth";
import { useSucursales } from "@/hooks/useSucursales";
import { formatWhatsAppTimestamp } from "@/utils/formatters";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { ChatConversation, ChatMessage, Client } from "@/types/db";
import Image from "next/image";

export function WhatsAppChatMobile() {
  const { idBarberia, isAdmin, barbero } = useBarberoAuth();
  const { sucursales } = useSucursales(idBarberia || undefined);
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined);
  const [showAllSucursales, setShowAllSucursales] = useState<boolean>(false);
  const supabase: any = getSupabaseClient();
  
  // Para barberos comunes, usar la sucursal asociada
  // Para administradores, permitir seleccionar sucursal o ver todas
  const sucursalId = !isAdmin && barbero?.id_sucursal ? barbero.id_sucursal : selectedSucursal;
  
  const { grouped, isLoading, subscriptionError, refreshChats, isRefreshing, clients } = useWhatsAppChats(sucursalId, showAllSucursales);
  const [active, setActive] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState<boolean>(true); // Controla qué panel mostrar
  
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

  // Mostrar todas las conversaciones sin filtrar (eliminamos la búsqueda)
  const filteredConversations = grouped || [];

  // Función mejorada para hacer scroll al último mensaje
  const scrollToBottom = () => {
    const container = document.getElementById('messages-container');
    if (container) {
      // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  // Efecto para hacer scroll al último mensaje cuando cambia el chat activo
  useEffect(() => {
    if (!activeConv) return;

    // Ejecutar inmediatamente
    scrollToBottom();
    
    // Ejecutar después de diferentes intervalos para asegurar la actualización del DOM
    const timer1 = setTimeout(scrollToBottom, 50);
    const timer2 = setTimeout(scrollToBottom, 100);
    const timer3 = setTimeout(scrollToBottom, 200);
    const timer4 = setTimeout(scrollToBottom, 500); // Agregar un timer adicional más largo
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [activeConv?.session_id, active]);

  // Efecto adicional para asegurar el scroll al final cuando cambian los mensajes
  useEffect(() => {
    if (!activeConv) return;

    // Ejecutar después de diferentes intervalos para asegurar la actualización del DOM
    const timer1 = setTimeout(scrollToBottom, 50);
    const timer2 = setTimeout(scrollToBottom, 100);
    const timer3 = setTimeout(scrollToBottom, 200);
    const timer4 = setTimeout(scrollToBottom, 500); // Agregar un timer adicional más largo
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [activeConv?.messages, activeConv]);

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

        await fetch("https://webhookn8npers.itmconsulting.es/webhook/manual", {
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

  // Función para seleccionar un chat y mostrar la conversación
  const handleSelectChat = (sessionId: string) => {
    setActive(sessionId);
    setShowChatList(false); // Ocultar la lista de chats y mostrar la conversación
  };

  // Función para volver a la lista de chats
  const handleBackToChats = () => {
    setShowChatList(true); // Mostrar la lista de chats
  };

  return (
    <>
      {/* Contenedor principal del chat - diseño móvil */}
      <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-qoder-dark-bg-primary rounded-xl overflow-hidden min-w-0">
        {showChatList ? (
          // Vista de lista de chats (móvil)
          <div className="flex flex-col h-full w-full min-w-0">
            {/* Header del panel de chats */}
            <div className="p-3 border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-qoder-dark-text-primary">Chats de WhatsApp</h2>
                <div className="flex items-center gap-1 ml-auto">
                  {isRefreshing && (
                    <div className="flex items-center gap-1 text-xs text-qoder-dark-text-secondary">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-qoder-dark-accent-primary"></div>
                    </div>
                  )}
                  <button 
                    onClick={refreshChats}
                    disabled={isRefreshing}
                    className="p-2 rounded-full hover:bg-qoder-dark-bg-hover transition-colors disabled:opacity-50"
                    title="Refrescar chats"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-qoder-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filtros para administradores */}
              {isAdmin && sucursales && sucursales.length > 0 && (
                <div className="px-2 py-2">
                  <div className="text-sm text-qoder-dark-text-secondary">
                    <label className="block mb-1">Filtrar por sucursal:</label>
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
                      className="w-full qoder-dark-search-box py-2 px-3 text-qoder-dark-text-primary focus:outline-none rounded-lg"
                    >
                      <option value="todas">Todos los chats</option>
                      {sucursales?.map((sucursal: any) => (
                        <option key={sucursal.id} value={sucursal.id}>
                          {sucursal.nombre_sucursal || `Sucursal ${sucursal.numero_sucursal}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Lista de conversaciones */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-qoder-dark-bg-quaternary scrollbar-styled min-w-0">
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
                  <button
                    key={conversation.session_id}
                    onClick={() => handleSelectChat(conversation.session_id)}
                    className={`w-full text-left p-3 hover:bg-qoder-dark-bg-hover transition-colors ${
                      isActive ? 'bg-qoder-dark-bg-hover' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar del cliente */}
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
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
                                  e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-semibold">${clientName.charAt(0).toUpperCase()}</span>`;
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
                          <h3 className="font-semibold text-qoder-dark-text-primary truncate">{clientName}</h3>
                          <span className="text-xs text-qoder-dark-text-secondary flex-shrink-0">
                            {lastMessage ? formatWhatsAppTimestamp(lastMessage.timestamp) : ""}
                          </span>
                        </div>
                        
                        {/* Último mensaje */}
                        <div className="text-sm text-qoder-dark-text-secondary truncate">
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
                  </button>
                );
              })}
              
              {!isLoading && filteredConversations.length === 0 && (
                <div className="p-4 text-center text-qoder-dark-text-secondary">
                  <p>No hay chats disponibles</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Vista de chat individual (móvil)
          <div className="flex flex-col h-full w-full min-w-0">
            {/* Header del chat */}
            {activeConv && (
              <div className="p-3 border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary flex items-center justify-between min-w-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToChats}
                    className="p-2 rounded-full hover:bg-qoder-dark-bg-hover transition-colors"
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
                              e.currentTarget.parentElement!.innerHTML = `<span class="text-white font-semibold">${clientName.charAt(0).toUpperCase()}</span>`;
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
                  <div className="flex items-center gap-2 bg-qoder-dark-bg-primary px-3 py-1 rounded-full">
                    <span className="text-xs text-qoder-dark-text-secondary">IA</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={getClientInfo(activeConv.session_id)?.chat_humano === 1}
                        onChange={(e) => handleControlHumanoChange(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-blue-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                    <span className="text-xs text-qoder-dark-text-secondary">Humano</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar scrollbar-styled bg-qoder-dark-bg-secondary bg-[url('/whatsapp-bg.png')] bg-repeat bg-[length:300px_500px] min-w-0" id="messages-container">
              {activeConv ? (
                <div className="space-y-2">
                  {activeConv.messages.map((msg: ChatMessage, index: number) => (
                    <div 
                      key={index} 
                      className={`flex ${(msg.type === 'ai' && msg.source === 'manual') || msg.type === 'ai' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl px-4 py-2 rounded-lg ${
                          (msg.type === 'ai' && msg.source === 'manual') 
                            ? 'bg-green-600 text-white rounded-br-none' 
                            : (msg.type === 'ai' 
                                ? 'bg-blue-500 text-white rounded-br-none' 
                                : 'bg-qoder-dark-bg-primary text-qoder-dark-text-primary rounded-bl-none')
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
                                  <p className="text-xs text-qoder-dark-text-primary mt-1">
                                    {imageData.caption}
                                  </p>
                                )}
                                <p className="text-xs opacity-70 mt-1">
                                  {msg.type === 'ai' && msg.source === 'manual' ? 'Humano' : (msg.type === 'ai' ? 'IA' : 'Cliente')} • {formatWhatsAppTimestamp(msg.timestamp)}
                                </p>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-1">
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {msg.type === 'ai' && msg.source === 'manual' ? 'Humano' : (msg.type === 'ai' ? 'IA' : 'Cliente')} • {formatWhatsAppTimestamp(msg.timestamp)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} style={{ height: '1px' }} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-qoder-dark-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9 8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">WhatsApp Web</h3>
                    <p className="max-w-md">Selecciona un chat para comenzar a enviar y recibir mensajes</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Área de entrada de mensaje */}
            {activeConv && (
              <div className="p-3 border-t border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 qoder-dark-input py-3 px-4 rounded-full focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="p-3 bg-green-600 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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