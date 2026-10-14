export interface CustomerInput {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
}

export interface Customer extends CustomerInput { id: string; url?: string }
export interface TrainingInput { customerId: string; date: string; activity: string; duration: number }
export interface Training extends Omit<TrainingInput, 'customerId'> {
  id: string;
  customerId: string | null;
  customerName?: string;
  url?: string;
}
export interface DataStore { customers: Customer[]; trainings: Training[] }
export type FieldErrors = Record<string, string>;
export type CustomerSort = 'name' | 'city' | 'email';
export type CalendarView = 'month' | 'week';
export interface Repository {
  list(signal?: AbortSignal): Promise<DataStore>;
  saveCustomer(input: CustomerInput, id?: string): Promise<void>;
  deleteCustomer(id: string): Promise<void>;
  addTraining(input: TrainingInput): Promise<void>;
  deleteTraining(id: string): Promise<void>;
}
