import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';

@Module({
    imports : [],
    providers : [SpaceService],
    controllers : [SpaceController]
})
export class SpaceModule {}
