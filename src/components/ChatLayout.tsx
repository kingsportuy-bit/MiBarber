"use client";

import { useState, useRef, useEffect } from "react";
import { useChats } from "@/hooks/useChats";
import { useClientes } from "@/hooks/useClientes";
import { formatWhatsAppTimestamp } from "@/utils/formatters";
import AutoRefreshChat from "@/components/AutoRefreshChat";
import { ChatSucursalFilter } from "@/components/ChatSucursalFilter";

export function ChatLayout() {
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined);
  const { grouped, isLoading, subscriptionError, refreshChats, isRefreshing } = useChats(selectedSucursal);
  const { data: clientes } = useClientes("", "ultimo_agregado");
  const [active, setActive] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Para la búsqueda de chats
  const [messageSearchTerm, setMessageSearchTerm] = useState<string>(""); // Para la búsqueda de mensajes
  const [isSearchingMessages, setIsSearchingMessages] = useState<boolean>(false); // Para mostrar el input de búsqueda de mensajes
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeConv = grouped?.find((g) => g.session_id === active) ?? grouped?.[0];

  // Función para obtener el nombre del cliente por su ID
  const getClientName = (sessionId: string) => {
    const cliente = clientes?.find(c => c.id_cliente === sessionId);
    return cliente?.nombre || "Cliente desconocido";
  };

  // Filtrar conversaciones por término de búsqueda
  const filteredConversations = grouped?.filter(conversation => {
    const clientName = getClientName(conversation.session_id);
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           conversation.session_id.includes(searchTerm);
  }) || [];

  // Función para manejar la búsqueda de chats
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Función para manejar la búsqueda de mensajes
  const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageSearchTerm(e.target.value);
  };

  // Función para activar la búsqueda de mensajes
  const toggleMessageSearch = () => {
    setIsSearchingMessages(!isSearchingMessages);
    if (isSearchingMessages) {
      setMessageSearchTerm(""); // Limpiar la búsqueda al cerrar
    }
  };

  // Filtrar mensajes por término de búsqueda
  const filteredMessages = activeConv?.messages.filter(message => 
    message.content.toLowerCase().includes(messageSearchTerm.toLowerCase())
  ) || [];

  // Efecto para hacer scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      // Forzar scroll al final inmediatamente
      const container = messagesEndRef.current.parentElement;
      if (container) {
        // Usar requestAnimationFrame para asegurar que el DOM esté actualizado
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    }
  }, [activeConv?.messages, activeConv?.session_id]);

  // Efecto para scroll inicial al cargar una conversación
  useEffect(() => {
    if (activeConv && messagesEndRef.current) {
      // Scroll al final cuando se carga una conversación
      const scrollToBottom = () => {
        const container = messagesEndRef.current?.parentElement;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      };
      
      // Ejecutar inmediatamente y después de un pequeño delay
      scrollToBottom();
      const timer1 = setTimeout(scrollToBottom, 50);
      const timer2 = setTimeout(scrollToBottom, 100);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [activeConv]);

  const handleSucursalChange = (idSucursal: string | undefined) => {
    setSelectedSucursal(idSucursal);
  };

  return (
    // Aplicar bordes redondeados al contenedor principal
    <div className="flex h-screen bg-qoder-dark-bg-primary rounded-xl overflow-hidden">
      {/* Panel izquierdo - Lista de chats estilo WhatsApp */}
      <aside className="w-80 border-r border-qoder-dark-border-primary flex flex-col bg-qoder-dark-bg-quaternary">
        {/* Header del panel de chats */}
        <div className="p-2 border-b border-qoder-dark-border-primary bg-qoder-dark-bg-quaternary">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-qoder-dark-text-primary px-2">Chats</h2>
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
          {/* Filtro de sucursales */}
          <ChatSucursalFilter 
            onSucursalChange={handleSucursalChange}
            initialSucursal={selectedSucursal}
          />
          {/* Barra de búsqueda */}
          <div className="px-3 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-qoder-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar chats..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full qoder-dark-search-box pl-10 pr-4 py-3 text-qoder-dark-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-qoder-dark-bg-quaternary">
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-qoder-dark-accent-primary mx-auto mb-2"></div>
              <p className="text-sm text-qoder-dark-text-secondary">Cargando chats...</p>
            </div>
          )}
          <AutoRefreshChat />
          {filteredConversations.map((conversation) => {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            const clientName = getClientName(conversation.session_id);
            const isActive = active === conversation.session_id;
            
            return (
              <button
                key={conversation.session_id}
                onClick={() => setActive(conversation.session_id)}
                className={`w-full text-left p-3 border-b border-qoder-dark-border-primary/30 hover:bg-qoder-dark-bg-hover transition-colors ${
                  isActive ? 'bg-qoder-dark-bg-hover' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar del cliente */}
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">
                      {clientName.charAt(0).toUpperCase()}
                    </span>
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
                          {lastMessage.sender === 'client' ? '' : ''}
                          {lastMessage.content}
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
          {!isLoading && (filteredConversations.length === 0) && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-qoder-dark-text-secondary">No hay conversaciones</p>
            </div>
          )}
        </div>
      </aside>

      {/* Área de chat - estilo WhatsApp */}
      <section className="flex-1 flex flex-col bg-qoder-dark-bg-secondary">
        {/* Header del chat */}
        <div className="p-3 bg-qoder-dark-bg-quaternary border-b border-qoder-dark-border-primary flex items-center justify-between">
          {activeConv ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getClientName(activeConv.session_id).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-qoder-dark-text-primary">{getClientName(activeConv.session_id)}</h3>
                <p className="text-xs text-qoder-dark-text-secondary">{activeConv.session_id}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-qoder-dark-text-secondary">
              Selecciona un chat para comenzar
            </div>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMessageSearch}
              className="p-2 rounded-full text-qoder-dark-text-secondary hover:bg-qoder-dark-bg-hover transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-2 rounded-full text-qoder-dark-text-secondary hover:bg-qoder-dark-bg-hover transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Input de búsqueda de mensajes (solo se muestra cuando se activa la búsqueda) - MOVIDO AQUÍ */}
        {isSearchingMessages && activeConv && (
          <div className="p-3 bg-qoder-dark-bg-secondary border-b border-qoder-dark-border-primary">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar mensajes..."
                value={messageSearchTerm}
                onChange={handleMessageSearch}
                className="w-full qoder-dark-search-box py-3 px-5 text-qoder-dark-text-primary focus:outline-none text-sm"
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsSearchingMessages(false);
                  setMessageSearchTerm("");
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary rounded-full hover:bg-qoder-dark-bg-hover transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Área de mensajes con fondo oscuro de la página */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-qoder-dark-bg-secondary">
          {activeConv && isSearchingMessages ? (
            // Mostrar mensajes filtrados cuando se está buscando
            filteredMessages && filteredMessages.length > 0 ? (
              filteredMessages.map((message, index) => (
                <div 
                  key={`${activeConv.session_id}-${index}`} 
                  className={`flex ${
                    message.sender === 'client' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div 
                    className={`max-w-[75%] p-3 rounded-2xl ${
                      message.sender === 'client' 
                        ? 'bg-green-700 text-white rounded-br-md' 
                        : 'bg-qoder-dark-bg-tertiary text-qoder-dark-text-primary rounded-bl-md'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                    <div className={`mt-1 text-xs flex items-center gap-1 ${
                      message.sender === 'client' ? 'text-green-200' : 'text-qoder-dark-text-secondary'
                    }`}>
                      {formatWhatsAppTimestamp(message.timestamp)}
                      {message.sender === 'client' && (
                        <span className="text-green-400">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-qoder-dark-text-secondary">No se encontraron mensajes</p>
              </div>
            )
          ) : activeConv?.messages ? (
            // Mostrar todos los mensajes cuando no se está buscando
            activeConv.messages.map((message, index) => (
              <div 
                key={`${activeConv.session_id}-${index}`} 
                className={`flex ${
                  message.sender === 'client' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    message.sender === 'client' 
                      ? 'bg-green-700 text-white rounded-br-md' 
                      : 'bg-qoder-dark-bg-tertiary text-qoder-dark-text-primary rounded-bl-md'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                  <div className={`mt-1 text-xs flex items-center gap-1 ${
                    message.sender === 'client' ? 'text-green-200' : 'text-qoder-dark-text-secondary'
                  }`}>
                    {formatWhatsAppTimestamp(message.timestamp)}
                    {message.sender === 'client' && (
                      <span className="text-green-400">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : null}
          
          {activeConv && activeConv.messages?.length === 0 && !isSearchingMessages && (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">😊</div>
              <p className="text-qoder-dark-text-secondary">No hay mensajes en esta conversación</p>
              <p className="text-qoder-dark-text-secondary text-sm mt-1">Los mensajes aparecerán aquí cuando el cliente escriba</p>
            </div>
          )}
          
          {!activeConv && !isSearchingMessages && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-qoder-dark-text-secondary max-w-md mx-auto">
                Selecciona un chat de la lista de la izquierda para ver la conversación completa.
              </p>
            </div>
          )}
          
          {/* Elemento de referencia para scroll automático */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Área de envío de mensajes flotante */}
        <div className="p-4 bg-qoder-dark-bg-secondary">
          <div className="bg-qoder-dark-bg-quaternary rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-2">
              {/* Campo de entrada */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Escribe un mensaje"
                  className="w-full bg-qoder-dark-bg-form border border-qoder-dark-border-primary rounded-full py-3 px-4 text-qoder-dark-text-primary focus:outline-none focus:ring-2 focus:ring-qoder-dark-accent-primary focus:border-transparent"
                />
                {/* Botón de adjuntar archivo */}
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-qoder-dark-text-secondary hover:text-qoder-dark-text-primary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
              </div>
              
              {/* Botón de enviar */}
              <button 
                className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}