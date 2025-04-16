const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
  
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Something went wrong',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
  };
  
export default errorHandler;