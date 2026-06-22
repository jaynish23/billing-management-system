using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BillingSystem.Application.Interfaces;
using BillingSystem.Application.Interfaces.Services;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PdfController : ControllerBase
    {
        private readonly IPdfService _pdfService;
        private readonly ICurrentUser _currentUser;

        public PdfController(IPdfService pdfService, ICurrentUser currentUser)
        {
            _pdfService = pdfService;
            _currentUser = currentUser;
        }

        [HttpGet("export-ledger")]
        public async Task<IActionResult> ExportLedger([FromQuery] string type, [FromQuery] int id, [FromQuery] string lang = "en")
        {
            var userNo = _currentUser.UserId;
            if (!userNo.HasValue) return Unauthorized("User session invalid.");

            if (string.IsNullOrWhiteSpace(type) || (type.ToLower() != "mill" && type.ToLower() != "dukan"))
            {
                return BadRequest("Type parameter must be 'mill' or 'dukan'.");
            }

            try
            {
                var pdfBytes = await _pdfService.GenerateLedgerPdfAsync(id, type, lang, userNo.Value);
                var filename = $"{type}_ledger_{id}_{DateTime.UtcNow:yyyyMMdd}.pdf";
                return File(pdfBytes, "application/pdf", filename);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error generating PDF: {ex.Message}");
            }
        }
    }
}
