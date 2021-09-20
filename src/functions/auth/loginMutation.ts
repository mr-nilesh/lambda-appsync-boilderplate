/**
 *  Returns payment details by payment id
 */
export const handler = async (event: any): Promise<any> => {
  try {
    const args = event.arguments;
    const loginObj = args.input;
    return {
      id: 1,
      name: 'test user'
    };
  } catch (error) {
    console.error(`[Login] Lambda Error: ${error}`);
  } finally {
  }
};
