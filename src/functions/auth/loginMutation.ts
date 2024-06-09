import { LoggedInUser } from "interfaces/auth/auth.interface";

export const handler = async (event: any): Promise<LoggedInUser> => {
  try {
    const args = event.arguments;
    const loginObj = args.input;
    console.info(loginObj, 'Login object')
    return {
      id: '123',
      name: 'test user'
    };
  } catch (error) {
    console.error(`[Login] Lambda Error: ${error}`);
    throw error;
  }
};
