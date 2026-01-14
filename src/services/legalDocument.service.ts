/**
 * Legal Document API Service
 *
 * Backend routes (AnthonyServer):
 * - GET /api/legal/{type}  (latest published document)
 *
 * Types:
 * - privacy_policy
 * - terms_of_service
 * - cookie_policy
 */

import { apiClient } from "@/lib/apiClient";

export type LegalDocumentType = "privacy_policy" | "terms_of_service" | "cookie_policy";

export interface LegalDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  version: string;
  format: "markdown" | "html";
  content: string;
  is_published: boolean;
  published_at?: string | null;
  effective_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const getLatest = async (type: LegalDocumentType): Promise<LegalDocument> => {
  const response = await apiClient.get<{ data: LegalDocument }>(`legal/${type}`);
  return response.data.data;
};

export default {
  getLatest,
};


