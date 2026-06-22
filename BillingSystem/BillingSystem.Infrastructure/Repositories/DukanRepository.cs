using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Domain.Entities;
using BillingSystem.Infrastructure.DbContext;

namespace BillingSystem.Infrastructure.Repositories
{
    public class DukanRepository : IDukanRepository
    {
        private readonly BillingDbContext _context;

        public DukanRepository(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDukan>> GetPagedAsync(int pageNumber, int pageSize, string language)
        {
            return await _context.UserDukans
                .Include(d => d.UserDistrict)
                .Include(d => d.UserState)
                .OrderByDescending(d => d.CreatedDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.UserDukans.CountAsync();
        }

        public async Task<UserDukan> GetByIdAsync(int dukanNo)
        {
            return await _context.UserDukans
                .Include(d => d.UserDistrict)
                .Include(d => d.UserState)
                .FirstOrDefaultAsync(d => d.DukanNo == dukanNo);
        }

        public async Task<UserDukan> AddAsync(UserDukan userDukan)
        {
            _context.UserDukans.Add(userDukan);
            await _context.SaveChangesAsync();
            return userDukan;
        }

        public async Task UpdateAsync(UserDukan userDukan)
        {
            _context.UserDukans.Update(userDukan);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int dukanNo)
        {
            var dukan = await _context.UserDukans.FindAsync(dukanNo);
            if (dukan != null)
            {
                dukan.IsActive = false;
                _context.UserDukans.Update(dukan);
                await _context.SaveChangesAsync();
            }
        }
    }
}
