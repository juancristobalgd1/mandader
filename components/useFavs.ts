"use client";
import { useLocal } from "./useLocal";
export function useFavs() {
  const [favs, setFavs] = useLocal<string[]>("mandader:favoritos", []);
  return { favs, isFav: (id: string) => favs.includes(id), toggle: (id: string) => setFavs(favs.includes(id) ? favs.filter((x) => x !== id) : [id, ...favs]) };
}
