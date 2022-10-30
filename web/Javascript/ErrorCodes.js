//
// Possible Error codes from NavigateError
//

//
// HTTP Error Codes
// 
var HTTP_STATUS_BAD_REQUEST = 400; // Invalid syntax. 
var HTTP_STATUS_DENIED = 401; // Access denied. 
var HTTP_STATUS_PAYMENT_REQ = 402; // Payment required. 
var HTTP_STATUS_FORBIDDEN = 403; // Request forbidden. 
var HTTP_STATUS_NOT_FOUND = 404; // Object not found. 
var HTTP_STATUS_BAD_METHOD = 405; // Method is not allowed. 
var HTTP_STATUS_NONE_ACCEPTABLE = 406; // No response acceptable to client found. 
var HTTP_STATUS_PROXY_AUTH_REQ = 407; // Proxy authentication required. 
var HTTP_STATUS_REQUEST_TIMEOUT = 408; // Server timed out waiting for request. 
var HTTP_STATUS_CONFLICT = 409; // User should resubmit with more info. 
var HTTP_STATUS_GONE = 410; // Resource is no longer available. 
var HTTP_STATUS_LENGTH_REQUIRED = 411; // Server refused to accept request without a length. 
var HTTP_STATUS_PRECOND_FAILED = 412; // Precondition given in request failed. 
var HTTP_STATUS_REQUEST_TOO_LARGE = 413; // Request entity was too large. 
var HTTP_STATUS_URI_TOO_LONG = 414; // Request Uniform Resource Identifier (URI) too long. 
var HTTP_STATUS_UNSUPPORTED_MEDIA = 415; // Unsupported media type. 
var HTTP_STATUS_RETRY_WITH = 449; // Retry after doing the appropriate action. 
var HTTP_STATUS_SERVER_ERROR = 500; // Internal server error. 
var HTTP_STATUS_NOT_SUPPORTED = 501; // Server does not support the functionality required to fulfill the request. 
var HTTP_STATUS_BAD_GATEWAY = 502; // Error response received from gateway. 
var HTTP_STATUS_SERVICE_UNAVAIL = 503; // Temporarily overloaded. 
var HTTP_STATUS_GATEWAY_TIMEOUT = 504; // Timed out waiting for gateway. 
var HTTP_STATUS_VERSION_NOT_SUP = 505; // HTTP version not supported. 

//
// HRESULT Status Codes
//
var INET_E_INVALID_URL = (0x800C0002); // URL string is not valid. 
var INET_E_NO_SESSION = (0x800C0003); // No session found. 
var INET_E_CANNOT_CONNECT = (0x800C0004); // Unable to connect to server. 
var INET_E_RESOURCE_NOT_FOUND = (0x800C0005); // Requested resource is not found. 
var INET_E_OBJECT_NOT_FOUND = (0x800C0006); // Requested object is not found. 
var INET_E_DATA_NOT_AVAILABLE = (0x800C0007); // Requested data is not available. 
var INET_E_DOWNLOAD_FAILURE = (0x800C0008); // Failure occurred during download. 
var INET_E_AUTHENTICATION_REQUIRED = (0x800C0009); // Requested navigation requires authentication. 
var INET_E_NO_VALID_MEDIA = (0x800C000A); // Required media not available or valid. 
var INET_E_CONNECTION_TIMEOUT = (0x800C000B); // Connection timed out. 
var INET_E_INVALID_REQUEST = (0x800C000C); // Request is invalid. 
var INET_E_UNKNOWN_PROTOCOL = (0x800C000D); // Protocol is not recognized. 
var INET_E_SECURITY_PROBLEM = (0x800C000E); // Navigation request has encountered a security issue. 
var INET_E_CANNOT_LOAD_DATA = (0x800C000F); // Unable to load data from the server. 
var INET_E_CANNOT_INSTANTIATE_OBJECT = (0x800C0010); // Unable to create an instance of the object. 
var INET_E_REDIRECT_FAILED = (0x800C0014); // Attempt to redirect the navigation failed. 
var INET_E_REDIRECT_TO_DIR = (0x800C0015); // Navigation redirected to a directory. 
var INET_E_CANNOT_LOCK_REQUEST = (0x800C0016); // Unable to lock request with the server. 
var INET_E_USE_EXTEND_BINDING = (0x800C0017); // Reissue request with extended binding. 
var INET_E_TERMINATED_BIND = (0x800C0018); // Binding is terminated. 
var INET_E_CODE_DOWNLOAD_DECLINED = (0x800C0100); // Permission to download is declined. 
var INET_E_RESULT_DISPATCHED = (0x800C0200); // Result is dispatched. 
var INET_E_CANNOT_REPLACE_SFP_FILE = (0x800C0300); // Cannot replace a protected System File Protection (SFP) file. 
