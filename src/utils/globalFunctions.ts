
export function areAllZeros(array) {
  // Handle empty array case
  if (!array || array.length === 0) {
    return false; // or true, depending on your requirements
  }
  
  // Check if all values are 0
  return array.every(value => value === 0);
}