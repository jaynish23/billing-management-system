using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces;
using BillingSystem.Application.Interfaces.Services;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BillConfigurationController : ControllerBase
    {
        private readonly IBillConfigurationService _service;
        private readonly ICurrentUser _currentUser;
        private readonly IConfiguration _configuration;

        public BillConfigurationController(IBillConfigurationService service, ICurrentUser currentUser, IConfiguration configuration)
        {
            _service = service;
            _currentUser = currentUser;
            _configuration = configuration;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            var config = await _service.GetByUserIdAsync(userNo.Value);
            if (config == null)
            {
                // Return an empty config object to front-end to initialize form easily
                return Ok(new BillConfigurationDto
                {
                    UserNo = userNo.Value,
                    IsActive = true
                });
            }

            return Ok(config);
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] BillConfigurationDto dto)
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            if (dto == null) return BadRequest("Invalid request payload.");
            if (string.IsNullOrWhiteSpace(dto.GSTNumber)) return BadRequest("GST Number is required.");
            if (string.IsNullOrWhiteSpace(dto.BankAccountNumber)) return BadRequest("Bank Account Number is required.");

            try
            {
                var savedConfig = await _service.SaveAsync(userNo.Value, dto);
                return Ok(new
                {
                    status = "success",
                    message = "Bill Configuration Saved Successfully",
                    configuration = savedConfig
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string position)
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            if (string.IsNullOrWhiteSpace(position) || (position.ToLower() != "left" && position.ToLower() != "right"))
            {
                return BadRequest("Position parameter must be either 'left' or 'right'.");
            }

            if (file == null || file.Length == 0) return BadRequest("No file was uploaded.");

            // Validate format
            var extension = Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Please upload JPG, PNG or WEBP image.");
            }

            // Validate size (1 MB limit)
            if (file.Length > 1048576)
            {
                return BadRequest("File size exceeds 1 MB.");
            }

            try
            {
                var uploadRoot = _configuration["StorageSettings:UploadRoot"] ?? "wwwroot/uploads";
                var targetDir = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, "billconfiguration", position.ToLower());
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // Delete old image if it exists to keep disk clean
                var currentConfig = await _service.GetByUserIdAsync(userNo.Value);
                if (currentConfig != null)
                {
                    string? oldPath = position.ToLower() == "left" ? currentConfig.LeftImagePath : currentConfig.RightImagePath;
                    if (!string.IsNullOrEmpty(oldPath))
                    {
                        string cleanOldPath = oldPath.TrimStart('/');
                        if (cleanOldPath.StartsWith("uploads/"))
                        {
                            cleanOldPath = cleanOldPath.Substring("uploads/".Length);
                        }
                        var oldPhysicalPath = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, cleanOldPath);
                        if (System.IO.File.Exists(oldPhysicalPath))
                        {
                            try { System.IO.File.Delete(oldPhysicalPath); } catch { /* Ignore file locking errors */ }
                        }
                    }
                }

                // Save new image
                var filename = $"user_{userNo.Value}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
                var fullPath = Path.Combine(targetDir, filename);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/billconfiguration/{position.ToLower()}/{filename}";
                return Ok(new
                {
                    status = "success",
                    imagePath = relativePath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("upload-qr")]
        public async Task<IActionResult> UploadQr(IFormFile file)
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            if (file == null || file.Length == 0) return BadRequest("No file was uploaded.");

            // Validate format
            var extension = Path.GetExtension(file.FileName).ToLower();
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest("Please upload JPG, PNG or WEBP image.");
            }

            // Validate size (1 MB limit)
            if (file.Length > 1048576)
            {
                return BadRequest("File size exceeds 1 MB.");
            }

            try
            {
                var uploadRoot = _configuration["StorageSettings:UploadRoot"] ?? "wwwroot/uploads";
                var targetDir = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, "billconfiguration", "qr");
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // Delete old QR image if it exists to keep disk clean
                var currentConfig = await _service.GetByUserIdAsync(userNo.Value);
                if (currentConfig != null && !string.IsNullOrEmpty(currentConfig.QRCodeImagePath))
                {
                    string cleanOldPath = currentConfig.QRCodeImagePath.TrimStart('/');
                    if (cleanOldPath.StartsWith("uploads/"))
                    {
                        cleanOldPath = cleanOldPath.Substring("uploads/".Length);
                    }
                    var oldPhysicalPath = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, cleanOldPath);
                    if (System.IO.File.Exists(oldPhysicalPath))
                    {
                        try { System.IO.File.Delete(oldPhysicalPath); } catch { /* Ignore file locking errors */ }
                    }
                }

                // Save new QR
                var filename = $"user_{userNo.Value}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
                var fullPath = Path.Combine(targetDir, filename);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var relativePath = $"/uploads/billconfiguration/qr/{filename}";
                return Ok(new
                {
                    status = "success",
                    imagePath = relativePath
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [AllowAnonymous]
        [HttpGet("image/{position}/{filename}")]
        public IActionResult GetBillConfigImage(string position, string filename)
        {
            if (string.IsNullOrWhiteSpace(position) || string.IsNullOrWhiteSpace(filename))
            {
                return BadRequest("Invalid request parameters.");
            }

            // Sanitize input to prevent directory traversal
            position = Path.GetFileName(position);
            filename = Path.GetFileName(filename);

            var uploadRoot = _configuration["StorageSettings:UploadRoot"] ?? "wwwroot/uploads";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), uploadRoot, "billconfiguration", position, filename);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Image not found.");
            }

            var extension = Path.GetExtension(filePath).ToLower();
            string contentType = extension switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };

            return PhysicalFile(filePath, contentType);
        }
    }
}
