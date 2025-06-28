import { RegisterCredentials } from '../types/register-credentials.type';

export interface IRegisterUseCase {
  execute(credentials: RegisterCredentials): Promise<void>;
}
