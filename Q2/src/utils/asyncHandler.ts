const asyncHandler = (fn: (...args: any[]) => any) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
