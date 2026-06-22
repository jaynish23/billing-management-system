using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces;
using BillingSystem.Domain.Entities;
using BillingSystem.Infrastructure.DbContext;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly ICurrentUser _currentUser;
        private readonly IConfiguration _configuration;
        private readonly string _uploadDirectory;

        public ProfileController(BillingDbContext context, ICurrentUser currentUser, IConfiguration configuration)
        {
            _context = context;
            _currentUser = currentUser;
            _configuration = configuration;
            
            // Set storage path inside configured upload root
            var uploadRoot = _configuration["StorageSettings:UploadRoot"] ?? "wwwroot/uploads";
            _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, "profile");
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserNo == userNo.Value);
            if (user == null) return NotFound("User not found.");

            // Join UserRoles to get RoleName
            var userRole = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.UserNo == user.UserNo && ur.IsActive);
            string roleName = userRole != null && userRole.RoleNo == 1 ? "Broker" : "User";

            var profileDto = new UserProfileDto
            {
                FirstName = user.vfirstname,
                LastName = user.vlastname,
                Username = user.Username,
                Email = user.vemailid,
                MobileNumber = user.MobileNumber,
                PreferredLanguage = user.PreferredLanguage ?? "en",
                RoleName = roleName,
                CreatedDate = user.CreatedDate,
                UserImagePath = user.UserImagePath
            };

            return Ok(profileDto);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (dto == null) return BadRequest("Invalid request payload.");

            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserNo == userNo.Value);
            if (user == null) return NotFound("User not found.");

            // Validation
            if (string.IsNullOrWhiteSpace(dto.FirstName)) return BadRequest("First Name is required.");
            if (string.IsNullOrWhiteSpace(dto.LastName)) return BadRequest("Last Name is required.");
            if (string.IsNullOrWhiteSpace(dto.MobileNumber) || dto.MobileNumber.Length != 10 || !dto.MobileNumber.All(char.IsDigit))
            {
                return BadRequest("Mobile number must be exactly 10 digits.");
            }

            user.vfirstname = dto.FirstName.Trim();
            user.vlastname = dto.LastName.Trim();
            user.MobileNumber = dto.MobileNumber.Trim();
            user.PreferredLanguage = dto.PreferredLanguage.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                status = "success",
                message = "Profile updated successfully.",
                user = new
                {
                    firstName = user.vfirstname,
                    lastName = user.vlastname,
                    role = "Broker",
                    userImagePath = user.UserImagePath
                }
            });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized();

            if (file == null || file.Length == 0) return BadRequest("No file was uploaded.");

            // Validate format
            var extension = Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Invalid image format. Only JPG, JPEG, PNG, and WEBP are accepted.");
            }

            // Validate size (Hard limit: 1 MB = 1048576 bytes)
            if (file.Length > 1048576)
            {
                return BadRequest("Image size exceeds the maximum limit of 1 MB.");
            }

            // Ensure directory exists
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }

            // Generate unique filename
            var filename = $"user_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var fullPath = Path.Combine(_uploadDirectory, filename);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Save relative path in database
            var relativePath = $"/uploads/profile/{filename}";
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserNo == userNo.Value);
            if (user != null)
            {
                user.UserImagePath = relativePath;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                status = "success",
                message = "Profile image uploaded successfully.",
                userImagePath = relativePath
            });
        }

        [AllowAnonymous]
        [HttpGet("image/{filename}")]
        public IActionResult GetProfileImage(string filename)
        {
            if (string.IsNullOrWhiteSpace(filename)) return BadRequest("Filename is required.");

            // Sanitize filename to prevent directory traversal
            filename = Path.GetFileName(filename);
            var filePath = Path.Combine(_uploadDirectory, filename);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Image not found.");
            }

            var extension = Path.GetExtension(filePath).ToLower();
            string contentType = extension switch
            {
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };

            return PhysicalFile(filePath, contentType);
        }
    }
}
