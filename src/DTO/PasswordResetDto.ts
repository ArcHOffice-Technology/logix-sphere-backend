export interface PasswordResetDTO {
    email: string;
    token: string;
    newPassword: string;
}