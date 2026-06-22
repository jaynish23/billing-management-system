using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Infrastructure.DbContext;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Linq;

namespace BillingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuditController : ControllerBase
    {
        private readonly BillingDbContext _context;

        public AuditController(BillingDbContext context)
        {
            _context = context;
        }

        [HttpGet("{recordNo}")]
        public async Task<IActionResult> Get(string recordNo)
        {
            var audits = await _context.AuditTableMsts
                .Where(a => a.RecordNo == recordNo)
                .OrderByDescending(a => a.CreatedDate)
                .Select(a => new {
                    a.AuditId,
                    a.TableName,
                    a.RecordNo,
                    a.ActionType,
                    a.OldValue,
                    a.NewValue,
                    a.UserNo,
                    a.CreatedDate,
                    UserName = _context.Users.Where(u => u.UserNo == a.UserNo).Select(u => u.Username).FirstOrDefault()
                })
                .ToListAsync();
            return Ok(audits);
        }
    }
}
