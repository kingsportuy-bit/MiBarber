"use client";

import { useEffect, useState } from "react";

export function SessionTest() {
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    // Solo ejecutar en desarrollo
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    const runTests = () => {
      console.log("=== Session Test Started ===");
      const results: any = {};
      
      try {
        // Test 1: Verificar acceso a localStorage
        results.localStorageAccessible = typeof localStorage !== 'undefined';
        console.log("Test 1 - localStorage accessible:", results.localStorageAccessible);
        
        if (results.localStorageAccessible) {
          // Test 2: Verificar si existe la clave barber_auth_session
          const sessionStr = localStorage.getItem('barber_auth_session');
          results.sessionExists = !!sessionStr;
          console.log("Test 2 - Session exists:", results.sessionExists);
          console.log("Session string:", sessionStr);
          
          if (sessionStr) {
            // Test 3: Intentar parsear la sesión
            try {
              const sessionData = JSON.parse(sessionStr);
              results.sessionParsed = true;
              results.sessionData = sessionData;
              console.log("Test 3 - Session parsed successfully:", sessionData);
              
              // Test 4: Verificar estructura de user
              if (sessionData.user) {
                results.userExists = true;
                results.userData = sessionData.user;
                console.log("Test 4 - User object exists:", sessionData.user);
                
                // Test 5: Verificar propiedades requeridas
                results.userIdExists = !!sessionData.user.id;
                results.userNameExists = !!(sessionData.user.name || sessionData.user.nombre);
                results.userUsernameExists = !!sessionData.user.username;
                console.log("Test 5 - User ID exists:", results.userIdExists);
                console.log("Test 5 - User name exists:", results.userNameExists);
                console.log("Test 5 - User username exists:", results.userUsernameExists);
                
                // Test 6: Verificar expiración
                if (sessionData.expiresAt) {
                  results.expiresAtExists = true;
                  const expires = new Date(sessionData.expiresAt);
                  const now = new Date();
                  results.isExpired = expires < now;
                  console.log("Test 6 - Session expires at:", expires);
                  console.log("Test 6 - Current time:", now);
                  console.log("Test 6 - Is expired:", results.isExpired);
                } else {
                  results.expiresAtExists = false;
                  results.isExpired = false;
                  console.log("Test 6 - No expiration time");
                }
              } else {
                results.userExists = false;
                console.log("Test 4 - No user object in session");
              }
            } catch (parseError) {
              results.sessionParsed = false;
              results.parseError = String(parseError);
              console.log("Test 3 - Error parsing session:", parseError);
            }
          }
        }
      } catch (error) {
        console.error("Error in SessionTest:", error);
        results.testError = String(error);
      }
      
      console.log("=== Session Test Results ===", results);
      console.log("=== Session Test Ended ===");
      setTestResults(results);
    };
    
    // Ejecutar inmediatamente
    runTests();
    
    // Ejecutar cada 3 segundos
    const interval = setInterval(runTests, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-40 left-0 right-0 bg-green-500 text-white p-2 text-xs z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          <span>Session Test:</span>
          {testResults ? (
            <span>
              LS:{testResults.localStorageAccessible ? '✓' : '✗'} 
              Session:{testResults.sessionExists ? '✓' : '✗'} 
              Parsed:{testResults.sessionParsed ? '✓' : '✗'} 
              User:{testResults.userExists ? '✓' : '✗'}
              Expired:{testResults.isExpired ? '✓' : '✗'}
            </span>
          ) : (
            <span>Running tests...</span>
          )}
        </div>
      </div>
    </div>
  );
}