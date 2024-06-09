export const handler = async (): Promise<any> => {
  try {
    return {
      message: 'User was logged out successfully.'
    };
  } catch (error) {
    console.error(`[Logout] Lambda Error: ${error}`);
    throw error;
  }
};
