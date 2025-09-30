// Using BigInt for calculations as the key space is 64-bit, which exceeds JavaScript's MAX_SAFE_INTEGER.

export const KEY_LENGTH = 16; // 64-bit keys (16 hex characters)
export const MIN_KEY = '0'.repeat(KEY_LENGTH);
export const MAX_KEY = 'f'.repeat(KEY_LENGTH);

const MIN_KEY_BIGINT = BigInt(`0x${MIN_KEY}`);
const MAX_KEY_BIGINT = BigInt(`0x${MAX_KEY}`);
const KEY_SPACE_RANGE = MAX_KEY_BIGINT - MIN_KEY_BIGINT;

/**
 * Converts a hexadecimal string to a BigInt.
 */
// FIX: Changed return type from BigInt to bigint to use the primitive type.
export const hexToBigInt = (hex: string): bigint => {
  return BigInt(`0x${hex}`);
};

/**
 * Converts a BigInt to a padded hexadecimal string.
 */
// FIX: Changed parameter type from BigInt to bigint to use the primitive type.
export const bigIntToHex = (num: bigint): string => {
  return num.toString(16).padStart(KEY_LENGTH, '0');
};

/**
 * Finds the midpoint between two hexadecimal keys.
 */
export const getMidpointKey = (key1: string, key2: string): string => {
  const midPoint = (hexToBigInt(key1) + hexToBigInt(key2)) / 2n;
  return bigIntToHex(midPoint);
};

/**
 * Generates a random hexadecimal key within the entire key space.
 */
export const getRandomKey = (): string => {
  // A simpler way to get a random 64-bit value is to generate random hex characters.
  let key = '';
  for (let i = 0; i < KEY_LENGTH; i++) {
    key += Math.floor(Math.random() * 16).toString(16);
  }
  return key;
};

/**
 * Calculates a key's proportional position within the key space as a percentage.
 * Uses integer math with a multiplier to avoid floating point inaccuracies with BigInt.
 */
export const getKeyAsPercentage = (key: string): number => {
    const keyBigInt = hexToBigInt(key);
    // Multiply by 10000 for precision, then divide by 100 at the end
    const percentageBigInt = ((keyBigInt - MIN_KEY_BIGINT) * 10000n) / KEY_SPACE_RANGE;
    return Number(percentageBigInt) / 100;
};

/**
 * Formats a long key for display purposes.
 */
export const formatKey = (key: string): string => {
    if (key.length <= 12) return key;
    return `${key.substring(0, 6)}...${key.substring(key.length - 6)}`;
};
