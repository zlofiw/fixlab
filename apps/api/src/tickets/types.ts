import type { ServiceRequestInput, TicketStage } from '../domain'

export type CreateTicketDto = ServiceRequestInput

export interface UpdateTicketStageDto {
  stage: TicketStage
}
