import { IsString, IsArray, IsMongoId } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  members: string[];
} 