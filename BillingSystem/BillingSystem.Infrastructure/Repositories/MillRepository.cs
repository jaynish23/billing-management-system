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
    public class MillRepository : IMillRepository
    {
        private readonly BillingDbContext _context;

        public MillRepository(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserMill>> GetPagedAsync(int pageNumber, int pageSize, string language)
        {
            var query = _context.UserMills
                .Include(m => m.UserDistrict)
                .Include(m => m.UserState)
                .AsQueryable();

            if (language == "hi")
            {
                query = query.OrderBy(m => m.MillName_hi);
            }
            else if (language == "gu" || language == "guj")
            {
                query = query.OrderBy(m => m.MillName_guj);
            }
            else
            {
                query = query.OrderBy(m => m.MillName_en);
            }

            return await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync()
        {
            return await _context.UserMills.CountAsync();
        }

        public async Task<UserMill> GetByIdAsync(int millNo)
        {
            return await _context.UserMills
                .Include(m => m.UserDistrict)
                .Include(m => m.UserState)
                .FirstOrDefaultAsync(m => m.MillNo == millNo);
        }

        public async Task<UserMill> AddAsync(UserMill mill)
        {
            _context.UserMills.Add(mill);
            await _context.SaveChangesAsync();
            return mill;
        }

        public async Task UpdateAsync(UserMill mill)
        {
            _context.UserMills.Update(mill);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int millNo)
        {
            var mill = await _context.UserMills.FindAsync(millNo);
            if (mill != null)
            {
                mill.IsActive = false;
                mill.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
