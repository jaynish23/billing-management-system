using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BillingSystem.Application.DTOs;
using BillingSystem.Application.Interfaces.Services;

namespace BillingSystem.API.Controllers
{
    [Authorize(Roles = "Broker")]
    [Route("api/[controller]")]
    [ApiController]
    public class DukanController : ControllerBase
    {
        private readonly IDukanService _dukanService;

        public DukanController(IDukanService dukanService)
        {
            _dukanService = dukanService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string lang = "en")
        {
            var (dukans, totalCount) = await _dukanService.GetPagedDukansAsync(page, pageSize, lang);
            return Ok(new { data = dukans, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, [FromQuery] string lang = "en")
        {
            var dukan = await _dukanService.GetDukanByIdAsync(id, lang);
            if (dukan == null) return NotFound();
            return Ok(dukan);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DukanDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdDukan = await _dukanService.CreateDukanAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = createdDukan.DukanNo }, createdDukan);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] DukanDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _dukanService.UpdateDukanAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _dukanService.DeleteDukanAsync(id);
            return NoContent();
        }
    }
}
