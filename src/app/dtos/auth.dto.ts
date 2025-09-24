export interface SignInDto {
  email: string;
  password: string;
}

export class RefreshTokenDto {
  refreshToken: string;
}

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
}

export class ChangePasswordDto {
  password: string;
}
