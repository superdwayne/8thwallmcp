export type Scene = {
  id: string;
  name: string;
  description?: string;
  order?: number;
};

export type App = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  scenes?: Scene[];
  url?: string;
};

