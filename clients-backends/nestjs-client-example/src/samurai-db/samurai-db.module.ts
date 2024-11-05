import { Module } from '@nestjs/common';
import {SamuraiDBDriver} from "./samurai-db-driver";

@Module({
    imports: [],
    controllers: [],
    providers: [SamuraiDBDriver],
    exports: [SamuraiDBDriver],
})
export class SamuraiDbModule {}
