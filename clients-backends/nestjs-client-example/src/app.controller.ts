import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import { AppService } from './app.service';
import {SamuraiDBDriver} from "./samurai-db/samurai-db-driver";
import {ApiBody, ApiOperation, ApiParam, ApiProperty} from "@nestjs/swagger";

export class SamuraiCharacter {
  @ApiProperty({ example: '123', description: 'Unique identifier for the Samurai' })
  id: string;

  @ApiProperty({ example: 'Miyamoto Musashi', description: 'Name of the Samurai' })
  name: string;

  @ApiProperty({ example: 100, description: 'Health points of the Samurai' })
  health: number;

  @ApiProperty({ example: 50, description: 'Attack power of the Samurai' })
  attackPower: number;

  @ApiProperty({ example: 30, description: 'Defense power of the Samurai' })
  defensePower: number;

  @ApiProperty({ example: 'Katana', description: 'Weapon used by the Samurai' })
  weapon: string;
}

@Controller('samurais')
export class AppController {
  constructor(private readonly samuraiDBDriver: SamuraiDBDriver<SamuraiCharacter>) {}

  @ApiOperation({ summary: 'Get Samurai by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Samurai ID' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<SamuraiCharacter> {
    return this.samuraiDBDriver.getById(id);
  }

  @ApiOperation({ summary: 'Create new Samurai' })
  @ApiBody({ type: SamuraiCharacter })
  @Post()
  async create(@Body() dto: SamuraiCharacter): Promise<SamuraiCharacter & {id: string}> {
    const result = await this.samuraiDBDriver.set<SamuraiCharacter & {id: string}>(dto);
    return result;
  }

  @ApiOperation({ summary: 'Update Samurai by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Samurai ID' })
  @ApiBody({ type: SamuraiCharacter })
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: SamuraiCharacter): Promise<void> {
    return this.samuraiDBDriver.updateById(id, dto);
  }

  @ApiOperation({ summary: 'Delete Samurai by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Samurai ID' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.samuraiDBDriver.deleteById(id);
  }
}
