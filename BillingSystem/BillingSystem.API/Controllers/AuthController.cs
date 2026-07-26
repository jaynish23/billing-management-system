using System.Threading.Tasks;
using BillingSystem.Application.DTOs.Auth;
using BillingSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto sendOtpDto)
        {
            _logger.LogInformation("[AuthAPI] SendOtp called for email: {Email}", sendOtpDto?.Email);
            try
            {
                var success = await _authService.SendOtpAsync(sendOtpDto);
                if (success)
                {
                    _logger.LogInformation("[AuthAPI] OTP sent successfully to {Email}", sendOtpDto?.Email);
                    return Ok(new { Message = "OTP sent successfully" });
                }
                
                _logger.LogWarning("[AuthAPI] Failed to send OTP to {Email}. Email may already be registered.", sendOtpDto?.Email);
                return BadRequest(new { Message = "Failed to send OTP. Email may already be registered." });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[AuthAPI] Error in SendOtp for email: {Email}", sendOtpDto?.Email);
                return StatusCode(500, new 
                { 
                    Status = "error", 
                    Message = "Internal Server Error during OTP sending.", 
                    Details = ex.Message, 
                    ExceptionType = ex.GetType().FullName,
                    StackTrace = ex.StackTrace 
                });
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto verifyOtpDto)
        {
            _logger.LogInformation("[AuthAPI] VerifyOtp called for email: {Email}, OTP: {Otp}", verifyOtpDto?.Email, verifyOtpDto?.Otp);
            try
            {
                var success = await _authService.VerifyOtpAsync(verifyOtpDto);
                if (success)
                {
                    _logger.LogInformation("[AuthAPI] OTP verified successfully for {Email}", verifyOtpDto?.Email);
                    return Ok(new { Message = "OTP verified successfully" });
                }
                
                _logger.LogWarning("[AuthAPI] Invalid or expired OTP verification attempt for {Email}", verifyOtpDto?.Email);
                return BadRequest(new { Message = "Invalid or expired OTP." });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[AuthAPI] Error in VerifyOtp for email: {Email}", verifyOtpDto?.Email);
                return StatusCode(500, new 
                { 
                    Status = "error", 
                    Message = "Internal Server Error during OTP verification.", 
                    Details = ex.Message, 
                    ExceptionType = ex.GetType().FullName,
                    StackTrace = ex.StackTrace 
                });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            _logger.LogInformation("[AuthAPI] Register called for username: {Username}, email: {Email}", registerDto?.Username, registerDto?.Email);
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                _logger.LogInformation("[AuthAPI] Register result status for user {Username}: {Status}", registerDto?.Username, result?.Status);
                if (result.Status == "success")
                    return Ok(result);
    
                return BadRequest(result);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[AuthAPI] Error in Register for username: {Username}", registerDto?.Username);
                return StatusCode(500, new 
                { 
                    Status = "error", 
                    Message = "Internal Server Error during registration.", 
                    Details = ex.Message, 
                    ExceptionType = ex.GetType().FullName,
                    StackTrace = ex.StackTrace 
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            _logger.LogInformation("[AuthAPI] Login called for username: {Username}", loginDto?.Username);
            try
            {
                var result = await _authService.LoginAsync(loginDto);
                _logger.LogInformation("[AuthAPI] Login result status for user {Username}: {Status}", loginDto?.Username, result?.Status);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[AuthAPI] Error in Login for username: {Username}", loginDto?.Username);
                return StatusCode(500, new 
                { 
                    Status = "error", 
                    Message = "Internal Server Error during login.", 
                    Details = ex.Message, 
                    ExceptionType = ex.GetType().FullName,
                    StackTrace = ex.StackTrace 
                });
            }
        }
    }
}
