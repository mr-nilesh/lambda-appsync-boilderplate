export const handler = async (event: any): Promise<any> => {
  try {
    const args = event.arguments;
    const loginObj = args.input;
    console.info(loginObj, 'Login object')
    return {
      id: 1,
      name: 'test user'
    };
  } catch (error) {
    console.error(`[Login] Lambda Error: ${error}`);
    throw error;
  }
};
