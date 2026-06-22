using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Interfaces.Repositories
{
    public interface ILedgerTransactionRepository
    {
        Task<IEnumerable<LedgerTransaction>> GetByMillNoAsync(int millNo);
        Task<IEnumerable<LedgerTransaction>> GetByDukanNoAsync(int dukanNo);
        Task<LedgerTransaction> GetByIdAsync(int transactionId);
        Task<LedgerTransaction> AddAsync(LedgerTransaction transaction);
        Task UpdateAsync(LedgerTransaction transaction);
        Task SoftDeleteAsync(int transactionId);
    }
}
