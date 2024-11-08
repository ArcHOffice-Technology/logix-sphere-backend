export interface UserRegisterDTO {
    name: string;
    lastName?: string;
    dateOfBirth?: Date;
    userType?: string;
    email: string;
    password: string;
    active: boolean;
    startDate: string;
    endDate?: Date;
    createdBy?: string;
    costModelId?: number;
    userTypeId?: number;
}