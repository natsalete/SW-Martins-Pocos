export const SUPERVISOR_PHONE = "34 92000-8254";
export const GERENTE_PHONE = "34 9912289645";

export const STATUS_STYLES = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-green-100 text-green-800",
  remarcado: "bg-blue-100 text-blue-800",
  concluido: "bg-gray-100 text-gray-800",
  cancelado: "bg-red-100 text-red-800",
};

export const TERRAIN_TYPES = {
  plano: "Terreno Plano",
  inclinado: "Terreno Inclinado",
  rochoso: "Terreno Rochoso",
} as const;

export type TerrainType = keyof typeof TERRAIN_TYPES;
