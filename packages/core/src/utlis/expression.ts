/**
 * Evaluates a template string expression with progress and velocity values.
 * Supports expressions like: "translateX(${progress} * 100px)" or "scale(${progress})"
 */
export const evaluateExpression = (
  expression: string, 
  progress: number, 
  velocity?: number
): string => {
  // Replace ${progress} and ${velocity} with actual values (template literal style)
  let result = expression
    .replace(/\$\{progress\}/g, progress.toString())
    .replace(/\$\{velocity\}/g, (velocity || 0).toString());
  
  // Handle basic math expressions
  try {
    // Replace common patterns like "0.5 * 100" 
    result = result.replace(/(\d*\.?\d+)\s*\*\s*(\d*\.?\d+)/g, (match, a, b) => {
      return (parseFloat(a) * parseFloat(b)).toString();
    });
    
    result = result.replace(/(\d*\.?\d+)\s*\/\s*(\d*\.?\d+)/g, (match, a, b) => {
      return (parseFloat(a) / parseFloat(b)).toString();
    });
    
    result = result.replace(/(\d*\.?\d+)\s*\+\s*(\d*\.?\d+)/g, (match, a, b) => {
      return (parseFloat(a) + parseFloat(b)).toString();
    });
    
    result = result.replace(/(\d*\.?\d+)\s*-\s*(\d*\.?\d+)/g, (match, a, b) => {
      return (parseFloat(a) - parseFloat(b)).toString();
    });
  } catch (error) {
    console.warn('Failed to evaluate expression:', expression, error);
    return expression; // Return original if evaluation fails
  }
  
  return result;
};