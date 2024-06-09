export const handler = async (): Promise<any> => {
  try {
    return [{
      name: 'Test Event',
      createdBy: 'Nilesh Mistry'
    }]
  } catch (error) {
    console.error(`[Login] Lambda Error: ${error}`);
    throw error;
  }
};
