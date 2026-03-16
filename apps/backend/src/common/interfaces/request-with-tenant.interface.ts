import { Request } from 'express';

export interface RequestWithTenant extends Request {
  tenantId?: string; // UUID del tenant inyectado en la API
  tenantSlug?: string; 
}
