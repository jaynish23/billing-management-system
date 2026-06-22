using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Infrastructure.DbContext;
using BillingSystem.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MasterPagesController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public MasterPagesController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var pages = await _context.UserMasterPages.Where(p => p.IsActive).ToListAsync();
            return Ok(pages);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UserMasterPage page)
        {
            if (page == null) return BadRequest();
            _context.UserMasterPages.Add(page);
            await _context.SaveChangesAsync();
            return Ok(page);
        }
    }
}
