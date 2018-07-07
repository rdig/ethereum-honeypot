/* @flow */

/**
 * Very BASIC validator to check if an IP Address is in the correct format
 *
 * This could do more thorough checks, but as it is, it will work for our use case.
 *
 * @method validateIPAddress
 *
 * @param {string} ipAddress the ip address string to validate
 *
 * @return {bool} a boolean to determine if the ip address passes our tests
 */
const validateIPAddress = (ipAddress: string): boolean => {
  const ipAddressBlocks: Array<string> = ipAddress.split('.');
  const assertCorrectFormat: Array<boolean> = [];
  /*
   * Should have more than one block, and at most four blocks
   */
  assertCorrectFormat.push(ipAddressBlocks.length >= 1 && ipAddressBlocks.length <= 4);
  /*
   * First block should be composed only of digits, up to a max of 3 and cannot start with 0
   */
  assertCorrectFormat
    .push(/^[1-9]{1,3}$/.test(ipAddressBlocks[0]) && ipAddressBlocks[0].length <= 3);
  /*
   * Second and third block should be only digits, up to a max of 3 (and can start with 0, or just be 0)
   */
  /*
   * We could only have one block
   */
  if (ipAddressBlocks.length > 1) {
    assertCorrectFormat
      .push(/^\d{1,3}$/.test(ipAddressBlocks[1]) && ipAddressBlocks[1].length <= 3);
  }
  /*
   * We could only have two blocks
   */
  if (ipAddressBlocks.length > 2) {
    assertCorrectFormat
      .push(/^\d{1,3}$/.test(ipAddressBlocks[2]) && ipAddressBlocks[2].length <= 3);
  }
  /*
   * Last block should be just as the first one, composed only of digits, up to a
   * max of 3 and cannot start with 0
   */
  /*
   * We could only have three blocks
   */
  if (ipAddressBlocks.length > 3) {
    assertCorrectFormat
      .push(/^[1-9]{1,3}$/.test(ipAddressBlocks[3]) && ipAddressBlocks[3].length <= 3);
  }
  return assertCorrectFormat.every(blockCorrectness => blockCorrectness === true);
};

export default validateIPAddress;
