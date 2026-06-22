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
    public class LedgerTransactionRepository : ILedgerTransactionRepository
    {
        private readonly BillingDbContext _context;

        public LedgerTransactionRepository(BillingDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LedgerTransaction>> GetByMillNoAsync(int millNo)
        {
            return await _context.LedgerTransactions
                .Include(t => t.UserDukan)
                .Include(t => t.UserMarko)
                .Where(t => t.MillNo == millNo && t.IsActive)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<LedgerTransaction>> GetByDukanNoAsync(int dukanNo)
        {
            return await _context.LedgerTransactions
                .Include(t => t.UserMill)
                .Include(t => t.UserMarko)
                .Where(t => t.DukanNo == dukanNo && t.IsActive)
                .OrderByDescending(t => t.TransactionDate)
                .ToListAsync();
        }

        public async Task<LedgerTransaction> GetByIdAsync(int transactionId)
        {
            return await _context.LedgerTransactions
                .Include(t => t.UserMill)
                .Include(t => t.UserDukan)
                .Include(t => t.UserMarko)
                .FirstOrDefaultAsync(t => t.TransactionId == transactionId && t.IsActive);
        }

        public async Task<LedgerTransaction> AddAsync(LedgerTransaction transaction)
        {
            _context.LedgerTransactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        public async Task UpdateAsync(LedgerTransaction transaction)
        {
            _context.LedgerTransactions.Update(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int transactionId)
        {
            var transaction = await _context.LedgerTransactions.FindAsync(transactionId);
            if (transaction != null)
            {
                transaction.IsActive = false;
                transaction.UpdatedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
