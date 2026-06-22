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
    public class MarkoController : ControllerBase
    {
        private readonly IMarkoService _markoService;

        public MarkoController(IMarkoService markoService)
        {
            _markoService = markoService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string lang = "en")
        {
            var (markos, totalCount) = await _markoService.GetPagedMarkosAsync(page, pageSize, lang);
            return Ok(new { data = markos, totalCount, page, pageSize });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, [FromQuery] string lang = "en")
        {
            var marko = await _markoService.GetMarkoByIdAsync(id, lang);
            if (marko == null) return NotFound();
            return Ok(marko);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] MarkoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var createdMarko = await _markoService.CreateMarkoAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = createdMarko.MarkoNo }, createdMarko);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] MarkoDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _markoService.UpdateMarkoAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _markoService.DeleteMarkoAsync(id);
            return NoContent();
        }
    }
}
