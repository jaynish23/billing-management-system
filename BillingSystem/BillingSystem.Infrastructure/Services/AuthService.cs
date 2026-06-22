using System;
using System.Linq;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs.Auth;
using BillingSystem.Application.Interfaces;
using BillingSystem.Domain.Entities;
using BillingSystem.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace BillingSystem.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly BillingDbContext _context;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;

        public AuthService(BillingDbContext context, IJwtTokenGenerator jwtTokenGenerator, IEmailService emailService)
        {
            _context = context;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
        }

        public async Task<bool> SendOtpAsync(SendOtpDto sendOtpDto)
        {
            var isDuplicateEmail = await _context.Users.AnyAsync(u => u.vemailid == sendOtpDto.Email);
            if (isDuplicateEmail) return false;

            var otp = new Random().Next(100000, 999999);
            var otpInfo = new OtpInfo
            {
                GeneratedOtp = otp,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddMinutes(5),
                RecordedBy = sendOtpDto.Email,
                OtpType = "Registration"
            };

            _context.OtpInfos.Add(otpInfo);
            await _context.SaveChangesAsync();
            await _emailService.SendEmailAsync(sendOtpDto.Email, "Registration OTP", $"your otp is : {otp} and you have been to register for Broker Management System applicatiion for this");
            return true;
        }

        public async Task<bool> VerifyOtpAsync(VerifyOtpDto verifyOtpDto)
        {
            var otpRecord = await _context.OtpInfos
                .Where(o => o.RecordedBy == verifyOtpDto.Email && o.OtpType == "Registration" && !o.IsUsed)
                .OrderByDescending(o => o.RecordedOnUtc)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.GeneratedOtp != verifyOtpDto.Otp || otpRecord.EndTime < DateTime.UtcNow)
                return false;

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var verifiedOtp = await _context.OtpInfos
                .Where(o => o.RecordedBy == registerDto.Email && o.OtpType == "Registration" && o.IsUsed)
                .OrderByDescending(o => o.RecordedOnUtc)
                .FirstOrDefaultAsync();

            if (verifiedOtp == null)
                return new AuthResponseDto { Status = "error", Message = "Email not verified via OTP." };

            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
                return new AuthResponseDto { Status = "error", Message = "Username already exists." };

            if (await _context.Users.AnyAsync(u => u.MobileNumber == registerDto.MobileNumber))
                return new AuthResponseDto { Status = "error", Message = "Mobile Number already exists." };

            var user = new User
            {
                Username = registerDto.Username,
                vfirstname = registerDto.FirstName,
                vlastname = registerDto.LastName,
                vemailid = registerDto.Email,
                MobileNumber = registerDto.MobileNumber,
                vpassword = BCrypt.Net.BCrypt.HashPassword(registerDto.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = new UserRole { UserNo = user.UserNo, RoleNo = 1 };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return new AuthResponseDto { Status = "success", Message = "User registered successfully." };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Username))
                return new AuthResponseDto { Status = "error", Message = "Please enter the username" };

            var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginDto.Username && u.IsActive);
            if (user == null)
                return new AuthResponseDto { Status = "error", Message = "User does not exist" };

            if (string.IsNullOrWhiteSpace(loginDto.Password))
                return new AuthResponseDto { Status = "error", Message = "Please enter the password" };

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.vpassword);
            if (!isPasswordValid)
                return new AuthResponseDto { Status = "error", Message = "Incorrect password" };

            var token = _jwtTokenGenerator.GenerateToken(user.UserNo, user.Username, user.vfirstname, user.vlastname, "Broker");

            var loginDetails = new UserLoginDetails
            {
                LoginId = Guid.NewGuid(),
                UserId = user.Uuserid,
                UserNo = user.UserNo,
                LoginTime = DateTime.UtcNow,
                IsActiveSession = true
            };
            _context.UserLoginDetails.Add(loginDetails);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                Status = "success",
                Token = token,
                User = new UserResponseDto
                {
                    FirstName = user.vfirstname,
                    LastName = user.vlastname,
                    Role = "Broker",
                    UserImagePath = user.UserImagePath
                }
            };
        }
    }
}
