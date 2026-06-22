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
    public class LedgerTransactionController : ControllerBase
    {
        private readonly ILedgerTransactionService _service;

        public LedgerTransactionController(ILedgerTransactionService service)
        {
            _service = service;
        }

        [HttpGet("mill/{millNo}")]
        public async Task<IActionResult> GetByMill(int millNo, [FromQuery] string lang = "en")
        {
            var data = await _service.GetTransactionsByMillAsync(millNo, lang);
            return Ok(data);
        }

        [HttpGet("dukan/{dukanNo}")]
        public async Task<IActionResult> GetByDukan(int dukanNo, [FromQuery] string lang = "en")
        {
            var data = await _service.GetTransactionsByDukanAsync(dukanNo, lang);
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id, [FromQuery] string lang = "en")
        {
            var transaction = await _service.GetTransactionByIdAsync(id, lang);
            if (transaction == null) return NotFound();
            return Ok(transaction);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] LedgerTransactionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var created = await _service.CreateTransactionAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.TransactionId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] LedgerTransactionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _service.UpdateTransactionAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteTransactionAsync(id);
            return NoContent();
        }
    }
}
