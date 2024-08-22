/**
 * Custom Error Handler Class.
 *
 * This class is used to create custom error objects with additional properties such as
 * message, statusCode, name, and stack trace.
 *
 * @class ErrorHandlerClass
*/
export class ErrorHandlerClass{
    /**
     * Creates an instance of ErrorHandlerClass.
     *
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code.
     * @param {string} [name] - The name of the error. Default is "MyCustomErrorClass".
     * @param {string} [stack] - The stack trace of the error.
    */
    constructor(message, statusCode, name, stack){
        this.message = message;
        this.statusCode = statusCode;
        this.name = name ? name :"MyCustomErrorClass";
        this.stack = stack;
        
    }
}
