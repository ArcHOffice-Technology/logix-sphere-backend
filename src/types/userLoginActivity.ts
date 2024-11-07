export type userLoginActivity ={
    activity_id: number;
    user_id: number;
    login_time: Date;
    ip_address?: string;  
    device_info?: string; 
    is_successful: boolean;
    failure_reason?: string; 
    created_by?: string; 
    created_at: Date;
    updated_at?: Date; 
}