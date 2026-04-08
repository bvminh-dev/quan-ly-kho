import axiosInstance from "@/lib/axios";
import { CATALOG_ROUTES } from "@/config";
import type {
  ApiResponse,
  PaginatedData,
  CatalogItem,
  CreateCatalogDto,
  UpdateCatalogDto,
} from "@/types/api";

type CatalogType = "inchs" | "items" | "qualitys" | "styles" | "colors";

const BASE_MAP: Record<CatalogType, string> = {
  inchs: CATALOG_ROUTES.INCHS,
  items: CATALOG_ROUTES.ITEMS,
  qualitys: CATALOG_ROUTES.QUALITYS,
  styles: CATALOG_ROUTES.STYLES,
  colors: CATALOG_ROUTES.COLORS,
};

const BY_ID_MAP: Record<CatalogType, (id: string) => string> = {
  inchs: CATALOG_ROUTES.INCH_BY_ID,
  items: CATALOG_ROUTES.ITEM_BY_ID,
  qualitys: CATALOG_ROUTES.QUALITY_BY_ID,
  styles: CATALOG_ROUTES.STYLE_BY_ID,
  colors: CATALOG_ROUTES.COLOR_BY_ID,
};

function buildCatalogService(type: CatalogType) {
  return {
    getAll: async (params?: { current?: number; pageSize?: number; sort?: string }) => {
      const { data } = await axiosInstance.get<ApiResponse<PaginatedData<CatalogItem>>>(
        BASE_MAP[type],
        { params: { current: 1, pageSize: 9999, ...params } }
      );
      return data;
    },

    getById: async (id: string) => {
      const { data } = await axiosInstance.get<ApiResponse<CatalogItem>>(
        BY_ID_MAP[type](id)
      );
      return data;
    },

    create: async (dto: CreateCatalogDto) => {
      const { data } = await axiosInstance.post<ApiResponse<CatalogItem>>(
        BASE_MAP[type],
        dto
      );
      return data;
    },

    update: async (id: string, dto: UpdateCatalogDto) => {
      const { data } = await axiosInstance.patch<ApiResponse<CatalogItem>>(
        BY_ID_MAP[type](id),
        dto
      );
      return data;
    },

    delete: async (id: string) => {
      const { data } = await axiosInstance.delete<ApiResponse<null>>(
        BY_ID_MAP[type](id)
      );
      return data;
    },
  };
}

export const inchService = buildCatalogService("inchs");
export const itemService = buildCatalogService("items");
export const qualityService = buildCatalogService("qualitys");
export const styleService = buildCatalogService("styles");
export const colorService = buildCatalogService("colors");
