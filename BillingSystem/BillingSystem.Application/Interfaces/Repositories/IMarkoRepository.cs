using System.Collections.Generic;
using System.Threading.Tasks;
using BillingSystem.Domain.Entities;

namespace BillingSystem.Application.Interfaces.Repositories
{
    public interface IMarkoRepository
    {
        Task<IEnumerable<UserMarko>> GetPagedAsync(int pageNumber, int pageSize, string language);
        Task<int> GetTotalCountAsync();
        Task<UserMarko> GetByIdAsync(int markoNo);
        Task<UserMarko> AddAsync(UserMarko marko);
        Task UpdateAsync(UserMarko marko);
        Task SoftDeleteAsync(int markoNo);
    }
}
