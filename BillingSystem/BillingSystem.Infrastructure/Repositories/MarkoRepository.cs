using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BillingSystem.Application.Interfaces.Repositories;
using BillingSystem.Domain.Entities;
using BillingSystem.Infrastructure.DbContext;
using Microsoft.EntityFrameworkCore;

namespace BillingSystem.Infrastructure.Repositories
{
    public class MarkoRepository : IMarkoRepository
    {
        private readonly BillingDbContext _context;

        public MarkoRepository(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserMarko>> GetPagedAsync(int pageNumber, int pageSize, string language)
        {
            var query = _context.UserMarkos
                .Include(m => m.UserMill)
                .AsQueryable();

            if (language == "hi")
            {
                query = query.OrderBy(m => m.MarkoName_hi);
            }
            else if (language == "gu" || language == "guj")
            {
                query = query.OrderBy(m => m.MarkoName_guj);
            }
            else
            {
                query = query.OrderBy(m => m.MarkoName_en);
            }

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.UserMarkos.CountAsync();
        }

        public async Task<UserMarko> GetByIdAsync(int markoNo)
        {
            return await _context.UserMarkos
                .Include(m => m.UserMill)
                .FirstOrDefaultAsync(m => m.MarkoNo == markoNo);
        }

        public async Task<UserMarko> AddAsync(UserMarko marko)
        {
            _context.UserMarkos.Add(marko);
            await _context.SaveChangesAsync();
            return marko;
        }

        public async Task UpdateAsync(UserMarko marko)
        {
            _context.UserMarkos.Update(marko);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int markoNo)
        {
            var marko = await _context.UserMarkos.FindAsync(markoNo);
            if (marko != null)
            {
                marko.IsActive = false;
                marko.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
