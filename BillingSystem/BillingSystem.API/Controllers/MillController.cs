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
    public class MillController : ControllerBase
    {
        private readonly IMillService _millService;

        public MillController(IMillService millService)
        {
            _millService = millService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string lang = "en")
        {
            var (mills, totalCount) = await _millService.GetPagedMillsAsync(page, pageSize, lang);
            return Ok(new { data = mills, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, [FromQuery] string lang = "en")
        {
            var mill = await _millService.GetMillByIdAsync(id, lang);
            if (mill == null) return NotFound();
            return Ok(mill);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MillDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMill = await _millService.CreateMillAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = createdMill.MillNo }, createdMill);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] MillDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _millService.UpdateMillAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _millService.DeleteMillAsync(id);
            return NoContent();
        }
    }
}
