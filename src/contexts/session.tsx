import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';
import Session from '../models/Session';

//Initial state
const LOCAL_STORAGE_KEY = 'grape-session';

const initialState = new Session(null);

const localState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

//Reducer
let reducer = (session: Session, newSession: Session) => {
  if (newSession === null) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return initialState;
  }

  return { ...session, ...newSession };
};

//Context
interface SessionContext {
  session: Session,
  setSession: React.Dispatch<any>
}

export const SessionContext = createContext<SessionContext>({} as SessionContext);
export const useSession = () => useContext(SessionContext);

type SessionProps = {
  children: React.ReactNode; // 👈️ added type for children
};

//Provider
//export const SessionProvider: React.FC = ({ children }) => {
export const SessionProvider = (props: SessionProps) => {
    const [session, setSession] = useReducer(reducer, localState || initialState);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {props.children}
    </SessionContext.Provider>
  )
}