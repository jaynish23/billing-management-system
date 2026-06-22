using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Domain.Entities;
using BillingSystem.Infrastructure.DbContext;

namespace BillingSystem.Infrastructure.Repositories
{
    public class BillConfigurationRepository : IBillConfigurationRepository
    {
        private readonly BillingDbContext _context;

        public BillConfigurationRepository(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<BillConfiguration?> GetByUserNoAsync(int userNo)
        {
            // The global query filter will automatically scope this to the logged-in user,
            // but we explicitly query with userNo as well to ensure correctness.
            return await _context.BillConfigurations
                .FirstOrDefaultAsync(bc => bc.UserNo == userNo && bc.IsActive);
        }

        public async Task AddAsync(BillConfiguration entity)
        {
            _context.BillConfigurations.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(BillConfiguration entity)
        {
            _context.BillConfigurations.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
