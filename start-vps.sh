#!/bin/bash

# Script para iniciar la aplicación MiBarber en VPS
# Este script maneja la ejecución correcta con la configuración standalone

echo "Iniciando aplicación MiBarber en modo producción..."

# Verificar si existe el directorio .next/standalone
if [ -d ".next/standalone" ]; then
    echo "Directorio standalone encontrado. Iniciando servidor..."
    
    # Iniciar la aplicación usando el servidor standalone
    node .next/standalone/server.js
else
    echo "Directorio standalone no encontrado. Construyendo la aplicación..."
    
    # Construir la aplicación primero
    npm run build
    
    # Verificar nuevamente si existe el directorio standalone
    if [ -d ".next/standalone" ]; then
        echo "Iniciando servidor..."
        node .next/standalone/server.js
    else
        echo "Error: No se pudo encontrar o construir el directorio standalone"
        exit 1
    fi
fi