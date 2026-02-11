export const makeStatusRequest = async (counter: number, statuses: number[], ) => {
  let response, receivedStatus;
  const status = statuses[counter];
  console.log(`Attempt to make a request #${counter} with status ${status}`);

  response = await fetch(`https://httpbin.org/status/${status}`);
  receivedStatus = response.status;

  console.log(`Received status: ${receivedStatus}`);
  return { response, receivedStatus, expectedStatus: status };
};
