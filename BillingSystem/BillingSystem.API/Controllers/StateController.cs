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
    public class StateController : ControllerBase
    {
        private readonly BillingDbContext _context;
        private readonly ICurrentUser _currentUser;
        private readonly ITranslationService _translationService;

        public StateController(BillingDbContext context, ICurrentUser currentUser, ITranslationService translationService)
        {
            _context = context;
            _currentUser = currentUser;
            _translationService = translationService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var list = await _context.UserStates.ToListAsync();
            return Ok(list);
        }

        private async Task TranslateMissingFieldsAsync(UserState stateItem)
        {
            string sourceLang = null;
            string name = null;
            string desc = null;

            if (!string.IsNullOrWhiteSpace(stateItem.StateName_en)) { sourceLang = "en"; name = stateItem.StateName_en; desc = stateItem.StateDescription_en; }
            else if (!string.IsNullOrWhiteSpace(stateItem.StateName_hi)) { sourceLang = "hi"; name = stateItem.StateName_hi; desc = stateItem.StateDescription_hi; }
            else if (!string.IsNullOrWhiteSpace(stateItem.StateName_guj)) { sourceLang = "gu"; name = stateItem.StateName_guj; desc = stateItem.StateDescription_guj; }

            if (sourceLang == null) return;

            var targets = new[] { "en", "hi", "gu" };
            foreach (var target in targets)
            {
                if (target == sourceLang) continue;

                if (target == "en")
                {
                    if (string.IsNullOrWhiteSpace(stateItem.StateName_en)) stateItem.StateName_en = await _translationService.TranslateAsync(name, sourceLang, "en");
                    if (string.IsNullOrWhiteSpace(stateItem.StateDescription_en) && !string.IsNullOrWhiteSpace(desc)) stateItem.StateDescription_en = await _translationService.TranslateAsync(desc, sourceLang, "en");
                }
                else if (target == "hi")
                {
                    if (string.IsNullOrWhiteSpace(stateItem.StateName_hi)) stateItem.StateName_hi = await _translationService.TranslateAsync(name, sourceLang, "hi");
                    if (string.IsNullOrWhiteSpace(stateItem.StateDescription_hi) && !string.IsNullOrWhiteSpace(desc)) stateItem.StateDescription_hi = await _translationService.TranslateAsync(desc, sourceLang, "hi");
                }
                else if (target == "gu")
                {
                    if (string.IsNullOrWhiteSpace(stateItem.StateName_guj)) stateItem.StateName_guj = await _translationService.TranslateAsync(name, sourceLang, "gu");
                    if (string.IsNullOrWhiteSpace(stateItem.StateDescription_guj) && !string.IsNullOrWhiteSpace(desc)) stateItem.StateDescription_guj = await _translationService.TranslateAsync(desc, sourceLang, "gu");
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserState dto)
        {
            if (dto == null) return BadRequest();

            var stateItem = await _context.UserStates.FirstOrDefaultAsync(d => d.StateCode != null && d.StateCode == dto.StateCode);
            
            if (stateItem != null)
            {
                // Update
                stateItem.StateName_en = string.IsNullOrWhiteSpace(dto.StateName_en) ? stateItem.StateName_en : dto.StateName_en;
                stateItem.StateName_hi = string.IsNullOrWhiteSpace(dto.StateName_hi) ? stateItem.StateName_hi : dto.StateName_hi;
                stateItem.StateName_guj = string.IsNullOrWhiteSpace(dto.StateName_guj) ? stateItem.StateName_guj : dto.StateName_guj;

                stateItem.StateDescription_en = string.IsNullOrWhiteSpace(dto.StateDescription_en) ? stateItem.StateDescription_en : dto.StateDescription_en;
                stateItem.StateDescription_hi = string.IsNullOrWhiteSpace(dto.StateDescription_hi) ? stateItem.StateDescription_hi : dto.StateDescription_hi;
                stateItem.StateDescription_guj = string.IsNullOrWhiteSpace(dto.StateDescription_guj) ? stateItem.StateDescription_guj : dto.StateDescription_guj;

                stateItem.IsActive = dto.IsActive;
                stateItem.UpdatedBy = _currentUser?.UserId;
                stateItem.UpdatedDate = DateTime.UtcNow;

                await TranslateMissingFieldsAsync(stateItem);

                await _context.SaveChangesAsync();
                return Ok(stateItem);
            }
            else
            {
                // Insert
                dto.CreatedBy = _currentUser?.UserId;
                dto.CreatedDate = DateTime.UtcNow;

                await TranslateMissingFieldsAsync(dto);

                _context.UserStates.Add(dto);
                await _context.SaveChangesAsync();
                return Ok(dto);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] UserState updatedState)
        {
            var stateItem = await _context.UserStates.FindAsync(id);
            if (stateItem == null) return NotFound();

            stateItem.StateCode = updatedState.StateCode ?? stateItem.StateCode;

            bool isEn = !string.IsNullOrWhiteSpace(updatedState.StateName_en) || !string.IsNullOrWhiteSpace(updatedState.StateDescription_en);
            bool isHi = !string.IsNullOrWhiteSpace(updatedState.StateName_hi) || !string.IsNullOrWhiteSpace(updatedState.StateDescription_hi);
            bool isGu = !string.IsNullOrWhiteSpace(updatedState.StateName_guj) || !string.IsNullOrWhiteSpace(updatedState.StateDescription_guj);

            if (isEn)
            {
                stateItem.StateName_en = updatedState.StateName_en ?? stateItem.StateName_en;
                stateItem.StateDescription_en = updatedState.StateDescription_en ?? stateItem.StateDescription_en;
                stateItem.StateName_hi = null; stateItem.StateDescription_hi = null;
                stateItem.StateName_guj = null; stateItem.StateDescription_guj = null;
            }
            else if (isHi)
            {
                stateItem.StateName_hi = updatedState.StateName_hi ?? stateItem.StateName_hi;
                stateItem.StateDescription_hi = updatedState.StateDescription_hi ?? stateItem.StateDescription_hi;
                stateItem.StateName_en = null; stateItem.StateDescription_en = null;
                stateItem.StateName_guj = null; stateItem.StateDescription_guj = null;
            }
            else if (isGu)
            {
                stateItem.StateName_guj = updatedState.StateName_guj ?? stateItem.StateName_guj;
                stateItem.StateDescription_guj = updatedState.StateDescription_guj ?? stateItem.StateDescription_guj;
                stateItem.StateName_en = null; stateItem.StateDescription_en = null;
                stateItem.StateName_hi = null; stateItem.StateDescription_hi = null;
            }

            stateItem.IsActive = updatedState.IsActive;
            
            stateItem.UpdatedBy = _currentUser?.UserId;
            stateItem.UpdatedDate = DateTime.UtcNow;

            await TranslateMissingFieldsAsync(stateItem);

            await _context.SaveChangesAsync();
            return Ok(stateItem);
        }
    }
}
