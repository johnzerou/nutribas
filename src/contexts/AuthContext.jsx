import React, { createContext, useContext, useState, useEffect } from 'react';
import { neon } from '@neondatabase/serverless';

const AuthContext = createContext();

// Instancia o cliente Neon usando a variável de ambiente
const sql = neon(import.meta.env.VITE_NEON_DB_URL);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mantemos o localStorage para manter a sessão ativa (conforme os requisitos da prompt2)
    const storedUser = localStorage.getItem('nutribas_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (password.length < 6) {
         return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
      }

      // Busca o nutricionista pelo email e senha
      const result = await sql`
        SELECT id, nome, email FROM public.nutricionistas 
        WHERE email = ${email} AND senha = ${password}
      `;

      if (result && result.length > 0) {
        const loggedUser = result[0];
        setUser(loggedUser);
        localStorage.setItem('nutribas_user', JSON.stringify(loggedUser));
        return { success: true };
      }

      return { success: false, message: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao fazer login' };
    }
  };

  const register = async (nome, email, password) => {
    try {
      if (password.length < 6) {
        return { success: false, message: 'A senha deve ter no mínimo 6 caracteres.' };
      }

      // Verifica se o email já existe
      const existing = await sql`SELECT id FROM public.nutricionistas WHERE email = ${email}`;
      if (existing && existing.length > 0) {
        return { success: false, message: 'Este email já está em uso.' };
      }

      // O Neon normalmente gera o uuid pelo banco se a coluna `id` estiver com default `gen_random_uuid()`
      // Se não, precisamos passar o id, mas vamos assumir que id é gerado automaticamente na tabela
      const result = await sql`
        INSERT INTO public.nutricionistas (nome, email, senha) 
        VALUES (${nome}, ${email}, ${password})
        RETURNING id, nome, email
      `;

      if (result && result.length > 0) {
        const newUser = result[0];
        setUser(newUser);
        localStorage.setItem('nutribas_user', JSON.stringify(newUser));
        return { success: true };
      }

      return { success: false, message: 'Erro ao criar conta' };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro ao criar conta' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nutribas_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
