import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/property/:id')
  toggleFavoriteProperty(@Request() req: any, @Param('id') propertyId: string) {
    return this.usersService.toggleFavoriteProperty(req.user.id, propertyId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorites/event/:id')
  toggleSavedEvent(@Request() req: any, @Param('id') eventId: string) {
    return this.usersService.toggleSavedEvent(req.user.id, eventId);
  }
}
