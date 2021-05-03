export interface CostumerRequest {
  name: string;
  email: string;
  phoneOne: string;
  phoneTwo?: string;
  address?: Partial<Address>;
  annotation?: string;
  cpfCnpj: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  number: string;
  detail: string;
  zipCode: string;
  isMain: string;
}
