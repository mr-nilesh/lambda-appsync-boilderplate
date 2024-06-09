import { NestFactory } from '@nestjs/core';
import { AppModule } from 'functions/app.module';
import { UserService } from './user.service';
import { User } from 'interfaces/users/user.interface';
import { INestApplicationContext } from '@nestjs/common';

let application: INestApplicationContext
export const handler = async (): Promise<User[]> => {
  try {
    if (!application) {
      application = await NestFactory.createApplicationContext(AppModule);
    }
    const userService: UserService = application.get(UserService);
    return userService.getAllUsers();
  } catch (error) {
    console.error(`[GetUsers] Lambda Error: ${error}`);
    throw error;
  }
};
