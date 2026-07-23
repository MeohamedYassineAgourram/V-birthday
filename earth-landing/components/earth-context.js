"use client";
import { createContext, useContext } from "react";

// Shares the Earth mesh ref so markers can occlude against it.
export const EarthContext = createContext({ current: null });
export const useEarthRef = () => useContext(EarthContext);
