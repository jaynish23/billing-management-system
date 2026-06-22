using System.Threading.Tasks;
using BillingSystem.Application.DTOs.Auth;

namespace BillingSystem.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<bool> SendOtpAsync(SendOtpDto sendOtpDto);
        Task<bool> VerifyOtpAsync(VerifyOtpDto verifyOtpDto);
    }
}
