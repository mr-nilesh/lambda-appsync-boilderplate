export const handler = async (): Promise<any> => {
  try {
    return [{
      name: 'Test Event',
      createdBy: 'Nilesh Mistry'
    }]
  } catch (error) {
    console.error(`[GetLatestEvents] Lambda Error: ${error}`);
    throw error;
  }
};
