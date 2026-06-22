using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Infrastructure.DbContext;
using BillingSystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;
using System;
using BillingSystem.Application.Interfaces;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DistrictController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly ICurrentUser _currentUser;
        private readonly ITranslationService _translationService;

        public DistrictController(BillingDbContext context, ICurrentUser currentUser, ITranslationService translationService)
        {
            _context = context;
            _currentUser = currentUser;
            _translationService = translationService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var list = await _context.UserDistricts.Include(d => d.UserState).ToListAsync();
            return Ok(list);
        }

        private async Task TranslateMissingFieldsAsync(UserDistrict district)
        {
            string sourceLang = null;
            string name = null;
            string desc = null;

            if (!string.IsNullOrWhiteSpace(district.DistrictName_en)) { sourceLang = "en"; name = district.DistrictName_en; desc = district.DistrictDescription_en; }
            else if (!string.IsNullOrWhiteSpace(district.DistrictName_hi)) { sourceLang = "hi"; name = district.DistrictName_hi; desc = district.DistrictDescription_hi; }
            else if (!string.IsNullOrWhiteSpace(district.DistrictName_guj)) { sourceLang = "gu"; name = district.DistrictName_guj; desc = district.DistrictDescription_guj; }

            if (sourceLang == null) return;

            var targets = new[] { "en", "hi", "gu" };
            foreach (var target in targets)
            {
                if (target == sourceLang) continue;

                if (target == "en")
                {
                    if (string.IsNullOrWhiteSpace(district.DistrictName_en)) district.DistrictName_en = await _translationService.TranslateAsync(name, sourceLang, "en");
                    if (string.IsNullOrWhiteSpace(district.DistrictDescription_en) && !string.IsNullOrWhiteSpace(desc)) district.DistrictDescription_en = await _translationService.TranslateAsync(desc, sourceLang, "en");
                }
                else if (target == "hi")
                {
                    if (string.IsNullOrWhiteSpace(district.DistrictName_hi)) district.DistrictName_hi = await _translationService.TranslateAsync(name, sourceLang, "hi");
                    if (string.IsNullOrWhiteSpace(district.DistrictDescription_hi) && !string.IsNullOrWhiteSpace(desc)) district.DistrictDescription_hi = await _translationService.TranslateAsync(desc, sourceLang, "hi");
                }
                else if (target == "gu")
                {
                    if (string.IsNullOrWhiteSpace(district.DistrictName_guj)) district.DistrictName_guj = await _translationService.TranslateAsync(name, sourceLang, "gu");
                    if (string.IsNullOrWhiteSpace(district.DistrictDescription_guj) && !string.IsNullOrWhiteSpace(desc)) district.DistrictDescription_guj = await _translationService.TranslateAsync(desc, sourceLang, "gu");
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserDistrict dto)
        {
            if (dto == null) return BadRequest();

            var district = await _context.UserDistricts.FirstOrDefaultAsync(d => d.DistrictCode != null && d.DistrictCode == dto.DistrictCode);
            
            if (district != null)
            {
                // Update
                district.DistrictName_en = string.IsNullOrWhiteSpace(dto.DistrictName_en) ? district.DistrictName_en : dto.DistrictName_en;
                district.DistrictName_hi = string.IsNullOrWhiteSpace(dto.DistrictName_hi) ? district.DistrictName_hi : dto.DistrictName_hi;
                district.DistrictName_guj = string.IsNullOrWhiteSpace(dto.DistrictName_guj) ? district.DistrictName_guj : dto.DistrictName_guj;

                district.DistrictDescription_en = string.IsNullOrWhiteSpace(dto.DistrictDescription_en) ? district.DistrictDescription_en : dto.DistrictDescription_en;
                district.DistrictDescription_hi = string.IsNullOrWhiteSpace(dto.DistrictDescription_hi) ? district.DistrictDescription_hi : dto.DistrictDescription_hi;
                district.DistrictDescription_guj = string.IsNullOrWhiteSpace(dto.DistrictDescription_guj) ? district.DistrictDescription_guj : dto.DistrictDescription_guj;

                district.StateNo = dto.StateNo;
                district.IsActive = dto.IsActive;
                district.UpdatedBy = _currentUser?.UserId;
                district.UpdatedDate = DateTime.UtcNow;

                await TranslateMissingFieldsAsync(district);

                await _context.SaveChangesAsync();
                return Ok(district);
            }
            else
            {
                // Insert
                dto.CreatedBy = _currentUser?.UserId;
                dto.CreatedDate = DateTime.UtcNow;

                await TranslateMissingFieldsAsync(dto);

                _context.UserDistricts.Add(dto);
                await _context.SaveChangesAsync();
                return Ok(dto);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UserDistrict updatedDistrict)
        {
            var district = await _context.UserDistricts.FindAsync(id);
            if (district == null) return NotFound();

            district.DistrictCode = updatedDistrict.DistrictCode ?? district.DistrictCode;
            district.StateNo = updatedDistrict.StateNo ?? district.StateNo;

            bool isEn = !string.IsNullOrWhiteSpace(updatedDistrict.DistrictName_en) || !string.IsNullOrWhiteSpace(updatedDistrict.DistrictDescription_en);
            bool isHi = !string.IsNullOrWhiteSpace(updatedDistrict.DistrictName_hi) || !string.IsNullOrWhiteSpace(updatedDistrict.DistrictDescription_hi);
            bool isGu = !string.IsNullOrWhiteSpace(updatedDistrict.DistrictName_guj) || !string.IsNullOrWhiteSpace(updatedDistrict.DistrictDescription_guj);

            if (isEn)
            {
                district.DistrictName_en = updatedDistrict.DistrictName_en ?? district.DistrictName_en;
                district.DistrictDescription_en = updatedDistrict.DistrictDescription_en ?? district.DistrictDescription_en;
                district.DistrictName_hi = null; district.DistrictDescription_hi = null;
                district.DistrictName_guj = null; district.DistrictDescription_guj = null;
            }
            else if (isHi)
            {
                district.DistrictName_hi = updatedDistrict.DistrictName_hi ?? district.DistrictName_hi;
                district.DistrictDescription_hi = updatedDistrict.DistrictDescription_hi ?? district.DistrictDescription_hi;
                district.DistrictName_en = null; district.DistrictDescription_en = null;
                district.DistrictName_guj = null; district.DistrictDescription_guj = null;
            }
            else if (isGu)
            {
                district.DistrictName_guj = updatedDistrict.DistrictName_guj ?? district.DistrictName_guj;
                district.DistrictDescription_guj = updatedDistrict.DistrictDescription_guj ?? district.DistrictDescription_guj;
                district.DistrictName_en = null; district.DistrictDescription_en = null;
                district.DistrictName_hi = null; district.DistrictDescription_hi = null;
            }

            district.IsActive = updatedDistrict.IsActive;
            
            district.UpdatedBy = _currentUser?.UserId;
            district.UpdatedDate = DateTime.UtcNow;

            await TranslateMissingFieldsAsync(district);

            await _context.SaveChangesAsync();
            return Ok(district);
        }
    }
}
