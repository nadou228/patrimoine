import axios from 'axios';
import { resolveApiUrl } from './config';

const api = axios.create({
  baseURL: resolveApiUrl('/api'),
});


export interface LoginResponse {
  id: number;
  username: string;
  nom: string;
  role: string;
  token: string;
  permissions?: string[];
}


interface JwtPayload {
  exp?: number;
  role?: string;
  permissions?: string[];
}


/**
 * Décoder le payload JWT
 */
export const decodeJwtPayload = (
  token: string
): JwtPayload | null => {

  try {

    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }


    const normalized = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');


    const decoded = atob(
      normalized.padEnd(
        normalized.length +
        ((4 - normalized.length % 4) % 4),
        '='
      )
    );


    return JSON.parse(decoded);


  } catch {

    return null;

  }
};


/**
 * Nettoyage session utilisateur
 */
export const clearCurrentUser = () => {

  localStorage.removeItem('user');

  localStorage.removeItem('token');

  localStorage.removeItem('currentUser');

};



/**
 * Vérification expiration JWT
 */
export const isTokenExpired = (
  token?: string
): boolean => {

  if (!token) {
    return true;
  }


  const payload = decodeJwtPayload(token);


  if (!payload?.exp) {

    return false;

  }


  return payload.exp * 1000 <= Date.now();

};



export interface TwoFactorRequiredResponse {

  requiresTwoFactor: true;

  tempToken: string;

}



/**
 * Connexion utilisateur
 */
export const login = async (
  username: string,
  password: string
) => {


  console.log(
    "🚀 Tentative login"
  );


  console.log(
    "URL appelée :",
    resolveApiUrl('/api/auth/login')
  );


  try {


    const response = await api.post(
      '/auth/login',
      {
        username,
        password
      }
    );


    console.log(
      "Réponse backend :",
      response.data
    );


    return response.data;



  } catch(error:any) {


    console.error(
      "Erreur API login :",
      error.response?.data ||
      error.message
    );


    throw error;

  }

};




/**
 * Déconnexion
 */
export const logout = () => {

  clearCurrentUser();

  window.location.href = '/login';

};





/**
 * Permissions fallback JWT
 */
export const buildPermissionsFallback = (
  user: LoginResponse
) => {


  const payload =
    decodeJwtPayload(user.token);



  const codes =
    (
      Array.isArray(payload?.permissions)
      ? payload.permissions
      : user.permissions
    ) ?? [];



  const role =
    payload?.role ??
    user.role ??
    'GUEST';



  if(codes.length === 0){

    return null;

  }



  return {

    role,

    permissions:

      codes.map(code => ({

        code,

        description: code,

        granted: true

      }))

  };


};





/**
 * Récupérer utilisateur connecté
 */
export const getCurrentUser = (): LoginResponse | null => {


  const rawUser =
    localStorage.getItem('user');



  if(!rawUser){

    return null;

  }



  try {


    const user =
      JSON.parse(rawUser);



    if(
      !user.token ||
      isTokenExpired(user.token)
    ){


      clearCurrentUser();

      return null;

    }



    return user;



  } catch {


    clearCurrentUser();

    return null;


  }

};