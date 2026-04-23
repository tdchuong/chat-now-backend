import { PhoneAlreadyExistsException } from '@/common/exceptions/user.exception';
import { RegisterResDto } from '@/features/auth/register/dto/register-res.dto';
import { UserRepository } from '@/database/repositories/user.repositoty';
import { RegisterReqDto } from '@/features/auth/register/dto/register-req.dto';
import { hashPassword } from '@/common/utils';
export class RegisterUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(dto: RegisterReqDto): Promise<RegisterResDto> {
    const existingUser = await this.userRepository.findByPhone(dto.phone);
    if (existingUser) {
      throw new PhoneAlreadyExistsException();
    }
    const hashedPassword = await hashPassword(dto.password);

    const user = await this.userRepository.create({
      displayName: dto.fullName,
      username: dto.phone,
      phone: dto.phone,
      password: hashedPassword,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
    });

    return {
      success: true,
      userId: user.id,
    };
  }

}
