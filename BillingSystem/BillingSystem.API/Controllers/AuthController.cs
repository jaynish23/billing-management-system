using System.Threading.Tasks;
using BillingSystem.Application.DTOs.Auth;
using BillingSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpDto sendOtpDto)
        {
            var success = await _authService.SendOtpAsync(sendOtpDto);
            if (success)
                return Ok(new { Message = "OTP sent successfully" });
            
            return BadRequest(new { Message = "Failed to send OTP. Email may already be registered." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto verifyOtpDto)
        {
            var success = await _authService.VerifyOtpAsync(verifyOtpDto);
            if (success)
                return Ok(new { Message = "OTP verified successfully" });
            
            return BadRequest(new { Message = "Invalid or expired OTP." });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var result = await _authService.RegisterAsync(registerDto);
            if (result.Status == "success")
                return Ok(result);

            return BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.LoginAsync(loginDto);
            return Ok(result); // Return Ok even for failure so the frontend handles it without console errors
        }
    }
}
