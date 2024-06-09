import { Injectable } from '@nestjs/common';
import { User } from 'interfaces/users/user.interface';

@Injectable()
export class UserService {
  getAllUsers(): User[] {
    return [{
      firstName: "Nilesh",
      lastName: "Mistry",
      mobile: "**********"
    }];
  }
}