using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Application.DTOs;

namespace BillingSystem.Application.Interfaces.Services
{
    public interface ILedgerTransactionService
    {
        Task<IEnumerable<LedgerTransactionDto>> GetTransactionsByMillAsync(int millNo, string language);
        Task<IEnumerable<LedgerTransactionDto>> GetTransactionsByDukanAsync(int dukanNo, string language);
        Task<LedgerTransactionDto> GetTransactionByIdAsync(int transactionId, string language);
        Task<LedgerTransactionDto> CreateTransactionAsync(LedgerTransactionDto dto);
        Task UpdateTransactionAsync(int transactionId, LedgerTransactionDto dto);
        Task DeleteTransactionAsync(int transactionId);
    }
}
