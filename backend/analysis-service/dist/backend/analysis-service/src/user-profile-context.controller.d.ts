import { UserProfileContextService } from './user-profile-context.service';
import { UserProfileContextResponseDto } from './dto';
import { User as UserEntity } from '@shared/models';
export declare class UserProfileContextController {
    private readonly contextService;
    constructor(contextService: UserProfileContextService);
    getProfileContext(req: {
        user: UserEntity;
    }, full: boolean): Promise<UserProfileContextResponseDto>;
}
